const express = require('express');
const env = require('../config/env');
const { getNotificacoes } = require('../services/eqfisClient');

const router = express.Router();

router.get('/api/dte/eqfis/notificacoes', async (req, res) => {
  const result = await getNotificacoes(req.query.cpfCnpj);
  return res.status(result.status).json(result.body);
});

router.get('/api/dte/status', (_req, res) => {
  res.json({
    dteServedFromRepository: true,
    dteRoute: '/dte',
    eqfisApiBaseUrl: env.EQFIS_API_BASE_URL,
    eqfisProxyEnabled: true,
  });
});

module.exports = router;
