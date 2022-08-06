import express, { Request, Response } from 'express';
import PersonHasElement from '../model/PersonHasElement';
import { startTimer, stopTimer } from '../utils/metrics';
// import list from './list';

const shareElement = express.Router();

// verifies user access to list
shareElement.use((req, res, next) => {
  const { email: emailPerson, idList } = req.app.locals;

  PersonHasElement.findOne({
    where: { idList, emailPerson },
  }).then((personhList: PersonHasElement | null) => {
    if (personhList !== null) return next();
    return res.status(200).json({ data: 'User dont have permissions to access to this list', success: false });
  }).catch((err: any) => {
    res.status(500).json({ data: err, success: false });
  });
});

shareElement.use(startTimer);

shareElement.get('/', (req : Request, res : Response) => {
  const variable : string = req.query.variable?.toString() || 'emailPerson';
  const order : string = req.query.order?.toString() || 'ASC';
  const { idList } = req.app.locals.list;
  
  PersonHasElement.findAll({
    // attributes: ['emailPerson'],
    order: [
      [variable, order],
    ],
    where: { idList },
  }).then((personhList: PersonHasElement[]) => {
    req.app.locals.success = true;
    return res.status(200).json({ data: personhList, success: true });
  }).catch((err: any) => {
    res.status(500).json({ data: err, success: false });
  });
}, stopTimer);

// verifies owner permissions
shareElement.use((req, res, next) => {
  const { email } = req.body;
  const { email: emailPerson } = req.app.locals;
  const { idList } = req.app.locals.list;

  PersonHasElement.findOne({
    where: { idList, emailPerson },
  }).then((personhList: PersonHasElement | null) => {
    if ((personhList !== null && personhList.getDataValue('isOwner')) || email === emailPerson) return next();
    return res.status(200).json({ data: 'User dont have owner permissions', success: false });
  }).catch((err: any) => {
    res.status(500).json({ data: err, success: false });
  });
});

shareElement.post('/', (req : Request, res : Response, next) => {
  const {
    email: emailPerson,
    isOwner,
    canRead,
    canWrite,
  } = req.body;
  const { idList } = req.app.locals.list;

  PersonHasElement.create({
    emailPerson, idList, isOwner, canRead, canWrite,
  })
    .then((personhList: PersonHasElement) => {
      req.app.locals.success = true;
      res.status(200).json({ data: personhList, success: true });
      next();
    }).catch((err: any) => {
      res.status(500).json({ data: err, success: false });
    });
});

shareElement.delete('/', (req : Request, res : Response, next) => {
  const { email: emailPerson } = req.body;
  const { idList } = req.app.locals.list;

  PersonHasElement.destroy({ where: { emailPerson, idList } })
    .then((results: any) => {
      req.app.locals.success = true;
      res.status(200).json({ data: results, success: true });
      next();
    }).catch((err: any) => {
      res.status(500).json({ data: err, success: false });
    });
});

shareElement.use(stopTimer);

export default shareElement;
