/* =============================================================
   tributosClient — Camada de integração com a API de Tributos
   -------------------------------------------------------------
   Mapeia TODOS os endpoints descritos em
   SOLICITACAO_API_TRIBUTOS_DEFINITIVA.md.

   Enquanto a empresa de tributos não entrega a API:
     - TRIBUTOS_API_BASE_URL fica vazio no .env
     - isConfigured() retorna false
     - as funções devolvem { ok:false, status:503, body:{ erro:'...' } }

   Quando a API de homologação chegar:
     - preencha TRIBUTOS_API_BASE_URL, TRIBUTOS_API_KEY e
       TRIBUTOS_AUTH_TYPE no .env
     - nada mais precisa mudar aqui
   ============================================================= */

const env = require('../config/env');
const logger = require('../config/logger');

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

function buildHeaders(extra = {}) {
  const headers = { Accept: 'application/json', ...extra };
  const authType = String(env.TRIBUTOS_AUTH_TYPE || 'bearer').toLowerCase();
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

/**
 * Requisição genérica à API de tributos.
 * Retorna sempre { ok, status, body } — nunca lança.
 */
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

/* ---- Helper de validação de documento para os GETs por contribuinte ---- */
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

/* =============================================================
   ENDPOINTS — espelham o documento de solicitação
   ============================================================= */

// 0. Conectividade
const health = () => request('GET', '/health');

// 1. Contribuinte
const getContribuinte = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/contribuintes', { query: { cpfCnpj: doc } }));

// 2. Resumo do dashboard
const getResumoFiscal = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/contribuintes/resumo', { query: { cpfCnpj: doc } }));

// 3. Situação fiscal
const getSituacaoFiscal = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/situacao-fiscal', { query: { cpfCnpj: doc } }));

// 4. Inscrições imobiliárias
const getInscricoesImobiliarias = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/inscricoes/imobiliarias', { query: { cpfCnpj: doc } }));
const getInscricaoImobiliaria = (inscricao) =>
  request('GET', `/v1/inscricoes/imobiliarias/${encodeURIComponent(inscricao)}`);

// 5. Inscrições econômicas
const getInscricoesEconomicas = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/inscricoes/economicas', { query: { cpfCnpj: doc } }));
const getInscricaoEconomica = (inscricao) =>
  request('GET', `/v1/inscricoes/economicas/${encodeURIComponent(inscricao)}`);

// 6. Lançamentos / tributos em aberto
const getLancamentos = (cpfCnpj, filtros = {}) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/lancamentos', { query: { cpfCnpj: doc, ...filtros } }));

// 7. Dívida ativa
const getDividaAtiva = (cpfCnpj, filtros = {}) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/divida-ativa', { query: { cpfCnpj: doc, ...filtros } }));

// 8. Acordos / parcelamentos
const getParcelamentos = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/parcelamentos', { query: { cpfCnpj: doc } }));
const simularAcordo = (payload) => request('POST', '/v1/acordos/simular', { body: payload });
const formalizarAcordo = (payload) => request('POST', '/v1/acordos/formalizar', { body: payload });
const cancelarAcordo = (acordoId, motivo) =>
  request('POST', `/v1/acordos/${encodeURIComponent(acordoId)}/cancelar`, { body: { motivo } });

// 9. 2ª via / guia
const emitirSegundaVia = (payload) => request('POST', '/v1/documentos/segunda-via', { body: payload });
const emitirGuiaUnificada = (payload) => request('POST', '/v1/documentos/guia-unificada', { body: payload });

// 10. Certidões
const emitirCertidao = (payload) => request('POST', '/v1/certidoes/emitir', { body: payload });
const autenticarCertidao = (codigo) =>
  request('GET', `/v1/certidoes/autenticar/${encodeURIComponent(codigo)}`);

// 11. Alvará
const getAlvaras = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/alvaras', { query: { cpfCnpj: doc } }));
const getElegibilidadeAlvara = (inscricao) =>
  request('GET', `/v1/alvaras/${encodeURIComponent(inscricao)}/elegibilidade`);
const emitirAlvara = (payload) => request('POST', '/v1/alvaras/emitir', { body: payload });

// 12. Cartão CGA
const getCga = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/cga', { query: { cpfCnpj: doc } }));
const emitirCga = (payload) => request('POST', '/v1/cga/emitir', { body: payload });

// 13. ITIV
const calcularItiv = (payload) => request('POST', '/v1/itiv/calcular', { body: payload });
const emitirGuiaItiv = (payload) => request('POST', '/v1/itiv/emitir-guia', { body: payload });

// 14. NFSe
const getNfse = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/nfse', { query: { cpfCnpj: doc } }));
const emitirNfse = (payload) => request('POST', '/v1/nfse/emitir', { body: payload });
const cancelarNfse = (numero, motivo) =>
  request('POST', `/v1/nfse/${encodeURIComponent(numero)}/cancelar`, { body: { motivo } });

// 15. Protocolos
const getProtocolos = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/protocolos', { query: { cpfCnpj: doc } }));
const abrirProtocolo = (payload) => request('POST', '/v1/protocolos', { body: payload });
const getProtocolo = (numero) => request('GET', `/v1/protocolos/${encodeURIComponent(numero)}`);

// 16. Notificações DEC/DTE
const getNotificacoes = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/notificacoes', { query: { cpfCnpj: doc } }));
const getNotificacao = (id) => request('GET', `/v1/notificacoes/${encodeURIComponent(id)}`);
const registrarCiencia = (id) => request('POST', `/v1/notificacoes/${encodeURIComponent(id)}/ciencia`);

// 17. Caixa postal
const getCaixaPostal = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/caixa-postal', { query: { cpfCnpj: doc } }));
const marcarCaixaPostalLida = (id) =>
  request('POST', `/v1/caixa-postal/${encodeURIComponent(id)}/marcar-lida`);

// 18. Pagamentos
const getPagamentos = (cpfCnpj) =>
  withDocumento(cpfCnpj, (doc) => request('GET', '/v1/pagamentos', { query: { cpfCnpj: doc } }));

module.exports = {
  isConfigured,
  sanitizeCpfCnpj,
  ensureValidCpfCnpj,
  request,
  // endpoints
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
};
