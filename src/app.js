import 'dotenv/config';
import express from 'express';
import 'express-async-errors';
import youch from 'youch';
import routes from './routes';
import path from 'path';
import cors from 'cors';
import './database';
import * as sentry from '@sentry/node';
import sentryConfig from './config/sentry';

class App {
  constructor() {
    this.server = express();
    sentry.init(sentryConfig);
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(cors())
    this.server.use(sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')))
  }

  routes() {
    this.server.use(routes);
    this.server.use(sentry.Handlers.errorHandler());
  }
  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new youch(err, req).toJSON();
        return res.status(500).json(errors);
      }
      return res.status(500).json({ error: 'Internal server error' });
    })
  }
}

export default new App().server;
