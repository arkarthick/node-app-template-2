import express, { Application } from 'express';
import { initExpress } from '@/loaders/express.loader';

export const createApp = (): Application => {
  const app = express();

  initExpress(app);

  return app;
};
