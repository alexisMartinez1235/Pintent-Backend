import express, { Request, Response } from 'express';
import ImagePin from '../model/ImagePin';
import { startTimer, stopTimer } from '../utils/metrics';

const pin = express.Router();

pin.use(startTimer);

pin.get('/', (req : Request, res : Response, next) => {
  const variable : string = req.query.variable?.toString() || 'ID'; // ID
  const order : string = req.query.order?.toString() || 'ASC'; // ASC | DESC  
  const inTrash: boolean = ( req.query.inTrash?.toString() === 'true' ) ? true : false;
  const { email, list } = req.app.locals;
  
  ImagePin.findAll({
    order: [
      [variable, order],
    ],
    where: { email, idList: list.getDataValue('idList'), inTrash },
  }).then((tasks: ImagePin[]) => {
    req.app.locals.success = true;
    res.status(200).json({ data: tasks, success: true });
    next();
  }).catch((err: any) => {
    res.status(500).json({ data: err, success: false });
  });
});

pin.post('/', (req : Request, res : Response, next) => {
  const { description } = req.body;
  const { email, list } = req.app.locals;
  
  ImagePin.create({
    description, email, idList: list.getDataValue('idList'),
  })
    .then((taskCreated: ImagePin) => {
      req.app.locals.success = true;
      res.status(200).json({ data: taskCreated, success: true });
      next();
    }).catch((err: any) => {
      res.status(500).json({ data: err, success: false });
    });
});

pin.put('/logical', (req : Request, res : Response, next) => {
  const { id } = req.body;
  const { list } = req.app.locals;

  ImagePin.update(
    { inTrash: true },
    { where: { id, idList: list.getDataValue('idList') } },
  ).then((results: any) => {
    req.app.locals.success = true;
    res.status(200).json({ data: results, success: true });
    next();
  }).catch((err: any) => {
    res.status(500).json({ data: err, success: false });
  });
});

pin.delete('/', (req : Request, res : Response, next) => {
  const { id } = req.body;
  const { list } = req.app.locals;
  
  ImagePin.destroy({ where: { id, idList: list.getDataValue('idList') } })
    .then((results: any) => {
      req.app.locals.success = true;
      res.status(200).json({ data: results, success: true });
      next();
    }).catch((err: any) => {
      res.status(500).json({ data: err, success: false });
    });
});

// end timer for db queries
pin.use(stopTimer);

export default pin;
