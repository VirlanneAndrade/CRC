const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 4000),
  SESSION_SECRET: process.env.SESSION_SECRET || 'crc_secret',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  RATE_LIMIT_PUBLIC: Number(process.env.RATE_LIMIT_PUBLIC || 200),
  EQFIS_API_BASE_URL: process.env.EQFIS_API_BASE_URL || 'http://localhost:3000/api/dte',
  EQFIS_API_KEY: process.env.EQFIS_API_KEY || '',
  EQFIS_TIMEOUT_MS: Number(process.env.EQFIS_TIMEOUT_MS || 10000),

  // Integração com a API da empresa de Tributos (homologação/produção)
  TRIBUTOS_API_BASE_URL: process.env.TRIBUTOS_API_BASE_URL || '',
  TRIBUTOS_API_KEY: process.env.TRIBUTOS_API_KEY || '',
  // Tipo de autenticação aceito pela API deles: 'bearer' | 'x-api-key' | 'none'
  TRIBUTOS_AUTH_TYPE: process.env.TRIBUTOS_AUTH_TYPE || 'x-api-key',
  TRIBUTOS_TIMEOUT_MS: Number(process.env.TRIBUTOS_TIMEOUT_MS || 10000),
};

module.exports = env;
