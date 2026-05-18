const express = require('express');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const { readStore, writeStore } = require('../services/runtimeStore');
const { generateCodigoCertidao, maskDocumento } = require('../services/criticalUtils');

const router = express.Router();
const validationCodes = new Map();
const documentPdfCache = new Map();

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

function getLatestConsent(userId) {
  const store = readStore();
  const entries = store.lgpdConsents.filter((x) => x.userId === userId);
  return entries.length ? entries[entries.length - 1] : null;
}

function buildPdfBuffer({ title, subtitle, fields = [], footer = '' }) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(16).text('Municipio de Lauro de Freitas', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(12).text(title.toUpperCase(), { align: 'center' });
    if (subtitle) {
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor('#555').text(subtitle, { align: 'center' });
      doc.fillColor('#000');
    }
    doc.moveDown(1.2);
    doc.fontSize(11);
    fields.forEach(([k, v]) => doc.text(`${k}: ${v}`));
    doc.moveDown(1.5);
    doc.fontSize(9).fillColor('#444').text(footer || 'Autenticidade verificavel no portal CRC.', { align: 'center' });
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
  };
}

async function emitDocument(res, config) {
  const record = createDocumentRecord(config);
  const pdf = await buildPdfBuffer({
    title: record.titulo,
    subtitle: record.subtitulo,
    fields: [
      ...record.fields,
      ['Codigo de autenticacao', record.codigo],
      ['Emissao', new Date(record.emissao).toLocaleString('pt-BR')],
      ['Validade', new Date(record.validade).toLocaleDateString('pt-BR')],
    ],
  });
  documentPdfCache.set(record.codigo, pdf);

  const store = readStore();
  store.documents.push(record);
  if (record.tipoDocumento === 'certidao') {
    store.certidoesEmitidas.push({
      codigo: record.codigo,
      inscricao: config.payload.inscricao || 'N/A',
      tipo: config.payload.tipo || 'N/A',
      tipoCert: config.payload.tipoCert || 'Certidao',
      vinculo: config.payload.vinculo || 'Titular',
      situacao: config.payload.situacao || 'Normal',
      emissao: record.emissao,
      validade: record.validade,
    });
  }
  writeStore(store);

  res.status(201).json({
    codigoAutenticacao: record.codigo,
    validadeAte: record.validade,
    urlDownload: `/api/v1/documentos/download/${encodeURIComponent(record.codigo)}`,
    urlAutenticacao: `/api/v1/documentos/autenticar/${encodeURIComponent(record.codigo)}`,
  });
}

router.get('/api/v1/lgpd/termo-vigente', (_req, res) => {
  res.json({ versao: TERMO_VERSAO, hash: termoHash(), html: TERMO_HTML });
});

router.get('/api/v1/lgpd/status', (req, res) => {
  const userId = req.header('x-user-id') || 'demo-user';
  const latest = getLatestConsent(userId);
  const acceptedCurrent = !!latest && latest.versaoTermo === TERMO_VERSAO && latest.hashTermo === termoHash();
  res.json({
    acceptedCurrent,
    currentVersion: TERMO_VERSAO,
    currentHash: termoHash(),
    lastAcceptedVersion: latest?.versaoTermo || null,
  });
});

router.post('/api/v1/lgpd/aceite', (req, res) => {
  const userId = req.header('x-user-id') || 'demo-user';
  const papel = req.body.papel || 'TITULAR';
  const consentimentosOpcionais = Array.isArray(req.body.consentimentosOpcionais) ? req.body.consentimentosOpcionais : [];
  const versaoTermo = req.body.versaoTermo || TERMO_VERSAO;

  if (versaoTermo !== TERMO_VERSAO) {
    return res.status(400).json({ erro: 'Versao de termo desatualizada. Recarregue o termo vigente.' });
  }

  const store = readStore();
  const aceiteId = crypto.randomUUID();
  const aceite = {
    id: aceiteId,
    userId,
    papel,
    versaoTermo: TERMO_VERSAO,
    hashTermo: termoHash(),
    ip: req.ip,
    userAgent: req.header('user-agent') || '',
    dataHora: new Date().toISOString(),
    consentimentosOpcionais,
    metodoAutenticacao: 'GOV_BR_SIMULADO',
  };
  store.lgpdConsents.push(aceite);
  writeStore(store);

  res.status(201).json({ aceiteId, dataHora: aceite.dataHora, versaoTermo: TERMO_VERSAO, hashTermo: termoHash() });
});

router.get('/api/v1/lgpd/meus-dados', (req, res) => {
  const userId = req.header('x-user-id') || 'demo-user';
  const store = readStore();
  const historico = store.lgpdConsents.filter((x) => x.userId === userId);
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

router.put('/api/v1/notificacoes/preferencias', (req, res) => {
  const userId = req.header('x-user-id') || 'demo-user';
  const canais = Array.isArray(req.body.canais) ? req.body.canais : [];
  const tiposNotificacao = Array.isArray(req.body.tiposNotificacao) ? req.body.tiposNotificacao : [];
  if (!canais.some((x) => x.validado === true)) return res.status(400).json({ erro: 'Ao menos um canal validado e obrigatorio.' });
  const store = readStore();
  store.notificacoesPreferencias[userId] = { canais, tiposNotificacao, updatedAt: new Date().toISOString() };
  writeStore(store);
  res.json({ ok: true, preferencias: store.notificacoesPreferencias[userId] });
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
  });
});

router.post('/api/v1/ficha-cadastral/pdf', async (req, res) => {
  await emitDocument(res, {
    tipoDocumento: 'ficha-cadastral',
    prefixoCodigo: 'FC',
    validadeDias: 3650,
    titulo: 'Ficha Cadastral',
    subtitulo: 'Extrato cadastral consolidado',
    filenamePrefix: 'ficha-cadastral',
    payload: req.body || {},
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

router.get('/api/v1/documentos/autenticar/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  const store = readStore();
  const record = store.documents.find((x) => x.codigo === codigo) || store.certidoesEmitidas.find((x) => x.codigo === codigo);
  if (!record) return res.status(404).json({ valida: false });
  res.json({
    valida: true,
    tipo: record.titulo || record.tipoCert || record.tipoDocumento || 'Documento',
    titular: 'Usuario Portal CRC',
    documento: maskDocumento('03456789012'),
    inscricao: record.inscricao || 'N/A',
    emissao: record.emissao,
    validade: record.validade,
    hashConteudo: `sha256:${crypto.createHash('sha256').update(codigo).digest('hex')}`,
    urlOriginal: `/api/v1/documentos/download/${encodeURIComponent(codigo)}`,
  });
});

router.get('/api/v1/certidoes/autenticar/:codigo', (req, res) => {
  const codigo = req.params.codigo;
  res.redirect(`/api/v1/documentos/autenticar/${encodeURIComponent(codigo)}`);
});

module.exports = router;
