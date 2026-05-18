let logger;

try {
  const pino = require('pino');
  logger = pino({
    level: process.env.LOG_LEVEL || 'info',
  });
} catch (err) {
  logger = {
    info: console.log,
    warn: console.warn,
    error: console.error,
    debug: console.debug,
  };
}

module.exports = logger;
