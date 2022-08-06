import express, { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import List from '../model/List';
import list from './list';
import { startTimer, stopTimer } from '../utils/metrics';
import PersonHasElement from '../model/PersonHasElement';
import Person from '../model/Person';
import { sequelize } from '../utils/database';
// import { databaseResponseTimeHistogram } from '../utils/metrics';

const lists = express.Router();

// save email for services
lists.use((req, _res, next) => {
  if (req.user instanceof Person) {
    req.app.locals.email = req.user.getDataValue('email');
  }
  next();
});

// routes
lists.use('/:idList', (req, _res, next) => {
  req.app.locals.idList = req.params.idList;
  next();
}, list);

lists.use(startTimer);

lists.get('/', (req : Request, res : Response, next) => {
  const variable : string = req.query.variable?.toString() || 'id'; // ID, etc
  const order : string = req.query.order?.toString() || 'ASC'; // ASC | DESC
  const inTrash: string = req.query.inTrash?.toString() || 'false';
  const { email: myEmail } = req.app.locals;

  // startTimer(req);

  sequelize.query(' \
    SELECT * \
    FROM `LIST` \
    FULL JOIN `PERSON_HAS_ELEMENT` ON id = `PERSON_HAS_ELEMENT`.idList \
    WHERE emailPerson=:myEmail AND \
      inTrash=:inTrash \
    ORDER BY :variable :order',
  {
    type: QueryTypes.SELECT,
    replacements: {
      myEmail,
      inTrash,
      variable,
      order,
    },
  }).then((personHasList: any[]) => {
    req.app.locals.success = true;
    res.status(200).json({ data: personHasList, success: true });
    // stopTimer(req);
    next();
  }).catch((err: any) => {
    res.status(500).json({ data: err, success: false });
  });
});

lists.post('/', (req : Request, res : Response, next) => {
  const { listName } = req.body;
  
  List.create({
    listName, email: req.app.locals.email,
  }).then((listCreated: List) => {
    req.app.locals.success = true;
    PersonHasElement.create({
      emailPerson: req.app.locals.email,
      idList: listCreated.getDataValue('id'),
      isOwner: true,
      canRead: true,
      canWrite: true,
    }).then((personHList: PersonHasElement | null) => {
      res.status(200).json({
        data: [listCreated, personHList],
        success: true,
      });
      next();
    }).catch((err: any) => {
      res.status(500).json({
        data: err,
        success: false,
      });
    });
  }).catch((err: any) => {
    res.status(500).json({
      data: err,
      success: false,
    });
  });
});

// end timer for LIST db queries
lists.use(stopTimer);

export default lists;
