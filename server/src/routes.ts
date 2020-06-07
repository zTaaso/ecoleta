import express, { Router } from 'express';
import { resolve } from 'path';
import { celebrate, Joi } from 'celebrate';
import multer from 'multer';
import multerConfig from './config/multer';

import itemController from './controllers/itemController';
import PointController from './controllers/PointController';

import PointValidator from './validators/PointValidator';

const routes = Router();
const upload = multer(multerConfig);

routes.use('/uploads', express.static(resolve(__dirname, '..', 'tmp')));

routes.get('/items', itemController.index);

routes.post(
	'/points',
	upload.single('image'),
	PointValidator.store(),
	PointController.store
);
routes.get('/points/:id', PointController.show);
routes.get('/points', PointController.index);
routes.delete('/points/:id', PointController.delete);

export default routes;
