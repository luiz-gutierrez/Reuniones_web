import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Reuniones Web API',
      version: '1.0.0',
      description: 'Documentación de la API para el sistema de gestión de reuniones',
    },
    servers: [
      { url: 'http://localhost:4000/api' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;