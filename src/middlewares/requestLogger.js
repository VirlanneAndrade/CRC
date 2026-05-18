const logger = require('../config/logger');

function buildRequestLogger() {
  try {
    const pinoHttp = require('pino-http');
    return pinoHttp({ logger });
  } catch (_err) {
    return function fallbackRequestLogger(req, _res, next) {
      logger.info({ method: req.method, url: req.originalUrl }, 'request');
      next();
    };
  }
}

module.exports = { buildRequestLogger };
