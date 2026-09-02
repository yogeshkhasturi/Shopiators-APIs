import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shopiators Public API',
      version: '1.0.0',
      description: 'Public API for integrating with Shopiators stores',
    },
    servers: process.env.NODE_ENV === 'production' 
      ? [
          {
            url: 'https://api.shopiators.com/api/v1',
            description: 'Production server',
          }
        ]
      : [
          {
            url: 'http://localhost:3000/api/v1',
            description: 'Development server',
          },
          {
            url: 'https://api.shopiators.com/api/v1',
            description: 'Production server',
          }
        ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Products', description: 'Product management' },
      { name: 'Variants', description: 'Variant management' },
      { name: 'Collections', description: 'Collection management' },
      { name: 'Attributes', description: 'Attribute management' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API_KEY',
          description: 'Enter your API key here (e.g. sk_live_...)'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/v1/*.ts', './src/docs/schemas.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);
