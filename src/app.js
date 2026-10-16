import 'dotenv/config';
import express from 'express';
import installationRoute from './routes/InstallationRoute.js';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import materialRoute from './routes/materialRoutes.js';
import stockRoute from './routes/stockRoutes.js';
import produitRoute from './routes/produitRoute.js';
import compositionRoute from './routes/compositionRoutes.js';
import ordreRoute from './routes/ordreRoutes.js';
import AppError from './errors/AppError.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './config/swagger.js';

const app = express();

app.use(express.json());
app.use('/api/installation', installationRoute);
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/materials', materialRoute);
app.use('/api/stock', stockRoute);
app.use('/api/produits', produitRoute);
app.use('/api/compositions', compositionRoute);
app.use('/api/ordres', ordreRoute);

app.get('/', (req, res) => {
  res.send('FactoryFlow API is running');
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Une erreur interne est survenue.',
  });
});

app.use((req, res, next) => {
  next(new AppError(`Impossible de trouver la route ${req.originalUrl} sur ce serveur.`, 404));
});

app.use(globalErrorHandler);

export default app;
