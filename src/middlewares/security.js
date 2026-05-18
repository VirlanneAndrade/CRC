const env = require('../config/env');

function noopMiddleware(_req, _res, next) {
  next();
}

function buildSecurityMiddlewares() {
  let helmetMiddleware = noopMiddleware;
  let corsMiddleware = noopMiddleware;
  let rateLimitMiddleware = noopMiddleware;

  try {
    const helmet = require('helmet');
    helmetMiddleware = helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    });
  } catch (_err) {
    // dependencia opcional no bootstrap inicial
  }

  try {
    const cors = require('cors');
    corsMiddleware = cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
      credentials: true,
    });
  } catch (_err) {
    // dependencia opcional no bootstrap inicial
  }

  try {
    const rateLimit = require('express-rate-limit');
    rateLimitMiddleware = rateLimit({
      windowMs: 60 * 1000,
      max: env.RATE_LIMIT_PUBLIC,
      standardHeaders: true,
      legacyHeaders: false,
      message: { erro: 'Muitas requisições. Tente novamente em instantes.' },
    });
  } catch (_err) {
    // dependencia opcional no bootstrap inicial
  }

  return {
    helmetMiddleware,
    corsMiddleware,
    rateLimitMiddleware,
  };
}

module.exports = { buildSecurityMiddlewares };
