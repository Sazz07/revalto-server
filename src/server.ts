import { Server } from 'http';
import app from './app';
import config from './config';

const port = config.port;

if (process.env.NODE_ENV !== 'production') {
  (async function main() {
    const server: Server = app.listen(port, () => {
      console.log(`Revalto Store Server is running on port ${port}`);
    });

    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log('Server closed');
        });
      }
      process.exit(1);
    };

    process.on('uncaughtException', (error) => {
      console.log(error);
      exitHandler();
    });

    process.on('unhandledRejection', (error) => {
      console.log(error);
      exitHandler();
    });
  })();
}
