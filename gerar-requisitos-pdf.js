const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'REQUISITOS_INTEGRACAO_CERTIDAO.pdf');

const COLORS = {
  primary: '#00A87E',
  primaryDark: '#007A5A',
  accent: '#E87C1E',
  dark: '#1A1A2E',
  text: '#222222',
  muted: '#666666',
  light: '#F4F6F8',
  white: '#FFFFFF',
  border: '#CCCCCC',
  codeBg: '#F0F4F8',
  red: '#E74C3C',
};

const doc = new PDFDocument({ size: 'A4', margin: 60, bufferPages: true });
const stream = fs.createWriteStream(OUTPUT);
doc.pipe(stream);

function drawLine(y, color = COLORS.border, width = 0.5) {
  doc.moveTo(60, y).lineTo(535, y).strokeColor(color).lineWidth(width).stroke();
}

function sectionTitle(text) {
  doc.moveDown(1.2);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(COLORS.primary).text(text);
  doc.moveDown(0.3);
  drawLine(doc.y, COLORS.primary, 1.5);
  doc.moveDown(0.6);
  doc.font('Helvetica').fillColor(COLORS.text).fontSize(10);
}

function subSection(text) {
  doc.moveDown(0.8);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.primaryDark).text(text);
  doc.moveDown(0.3);
  doc.font('Helvetica').fillColor(COLORS.text).fontSize(10);
}

function bodyText(text, opts = {}) {
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.text).text(text, { align: 'justify', lineGap: 3, ...opts });
}

function boldText(text, opts = {}) {
  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.text).text(text, { lineGap: 3, ...opts });
}

function bulletItem(text) {
  const x = doc.x;
  doc.fontSize(10).font('Helvetica').fillColor(COLORS.primary).text('  •  ', { continued: true });
  doc.fillColor(COLORS.text).text(text, { align: 'left', lineGap: 2 });
}

function codeBlock(lines) {
  doc.moveDown(0.3);
  const startX = 70;
  const blockWidth = 455;
  const lineHeight = 13;
  const padding = 10;
  const blockHeight = lines.length * lineHeight + padding * 2;

  if (doc.y + blockHeight > 740) doc.addPage();

  const startY = doc.y;
  doc.roundedRect(startX, startY, blockWidth, blockHeight, 4)
    .fill(COLORS.codeBg);
  doc.fillColor('#334155').fontSize(8.5).font('Courier');
  let currentY = startY + padding;
  for (const line of lines) {
    doc.text(line, startX + padding, currentY);
    currentY += lineHeight;
  }
  doc.x = 60;
  doc.y = startY + blockHeight + 6;
  doc.font('Helvetica').fillColor(COLORS.text).fontSize(10);
}

function tableRow(cols, widths, opts = {}) {
  const startX = 65;
  const rowY = doc.y;
  const isHeader = opts.header || false;
  const rowHeight = 22;

  if (rowY + rowHeight > 740) doc.addPage();

  if (isHeader) {
    doc.rect(startX - 5, rowY - 3, 470, rowHeight).fill(COLORS.primary);
    doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(8.5);
  } else {
    if (opts.even) {
      doc.rect(startX - 5, rowY - 3, 470, rowHeight).fill('#F8FAFB');
    }
    doc.fillColor(COLORS.text).font('Helvetica').fontSize(8.5);
  }

  let xPos = startX;
  for (let i = 0; i < cols.length; i++) {
    doc.text(cols[i], xPos, rowY, { width: widths[i], align: 'left' });
    xPos += widths[i];
  }
  doc.y = rowY + rowHeight;
  doc.x = 60;
  doc.fillColor(COLORS.text).font('Helvetica').fontSize(10);
}

function checkPageSpace(needed) {
  if (doc.y + needed > 720) doc.addPage();
}

// ═══════════════════════════════════════════════════════════════
//  CAPA
// ═══════════════════════════════════════════════════════════════

doc.rect(0, 0, 595, 842).fill(COLORS.dark);

doc.rect(0, 0, 595, 8).fill(COLORS.primary);
doc.rect(0, 834, 595, 8).fill(COLORS.primary);

doc.moveDown(6);
doc.fontSize(10).font('Helvetica').fillColor(COLORS.primary)
  .text('PREFEITURA MUNICIPAL DE LAURO DE FREITAS — BAHIA', { align: 'center' });
doc.moveDown(0.3);
doc.fontSize(8).fillColor('#888888')
  .text('Central de Relacionamento com o Contribuinte — CRC', { align: 'center' });

doc.moveDown(4);

doc.rect(80, doc.y, 435, 3).fill(COLORS.primary);
doc.moveDown(1.5);

doc.fontSize(28).font('Helvetica-Bold').fillColor(COLORS.white)
  .text('DOCUMENTO DE', { align: 'center' });
doc.fontSize(28).fillColor(COLORS.primary)
  .text('REQUISITOS DE INTEGRAÇÃO', { align: 'center' });
doc.moveDown(0.8);
doc.fontSize(16).font('Helvetica').fillColor('#AAAAAA')
  .text('Módulo: Certidão Negativa de Débitos', { align: 'center' });

doc.moveDown(3);

doc.rect(80, doc.y, 435, 3).fill(COLORS.primary);
doc.moveDown(1.5);

doc.fontSize(10).font('Helvetica').fillColor('#888888')
  .text('Destinatário: Empresa Desenvolvedora do Sistema de Tributos', { align: 'center' });
doc.moveDown(0.8);

const dataHoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
doc.fontSize(10).fillColor('#AAAAAA')
  .text(`Versão 1.0  —  ${dataHoje}`, { align: 'center' });

doc.moveDown(6);
doc.fontSize(8).fillColor('#555555')
  .text('DOCUMENTO CONFIDENCIAL — USO RESTRITO', { align: 'center' });
doc.text('CRC — Central de Relacionamento com o Contribuinte — Lauro de Freitas/BA', { align: 'center' });

// ═══════════════════════════════════════════════════════════════
//  PÁGINA 2 — SUMÁRIO
// ═══════════════════════════════════════════════════════════════

doc.addPage();

doc.fontSize(18).font('Helvetica-Bold').fillColor(COLORS.primary).text('Sumário');
doc.moveDown(0.5);
drawLine(doc.y, COLORS.primary, 2);
doc.moveDown(1);

const sumario = [
  ['1.', 'Objetivo do Documento'],
  ['2.', 'Visão Geral da Arquitetura'],
  ['3.', 'Tipos de Certidão'],
  ['4.', 'APIs / Endpoints Requeridos'],
  ['  4.1', 'Consulta de Débitos por CPF/CNPJ'],
  ['  4.2', 'Consulta de Débitos por Inscrição'],
  ['  4.3', 'Verificação de Situação Fiscal'],
  ['  4.4', 'Emissão de Certidão'],
  ['  4.5', 'Validação de Autenticidade'],
  ['5.', 'Estrutura de Dados (JSON)'],
  ['6.', 'Regras de Negócio'],
  ['7.', 'Tabelas MSSQL Envolvidas'],
  ['8.', 'Requisitos Não-Funcionais'],
  ['9.', 'Segurança e Autenticação'],
  ['10.', 'Cronograma Sugerido'],
  ['11.', 'Considerações Finais'],
];

for (const [num, titulo] of sumario) {
  const isChild = num.startsWith(' ');
  doc.fontSize(isChild ? 9.5 : 10.5)
    .font(isChild ? 'Helvetica' : 'Helvetica-Bold')
    .fillColor(isChild ? COLORS.muted : COLORS.text)
    .text(`${num}  ${titulo}`, isChild ? 85 : 70);
  doc.moveDown(0.3);
}

// ═══════════════════════════════════════════════════════════════
//  1. OBJETIVO
// ═══════════════════════════════════════════════════════════════

doc.addPage();

sectionTitle('1. Objetivo do Documento');

bodyText(
  'Este documento especifica os requisitos técnicos de integração entre o portal CRC ' +
  '(Central de Relacionamento com o Contribuinte) do Município de Lauro de Freitas e o ' +
  'Sistema de Tributos Municipal, com foco na funcionalidade de emissão de Certidão ' +
  'Negativa de Débitos (CND) e Certidão Positiva com Efeito de Negativa (CPEN).'
);

doc.moveDown(0.5);

bodyText(
  'O objetivo é que a empresa desenvolvedora do Sistema de Tributos disponibilize ' +
  'endpoints de API REST (ou procedures MSSQL acessíveis via API intermediária) que ' +
  'permitam ao CRC consultar a situação fiscal do contribuinte em tempo real e emitir ' +
  'certidões com validade jurídica.'
);

doc.moveDown(0.5);

bodyText(
  'Atualmente o módulo de certidões do CRC opera com dados simulados (demonstração). ' +
  'Para entrar em produção, é imprescindível que o Sistema de Tributos forneça as interfaces ' +
  'descritas neste documento.'
);

// ═══════════════════════════════════════════════════════════════
//  2. VISÃO GERAL DA ARQUITETURA
// ═══════════════════════════════════════════════════════════════

sectionTitle('2. Visão Geral da Arquitetura');

bodyText(
  'A integração segue o modelo cliente-servidor, onde o CRC (Node.js/Express) consome ' +
  'APIs REST expostas pelo Sistema de Tributos. O fluxo principal é:'
);

doc.moveDown(0.6);

const fluxo = [
  '┌─────────────────┐      HTTPS/REST       ┌──────────────────────┐',
  '│                 │ ────────────────────>  │                      │',
  '│   CRC Portal    │   JSON Request         │  Sistema de Tributos │',
  '│  (Node.js)      │ <────────────────────  │     (MSSQL + API)    │',
  '│                 │   JSON Response        │                      │',
  '└─────────────────┘                        └──────────────────────┘',
  '',
  '  Contribuinte                                  Banco MSSQL',
  '  acessa via                                  ┌──────────────┐',
  '  navegador                                   │ TRB_VALIDACAO│',
  '  ─────────> CRC ──> API Tributos ──> SQL ──> │ TIPO_CERTIDOE│',
  '                                              │ IPTU_CPF_CNPJ│',
  '                                              └──────────────┘',
];

codeBlock(fluxo);

doc.moveDown(0.3);

bodyText('Requisitos de comunicação:');
doc.moveDown(0.2);
bulletItem('Protocolo: HTTPS (TLS 1.2 ou superior)');
bulletItem('Formato: JSON (Content-Type: application/json)');
bulletItem('Autenticação: Token Bearer (JWT) ou API Key com IP whitelist');
bulletItem('Timeout máximo recomendado: 30 segundos por requisição');

// ═══════════════════════════════════════════════════════════════
//  3. TIPOS DE CERTIDÃO
// ═══════════════════════════════════════════════════════════════

sectionTitle('3. Tipos de Certidão');

bodyText(
  'O sistema deverá suportar a emissão dos seguintes tipos de certidão, conforme a ' +
  'situação fiscal do contribuinte:'
);

doc.moveDown(0.6);

const certWidths = [130, 340];
tableRow(['TIPO', 'DESCRIÇÃO'], certWidths, { header: true });
tableRow(
  ['Certidão Negativa (CND)', 'Atesta a INEXISTÊNCIA de débitos tributários para o CPF/CNPJ ou inscrição consultada. Emitida quando não há nenhum débito em aberto, vencido ou inscrito em dívida ativa.'],
  certWidths, { even: false }
);
doc.moveDown(0.2);
tableRow(
  ['Certidão Positiva com Efeito de Negativa (CPEN)', 'Emitida quando EXISTEM débitos, porém todos estão com exigibilidade suspensa (parcelamento ativo e em dia, impugnação em andamento, liminar judicial, ou depósito do montante integral).'],
  certWidths, { even: true }
);
doc.moveDown(0.2);
tableRow(
  ['Certidão Positiva (CP)', 'Indica a EXISTÊNCIA de débitos tributários vencidos e não regularizados. Neste caso, a certidão NÃO é emitida — o sistema retorna a informação de que o contribuinte possui pendências.'],
  certWidths, { even: false }
);

// ═══════════════════════════════════════════════════════════════
//  4. APIs / ENDPOINTS REQUERIDOS
// ═══════════════════════════════════════════════════════════════

doc.addPage();

sectionTitle('4. APIs / Endpoints Requeridos');

bodyText(
  'A seguir estão especificados os 5 endpoints que o Sistema de Tributos deve disponibilizar ' +
  'para o CRC. Para cada endpoint, são detalhados: método HTTP, URL sugerida, parâmetros de ' +
  'entrada, estrutura de resposta e códigos de status.'
);

// ── 4.1 ──
subSection('4.1  Consulta de Débitos por CPF/CNPJ');

bodyText(
  'Retorna todos os débitos tributários (abertos, parcelados e em dívida ativa) ' +
  'vinculados a um CPF ou CNPJ. Este endpoint é utilizado pelo CRC para montar o ' +
  'painel de situação fiscal do contribuinte.'
);

doc.moveDown(0.4);
boldText('Especificação:');
doc.moveDown(0.2);

codeBlock([
  'GET /api/tributos/debitos/{cpf_cnpj}',
  '',
  'Headers:',
  '  Authorization: Bearer {token}',
  '  Content-Type: application/json',
  '',
  'Parâmetros de URL:',
  '  cpf_cnpj  (string, obrigatório) — CPF (11 dígitos) ou CNPJ (14 dígitos), apenas números',
  '',
  'Query Parameters (opcionais):',
  '  exercicio    — Ano do exercício fiscal (ex: 2026)',
  '  tipo_tributo — Filtro por tributo: IPTU, ISS, TFF, TAXAS, DIVIDA_ATIVA',
  '  situacao     — Filtro: ABERTO, PARCELADO, DIVIDA_ATIVA, TODOS (default)',
]);

doc.moveDown(0.4);
boldText('Resposta (200 OK):');
doc.moveDown(0.2);

codeBlock([
  '{',
  '  "cpf_cnpj": "034.567.890-12",',
  '  "nome": "Maria Fernanda da Silva",',
  '  "total_debitos": 3368.10,',
  '  "total_divida_ativa": 1438.80,',
  '  "situacao_geral": "IRREGULAR",',
  '  "debitos": [',
  '    {',
  '      "id_debito": 50234,',
  '      "inscricao": "001.023.045.001",',
  '      "tipo_tributo": "IPTU",',
  '      "exercicio": 2025,',
  '      "parcela": "3/10",',
  '      "valor_original": 450.00,',
  '      "juros": 22.50,',
  '      "multa": 18.00,',
  '      "valor_atualizado": 490.50,',
  '      "vencimento": "2025-07-15",',
  '      "situacao": "VENCIDO",',
  '      "inscrito_divida_ativa": false,',
  '      "numero_dam": "DAM-2025-003421"',
  '    }',
  '  ]',
  '}',
]);

checkPageSpace(200);

// ── 4.2 ──
subSection('4.2  Consulta de Débitos por Inscrição');

bodyText(
  'Retorna os débitos vinculados a uma inscrição específica (imobiliária ou mobiliária). ' +
  'Utilizado pelo CRC no módulo de certidões para verificar a situação de uma inscrição individual.'
);

doc.moveDown(0.4);
boldText('Especificação:');
doc.moveDown(0.2);

codeBlock([
  'GET /api/tributos/debitos/inscricao/{numero_inscricao}',
  '',
  'Headers:',
  '  Authorization: Bearer {token}',
  '',
  'Parâmetros de URL:',
  '  numero_inscricao  (string, obrigatório) — Número da inscrição (ex: 001.023.045.001)',
  '',
  'Query Parameters (opcionais):',
  '  exercicio    — Ano do exercício fiscal',
  '  incluir_quitados — true/false (default: false)',
]);

doc.moveDown(0.4);
boldText('Resposta (200 OK):');
doc.moveDown(0.2);

codeBlock([
  '{',
  '  "inscricao": "001.023.045.001",',
  '  "tipo": "IMOVEL",',
  '  "proprietario": "Maria Fernanda da Silva",',
  '  "cpf_cnpj": "034.567.890-12",',
  '  "endereco": "Rua das Acácias, 123 — Vilas do Atlântico",',
  '  "situacao_fiscal": "IRREGULAR",',
  '  "tem_parcelamento_ativo": false,',
  '  "total_debitos_abertos": 1929.30,',
  '  "debitos": [ ... ]  // Mesmo formato do endpoint 4.1',
  '}',
]);

doc.addPage();

// ── 4.3 ──
subSection('4.3  Verificação de Situação Fiscal (Pré-Certidão)');

bodyText(
  'Endpoint principal para emissão de certidão. Recebe um CPF/CNPJ ou inscrição e retorna ' +
  'a situação fiscal consolidada, indicando qual tipo de certidão pode ser emitida (ou se ' +
  'há impedimento). Este é o endpoint mais crítico da integração.'
);

doc.moveDown(0.4);
boldText('Especificação:');
doc.moveDown(0.2);

codeBlock([
  'POST /api/tributos/certidao/verificar',
  '',
  'Headers:',
  '  Authorization: Bearer {token}',
  '  Content-Type: application/json',
  '',
  'Body (JSON):',
  '{',
  '  "cpf_cnpj": "034.567.890-12",           // Obrigatório',
  '  "inscricao": "001.023.045.001",          // Opcional (filtra por inscrição)',
  '  "tipo_certidao_solicitada": "CND",       // CND, CPEN ou AUTO (sistema decide)',
  '  "finalidade": "LICITACAO"                // LICITACAO, FINANCIAMENTO, ALVARA, OUTROS',
  '}',
]);

doc.moveDown(0.4);
boldText('Resposta (200 OK) — Apta para emissão:');
doc.moveDown(0.2);

codeBlock([
  '{',
  '  "apta_emissao": true,',
  '  "tipo_certidao": "CND",',
  '  "cpf_cnpj": "034.567.890-12",',
  '  "nome": "Maria Fernanda da Silva",',
  '  "inscricao": "001.023.045.002",',
  '  "situacao": "REGULAR",',
  '  "debitos_suspensos": 0,',
  '  "motivo_suspensao": null,',
  '  "observacoes": "Nenhum débito encontrado para a inscrição informada.",',
  '  "validade_dias": 90,',
  '  "data_referencia": "2026-04-22T14:30:00Z"',
  '}',
]);

doc.moveDown(0.4);
boldText('Resposta (200 OK) — NÃO apta (Certidão Positiva):');
doc.moveDown(0.2);

codeBlock([
  '{',
  '  "apta_emissao": false,',
  '  "tipo_certidao": "POSITIVA",',
  '  "cpf_cnpj": "034.567.890-12",',
  '  "situacao": "IRREGULAR",',
  '  "total_debitos": 1929.30,',
  '  "quantidade_debitos": 4,',
  '  "debitos_resumo": [',
  '    { "tributo": "IPTU", "exercicio": 2025, "valor": 490.50 },',
  '    { "tributo": "TFF", "exercicio": 2025, "valor": 1438.80 }',
  '  ],',
  '  "mensagem": "Existem débitos em aberto que impedem a emissão de CND."',
  '}',
]);

doc.addPage();

// ── 4.4 ──
subSection('4.4  Emissão (Registro) de Certidão');

bodyText(
  'Após a verificação (4.3) retornar que o contribuinte está apto, o CRC chama este endpoint ' +
  'para registrar formalmente a emissão da certidão no Sistema de Tributos. O sistema deve ' +
  'gerar um código de autenticação único e persistir o registro na tabela TRB_VALIDACAO_CERTIDAO.'
);

doc.moveDown(0.4);
boldText('Especificação:');
doc.moveDown(0.2);

codeBlock([
  'POST /api/tributos/certidao/emitir',
  '',
  'Headers:',
  '  Authorization: Bearer {token}',
  '  Content-Type: application/json',
  '',
  'Body (JSON):',
  '{',
  '  "cpf_cnpj": "034.567.890-12",',
  '  "inscricao": "001.023.045.002",',
  '  "tipo_certidao": "CND",',
  '  "finalidade": "LICITACAO",',
  '  "solicitante_nome": "Maria Fernanda da Silva",',
  '  "solicitante_cpf": "034.567.890-12",',
  '  "canal": "PORTAL_CRC",',
  '  "ip_origem": "189.45.67.123"',
  '}',
]);

doc.moveDown(0.4);
boldText('Resposta (201 Created):');
doc.moveDown(0.2);

codeBlock([
  '{',
  '  "sucesso": true,',
  '  "certidao": {',
  '    "id": 89234,',
  '    "codigo_autenticacao": "CERT-2026-04832-A7BK9",',
  '    "tipo": "CND",',
  '    "cpf_cnpj": "034.567.890-12",',
  '    "inscricao": "001.023.045.002",',
  '    "nome_contribuinte": "Maria Fernanda da Silva",',
  '    "data_emissao": "2026-04-22T14:35:12Z",',
  '    "data_validade": "2026-07-21T23:59:59Z",',
  '    "validade_dias": 90,',
  '    "finalidade": "LICITACAO",',
  '    "texto_certidao": "Certificamos que NÃO constam débitos ...",',
  '    "hash_verificacao": "a1b2c3d4e5f6..."',
  '  }',
  '}',
]);

checkPageSpace(180);

// ── 4.5 ──
subSection('4.5  Validação de Autenticidade da Certidão');

bodyText(
  'Permite que terceiros (bancos, órgãos públicos, empresas) verifiquem se uma certidão ' +
  'apresentada é autêntica e ainda está dentro da validade. O CRC já possui o módulo de ' +
  '"Autenticação de Certidão" no frontend — este endpoint fornece os dados reais.'
);

doc.moveDown(0.4);
boldText('Especificação:');
doc.moveDown(0.2);

codeBlock([
  'GET /api/tributos/certidao/validar/{codigo_autenticacao}',
  '',
  'Headers:',
  '  Content-Type: application/json',
  '  (Sem autenticação — acesso público)',
  '',
  'Parâmetros de URL:',
  '  codigo_autenticacao (string) — Código impresso na certidão (ex: CERT-2026-04832-A7BK9)',
]);

doc.moveDown(0.4);
boldText('Resposta (200 OK):');
doc.moveDown(0.2);

codeBlock([
  '{',
  '  "valida": true,',
  '  "certidao": {',
  '    "codigo": "CERT-2026-04832-A7BK9",',
  '    "tipo": "CND",',
  '    "contribuinte": "M**** F****** da S****",',
  '    "cpf_cnpj_mascarado": "034.***.***-12",',
  '    "inscricao": "001.023.045.002",',
  '    "data_emissao": "2026-04-22",',
  '    "data_validade": "2026-07-21",',
  '    "vigente": true,',
  '    "municipio": "Lauro de Freitas — BA"',
  '  }',
  '}',
]);

// ═══════════════════════════════════════════════════════════════
//  5. ESTRUTURA DE DADOS (RESUMO)
// ═══════════════════════════════════════════════════════════════

doc.addPage();

sectionTitle('5. Estrutura de Dados — Resumo dos Campos');

bodyText(
  'Tabela consolidada com os campos mais relevantes trafegados entre os sistemas. ' +
  'Todos os campos de valores monetários devem utilizar formato numérico (float) com ' +
  'duas casas decimais. Datas devem seguir o formato ISO 8601 (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ssZ).'
);

doc.moveDown(0.6);

const dataWidths = [120, 70, 55, 225];
tableRow(['CAMPO', 'TIPO', 'OBRIG.', 'DESCRIÇÃO'], dataWidths, { header: true });

const campos = [
  ['cpf_cnpj', 'string', 'Sim', 'CPF (11 dígitos) ou CNPJ (14 dígitos), apenas números'],
  ['inscricao', 'string', 'Não', 'Número da inscrição imobiliária ou mobiliária'],
  ['nome', 'string', 'Sim', 'Nome completo ou razão social do contribuinte'],
  ['tipo_tributo', 'string', 'Sim', 'IPTU, ISS, TFF, TAXAS, DIVIDA_ATIVA, ITIV'],
  ['exercicio', 'integer', 'Sim', 'Ano do exercício fiscal (ex: 2026)'],
  ['valor_original', 'float', 'Sim', 'Valor original do débito sem correção'],
  ['juros', 'float', 'Sim', 'Valor de juros calculado até a data atual'],
  ['multa', 'float', 'Sim', 'Valor de multa aplicada'],
  ['valor_atualizado', 'float', 'Sim', 'Valor total (original + juros + multa + correção)'],
  ['vencimento', 'date', 'Sim', 'Data de vencimento no formato YYYY-MM-DD'],
  ['situacao', 'string', 'Sim', 'ABERTO, VENCIDO, PARCELADO, QUITADO, DIVIDA_ATIVA'],
  ['situacao_geral', 'string', 'Sim', 'REGULAR, IRREGULAR, REGULARIZANDO'],
  ['codigo_autenticacao', 'string', 'Sim', 'Código único gerado na emissão da certidão'],
  ['data_emissao', 'datetime', 'Sim', 'Timestamp ISO 8601 da emissão'],
  ['data_validade', 'datetime', 'Sim', 'Timestamp ISO 8601 do fim da validade'],
  ['tipo_certidao', 'string', 'Sim', 'CND, CPEN ou POSITIVA'],
];

for (let i = 0; i < campos.length; i++) {
  checkPageSpace(24);
  tableRow(campos[i], dataWidths, { even: i % 2 === 0 });
}

// ═══════════════════════════════════════════════════════════════
//  6. REGRAS DE NEGÓCIO
// ═══════════════════════════════════════════════════════════════

sectionTitle('6. Regras de Negócio');

subSection('6.1  Determinação do Tipo de Certidão');
doc.moveDown(0.2);
bulletItem('CND (Certidão Negativa): emitida quando NÃO existem débitos de nenhuma natureza para o CPF/CNPJ ou inscrição consultada.');
bulletItem('CPEN (Positiva com Efeito de Negativa): emitida quando existem débitos, mas TODOS possuem exigibilidade suspensa — parcelamento ativo e adimplente, impugnação administrativa, recurso em andamento, liminar/tutela judicial, ou depósito do montante integral.');
bulletItem('Positiva: existem débitos vencidos e sem suspensão. A certidão NÃO é emitida; o sistema deve retornar a lista de pendências.');

subSection('6.2  Validade');
doc.moveDown(0.2);
bulletItem('A certidão CND tem validade de 90 (noventa) dias corridos a partir da data de emissão, salvo disposição legal específica.');
bulletItem('A certidão CPEN tem validade enquanto perdurar a condição que a motivou (parcelamento em dia, processo em andamento), limitada a 90 dias.');
bulletItem('Após o vencimento, a certidão deve constar como EXPIRADA na consulta de validação (endpoint 4.5).');

subSection('6.3  Abrangência');
doc.moveDown(0.2);
bulletItem('A certidão pode ser emitida por CPF/CNPJ (abrange todas as inscrições do contribuinte) ou por inscrição específica.');
bulletItem('Quando emitida por CPF/CNPJ, TODOS os vínculos (imóveis e empresas) devem estar regulares para que seja CND.');
bulletItem('Quando emitida por inscrição, apenas os débitos daquela inscrição são considerados.');

checkPageSpace(120);

subSection('6.4  Restrições');
doc.moveDown(0.2);
bulletItem('Cada emissão deve gerar um registro auditável no banco de dados (tabela TRB_VALIDACAO_CERTIDAO).');
bulletItem('O código de autenticação deve ser único e não sequencial (evitar previsibilidade).');
bulletItem('Não permitir emissão de mais de 10 certidões por CPF/CNPJ em um período de 24 horas (proteção contra abuso).');
bulletItem('Débitos com lançamento "sub judice" devem ser tratados como exigibilidade suspensa (CPEN).');

// ═══════════════════════════════════════════════════════════════
//  7. TABELAS MSSQL
// ═══════════════════════════════════════════════════════════════

doc.addPage();

sectionTitle('7. Tabelas MSSQL Envolvidas');

bodyText(
  'As tabelas abaixo já estão documentadas na arquitetura do CRC (DOCUMENTACAO.md, seção 11) ' +
  'e são as que o Sistema de Tributos deve consultar/gravar durante o fluxo de certidões:'
);

doc.moveDown(0.6);

const tblWidths = [170, 300];
tableRow(['TABELA', 'FUNÇÃO NA INTEGRAÇÃO'], tblWidths, { header: true });

const tabelas = [
  ['TRB_VALIDACAO_CERTIDAO', 'Armazena todas as certidões emitidas. Campos esperados: código de autenticação, tipo, CPF/CNPJ, inscrição, data de emissão, data de validade, hash de verificação, IP de origem, canal de emissão.'],
  ['TIPO_CERTIDOES_WEB', 'Catálogo dos tipos de certidão disponíveis (CND, CPEN, Positiva). Define nomes, descrições e regras de validade para cada tipo.'],
  ['IPTU_CPF_CNPJ', 'Vinculação de inscrições imobiliárias a CPFs/CNPJs. Usada para resolver "quais inscrições pertencem a este contribuinte".'],
  ['TAXA_EXP_CPF_CNPJ', 'Taxas de expediente vinculadas ao contribuinte. Débitos de taxas devem ser considerados na verificação fiscal.'],
  ['ISS_AUTONOMO_TABELA', 'Lançamentos de ISS autônomo. Débitos de ISS devem ser considerados na verificação fiscal.'],
  ['Acordo', 'Acordos formalizados. Parcelamentos ativos e em dia justificam a emissão de CPEN.'],
  ['ACORDO_DIVIDA_PARCELAS_TABELA', 'Parcelas individuais de cada acordo. Necessário verificar se todas estão em dia para manter a CPEN.'],
  ['FR_USUARIO', 'Cadastro de usuários/contribuintes. Fonte do nome, CPF/CNPJ e dados de contato.'],
];

for (let i = 0; i < tabelas.length; i++) {
  checkPageSpace(30);
  tableRow(tabelas[i], tblWidths, { even: i % 2 === 0 });
  doc.moveDown(0.15);
}

doc.moveDown(0.5);

bodyText(
  'Observação: Caso o Sistema de Tributos utilize tabelas adicionais para o controle de débitos ' +
  '(além das listadas acima), solicitamos que sejam documentadas e informadas na resposta a este ' +
  'documento, para que possamos ajustar a integração.'
);

// ═══════════════════════════════════════════════════════════════
//  8. REQUISITOS NÃO-FUNCIONAIS
// ═══════════════════════════════════════════════════════════════

sectionTitle('8. Requisitos Não-Funcionais');

subSection('8.1  Performance');
doc.moveDown(0.2);
bulletItem('Tempo de resposta máximo: 5 segundos para qualquer endpoint (p95).');
bulletItem('Endpoint de verificação fiscal (4.3): tempo de resposta ideal abaixo de 2 segundos.');
bulletItem('A API deve suportar pelo menos 50 requisições simultâneas sem degradação.');

subSection('8.2  Disponibilidade');
doc.moveDown(0.2);
bulletItem('Disponibilidade mínima: 99,5% (uptime mensal), excluindo janelas de manutenção programada.');
bulletItem('Janelas de manutenção devem ser comunicadas com no mínimo 48 horas de antecedência.');
bulletItem('Em caso de indisponibilidade, os endpoints devem retornar HTTP 503 com mensagem descritiva.');

subSection('8.3  Escalabilidade');
doc.moveDown(0.2);
bulletItem('A API deve ser stateless (sem dependência de sessão do servidor).');
bulletItem('Paginação obrigatória em endpoints que retornem listas (máximo de 100 registros por página).');

subSection('8.4  Monitoramento');
doc.moveDown(0.2);
bulletItem('Endpoint de health check: GET /api/tributos/health retornando { "status": "ok", "timestamp": "..." }.');
bulletItem('Logs de acesso e erros devem ser mantidos por pelo menos 12 meses.');

// ═══════════════════════════════════════════════════════════════
//  9. SEGURANÇA
// ═══════════════════════════════════════════════════════════════

doc.addPage();

sectionTitle('9. Segurança e Autenticação');

subSection('9.1  Autenticação da API');
doc.moveDown(0.2);
bodyText(
  'Recomendamos uma das seguintes abordagens (em ordem de preferência):'
);
doc.moveDown(0.3);
bulletItem('Opção A — JWT (JSON Web Token): O CRC obtém um token via endpoint de autenticação (client_id + client_secret) e envia o token no header Authorization: Bearer {token} em todas as requisições. Token com expiração de 1 hora e refresh automático.');
doc.moveDown(0.15);
bulletItem('Opção B — API Key + IP Whitelist: Chave fixa de API enviada no header X-API-Key, combinada com restrição por IP de origem. Mais simples, porém menos flexível.');

subSection('9.2  Criptografia');
doc.moveDown(0.2);
bulletItem('Toda comunicação deve ocorrer sobre HTTPS (TLS 1.2+). Conexões HTTP puro devem ser rejeitadas.');
bulletItem('Dados sensíveis (CPF, CNPJ) em logs devem ser mascarados (ex: 034.***.***-12).');

subSection('9.3  LGPD');
doc.moveDown(0.2);
bulletItem('Os dados retornados pela API são dados pessoais protegidos pela Lei 13.709/2018 (LGPD).');
bulletItem('O endpoint de validação pública (4.5) deve retornar dados mascarados (nome parcial, CPF parcial).');
bulletItem('Registros de acesso (quem consultou, quando, IP) devem ser mantidos para auditoria.');

subSection('9.4  Rate Limiting');
doc.moveDown(0.2);
bulletItem('Limite sugerido: 100 requisições por minuto por IP/token.');
bulletItem('Ao exceder o limite, retornar HTTP 429 (Too Many Requests) com header Retry-After.');

// ═══════════════════════════════════════════════════════════════
//  10. CRONOGRAMA
// ═══════════════════════════════════════════════════════════════

sectionTitle('10. Cronograma Sugerido');

bodyText(
  'O cronograma abaixo é uma sugestão para alinhamento entre as equipes. ' +
  'As datas são negociáveis e devem ser confirmadas em reunião de kickoff.'
);

doc.moveDown(0.6);

const cronWidths = [55, 210, 205];
tableRow(['FASE', 'DESCRIÇÃO', 'PRAZO SUGERIDO'], cronWidths, { header: true });

const cronograma = [
  ['Fase 1', 'Análise técnica e definição de contrato da API', '2 semanas após aceite'],
  ['Fase 2', 'Desenvolvimento dos endpoints 4.1 e 4.2 (consultas)', '3 semanas após Fase 1'],
  ['Fase 3', 'Desenvolvimento dos endpoints 4.3, 4.4 e 4.5 (certidão)', '3 semanas após Fase 2'],
  ['Fase 4', 'Testes de integração em ambiente de homologação', '2 semanas após Fase 3'],
  ['Fase 5', 'Ajustes, correções e testes de carga', '1 semana após Fase 4'],
  ['Fase 6', 'Deploy em produção e monitoramento assistido', '1 semana após Fase 5'],
];

for (let i = 0; i < cronograma.length; i++) {
  checkPageSpace(24);
  tableRow(cronograma[i], cronWidths, { even: i % 2 === 0 });
}

doc.moveDown(0.5);
boldText('Prazo total estimado: 12 semanas (3 meses)');

// ═══════════════════════════════════════════════════════════════
//  11. CONSIDERAÇÕES FINAIS
// ═══════════════════════════════════════════════════════════════

sectionTitle('11. Considerações Finais');

bodyText(
  'Este documento de requisitos visa fornecer todas as informações necessárias para que a ' +
  'equipe de desenvolvimento do Sistema de Tributos possa planejar e implementar a ' +
  'integração com o portal CRC de forma eficiente e segura.'
);

doc.moveDown(0.5);

bodyText('Solicitamos que a empresa retorne com:');
doc.moveDown(0.3);
bulletItem('Confirmação de viabilidade técnica para cada endpoint especificado.');
bulletItem('Proposta de cronograma ajustada à realidade da equipe.');
bulletItem('Documentação das tabelas e procedures adicionais que sejam necessárias.');
bulletItem('Sugestão de melhorias ou adequações nos contratos de API propostos.');
bulletItem('Proposta comercial, se aplicável, para o desenvolvimento da integração.');

doc.moveDown(0.8);

bodyText(
  'Estamos à disposição para reuniões técnicas de alinhamento e esclarecimento de dúvidas. ' +
  'O ponto focal para esta integração no CRC é a equipe de desenvolvimento do portal.'
);

doc.moveDown(2);
drawLine(doc.y, COLORS.primary, 1.5);
doc.moveDown(0.8);

doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.primary)
  .text('CRC — Central de Relacionamento com o Contribuinte', { align: 'center' });
doc.fontSize(8).font('Helvetica').fillColor(COLORS.muted)
  .text('Prefeitura Municipal de Lauro de Freitas — Bahia', { align: 'center' });
doc.moveDown(0.3);
doc.text(`Documento gerado em ${dataHoje}`, { align: 'center' });

// ═══════════════════════════════════════════════════════════════
//  RODAPÉ EM TODAS AS PÁGINAS (exceto capa)
// ═══════════════════════════════════════════════════════════════

const totalPages = doc.bufferedPageRange().count;
for (let i = 1; i < totalPages; i++) {
  doc.switchToPage(i);
  doc.fontSize(7).font('Helvetica').fillColor(COLORS.muted);
  doc.text(
    `CRC — Requisitos de Integração: Certidão Negativa  |  Página ${i} de ${totalPages - 1}`,
    60, 810, { width: 475, align: 'center' }
  );
}

doc.end();

stream.on('finish', () => {
  console.log(`PDF gerado com sucesso: ${OUTPUT}`);
  console.log(`Tamanho: ${(fs.statSync(OUTPUT).size / 1024).toFixed(1)} KB`);
});
