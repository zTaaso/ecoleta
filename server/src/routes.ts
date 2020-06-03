import express, { Router } from 'express';
import { resolve } from 'path';

const routes = Router();

routes.get('/users', (req, res) => res.json({ msg: 'vc é cornooooooo' }));
routes.use('/uploads', express.static(resolve(__dirname, '..', 'tmp')));

export default routes;
