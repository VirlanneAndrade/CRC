const express = require('express');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const { getRepositories } = require('../repositories');
const { generateCodigoCertidao, maskDocumento } = require('../services/criticalUtils');

const router = express.Router();
const validationCodes = new Map();
const documentPdfCache = new Map();
const DEFAULT_ENTIDADE_CONFIG = {
  nome: 'Municipio de Lauro de Freitas',
  cnpj: '',
  ibge: '',
  endereco: '',
  uf: '',
  email: '',
  telefone: '',
  responsavel: '',
  logo: '',
};
const DEFAULT_TRIBUTOS_CONFIG = {
  apiBaseUrl: '',
  authType: 'bearer',
  authToken: '',
  healthPath: '/health',
  timeoutMs: 10000,
  sincronizacao: '15min',
  recursos: [],
};
const DEFAULT_NOTIFICACOES_CONFIG = {
  emailWebhookUrl: '',
  whatsappWebhookUrl: '',
  smsWebhookUrl: '',
  remetentePadrao: 'Portal CRC',
};

const TERMO_VERSAO = 'v1.1-2026-05-18';
const TERMO_HTML = `
<h3>Termo de Consentimento e Privacidade</h3>
<p>Ao acessar o Portal CRC, voce declara ciencia sobre o tratamento de dados pessoais para prestacao de servicos tributarios municipais, conforme Lei 13.709/2018.</p>
<p>Base legal: cumprimento de obrigacao legal e execucao de politica publica. Consentimentos opcionais podem ser revogados em "LGPD — Meus Dados".</p>
<p>Para novas versoes deste termo, sera solicitado reaceite antes de liberar o acesso.</p>
`;

function termoHash() {
  return `sha256:${crypto.createHash('sha256').update(TERMO_HTML).digest('hex')}`;
}

function getUserId(req) {
  return req.header('x-user-id') || 'demo-user';
}

async function safeLog(fn) {
  try {
    await fn();
  } catch (_err) {
    // Logs de auditoria/integracao nao devem quebrar a request principal.
  }
}

function registrarAuditoria(req, { acao, entidade, detalhe }) {
  const repos = getRepositories();
  return safeLog(() => repos.log.addAuditoria({
    usuarioId: req.session?.admin?.id || null,
    acao,
    entidade: entidade || null,
    detalhe: detalhe || null,
    ip: req.ip,
    userAgent: req.header('user-agent') || null,
  }));
}

function registrarIntegracao(entry) {
  const repos = getRepositories();
  return safeLog(() => repos.log.addIntegracao(entry));
}

async function getLatestConsent(userId) {
  const repos = getRepositories();
  return repos.lgpd.getLatestConsent(userId);
}

function normalizeEntidadeConfig(raw = {}) {
  return {
    nome: String(raw.nome || DEFAULT_ENTIDADE_CONFIG.nome).trim() || DEFAULT_ENTIDADE_CONFIG.nome,
    cnpj: String(raw.cnpj || '').trim(),
    ibge: String(raw.ibge || '').trim(),
    endereco: String(raw.endereco || '').trim(),
    uf: String(raw.uf || '').trim(),
    email: String(raw.email || '').trim(),
    telefone: String(raw.telefone || '').trim(),
    responsavel: String(raw.responsavel || '').trim(),
    logo: typeof raw.logo === 'string' ? raw.logo : '',
  };
}

function normalizeTributosConfig(raw = {}) {
  const recursos = Array.isArray(raw.recursos) ? raw.recursos.map((x) => String(x || '').trim()).filter(Boolean) : [];
  const timeoutMs = Number(raw.timeoutMs || DEFAULT_TRIBUTOS_CONFIG.timeoutMs);
  return {
    apiBaseUrl: String(raw.apiBaseUrl || '').trim(),
    authType: String(raw.authType || DEFAULT_TRIBUTOS_CONFIG.authType).trim() || DEFAULT_TRIBUTOS_CONFIG.authType,
    authToken: String(raw.authToken || '').trim(),
    healthPath: String(raw.healthPath || DEFAULT_TRIBUTOS_CONFIG.healthPath).trim() || DEFAULT_TRIBUTOS_CONFIG.healthPath,
    timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TRIBUTOS_CONFIG.timeoutMs,
    sincronizacao: String(raw.sincronizacao || DEFAULT_TRIBUTOS_CONFIG.sincronizacao).trim() || DEFAULT_TRIBUTOS_CONFIG.sincronizacao,
    recursos,
  };
}

function normalizeNotificacoesConfig(raw = {}) {
  return {
    emailWebhookUrl: String(raw.emailWebhookUrl || '').trim(),
    whatsappWebhookUrl: String(raw.whatsappWebhookUrl || '').trim(),
    smsWebhookUrl: String(raw.smsWebhookUrl || '').trim(),
    remetentePadrao: String(raw.remetentePadrao || DEFAULT_NOTIFICACOES_CONFIG.remetentePadrao).trim() || DEFAULT_NOTIFICACOES_CONFIG.remetentePadrao,
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function resolveEntidadeConfig(entidadePayload) {
  if (entidadePayload && typeof entidadePayload === 'object') {
    return normalizeEntidadeConfig(entidadePayload);
  }
  const repos = getRepositories();
  const stored = await repos.config.getEntidade();
  return normalizeEntidadeConfig(stored || {});
}

function getImageBufferFromDataUrl(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/i);
  if (!match) return null;
  try {
    return Buffer.from(match[2], 'base64');
  } catch (_err) {
    return null;
  }
}

function formatFieldLabel(raw) {
  const key = String(raw || '').toLowerCase();
  const labels = {
    tipo: 'Tipo',
    inscricao: 'Inscricao',
    vinculo: 'Vinculo',
    situacao: 'Situacao',
    cnpj: 'CNPJ',
    empresa: 'Empresa',
    validadeinformada: 'Validade Informada',
    razaosocial: 'Razao Social',
    atividade: 'Atividade',
    tributo: 'Tributo',
    valor: 'Valor',
    vencimento: 'Vencimento',
    codigodeautenticacao: 'Codigo de Autenticacao',
    emissao: 'Emissao',
    validade: 'Validade',
    cpf: 'CPF',
    endereco: 'Endereco',
    bairro: 'Bairro',
    cep: 'CEP',
    cidade: 'Cidade',
    uf: 'UF',
  };
  const compact = key.replace(/\s+/g, '').replace(/_/g, '');
  if (labels[compact]) return labels[compact];
  return String(raw || '')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function drawPdfHeader(doc, { entidade, title, subtitle }) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const top = 42;
  const logoSize = 54;
  const logoBuffer = getImageBufferFromDataUrl(entidade.logo);
  const centerX = (left + right) / 2;

  if (logoBuffer) {
    try {
      doc.image(logoBuffer, centerX - 260, top + 2, { fit: [logoSize, logoSize], align: 'left' });
    } catch (_err) {
      // Ignore invalid image payloads to keep PDF generation resilient.
    }
  }

  const local = [entidade.endereco, entidade.uf].filter(Boolean).join(' - ');

  doc.fontSize(17).fillColor('#1d2e40').font('Helvetica-Bold').text(entidade.nome, left, top, { width: right - left, align: 'center' });
  if (entidade.cnpj) doc.fontSize(11).fillColor('#304a67').font('Helvetica').text(`CNPJ: ${entidade.cnpj}`, left, top + 28, { width: right - left, align: 'center' });
  if (local) doc.fontSize(10).fillColor('#304a67').text(local, left, top + 44, { width: right - left, align: 'center' });

  doc.fontSize(31).fillColor('#d8e5f1').font('Helvetica-Bold').text('CRC', left, top - 2, { width: right - left, align: 'right' });
  doc.fontSize(15).fillColor('#0f1720').font('Helvetica-Bold').text(String(title || '').toUpperCase(), left, top + 78, { align: 'center' });
  if (subtitle) doc.fontSize(12).fillColor('#5a6b7d').font('Helvetica').text(subtitle, left, top + 99, { align: 'center' });

  const lineY = subtitle ? top + 124 : top + 114;
  doc.moveTo(left, lineY).lineTo(right, lineY).strokeColor('#b9cedf').lineWidth(1).stroke();
  doc.fillColor('#000');
  doc.y = lineY + 18;
}

function drawPdfFields(doc, fields = []) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  doc.lineGap(3);
  fields.forEach(([key, value], index) => {
    const label = formatFieldLabel(key);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#1a2d40').text(`${label}: `, left, doc.y, { continued: true });
    doc.font('Helvetica').fontSize(11).fillColor('#111').text(String(value ?? '—'));
    if (index < fields.length - 1) doc.moveDown(0.12);
  });
  doc.moveDown(0.7);
  doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor('#d4dfeb').lineWidth(0.8).stroke();
  doc.moveDown(0.7);
}

function drawSignatureBlock(doc, { entidade, codigo, emissao }) {
  const left = doc.page.margins.left;
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const y = doc.y;
  doc.roundedRect(left, y, width, 90, 8).fillAndStroke('#f6f9fc', '#d4dfeb');
  doc.fillColor('#2c4d6d').font('Helvetica-Bold').fontSize(10).text('ASSINATURA ELETRONICA / AUTENTICACAO', left + 12, y + 12, { width: width - 24, align: 'center' });
  doc.fillColor('#35516a').font('Helvetica').fontSize(9).text(`Codigo de autenticacao: ${codigo}`, left + 12, y + 32, { width: width - 24, align: 'center' });
  doc.text(`Emitido em: ${emissao}`, left + 12, y + 46, { width: width - 24, align: 'center' });
  doc.text(`Assinado digitalmente por ${entidade.nome} - Portal CRC`, left + 12, y + 60, { width: width - 24, align: 'center' });
  doc.y = y + 102;
}

function buildPdfBuffer({ title, subtitle, fields = [], footer = '', entidade, codigoAutenticacao = '', emissao = '' }) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    drawPdfHeader(doc, { entidade: normalizeEntidadeConfig(entidade), title, subtitle });
    drawPdfFields(doc, fields);
    drawSignatureBlock(doc, { entidade: normalizeEntidadeConfig(entidade), codigo: codigoAutenticacao, emissao });
    doc.moveDown(0.4);
    doc.fontSize(9).fillColor('#3d5874').text(footer || 'Autenticidade verificavel no portal CRC.', { align: 'center' });
    doc.end();
  });
}

function createDocumentRecord({
  tipoDocumento,
  prefixoCodigo,
  validadeDias = 90,
  titulo,
  subtitulo,
  filenamePrefix,
  payload,
  entidade,
}) {
  const codigo = prefixoCodigo === 'CERT' ? generateCodigoCertidao() : `${prefixoCodigo}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
  const emissao = new Date();
  const validade = new Date(emissao.getTime() + validadeDias * 24 * 60 * 60 * 1000);
  const fields = Object.entries(payload || {}).map(([k, v]) => [k, String(v ?? '—')]);
  return {
    codigo,
    tipoDocumento,
    emissao: emissao.toISOString(),
    validade: validade.toISOString(),
    titulo,
    subtitulo,
    fields,
    filenamePrefix,
    entidade: normalizeEntidadeConfig(entidade),
  };
}

async function emitDocument(res, config) {
  const entidade = await resolveEntidadeConfig(config.entidade);
  const record = createDocumentRecord({ ...config, entidade });
  const pdf = await buildPdfBuffer({
    title: record.titulo,
    subtitle: record.subtitulo,
    fields: [
      ...record.fields,
      ['Codigo de autenticacao', record.codigo],
      ['Emissao', new Date(record.emissao).toLocaleString('pt-BR')],
      ['Validade', new Date(record.validade).toLocaleDateString('pt-BR')],
    ],
    footer: `Autenticidade verificavel no portal CRC. Codigo: ${record.codigo}`,
    entidade,
    codigoAutenticacao: record.codigo,
    emissao: new Date(record.emissao).toLocaleString('pt-BR'),
  });
  documentPdfCache.set(record.codigo, pdf);

  const urlPdf = `/api/v1/documentos/download/${encodeURIComponent(record.codigo)}`;
  const inscricao = config.payload?.inscricao || null;
  const dados = {
    titulo: record.titulo,
    tipoDocumento: record.tipoDocumento,
    entidade,
    emissao: record.emissao,
    validade: record.validade,
    inscricao,
    payload: config.payload || {},
  };

  const repos = getRepositories();
  await repos.documento.add({
    tipo: record.tipoDocumento,
    titulo: record.titulo,
    codigoAutenticacao: record.codigo,
    cpfCnpj: config.payload?.cnpj || null,
    inscricao,
    urlPdf,
    validade: new Date(record.validade),
    dados,
  });

  res.status(201).json({
    codigoAutenticacao: record.codigo,
    validadeAte: record.validade,
    urlDownload: urlPdf,
    urlAutenticacao: `/api/v1/documentos/autenticar/${encodeURIComponent(record.codigo)}`,
  });
}

router.get('/api/v1/entidade/config', async (_req, res) => {
  const repos = getRepositories();
  const stored = await repos.config.getEntidade();
  res.json({ entidade: normalizeEntidadeConfig(stored || {}) });
});

router.put('/api/v1/entidade/config', async (req, res) => {
  const repos = getRepositories();
  const entidade = normalizeEntidadeConfig(req.body || {});
  await repos.config.saveEntidade(entidade);
  await registrarAuditoria(req, { acao: 'config.entidade.update', entidade: 'ConfiguracaoPortal' });
  res.json({ ok: true, entidade });
});

router.get('/api/v1/integracoes/tributos', async (_req, res) => {
  const repos = getRepositories();
  const stored = await repos.config.getTributos();
  res.json({ config: normalizeTributosConfig(stored || {}) });
});

router.put('/api/v1/integracoes/tributos', async (req, res) => {
  const repos = getRepositories();
  const config = normalizeTributosConfig(req.body || {});
  await repos.config.saveTributos(config);
  await registrarAuditoria(req, { acao: 'config.tributos.update', entidade: 'ConfiguracaoApiTributos' });
  res.json({ ok: true, config });
});

router.post('/api/v1/integracoes/tributos/testar', async (req, res) => {
  const repos = getRepositories();
  const payloadConfig = normalizeTributosConfig(req.body || {});
  const stored = await repos.config.getTributos();
  const config = payloadConfig.apiBaseUrl ? payloadConfig : normalizeTributosConfig(stored || {});
  if (!config.apiBaseUrl) return res.status(400).json({ ok: false, erro: 'API Base URL nao configurada.' });

  const base = config.apiBaseUrl.replace(/\/+$/, '');
  const path = config.healthPath.startsWith('/') ? config.healthPath : `/${config.healthPath}`;
  const url = `${base}${path}`;
  const headers = { accept: 'application/json' };
  if (config.authToken) {
    const authType = String(config.authType).toLowerCase();
    if (authType === 'x-api-key') headers['x-api-key'] = config.authToken;
    else if (authType !== 'none') headers.authorization = `Bearer ${config.authToken}`;
  }

  const inicio = Date.now();
  try {
    const response = await fetchWithTimeout(url, { method: 'GET', headers }, config.timeoutMs);
    const text = await response.text();
    await registrarIntegracao({
      endpoint: url,
      metodo: 'GET',
      statusHttp: response.status,
      duracaoMs: Date.now() - inicio,
      sucesso: response.ok,
      erro: response.ok ? null : `HTTP ${response.status}`,
    });
    return res.status(response.ok ? 200 : 502).json({
      ok: response.ok,
      status: response.status,
      endpoint: url,
      respostaPreview: text.slice(0, 280),
    });
  } catch (err) {
    await registrarIntegracao({
      endpoint: url,
      metodo: 'GET',
      statusHttp: null,
      duracaoMs: Date.now() - inicio,
      sucesso: false,
      erro: err.message,
    });
    return res.status(502).json({ ok: false, endpoint: url, erro: `Falha de conexao: ${err.message}` });
  }
});

router.get('/api/v1/notificacoes/config', async (_req, res) => {
  const repos = getRepositories();
  const stored = await repos.config.getNotificacoes();
  res.json({ config: normalizeNotificacoesConfig(stored || {}) });
});

router.put('/api/v1/notificacoes/config', async (req, res) => {
  const repos = getRepositories();
  const config = normalizeNotificacoesConfig(req.body || {});
  await repos.config.saveNotificacoes(config);
  await registrarAuditoria(req, { acao: 'config.notificacoes.update', entidade: 'ConfiguracaoNotificacao' });
  res.json({ ok: true, config });
});

router.get('/api/v1/lgpd/termo-vigente', (_req, res) => {
  res.json({ versao: TERMO_VERSAO, hash: termoHash(), html: TERMO_HTML });
});

router.get('/api/v1/lgpd/status', async (req, res) => {
  const userId = getUserId(req);
  const latest = await getLatestConsent(userId);
  const acceptedCurrent = !!latest && latest.versaoTermo === TERMO_VERSAO && latest.hashTermo === termoHash();
  res.json({
    acceptedCurrent,
    currentVersion: TERMO_VERSAO,
    currentHash: termoHash(),
    lastAcceptedVersion: latest?.versaoTermo || null,
  });
});

router.post('/api/v1/lgpd/aceite', async (req, res) => {
  const userId = getUserId(req);
  const papel = req.body.papel || 'TITULAR';
  const consentimentosOpcionais = Array.isArray(req.body.consentimentosOpcionais) ? req.body.consentimentosOpcionais : [];
  const versaoTermo = req.body.versaoTermo || TERMO_VERSAO;

  if (versaoTermo !== TERMO_VERSAO) {
    return res.status(400).json({ erro: 'Versao de termo desatualizada. Recarregue o termo vigente.' });
  }

  const repos = getRepositories();
  const aceite = await repos.lgpd.addConsent({
    userId,
    papel,
    versaoTermo: TERMO_VERSAO,
    hashTermo: termoHash(),
    ip: req.ip,
    userAgent: req.header('user-agent') || '',
    consentimentosOpcionais,
    metodoAutenticacao: 'GOV_BR_SIMULADO',
  });

  res.status(201).json({ aceiteId: aceite.id, dataHora: aceite.dataHora, versaoTermo: TERMO_VERSAO, hashTermo: termoHash() });
});

router.get('/api/v1/lgpd/meus-dados', async (req, res) => {
  const userId = getUserId(req);
  const repos = getRepositories();
  const historico = await repos.lgpd.listConsents(userId);
  res.json({
    dadosPessoais: {
      nome: 'Usuario Portal CRC',
      documento: maskDocumento('03456789012'),
      email: 'usuario@exemplo.com',
    },
    dadosFiscais: {
      inscricoes: ['001.023.045.001', 'EMP-2024-00345'],
      municipio: 'Lauro de Freitas',
    },
    historicoConsentimentos: historico,
  });
});

router.get('/api/v1/lgpd/solicitacoes', async (req, res) => {
  const userId = getUserId(req);
  const repos = getRepositories();
  const solicitacoes = await repos.lgpd.listSolicitacoes(userId);
  res.json({ solicitacoes });
});

router.post('/api/v1/lgpd/solicitacoes', async (req, res) => {
  const userId = getUserId(req);
  const tipo = String(req.body?.tipo || '').trim();
  const descricao = String(req.body?.descricao || '').trim();
  if (!tipo) return res.status(400).json({ erro: 'Tipo da solicitacao e obrigatorio.' });
  if (!descricao) return res.status(400).json({ erro: 'Descricao da solicitacao e obrigatoria.' });

  const repos = getRepositories();
  const total = await repos.lgpd.countSolicitacoes();
  const numero = `LGPD-${new Date().getFullYear()}-${String(total + 1).padStart(4, '0')}`;
  const solicitacao = await repos.lgpd.addSolicitacao({ numero, userId, tipo, descricao });
  res.status(201).json({ ok: true, solicitacao });
});

router.post('/api/v1/notificacoes/validar/enviar', (req, res) => {
  const { canal, destino } = req.body || {};
  if (!canal || !destino) return res.status(400).json({ erro: 'Canal e destino sao obrigatorios.' });
  if (!['email', 'whatsapp', 'sms'].includes(canal)) return res.status(400).json({ erro: 'Canal invalido.' });
  const codigoId = crypto.randomUUID();
  const codigo = String(Math.floor(100000 + Math.random() * 900000));
  const expiraEm = Date.now() + 5 * 60 * 1000;
  validationCodes.set(codigoId, { canal, destino, codigo, expiraEm, tentativas: 0, validado: false });
  res.status(201).json({ codigoId, expiraEm, codigoDebug: codigo });
});

router.post('/api/v1/notificacoes/teste/enviar', async (req, res) => {
  const { canal, destino } = req.body || {};
  const mensagem = String(req.body?.mensagem || '').trim() || 'Teste de notificacao do Portal CRC.';
  if (!canal || !destino) return res.status(400).json({ erro: 'Canal e destino sao obrigatorios.' });
  if (!['email', 'whatsapp', 'sms'].includes(canal)) return res.status(400).json({ erro: 'Canal invalido.' });

  const repos = getRepositories();
  const stored = await repos.config.getNotificacoes();
  const cfg = normalizeNotificacoesConfig(stored || {});
  const webhookByCanal = {
    email: cfg.emailWebhookUrl,
    whatsapp: cfg.whatsappWebhookUrl,
    sms: cfg.smsWebhookUrl,
  };
  const webhookUrl = webhookByCanal[canal];
  const protocolo = `NTF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
  let status = 'simulado';
  let webhookStatus = null;
  let erro = null;

  if (webhookUrl) {
    const inicio = Date.now();
    try {
      const response = await fetchWithTimeout(webhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          canal,
          destino,
          mensagem,
          protocolo,
          remetente: cfg.remetentePadrao,
        }),
      }, 10000);
      status = response.ok ? 'enviado' : 'falha';
      webhookStatus = response.status;
      await registrarIntegracao({
        endpoint: webhookUrl,
        metodo: 'POST',
        statusHttp: response.status,
        duracaoMs: Date.now() - inicio,
        sucesso: response.ok,
        erro: response.ok ? null : `HTTP ${response.status}`,
      });
    } catch (err) {
      status = 'falha';
      erro = err.message;
      await registrarIntegracao({
        endpoint: webhookUrl,
        metodo: 'POST',
        statusHttp: null,
        duracaoMs: Date.now() - inicio,
        sucesso: false,
        erro: err.message,
      });
    }
  }

  const ok = status !== 'falha';
  return res.status(ok ? 200 : 502).json({
    ok,
    protocolo,
    modo: webhookUrl ? 'webhook' : 'simulado',
    status,
    webhookStatus,
    canal,
    destino,
    mensagem: ok ? 'Teste enviado com sucesso.' : 'Falha ao enviar teste.',
    erro,
  });
});

router.post('/api/v1/notificacoes/validar/conferir', (req, res) => {
  const { codigoId, codigo } = req.body || {};
  const state = validationCodes.get(codigoId);
  if (!state) return res.status(404).json({ validado: false, erro: 'Codigo inexistente.' });
  if (Date.now() > state.expiraEm) return res.status(400).json({ validado: false, erro: 'Codigo expirado.' });
  if (state.tentativas >= 3) return res.status(429).json({ validado: false, erro: 'Muitas tentativas.' });
  if (state.codigo !== String(codigo || '')) {
    state.tentativas += 1;
    return res.status(400).json({ validado: false, tentativasRestantes: Math.max(0, 3 - state.tentativas) });
  }
  state.validado = true;
  res.json({ validado: true, tentativasRestantes: Math.max(0, 3 - state.tentativas) });
});

router.get('/api/v1/notificacoes/preferencias', async (req, res) => {
  const userId = getUserId(req);
  const repos = getRepositories();
  const stored = await repos.preferencias.get(userId);
  if (!stored) return res.json({ preferencias: { canais: [], tiposNotificacao: [] } });
  const outras = stored.outras && typeof stored.outras === 'object' ? stored.outras : {};
  res.json({
    preferencias: {
      canais: Array.isArray(stored.canais) ? stored.canais : [],
      tiposNotificacao: Array.isArray(outras.tiposNotificacao) ? outras.tiposNotificacao : [],
      updatedAt: stored.atualizadoEm || null,
    },
  });
});

router.put('/api/v1/notificacoes/preferencias', async (req, res) => {
  const userId = getUserId(req);
  const canais = Array.isArray(req.body.canais) ? req.body.canais : [];
  const tiposNotificacao = Array.isArray(req.body.tiposNotificacao) ? req.body.tiposNotificacao : [];
  if (!canais.some((x) => x.validado === true)) return res.status(400).json({ erro: 'Ao menos um canal validado e obrigatorio.' });
  const repos = getRepositories();
  await repos.preferencias.save(userId, { canais, outras: { tiposNotificacao } });
  res.json({ ok: true, preferencias: { canais, tiposNotificacao, updatedAt: new Date().toISOString() } });
});

router.post('/api/v1/certidoes/emitir', async (req, res) => {
  await emitDocument(res, {
    tipoDocumento: 'certidao',
    prefixoCodigo: 'CERT',
    validadeDias: 90,
    titulo: req.body.tipoCert || 'Certidao de Debitos',
    subtitulo: 'Central de Relacionamento com o Contribuinte',
    filenamePrefix: 'certidao',
    payload: {
      inscricao: req.body.inscricao || 'N/A',
      tipo: req.body.tipo || 'Contribuinte',
      vinculo: req.body.vinculo || 'Titular',
      situacao: req.body.situacao || 'Normal',
    },
    entidade: req.body.entidade,
  });
});

router.post('/api/v1/alvaras/emitir', async (req, res) => {
  await emitDocument(res, {
    tipoDocumento: 'alvara',
    prefixoCodigo: 'ALV',
    validadeDias: 365,
    titulo: 'Alvara de Funcionamento',
    subtitulo: 'Documento oficial de licenciamento',
    filenamePrefix: 'alvara',
    payload: {
      inscricao: req.body.inscricao || 'N/A',
      cnpj: req.body.cnpj || 'N/A',
      empresa: req.body.nome || 'Empresa',
      validadeInformada: req.body.validade || 'N/A',
    },
    entidade: req.body.entidade,
  });
});

router.post('/api/v1/cga/emitir', async (req, res) => {
  await emitDocument(res, {
    tipoDocumento: 'cga',
    prefixoCodigo: 'CGA',
    validadeDias: 3650,
    titulo: 'Cartao CGA',
    subtitulo: 'Cadastro Geral de Atividades',
    filenamePrefix: 'cartao-cga',
    payload: {
      inscricao: req.body.inscricao || 'N/A',
      razaoSocial: req.body.nome || 'N/A',
      atividade: req.body.atividade || 'N/A',
    },
    entidade: req.body.entidade,
  });
});

router.post('/api/v1/documentos/2via', async (req, res) => {
  await emitDocument(res, {
    tipoDocumento: 'segunda-via',
    prefixoCodigo: '2VIA',
    validadeDias: 30,
    titulo: 'Documento de Arrecadacao - 2a Via',
    subtitulo: 'Emitido pelo Portal CRC',
    filenamePrefix: 'segunda-via',
    payload: {
      tributo: req.body.tributo || 'N/A',
      inscricao: req.body.inscricao || 'N/A',
      valor: req.body.valor || 'N/A',
      vencimento: req.body.vencimento || 'N/A',
    },
    entidade: req.body.entidade,
  });
});

router.post('/api/v1/financeiro/boleto', async (req, res) => {
  await emitDocument(res, {
    tipoDocumento: 'boleto',
    prefixoCodigo: 'BLT',
    validadeDias: 30,
    titulo: 'Boleto / DAM',
    subtitulo: 'Pagamento de tributos municipais',
    filenamePrefix: 'boleto',
    payload: {
      tributo: req.body.tributo || 'N/A',
      inscricao: req.body.inscricao || 'N/A',
      valor: req.body.valor || 'N/A',
      vencimento: req.body.vencimento || 'N/A',
    },
    entidade: req.body.entidade,
  });
});

router.post('/api/v1/ficha-cadastral/pdf', async (req, res) => {
  const payload = { ...(req.body || {}) };
  delete payload.entidade;
  await emitDocument(res, {
    tipoDocumento: 'ficha-cadastral',
    prefixoCodigo: 'FC',
    validadeDias: 3650,
    titulo: 'Ficha Cadastral',
    subtitulo: 'Extrato cadastral consolidado',
    filenamePrefix: 'ficha-cadastral',
    payload,
    entidade: req.body.entidade,
  });
});

router.get('/api/v1/documentos/download/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  const pdf = documentPdfCache.get(codigo);
  if (!pdf) return res.status(404).json({ erro: 'Documento nao encontrado para download.' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=documento-${codigo}.pdf`);
  res.send(pdf);
});

router.get('/api/v1/certidoes/download/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  res.redirect(`/api/v1/documentos/download/${encodeURIComponent(codigo)}`);
});

router.get('/api/v1/documentos/autenticar/:codigo', async (req, res) => {
  const codigo = req.params.codigo;
  const repos = getRepositories();
  const registro = await repos.documento.findByCodigo(codigo);
  if (!registro) return res.status(404).json({ valida: false });
  const dados = registro.dados && typeof registro.dados === 'object' ? registro.dados : {};
  res.json({
    valida: true,
    tipo: registro.titulo || dados.titulo || dados.tipoDocumento || 'Documento',
    entidade: dados.entidade || normalizeEntidadeConfig(),
    titular: 'Usuario Portal CRC',
    documento: maskDocumento('03456789012'),
    inscricao: registro.inscricao || dados.inscricao || 'N/A',
    emissao: dados.emissao || registro.criadoEm,
    validade: dados.validade || registro.validade,
    hashConteudo: `sha256:${crypto.createHash('sha256').update(codigo).digest('hex')}`,
    urlOriginal: `/api/v1/documentos/download/${encodeURIComponent(codigo)}`,
  });
});

router.get('/api/v1/certidoes/autenticar/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  res.redirect(`/api/v1/documentos/autenticar/${encodeURIComponent(codigo)}`);
});

module.exports = router;
