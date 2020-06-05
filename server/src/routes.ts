import express, { Router } from 'express';
import { resolve } from 'path';

import itemController from './controllers/itemController';
import PointController from './controllers/PointController';

const routes = Router();

routes.use('/uploads', express.static(resolve(__dirname, '..', 'tmp')));

routes.get('/items', itemController.index);

routes.post('/points', PointController.store);
routes.get('/points/:id', PointController.show);
routes.get('/points', PointController.index);
routes.delete('/points/:id', PointController.delete);
// routes.get('/points/all', PointController.listAll)

export default routes;
