import express, { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import List from '../model/List';
import pin from './pin';
import shareElement from './shareElement';
import { startTimer, stopTimer } from '../utils/metrics';
import PersonHasElement from '../model/PersonHasElement';
import { sequelize } from '../utils/database';


const list = express.Router();

list.use((req : Request, res : Response, next: any) => {
  const idList: string = req.app.locals.idList?.toString();
  
  PersonHasElement.findOne({
    where: { idList, emailPerson: req.app.locals.email },
  }).then((resList: List | null) => {
    req.app.locals.list = resList;
    // console.log(resList);
    next();
  })
    .catch((err: any) => {
      res.status(500).json({ data: err, success: false });
    });
});

// routes
list.use('/pin', pin);
list.use('/share', shareElement);


list.use(startTimer);

list.get('/', (req : Request, res : Response, next) => {
  const variable : string = req.query.variable?.toString() || 'id'; // ID, etc
  const order : string = req.query.order?.toString() || 'ASC'; // ASC | DESC
  const inTrash: string = req.query.inTrash?.toString() || 'false';
  const { email: myEmail } = req.app.locals;
  const idList: string = req.app.locals.idList?.toString();

  sequelize.query(' \
    SELECT * \
    FROM `LIST` \
    FULL JOIN `PERSON_HAS_ELEMENT` ON id = `PERSON_HAS_ELEMENT`.idList \
    WHERE emailPerson=:myEmail AND \
      inTrash=:inTrash AND \
      `PERSON_HAS_ELEMENT`.idList=:idList \
    ORDER BY :variable :order',
  {
    type: QueryTypes.SELECT,
    replacements: {
      myEmail,
      variable,
      order,
      inTrash,
      idList,
    },
  }).then((personHasList: any[]) => {
    if (personHasList.length === 0) return res.status(404).send({
      data: 'List not found',
      success: false,
    });
    req.app.locals.success = true;
    res.status(200).json({ data: personHasList[0], success: true });
    // stopTimer(req);
    return next();
  }).catch((err: any) => {
    res.status(500).json({ data: err, success: false });
  });
});

list.put('/logical', (req : Request, res : Response, next) => {
  const { idList: id } = req.app.locals;

  List.update(
    { inTrash: true },
    { where: { id } },
  ).then((results: any) => {
    req.app.locals.success = true;
    res.status(200).json({ data: results, success: true });
    next();
  }).catch((err: any) => {
    res.status(500).json({ data: err, success: false });
  });
});

list.delete('/', (req : Request, res : Response, next) => {
  const { idList } = req.app.locals;
  
  PersonHasElement.destroy({
    where: { idList, emailPerson: req.app.locals.email },
  }).then(() => {
    List.destroy({ where: { id: idList } })
      .then((resultsListD: any) => {
        if (resultsListD === 0) return res.status(404).json({ data: resultsListD, success: false });
        req.app.locals.success = true;
        res.status(200).json({ data: resultsListD, success: true });
        return next();
      }).catch((err: any) => {
        res.status(500).json({ data: err, success: false });
      });
  }).catch((err: any) => {
    res.status(500).json({ data: err, success: false });
  });
});

// end timer for LIST db queries
list.use(stopTimer);

export default list;

