export interface AppConfig {
  port: number;
  nodeEnv: string;
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
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USERNAME || 'campus_user',
    password: process.env.DB_PASSWORD || 'campus_password',
    database: process.env.DB_DATABASE || 'campus_trading',
  },
};
