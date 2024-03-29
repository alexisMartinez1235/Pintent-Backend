import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import Person from '../model/Person';
import { sessionKey } from './keys';

// eslint-disable-next-line import/prefer-default-export
export const userReg = {
  localSignin: 'local-signin',
  localSignup: 'local-signup',
  tokenJWT: 'jwt',
};
// save user to dont ask for the email and password in every route
passport.serializeUser((user: any, done: any) => {
  console.log('Serialize User');
  done(null, user.id);
});

passport.deserializeUser((id: string, done: any) => {
  console.log('Deserialize User');
  
  Person.findOne({
    where: { id },
  }).then((userRes: any) => {
    // if (userRes instanceof User) {
    if (userRes !== null) {
      return done(null, userRes);
    }
    return done(null, false);
  }).catch((err: any) => {
    console.log('Deserialize error');
    console.log(err);
    return done(err, false);
  });
});

passport.use(
  userReg.localSignup,
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    (req: any, email: string, password: string, done: any) => {
      Person.hashPassword(password).then((pwHashed: string) => {
        Person.create(
          { email, password: pwHashed },
        // ).then((userRes: User | null) => {
        ).then((userRes: any) => {
          console.log('[then insert]: ');
          if (userRes !== null) {
            return done(null, userRes);
          }
          return done(null, false, req.flash('signupMessage', 'Cannot add User'));
        }).catch((err: any) => {
          console.log(`[catch insert]: ${err}`);
          return done(null, false, req.flash('signupMessage', 'The email is already taken'));
        });
      });
    },
  ),
);

passport.use(
  userReg.localSignin,
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    (req: any, email: string, password: string, done: any) => {
      Person.findOne({
        where: { email },
      }).then((userRes: any) => {
        if (userRes === null) return done(null, false, req.flash('signinMessage', 'User not found'));
        bcrypt.compare(password, userRes.password, (err: any, isEqual: any) => {
          if (err) return done(null, false, req.flash('signinMessage', err.message));
          if (isEqual) {
            return done(null, userRes);
          }
          return done(null, false, req.flash('signinMessage', 'Invalid password'));
        });

      }).catch((err: any) => done(null, false, req.flash('signinMessage', err.message)));
    },
  ),
);

// api client token verification
passport.use(
  userReg.tokenJWT,
  new JwtStrategy({
    secretOrKey: sessionKey,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  }, (jwtPayload: any, done: any) => {
    Person.findOne({ where: { email: jwtPayload.person.email } })
      .then((user: any) => done(null, user))
      .catch((err: any) => done(err, false));
  }),
);
