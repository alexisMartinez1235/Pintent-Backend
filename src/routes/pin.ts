import express, { Request, Response } from 'express';
import ImagePin from '../model/ImagePin';
import { startTimer, stopTimer } from '../utils/metrics';

const pin = express.Router();

pin.use(startTimer);

pin.get('/', (req : Request, res : Response, next) => {
  const variable : string = req.query.variable?.toString() || 'ID'; // ID
  const order : string = req.query.order?.toString() || 'ASC'; // ASC | DESC  
  const inTrash: boolean = ( req.query.inTrash?.toString() === 'true' ) ? true : false;
  const { idPin, email, list, formatRes } = req.app.locals;
  
  ImagePin.findOne({
    order: [
      [variable, order],
    ],
    where: { email, idList: list.getDataValue('idList'), inTrash, id: idPin},
  }).then((tasks: ImagePin | null) => {
    req.app.locals.success = true;
    res.status(200).format(formatRes(req.originalUrl, { data: tasks, success: true }));
    next();
  }).catch((err: any) => {
    res.status(500).format(formatRes(req.originalUrl, { data: err, success: false }));
  });
});

pin.put('/logical', (req : Request, res : Response, next) => {
  const { idPin, list, formatRes } = req.app.locals;

  ImagePin.update(
    { inTrash: true },
    { where: { id: idPin, idList: list.getDataValue('idList') } },
  ).then((results: any) => {
    req.app.locals.success = true;
    res.status(200).format(formatRes(req.originalUrl, { data: results, success: true }));
    next();
  }).catch((err: any) => {
    res.status(500).format(formatRes(req.originalUrl, { data: err, success: false }));
  });
});

pin.delete('/', (req : Request, res : Response, next) => {
  const { idPin, list, formatRes } = req.app.locals;

  ImagePin.destroy({ where: { id: idPin, idList: list.getDataValue('idList') } })
    .then((results: any) => {
      req.app.locals.success = true;
      res.status(200).format(formatRes(req.originalUrl, { data: results, success: true }));
      next();
    }).catch((err: any) => {
      res.status(500).format(formatRes(req.originalUrl, { data: err, success: false }));
    });
});

// end timer for db queries
pin.use(stopTimer);

export default pin;
