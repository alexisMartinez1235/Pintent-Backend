import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { userReg } from '../utils/local-auth';
import { sessionKey } from '../utils/keys';
import Person from '../model/Person';
import lists from './lists';
import { Blacklist, blackListRepository } from '../model/Blacklist';
import { Repository } from 'redis-om';

(async () => {
  console.log("**********");
  // blackListRepository()
  //   .then((blacklistRepo: Repository<Blacklist>) => {
  //     blacklistRepo.createAndSave({ token: 'xd' })
  //     .then((blackListElement: Blacklist) => {
  //       return console.log(blackListElement);
  //     })
  //     .catch((err) => console.error(err));
  //   })
  //   .catch((err) => console.error(err));
  console.log("**********");
})();

function loggin(user: any, req: any, res: any, next: any) {
  req.login(user, { session: false }, async (errLogin: any) => {
    if (errLogin) return next(errLogin);

    // generate a signed son web token with the contents of
    //  user object and return it in the response
    const userRes = { _id: user.id, email: user.email };
    const token = jwt.sign({ person: userRes }, sessionKey, {
      expiresIn: 1 * 60 * 60 * 1000, // 1 hour
    });
    return res.status(200).json({
      data: {
        user: userRes,
        token,
      },
      success: true,
    });
  });
}

const api = express.Router();

api.get('/', (req, res) => {
  res.status(200).json({
    data: 'Successfully connected',
    success: true,
  });
});

api.post(
  '/signin',
  (req, res, next) => {
    passport.authenticate(userReg.localSignin, {
      session: false,
    }, async (err, user) => {
      if (err || !user) {
        res.status(400);
        if (err) res.status(500);
        res.json({
          data: req.flash('signinMessage')[0],
          success: false,
        });
        return next(err);
      }
      return loggin(user, req, res, next);
    })(req, res, next);
  },
);

api.post(
  '/signup',
  (req, res, next) => {
    passport.authenticate(userReg.localSignup, {
      session: false,
    }, async (err, user) => {
      if (err || !user) {
        res.status(400);
        if (err) res.status(500);
        res.json({
          data: req.flash('signupMessage')[0],
          success: false,
        });
        return next(err);
      }
      return loggin(user, req, res, next);
    })(req, res, next);
  },
);

/*
  blacklist.verification
*/
api.use((req, res, next) => {
  const token = req.get('Authorization')?.toString().substring(7,) || '';

  blackListRepository().then(async (blacklistRepo: Repository<Blacklist>) => {
    blacklistRepo.search()
      .where('token').equals(token).return.all()
      .then((tokenFound) => {

        console.log(tokenFound);
        if (tokenFound[0] === undefined) return next();

        return res.status(200).json({
            data: ['Your token is not valid', tokenFound],
            success: true,
          });
      })
      .catch((err) => res.status(500).json({
        data: ['blacklist.verification.2', err],
        success: false,
      }));
    })
    .catch((err) => res.status(500).json({
      data: ['blacklist.verification.1', err],
      success: false,
    }));
  return 0;
});

//  Authenticate user with passport
api.use(passport.authenticate(userReg.tokenJWT, { session: false }));

// Authenticated routes
api.post('/logout', async (req, res) => {
  const token = req.get('Authorization')?.toString().substring(7,) || '';

  req.logOut((err) => {
    if (err) return res.status(500).json({
      data: err,
      success: false,
    });

    return res.status(200).json({
      data: 'req.logout-1',
      success: true,
    });
  });

  blackListRepository()
    .then((blacklistRepo: Repository<Blacklist>) => {
      blacklistRepo.createAndSave({ token })
      .then((blackListElement: Blacklist) => {
        return res.status(200).json({
          data: ['You have logged out', blackListElement],
          success: true,
        });
      })
      .catch((err) => res.status(500).json({data: ['req.logout.2', err], success: false}));
    })
    .catch((err) => res.status(500).json({data: ['req.logout.3', err], success: false}));
  });

api.post(
  '/profile',
  (req, res) => {
    if (req.user instanceof Person) {
      res.status(200).json({
        data: {
          message: 'You already have to access to profile!',
          user: {
            id: req.user.getDataValue('id'),
            email: req.user.getDataValue('email'),
          },
          token: req.query.secret_token,
        },
        success: true,
      });
    }
  },
);

// routes of /api
api.use('/list', lists);

// api.use('/user', personHasList);

export default api;
