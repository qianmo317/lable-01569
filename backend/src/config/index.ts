export interface AppConfig {
  port: number;
  nodeEnv: string;
  isProduction: boolean;
  jwt: {
    secret: string;
    expiresIn: string;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  cors: {
    origins: string[];
  };
}

// Validate required environment variables in production
const validateProductionConfig = (): void => {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    const requiredEnvVars = ['JWT_SECRET', 'DB_PASSWORD'];
    const missing = requiredEnvVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`);
    }
    // Ensure JWT_SECRET is strong enough
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
  }
};

validateProductionConfig();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv,
  isProduction,
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-only-secret-key-not-for-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'campus_user',
    password: process.env.DB_PASSWORD || 'campus_password',
    database: process.env.DB_DATABASE || 'campus_trading',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // 100 requests per window
  },
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  },
};
