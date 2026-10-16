import 'dotenv/config';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import app from './app.js';
const port = Number(process.env.PORT) || 5000;

async function startServer() {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
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
