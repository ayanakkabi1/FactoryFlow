import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FactoryFlow API',
      version: '1.0.0',
      description: 'Interactive documentation for the FactoryFlow API.',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/controllers/*.js', './src/models/openapiSchemas.js'],
};

export default swaggerJsdoc(options);
