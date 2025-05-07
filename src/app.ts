import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';

const app: Application = express();

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:300'],
    credentials: true,
  })
);

// Home Route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to our bike store server!');
});

// Application Routes
app.use('/api/v1', router);

//middleware
app.use(globalErrorHandler);
app.use(notFound);

export default app;
