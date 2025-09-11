import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRouter from './routes/auth';
import gamesRouter from './routes/games';
import courseRouter from './routes/course';
import analyticsRouter from './routes/analytics';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'mapear-backend' });
});

app.use('/auth', authRouter);
app.use('/games', gamesRouter);
app.use('/course', courseRouter);
app.use('/analytics', analyticsRouter);

export default app;

