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
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Login: {
          type: 'object', required: ['email', 'password'],
          properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
        },
        Installation: {
          type: 'object', required: ['name', 'email', 'password'],
          properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6 } },
        },
        User: {
          type: 'object', required: ['name', 'email', 'password'],
          properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6 } },
        },
        Material: {
          type: 'object', required: ['reference', 'name', 'uniteMesure'],
          properties: { reference: { type: 'string' }, name: { type: 'string' }, uniteMesure: { type: 'string' }, quantiteDisponible: { type: 'number', minimum: 0 }, seuilAlerte: { type: 'number', minimum: 0 } },
        },
        Product: {
          type: 'object', required: ['reference', 'nom'],
          properties: { reference: { type: 'string' }, nom: { type: 'string' }, description: { type: 'string' }, prix: { type: 'number', minimum: 0 }, composition: { type: 'array', items: { type: 'object' } } },
        },
        CompositionItem: {
          type: 'object', required: ['matiere', 'quantiteNecessaire'],
          properties: { produit: { type: 'string', description: 'MongoDB product ID; omitted when the product ID is in the URL.' }, matiere: { type: 'string', description: 'MongoDB material ID.' }, quantiteNecessaire: { type: 'number', exclusiveMinimum: 0 } },
        },
        Order: {
          type: 'object', required: ['code', 'produit', 'quantiteAFabriquer', 'assigneA'],
          properties: { code: { type: 'string' }, produit: { type: 'string' }, quantiteAFabriquer: { type: 'number', exclusiveMinimum: 0 }, assigneA: { type: 'string' } },
        },
        StockMovement: {
          type: 'object', required: ['type', 'matiereId', 'quantite'],
          properties: { type: { type: 'string', enum: ['ENTREE', 'SORTIE'] }, matiereId: { type: 'string' }, quantite: { type: 'number', exclusiveMinimum: 0 }, motif: { type: 'string', maxLength: 255 } },
        },
        OrderStatus: {
          type: 'object', required: ['statut'], properties: { statut: { type: 'string', enum: ['PLANIFIE', 'EN_COURS', 'TERMINE', 'ANNULE'] } },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

export default swaggerJsdoc(options);
