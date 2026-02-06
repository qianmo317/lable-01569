import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { initializeDatabase } from './config/database';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { seedDatabase } from './seeds';

const app = express();
const PORT = config.port;

// CORS configuration - restrict origins in production
const corsOptions: cors.CorsOptions = {
  origin: config.isProduction 
    ? config.cors.origins 
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Rate limiting - protect against brute force and DDoS
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    message: '登录尝试过于频繁，请15分钟后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares
app.use(cors(corsOptions));
app.use(limiter); // Apply general rate limiting
app.use(express.json({ limit: '1mb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply stricter rate limiting to auth routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Campus Trading Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '校园交易平台 API 文档',
}));

// Serve OpenAPI spec as JSON
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    // Seed database with initial data
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔒 Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
