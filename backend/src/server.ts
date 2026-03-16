import app from './app';
import config from './config';
import db from './config/database';

const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await db.testConnection();

    // Start server
    app.listen(config.port, () => {
      console.log(` API URL: http://localhost:${config.port}${config.apiPrefix}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

startServer();
