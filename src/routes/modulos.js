const express = require('express');
const { getRepositories } = require('../repositories');
const { requireMaster } = require('../middlewares/adminAuth');

const router = express.Router();

const DEFAULT_MODULES = {
  dashboard: true, situacao_fiscal: true, certidoes: true, alvara: true, cartao_cga: true,
  segunda_via: true, extrato_divida: true, tributos: true, acordo: true, itiv: true, nfse: true,
  ficha_cadastral: true, autenticacao: true, legislacao: true, procuracao: true, protocolo: true,
  dec: true, caixa_postal: true, notificacoes: true, perfil: true, faq: true, config_dev: true,
};

function normalizeModulos(raw) {
  const out = { ...DEFAULT_MODULES };
  if (raw && typeof raw === 'object') {
    for (const key of Object.keys(DEFAULT_MODULES)) {
      if (typeof raw[key] === 'boolean') out[key] = raw[key];
    }
  }
  return out;
}

router.get('/api/v1/modulos', async (_req, res) => {
  const repos = getRepositories();
  const stored = await repos.config.getModulos();
  res.json({ modulos: normalizeModulos(stored) });
});

router.put('/api/v1/modulos', requireMaster, async (req, res) => {
  const repos = getRepositories();
  const modulos = normalizeModulos(req.body?.modulos || req.body);
  const saved = await repos.config.saveModulos(modulos);
  await repos.log.addAuditoria({
    usuarioId: req.session?.admin?.id || null,
    acao: 'config.modulos.update',
    entidade: 'ConfiguracaoModulos',
    detalhe: null,
    ip: req.ip,
    userAgent: req.header('user-agent') || null,
  }).catch(() => {});
  res.json({ ok: true, modulos: normalizeModulos(saved) });
});

module.exports = router;
