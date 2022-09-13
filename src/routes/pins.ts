import express, { Request, Response } from 'express';
import ImagePin from '../model/ImagePin';
import { startTimer, stopTimer } from '../utils/metrics';
import pin from './pin';

const pins = express.Router();

// routes
pins.use(
  '/:idPin',
  (req, _res, next) => {
    req.app.locals.idPin = req.params.idPin;
    next();
  },
  pin
);

pins.use(startTimer);

pins.get('/', (req: Request, res: Response, next) => {
  const variable: string = req.query.variable?.toString() || 'ID'; // ID
  const order: string = req.query.order?.toString() || 'ASC'; // ASC | DESC
  const inTrash: boolean = req.query.inTrash?.toString() === 'true' ? true : false;
  const { email, list, formatRes } = req.app.locals;

  ImagePin.findAll({
    order: [[variable, order]],
    where: { email, idList: list.getDataValue('idList'), inTrash },
  })
    .then((tasks: ImagePin[]) => {
      req.app.locals.success = true;
      res.status(200).format(formatRes(req.originalUrl, { data: tasks, success: true }));
      next();
    })
    .catch((err: any) => {
      res.status(500).format(formatRes(req.originalUrl, { data: err, success: false }));
    });
});

pins.post('/', (req: Request, res: Response, next) => {
  const { description, image } = req.body;
  const { email, list, formatRes } = req.app.locals;

  ImagePin.create({
    description,
    email,
    image,
    idList: list.getDataValue('idList'),
  })
    .then((taskCreated: ImagePin) => {
      req.app.locals.success = true;
      res.status(200).format(formatRes(req.originalUrl, { data: taskCreated, success: true }));
      next();
    })
    .catch((err: any) => {
      res.status(500).format(formatRes(req.originalUrl, { data: err, success: false }));
    });
});

pins.put('/logical', (req: Request, res: Response, next) => {
  const { id } = req.body;
  const { list, formatRes } = req.app.locals;

  ImagePin.update({ inTrash: true }, { where: { id, idList: list.getDataValue('idList') } })
    .then((results: any) => {
      req.app.locals.success = true;
      res.status(200).format(formatRes(req.originalUrl, { data: results, success: true }));
      next();
    })
    .catch((err: any) => {
      res.status(500).format(formatRes(req.originalUrl, { data: err, success: false }));
    });
});

pins.delete('/', (req: Request, res: Response, next) => {
  const { id } = req.body;
  const { list, formatRes } = req.app.locals;

  ImagePin.destroy({ where: { id, idList: list.getDataValue('idList') } })
    .then((results: any) => {
      req.app.locals.success = true;
      res.status(200).format(formatRes(req.originalUrl, { data: results, success: true }));
      next();
    })
    .catch((err: any) => {
      res.status(500).format(formatRes(req.originalUrl, { data: err, success: false }));
    });
});

// end timer for db queries
pins.use(stopTimer);

export default pins;
