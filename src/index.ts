import cors from 'cors';
import express, { Request, Response } from 'express';
import responseTime from 'response-time';
import morgan from 'morgan';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import {
  startMetricsServer,
  restResponseTimeHistogram,
  // databaseResponseTimeHistorgram
} from './utils/metrics';
import { mongo_uri, mongoSessionCollectionName } from './utils/database';
import routes from './routes/routes';
import {
  sessionKey,
  sessionName
} from './utils/keys';
import api from './routes/api';

const MongoDBStore = require('connect-mongodb-session')(session);
const engine = require('ejs-mate');

const app = express();
const port: number = 8000;
const sessionStore = new MongoDBStore({
  uri: mongo_uri,
  collection: mongoSessionCollectionName
});

require('./utils/local-auth');

// middlewares ------------------------
app.use(cors({
  credentials: true,
}));

app.use(morgan('dev')); // see debug in terminal
app.use(cookieParser());

// -- config session
app.use(
  session({
    secret: sessionKey,
    store: sessionStore,
    name: sessionName,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      secure: false,
    },
  }),
);

//------------------------------------

app.use(flash()); // is after because use session as passport

// initialize passport ------------------
app.use(passport.initialize());
app.use(passport.session()); // config session for allow user identification

app.use(bodyParser.json()); // bodyParser manage request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// EJS config -----------------------
// -- assign views folder to express
app.set('views', path.join(__dirname, 'views'));

// -- settings engine template ejs
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// -- sleep server
app.use(rateLimit({
  windowMs: 1 * 3 * 1000, // 3 seconds
  max: 33, // Limit each IP to x requests per `window`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    data: ['wait 3 seconds'],
    success: false,
  },
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use((req, res, next) => {
  app.locals.signupMessage = req.flash('signupMessage');
  app.locals.signinMessage = req.flash('signinMessage');
  console.log(req.flash());
  next();
});

// save metrics
app.use(responseTime((req: Request, res: Response, time: number) => {
  if (req?.route?.path) {
    restResponseTimeHistogram.observe({
      method: req.method,
      // route: req.route.path,
      route: req.originalUrl,
      status_code: res.statusCode,
    }, time);
    // }, time * 1000);
  }
}));
// routeslist
app.locals.routes = ["list", "pin", "profile"];

// adapter for res.json
app.use((req, res, next) => {
  req.app.locals.formatRes = (originalUrl: string, responseData: any, _e: String) => {
    let route = originalUrl.replace(/\/$/i,'');
    let index = 0;
    let end_index = 0;

    app.locals.routes.forEach((route: string) => {
      if (originalUrl.lastIndexOf(route) > index) {
        index = originalUrl.lastIndexOf(route);
        end_index = index + route.length;
      }
    });
    
    route = route.substring(index, end_index);
    console.log(route);

    return {
      'text/html': () => {
        res.render(route, {
          ...responseData,
          path: originalUrl,
          // async: false,
        });
      },
      'application/json': () => {
        res.json(responseData);

      },  
      'default': () => {  
        res.status(406).send('Not Acceptable');
      }
    };
  };
  next();
});

// routes
app.use('/api', api);
app.use('/', routes);

app.listen(port, () => {
  console.log(`Listening on localhost:${port}`);
  startMetricsServer();
});
