const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const path = require('path');
const PDFDocument = require('pdfkit');
const env = require('./src/config/env');
const logger = require('./src/config/logger');
const { buildSecurityMiddlewares } = require('./src/middlewares/security');
const { buildRequestLogger } = require('./src/middlewares/requestLogger');
const healthRouter = require('./src/routes/health');
const dteIntegrationRouter = require('./src/routes/dteIntegration');
const criticalFeaturesRouter = require('./src/routes/criticalFeatures');

const app = express();
const PORT = env.PORT;
const { helmetMiddleware, corsMiddleware, rateLimitMiddleware } = buildSecurityMiddlewares();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(buildRequestLogger());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
  }
}));

app.use(healthRouter);
app.use(dteIntegrationRouter);
app.use(criticalFeaturesRouter);

app.get(['/dte', '/dte/*'], (_req, res) => {
  res.render('index');
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/portal', (req, res) => {
  res.render('index');
});

/* ═══════════════════════════════════════════════
   API — Consulta CNPJ (BrasilAPI pública)
   ═══════════════════════════════════════════════ */
app.get('/api/consulta-cnpj/:cnpj', async (req, res) => {
  const cnpj = req.params.cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return res.status(400).json({ erro: 'CNPJ inválido. Deve conter 14 dígitos.' });

  const apis = [
    { url: `https://publica.cnpj.ws/cnpj/${cnpj}`, parser: 'cnpjws' },
    { url: `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, parser: 'brasilapi' },
    { url: `https://receitaws.com.br/v1/cnpj/${cnpj}`, parser: 'receitaws' },
  ];

  for (const api of apis) {
    try {
      const resp = await fetch(api.url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'CRC-Portal/1.0' }
      });
      if (!resp.ok) continue;
      const raw = await resp.json();
      if (raw.status === 'ERROR' || raw.erro) continue;

      let data;
      if (api.parser === 'cnpjws') {
        const est = raw.estabelecimento || {};
        data = {
          cnpj: est.cnpj || cnpj,
          razao_social: raw.razao_social || '',
          nome_fantasia: est.nome_fantasia || '',
          situacao_cadastral: est.situacao_cadastral || '',
          data_situacao: est.data_situacao_cadastral || '',
          data_inicio_atividade: est.data_inicio_atividade || '',
          cnae_principal: est.atividade_principal?.descricao || '',
          cnae_codigo: est.atividade_principal?.id || '',
          natureza_juridica: (raw.natureza_juridica?.id || '') + ' — ' + (raw.natureza_juridica?.descricao || ''),
          porte: raw.porte?.descricao || '',
          logradouro: est.tipo_logradouro ? (est.tipo_logradouro + ' ' + (est.logradouro || '')) : (est.logradouro || ''),
          numero: est.numero || '',
          complemento: est.complemento || '',
          bairro: est.bairro || '',
          municipio: est.cidade?.nome || '',
          uf: est.estado?.sigla || '',
          cep: est.cep || '',
          telefone: est.ddd1 ? (est.ddd1 + est.telefone1) : '',
          email: est.email || '',
          capital_social: raw.capital_social || 0,
          socios: (raw.socios || []).map(s => ({
            nome: s.nome, cpf_cnpj: s.cpf_cnpj_socio || '', qualificacao: s.qualificacao_socio?.descricao || ''
          }))
        };
      } else if (api.parser === 'brasilapi') {
        data = {
          cnpj: raw.cnpj, razao_social: raw.razao_social,
          nome_fantasia: raw.nome_fantasia || '',
          situacao_cadastral: raw.descricao_situacao_cadastral,
          data_situacao: raw.data_situacao_cadastral,
          data_inicio_atividade: raw.data_inicio_atividade,
          cnae_principal: raw.cnae_fiscal_descricao,
          cnae_codigo: raw.cnae_fiscal,
          natureza_juridica: raw.natureza_juridica, porte: raw.porte,
          logradouro: raw.logradouro, numero: raw.numero,
          complemento: raw.complemento || '', bairro: raw.bairro,
          municipio: raw.municipio, uf: raw.uf, cep: raw.cep,
          telefone: raw.ddd_telefone_1 || '', email: raw.email || '',
          capital_social: raw.capital_social,
          socios: (raw.qsa || []).map(s => ({
            nome: s.nome_socio, cpf_cnpj: s.cnpj_cpf_do_socio, qualificacao: s.qualificacao_socio
          }))
        };
      } else {
        data = {
          cnpj: raw.cnpj, razao_social: raw.nome,
          nome_fantasia: raw.fantasia || '',
          situacao_cadastral: raw.situacao,
          data_situacao: raw.data_situacao,
          data_inicio_atividade: raw.abertura,
          cnae_principal: raw.atividade_principal?.text || '',
          cnae_codigo: raw.atividade_principal?.code || '',
          natureza_juridica: raw.natureza_juridica, porte: raw.porte,
          logradouro: raw.logradouro, numero: raw.numero,
          complemento: raw.complemento || '', bairro: raw.bairro,
          municipio: raw.municipio, uf: raw.uf, cep: raw.cep,
          telefone: raw.telefone || '', email: raw.email || '',
          capital_social: parseFloat(raw.capital_social) || 0,
          socios: (raw.qsa || []).map(s => ({
            nome: s.nome, cpf_cnpj: '', qualificacao: s.qual
          }))
        };
      }
      return res.json(data);
    } catch (err) {
      console.log(`API ${api.parser} falhou: ${err.message}`);
      continue;
    }
  }
  res.status(404).json({ erro: 'CNPJ não encontrado. Verifique o número e tente novamente.' });
});

/* ═══════════════════════════════════════════════
   API — Consulta CPF (simulado — InfoJud futuro)
   Retorna apenas o nome completo até integrar InfoJud
   ═══════════════════════════════════════════════ */
app.get('/api/consulta-cpf/:cpf', async (req, res) => {
  const cpf = req.params.cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return res.status(400).json({ erro: 'CPF inválido. Deve conter 11 dígitos.' });
  // Sem InfoJud, retorna dados mínimos (nome via Gov.BR ou simulado)
  // Em produção: integrar com InfoJud/Serpro/Gov.BR OAuth para obter dados reais
  res.json({
    cpf,
    nome: null,
    mensagem: 'Consulta CPF disponível após assinatura Gov.BR. Sem InfoJud, apenas o nome será retornado após autenticação.',
    requer_govbr: true
  });
});

/* ═══════════════════════════════════════════════
   API — Geração de PDF de Procuração
   ═══════════════════════════════════════════════ */
app.post('/api/procuracao/pdf', (req, res) => {
  const {
    template, outorgante_nome, outorgante_cpf, outorgante_endereco,
    procurador_nome, procurador_cpf_cnpj, procurador_endereco,
    procurador_razao_social, procurador_email,
    sistemas, vigencia, data_assinatura,
    entidade_nome, entidade_cnpj, entidade_logo
  } = req.body;

  if (!template || !outorgante_nome || !procurador_nome) {
    return res.status(400).json({ erro: 'Dados obrigatórios faltando.' });
  }

  let texto = template
    .replace(/\{outorgante_nome\}/g, outorgante_nome || '')
    .replace(/\{outorgante_cpf\}/g, outorgante_cpf || '')
    .replace(/\{outorgante_endereco\}/g, outorgante_endereco || '')
    .replace(/\{procurador_nome\}/g, procurador_nome || '')
    .replace(/\{procurador_cpf_cnpj\}/g, procurador_cpf_cnpj || '')
    .replace(/\{procurador_razao_social\}/g, procurador_razao_social || '')
    .replace(/\{procurador_endereco\}/g, procurador_endereco || '')
    .replace(/\{procurador_email\}/g, procurador_email || '')
    .replace(/\{sistemas\}/g, sistemas || '')
    .replace(/\{vigencia\}/g, vigencia || '')
    .replace(/\{data_assinatura\}/g, data_assinatura || '')
    .replace(/\{entidade_nome\}/g, entidade_nome || '')
    .replace(/\{entidade_cnpj\}/g, entidade_cnpj || '')
    .replace(/\{data\}/g, new Date().toLocaleDateString('pt-BR'))
    .replace(/\{hora\}/g, new Date().toLocaleTimeString('pt-BR'));

  const doc = new PDFDocument({ size: 'A4', margin: 60 });
  const buffers = [];
  doc.on('data', chunk => buffers.push(chunk));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=procuracao.pdf');
    res.send(pdfBuffer);
  });

  // Cabeçalho
  if (entidade_nome) {
    doc.fontSize(10).fillColor('#666').text(entidade_nome.toUpperCase(), { align: 'center' });
    if (entidade_cnpj) doc.fontSize(8).text(`CNPJ: ${entidade_cnpj}`, { align: 'center' });
    doc.moveDown(0.5);
  }
  doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#00A87E').lineWidth(2).stroke();
  doc.moveDown(1);

  // Título
  doc.fontSize(16).fillColor('#00A87E').font('Helvetica-Bold')
     .text('PROCURAÇÃO ELETRÔNICA', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#888').font('Helvetica')
     .text('Central de Relacionamento com o Contribuinte — CRC', { align: 'center' });
  doc.moveDown(1.5);

  // Corpo do documento (template processado)
  const paragrafos = texto.split('\n');
  doc.fontSize(11).fillColor('#222').font('Helvetica');
  for (const p of paragrafos) {
    const trimmed = p.trim();
    if (!trimmed) { doc.moveDown(0.6); continue; }
    if (trimmed.startsWith('##')) {
      doc.moveDown(0.4).fontSize(12).font('Helvetica-Bold').fillColor('#00A87E')
         .text(trimmed.replace(/^#+\s*/, ''), { align: 'left' });
      doc.fontSize(11).font('Helvetica').fillColor('#222');
      doc.moveDown(0.3);
    } else {
      doc.text(trimmed, { align: 'justify', lineGap: 3 });
    }
  }

  // Assinatura digital
  doc.moveDown(2);
  doc.moveTo(60, doc.y).lineTo(535, doc.y).strokeColor('#ddd').lineWidth(0.5).stroke();
  doc.moveDown(1);
  doc.fontSize(9).fillColor('#00A87E').font('Helvetica-Bold')
     .text('ASSINATURA DIGITAL', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(8).fillColor('#666').font('Helvetica')
     .text(`Documento assinado eletronicamente via Gov.BR em ${data_assinatura || new Date().toLocaleDateString('pt-BR')}`, { align: 'center' });
  doc.text(`Código de verificação: CRC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.text('Este documento tem validade jurídica conforme MP 2.200-2/2001 e Decreto 10.543/2020.', { align: 'center' });

  doc.end();
});

app.use((err, _req, res, _next) => {
  logger.error({ err }, 'Erro interno não tratado');
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`CRC iniciado em http://localhost:${PORT}`);
  });
}

module.exports = app;
