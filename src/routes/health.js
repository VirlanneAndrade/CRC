const express = require('express');
const env = require('../config/env');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'crc-portal-contribuinte',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
