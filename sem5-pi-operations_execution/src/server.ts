import 'reflect-metadata';
import app from './app';
import loaders from './loaders';
import config from './config'; // Importar o config para usar a porta definida lá

async function startServer() {

    await loaders({ expressApp: app });

    app.listen(config.port, () => {
        console.log(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️ 
      ################################################
    `);
    }).on('error', err => {
        console.error(err);
        process.exit(1);
    });
}

startServer();