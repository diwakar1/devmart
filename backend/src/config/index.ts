import dotenv from 'dotenv';
import path from 'path';

import fs from 'fs';

// Load environment variables — try multiple paths for robustness
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
];
const envPath = envPaths.find(p => fs.existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // fallback to default behavior
}

interface Config {
  // Server
  nodeEnv: string;
  port: number;
  apiPrefix: string;

  // Database
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
    connectionLimit: number;
  };

  // JWT
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };

  // Cookie
  cookieSecret: string;

  // CORS
  corsOrigin: string;

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // File Upload
  upload: {
    maxFileSize: number;
    path: string;
  };

  // Logging
  logLevel: string;

  // Email
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };

  // Frontend URL (for links in emails)
  frontendUrl: string;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'devmart_user',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'devmart',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cookieSecret: process.env.COOKIE_SECRET || 'default_cookie_secret',

  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    path: process.env.UPLOAD_PATH || 'uploads/',
  },

  logLevel: process.env.LOG_LEVEL || 'info',

  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@devmart.com',
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
};

export default config;
