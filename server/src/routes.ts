import { Router } from 'express';

const routes = Router();

routes.get('/users', (req, res) => {
  return res.json({ msg: 'vc é corno' });
});

export default routes;
