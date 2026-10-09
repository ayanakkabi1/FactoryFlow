import 'dotenv/config';
import express from 'express';
import installationRoute from './routes/InstallationRoute.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';

const app = express();

app.use(express.json());
app.use('/api/installation', installationRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);

app.get('/', (req, res) => {
  res.send('FactoryFlow API is running');
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Une erreur interne est survenue.',
  });
});

export default app;
