/* =============================================================
   tributosClient — Camada de integração com a API de Tributos (JFU/Webrun)
   ============================================================= */

const env = require('../config/env');
const logger = require('../config/logger');

const JFU_RULE_CONTRIBUINTES = 'contribuintes.rule';
const JFU_SYS = 'JFU';

function isConfigured() {
  return Boolean(env.TRIBUTOS_API_BASE_URL);
}

function sanitizeCpfCnpj(value) {
  return String(value || '').replace(/\D/g, '');
}

function ensureValidCpfCnpj(value) {
  const digits = sanitizeCpfCnpj(value);
  return digits.length === 11 || digits.length === 14 ? digits : null;
}

function buildUrl(pathname, query = {}) {
  const base = String(env.TRIBUTOS_API_BASE_URL || '').replace(/\/+$/, '');
  const path = String(pathname || '').replace(/^\/+/, '');
  const url = new URL(`${base}/${path}`);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v) !== '') {
      url.searchParams.set(k, String(v));
    }
  });
  return url.toString();
}

function buildRuleUrl(query = {}) {
  return buildUrl(JFU_RULE_CONTRIBUINTES, { sys: JFU_SYS, ...query });
}

function buildHeaders(extra = {}) {
  const headers = { Accept: 'application/json', ...extra };
  const authType = String(env.TRIBUTOS_AUTH_TYPE || 'x-api-key').toLowerCase();
  if (env.TRIBUTOS_API_KEY && authType !== 'none') {
    if (authType === 'x-api-key') headers['X-API-Key'] = env.TRIBUTOS_API_KEY;
    else headers.Authorization = `Bearer ${env.TRIBUTOS_API_KEY}`;
  }
  return headers;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.TRIBUTOS_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function request(method, pathname, { query, body } = {}) {
  if (!isConfigured()) {
    return {
      ok: false,
      status: 503,
      body: { erro: 'Integração de tributos não configurada (TRIBUTOS_API_BASE_URL vazio).', codigo: 'TRIBUTOS_NAO_CONFIGURADO' },
    };
  }

  const url = buildUrl(pathname, query);
  const options = { method, headers: buildHeaders(body ? { 'Content-Type': 'application/json' } : {}) };
  if (body) options.body = JSON.stringify(body);

  try {
    const resp = await fetchWithTimeout(url, options);
    const data = await resp.json().catch(() => ({}));
    return { ok: resp.ok, status: resp.status, body: data };
  } catch (err) {
    logger.error({ err, url }, 'Falha ao comunicar com a API de Tributos');
    return { ok: false, status: 502, body: { erro: 'Falha de comunicação com a API de Tributos.', codigo: 'TRIBUTOS_INDISPONIVEL' } };
  }
}

async function requestRule(query = {}) {
  if (!isConfigured()) {
    return {
      ok: false,
      status: 503,
      body: { erro: 'Integração de tributos não configurada (TRIBUTOS_API_BASE_URL vazio).', codigo: 'TRIBUTOS_NAO_CONFIGURADO' },
    };
  }

  const url = buildRuleUrl(query);
  try {
    const resp = await fetchWithTimeout(url, { method: 'GET', headers: buildHeaders() });
    const data = await resp.json().catch(() => ({}));
    return { ok: resp.ok, status: resp.status, body: data };
  } catch (err) {
    logger.error({ err, url }, 'Falha ao comunicar com a API JFU');
    return { ok: false, status: 502, body: { erro: 'Falha de comunicação com a API de Tributos.', codigo: 'TRIBUTOS_INDISPONIVEL' } };
  }
}

function withDocumento(value, fn) {
  const documento = ensureValidCpfCnpj(value);
  if (!documento) {
    return Promise.resolve({
      ok: false,
      status: 400,
      body: { erro: 'CPF/CNPJ inválido. Informe 11 ou 14 dígitos.', codigo: 'DOCUMENTO_INVALIDO' },
    });
  }
  return fn(documento);
}

const health = () => request('GET', '/health');

const getContribuinte = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => requestRule({ cpfCnpj: doc }));

const getResumoFiscal = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => requestRule({ cpfCnpj: doc, resumo: 'true' }));

const getSituacaoFiscal = () =>
  Promise.resolve({
    ok: false,
    status: 503,
    body: { erro: 'Situação fiscal não implementada para a API JFU.', codigo: 'NAO_IMPLEMENTADO' },
  });

const getInscricoesImobiliarias = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/inscricoes/imobiliarias', { query: { cpfCnpj: doc } }));
const getInscricaoImobiliaria = (inscricao) =>
  request('GET', `/v1/inscricoes/imobiliarias/${encodeURIComponent(inscricao)}`);

const getInscricoesEconomicas = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/inscricoes/economicas', { query: { cpfCnpj: doc } }));
const getInscricaoEconomica = (inscricao) =>
  request('GET', `/v1/inscricoes/economicas/${encodeURIComponent(inscricao)}`);

const getLancamentos = (cpfCnpj, filtros = {}) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/lancamentos', { query: { cpfCnpj: doc, ...filtros } }));

const getDividaAtiva = (cpfCnpj, filtros = {}) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/divida-ativa', { query: { cpfCnpj: doc, ...filtros } }));

const getParcelamentos = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/parcelamentos', { query: { cpfCnpj: doc } }));
const simularAcordo = (payload) => request('POST', '/v1/acordos/simular', { body: payload });
const formalizarAcordo = (payload) => request('POST', '/v1/acordos/formalizar', { body: payload });
const cancelarAcordo = (acordoId, motivo) =>
  request('POST', `/v1/acordos/${encodeURIComponent(acordoId)}/cancelar`, { body: { motivo } });

const emitirSegundaVia = (payload) => request('POST', '/v1/documentos/segunda-via', { body: payload });
const emitirGuiaUnificada = (payload) => request('POST', '/v1/documentos/guia-unificada', { body: payload });

const emitirCertidao = (payload) => request('POST', '/v1/certidoes/emitir', { body: payload });
const autenticarCertidao = (codigo) =>
  request('GET', `/v1/certidoes/autenticar/${encodeURIComponent(codigo)}`);

const getAlvaras = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/alvaras', { query: { cpfCnpj: doc } }));
const getElegibilidadeAlvara = (inscricao) =>
  request('GET', `/v1/alvaras/${encodeURIComponent(inscricao)}/elegibilidade`);
const emitirAlvara = (payload) => request('POST', '/v1/alvaras/emitir', { body: payload });

const getCga = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/cga', { query: { cpfCnpj: doc } }));
const emitirCga = (payload) => request('POST', '/v1/cga/emitir', { body: payload });

const calcularItiv = (payload) => request('POST', '/v1/itiv/calcular', { body: payload });
const emitirGuiaItiv = (payload) => request('POST', '/v1/itiv/emitir-guia', { body: payload });

const getNfse = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/nfse', { query: { cpfCnpj: doc } }));
const emitirNfse = (payload) => request('POST', '/v1/nfse/emitir', { body: payload });
const cancelarNfse = (numero, motivo) =>
  request('POST', `/v1/nfse/${encodeURIComponent(numero)}/cancelar`, { body: { motivo } });

const getProtocolos = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/protocolos', { query: { cpfCnpj: doc } }));
const abrirProtocolo = (payload) => request('POST', '/v1/protocolos', { body: payload });
const getProtocolo = (numero) => request('GET', `/v1/protocolos/${encodeURIComponent(numero)}`);

const getNotificacoes = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/notificacoes', { query: { cpfCnpj: doc } }));
const getNotificacao = (id) => request('GET', `/v1/notificacoes/${encodeURIComponent(id)}`);
const registrarCiencia = (id) => request('POST', `/v1/notificacoes/${encodeURIComponent(id)}/ciencia`);

const getCaixaPostal = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/caixa-postal', { query: { cpfCnpj: doc } }));
const marcarCaixaPostalLida = (id) =>
  request('POST', `/v1/caixa-postal/${encodeURIComponent(id)}/marcar-lida`);

const getPagamentos = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/pagamentos', { query: { cpfCnpj: doc } }));

module.exports = {
  isConfigured,
  sanitizeCpfCnpj,
  ensureValidCpfCnpj,
  buildRuleUrl,
  buildHeaders,
  request,
  requestRule,
  health,
  getContribuinte,
  getResumoFiscal,
  getSituacaoFiscal,
  getInscricoesImobiliarias,
  getInscricaoImobiliaria,
  getInscricoesEconomicas,
  getInscricaoEconomica,
  getLancamentos,
  getDividaAtiva,
  getParcelamentos,
  simularAcordo,
  formalizarAcordo,
  cancelarAcordo,
  emitirSegundaVia,
  emitirGuiaUnificada,
  emitirCertidao,
  autenticarCertidao,
  getAlvaras,
  getElegibilidadeAlvara,
  emitirAlvara,
  getCga,
  emitirCga,
  calcularItiv,
  emitirGuiaItiv,
  getNfse,
  emitirNfse,
  cancelarNfse,
  getProtocolos,
  abrirProtocolo,
  getProtocolo,
  getNotificacoes,
  getNotificacao,
  registrarCiencia,
  getCaixaPostal,
  marcarCaixaPostalLida,
  getPagamentos,
  JFU_RULE_CONTRIBUINTES,
  JFU_SYS,
};
