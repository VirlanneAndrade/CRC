const express = require('express');
const { getRepositories } = require('../repositories');

const router = express.Router();

const DEFAULT_IA_CONFIG = {
  provedor: '',
  modelo: '',
  apiKey: '',
  systemPrompt: '',
  temperatura: 0.7,
  temasBloqueados: [],
};

function maskApiKey(key) {
  const value = String(key || '');
  if (!value) return '';
  if (value.length <= 4) return '••••';
  return `••••${value.slice(-4)}`;
}

function normalizeIaConfig(raw = {}) {
  const temperatura = Number(raw.temperatura);
  const temasBloqueados = Array.isArray(raw.temasBloqueados)
    ? raw.temasBloqueados.map((x) => String(x || '').trim()).filter(Boolean)
    : [];
  return {
    provedor: String(raw.provedor || '').trim(),
    modelo: String(raw.modelo || '').trim(),
    apiKey: typeof raw.apiKey === 'string' ? raw.apiKey.trim() : '',
    systemPrompt: String(raw.systemPrompt || '').trim(),
    temperatura: Number.isFinite(temperatura) ? Math.min(2, Math.max(0, temperatura)) : DEFAULT_IA_CONFIG.temperatura,
    temasBloqueados,
  };
}

function toPublicIaConfig(config) {
  return {
    provedor: config.provedor,
    modelo: config.modelo,
    systemPrompt: config.systemPrompt,
    temperatura: config.temperatura,
    temasBloqueados: config.temasBloqueados,
    hasApiKey: !!config.apiKey,
    apiKeyMask: maskApiKey(config.apiKey),
  };
}

router.get('/api/v1/ia/config', async (_req, res) => {
  const repos = getRepositories();
  const stored = await repos.config.getIa();
  res.json({ config: toPublicIaConfig(normalizeIaConfig(stored || DEFAULT_IA_CONFIG)) });
});

router.put('/api/v1/ia/config', async (req, res) => {
  const repos = getRepositories();
  const stored = normalizeIaConfig((await repos.config.getIa()) || DEFAULT_IA_CONFIG);
  const incoming = normalizeIaConfig(req.body || {});
  // apiKey vazia no PUT preserva a chave existente (o front recebe apenas a mascara).
  const apiKey = incoming.apiKey || stored.apiKey;
  const config = { ...incoming, apiKey };
  await repos.config.saveIa(config);
  await repos.log.addAuditoria({
    usuarioId: req.session?.admin?.id || null,
    acao: 'config.ia.update',
    entidade: 'ConfiguracaoIa',
    detalhe: null,
    ip: req.ip,
    userAgent: req.header('user-agent') || null,
  }).catch(() => {});
  res.json({ ok: true, config: toPublicIaConfig(config) });
});

module.exports = router;
