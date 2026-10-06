import 'dotenv/config';
import express from 'express';
import { connectDatabase, disconnectDatabase } from './config/db.js';

const app = express();
const port = Number(process.env.PORT) || 5000;

app.get('/', (req, res) => {
  res.send('FactoryFlow API is running');
});

async function startServer() {
  await connectDatabase();

  const server = app.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}`);
  });

  const shutdown = async (signal) => {
    console.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

startServer().catch((error) => {
  console.error('Server startup aborted:', error.message);
  process.exitCode = 1;
});