import express from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export const setupSwagger = (app: express.Application, port: number) => {
  const options: swaggerJSDoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.0.0',
        description: 'API Documentation',
      },
      servers: [{ url: `http://localhost:${port}` }],
    },
    apis: ['src/api/routes/**/*.ts'], 
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
