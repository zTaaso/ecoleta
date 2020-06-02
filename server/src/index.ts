import express from 'express';

const app = express();

app.get('/users', (req, res) => {
  return res.json({ msg: 'mama aqui glubi glub glub' });
});

app.listen(3333);
