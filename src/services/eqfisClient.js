const env = require('../config/env');

function sanitizeCpfCnpj(value) {
  return String(value || '').replace(/\D/g, '');
}

function ensureValidCpfCnpj(value) {
  const digits = sanitizeCpfCnpj(value);
  if (digits.length === 11 || digits.length === 14) {
    return digits;
  }
  return null;
}

function buildEqfisUrl(pathname) {
  const trimmedBase = String(env.EQFIS_API_BASE_URL || '').replace(/\/+$/, '');
  const trimmedPath = String(pathname || '').replace(/^\/+/, '');
  return `${trimmedBase}/${trimmedPath}`;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.EQFIS_TIMEOUT_MS);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function getNotificacoes(cpfCnpj) {
  const documento = ensureValidCpfCnpj(cpfCnpj);
  if (!documento) {
    return { ok: false, status: 400, body: { erro: 'CPF/CNPJ inválido. Informe 11 ou 14 dígitos.' } };
  }

  const headers = {
    Accept: 'application/json',
    'X-Contribuinte-CPFCNPJ': documento,
  };
  if (env.EQFIS_API_KEY) {
    headers['X-API-Key'] = env.EQFIS_API_KEY;
  }

  try {
    const resp = await fetchWithTimeout(buildEqfisUrl('notificacoes'), { method: 'GET', headers });
    const body = await resp.json().catch(() => ({}));
    return { ok: resp.ok, status: resp.status, body };
  } catch (_err) {
    return { ok: false, status: 502, body: { erro: 'Falha ao comunicar com EQFIS.' } };
  }
}

module.exports = {
  sanitizeCpfCnpj,
  ensureValidCpfCnpj,
  buildEqfisUrl,
  getNotificacoes,
};
