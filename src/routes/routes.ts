import express from 'express';
import passport from 'passport';
import Person from '../model/Person';
import { isAuthenticated, isUnauthenticated } from '../utils/authenticated';
import { userReg } from '../utils/local-auth';
import list from './list';
import lists from './lists';

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/signup', isUnauthenticated, (req: any, res: any) => {
  res.render('signup');
});

router.post('/signup', isUnauthenticated, (req, res, next) => {
  passport.authenticate(
    userReg.localSignup,
    {
      successRedirect: '/profile',
      failureRedirect: '/signup',
      passReqToCallback: true,
      failureFlash: true,
    },
    (err, user) => {
      if (err) return err;
      if (!user) return res.redirect('/signup');
      return req.logIn(user, (logInErr) => {
        if (logInErr) return logInErr;
        return req.session.save(() => res.redirect('/profile'));
      });
    }
  )(req, res, next);
});

router.get('/signin', isUnauthenticated, (req, res) => {
  res.render('signin');
});

router.post('/signin', isUnauthenticated, (req, res, next) => {
  passport.authenticate(
    userReg.localSignin,
    {
      successRedirect: '/profile',
      failureRedirect: '/signin',
      passReqToCallback: true,
      failureFlash: true,
    },
    (err, user) => {
      if (err) return err;
      if (!user) return res.redirect('/signin');
      return req.logIn(user, (logInErr) => {
        if (logInErr) return logInErr;
        return req.session.save(() => res.redirect('/profile'));
      });
    }
  )(req, res, next);
});

router.use(isAuthenticated); // authentificate before go to profile, logout, etc

router.get('/profile', (req, res) => {
  let email = '';
  if (req.user instanceof Person) {
    email = req.user.getDataValue('email');
  }
  res.render('profile', { email });
});

router.get(
  '/logout',
  (req, res, next) => {
    req.logOut((err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
    next();
  },
  isAuthenticated
);

router.post('/user', (req, res) => {
  if (req.user instanceof Person) {
    return Person.destroy({
      where: { email: req.user.getDataValue('email') }
    }).then((destroyRes: number) => {
      let message = 'the account was not deleted';
      if (destroyRes > 0) message = 'the account was deleted'
      
      return res.status(200).render('message', {
        data: message,
        success: true,
      })
    }).catch((err) => {
      return res.status(500).render('message', {
        data: ['user.delete.1', err],
        success: false,
      })
    });
  }
  return res.status(500).json({
    data: 'req.user is not instance of Person',
    success: false,
  });
});

// routes of /
router.use('/list', lists);
router.use('/list/:idList', (req, _res, next) => {
  req.app.locals.idList = req.params.idList;
  next();
}, list);

export default router;
