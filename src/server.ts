import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './config/db.js';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 ViRa POS API Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  logger.info(`📡 Health check available at http://localhost:${env.PORT}/health`);
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during database disconnect');
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
