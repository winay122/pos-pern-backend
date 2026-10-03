import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';
import { ApiError } from './utils/ApiError.js';
import { ApiResponse } from './utils/ApiResponse.js';

import { DEFAULT_CORS_ORIGINS } from './config/constants.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import shopRoutes from './modules/shop/shop.routes.js';
import productRoutes from './modules/product/product.routes.js';
import stockRoutes from './modules/stock/stock.routes.js';
import saleRoutes from './modules/sale/sale.routes.js';
import syncRoutes from './modules/sync/sync.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app: Express = express();

// Security and compression middleware
app.use(helmet());
app.use(compression());

// Combine origins from environment and constants
const allowedOrigins = Array.from(new Set([...DEFAULT_CORS_ORIGINS, ...env.CORS_ORIGIN]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      // If '*' is present in origins, permit all
      if (allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === origin) return true;
        if (allowed.startsWith('.') && origin.endsWith(allowed)) return true;
        return false;
      });

      if (isAllowed) {
        return callback(null, true);
      }

      // Dynamically permit ngrok / tunnel domains in development
      if (
        env.NODE_ENV === 'development' &&
        (origin.includes('ngrok-free.dev') ||
          origin.includes('ngrok-free.app') ||
          origin.includes('ngrok.io'))
      ) {
        return callback(null, true);
      }

      return callback(null, true); // Fallback safe in development
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging & Rate Limiting
app.use(requestLogger);
app.use('/api', apiLimiter);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json(
    ApiResponse.success('ViRa POS API is healthy', {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    })
  );
});

// App module routes
app.use('/auth', authRoutes);
app.use('/shop', shopRoutes);
app.use('/product', productRoutes);
app.use('/stock', stockRoutes);
app.use('/sale', saleRoutes);
app.use('/sync', syncRoutes);
app.use('/admin', adminRoutes);

// Fallback for unmatched routes
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
});

// Centralized error handling
app.use(errorHandler);

export default app;
