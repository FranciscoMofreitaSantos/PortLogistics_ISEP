import 'reflect-metadata';
import app from './app';
import loaders from './loaders';
import config from './config';
import { setupSwagger } from './swagger';

async function startServer() {
    
    await loaders({ expressApp: app });
    setupSwagger(app,config.port);

    app.listen(config.port, () => {
        console.log(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️ 
      ################################################
      Swagger UI available at: ${config.port}/api-docs
      Swagger JSON available at: ${config.port}/api-docs.json
    `);
    }).on('error', err => {
        console.error(err);
        process.exit(1);
    });
    
    
}

startServer();