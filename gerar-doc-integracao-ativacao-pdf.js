const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const inputPath = path.join(__dirname, 'DOCUMENTO_INTEGRACAO_E_ATIVACAO_CRC.md');
const outputPath = path.join(__dirname, 'DOCUMENTO_INTEGRACAO_E_ATIVACAO_CRC.pdf');

function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let inCode = false;
  let codeBuffer = [];

  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        blocks.push({ type: 'code', text: codeBuffer.join('\n') });
        codeBuffer = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }
    if (inCode) {
      codeBuffer.push(line);
      return;
    }
    if (line.startsWith('## ')) return blocks.push({ type: 'h2', text: line.slice(3).trim() });
    if (line.startsWith('### ')) return blocks.push({ type: 'h3', text: line.slice(4).trim() });
    if (line.startsWith('# ')) return blocks.push({ type: 'h1', text: line.slice(2).trim() });
    if (/^\s*-\s+/.test(line)) {
      const indent = line.length - line.replace(/^\s+/, '').length;
      return blocks.push({ type: 'li', text: line.replace(/^\s*-\s+/, '').trim(), indent });
    }
    if (/^\s*\d+\.\s+/.test(line)) return blocks.push({ type: 'oli', text: line.replace(/^\s*\d+\.\s+/, '').trim() });
    if (line.startsWith('> ')) return blocks.push({ type: 'quote', text: line.slice(2).trim() });
    if (line.trim() === '---') return blocks.push({ type: 'hr' });
    if (!line.trim()) return blocks.push({ type: 'space' });
    return blocks.push({ type: 'p', text: line.trim() });
  });

  if (codeBuffer.length) blocks.push({ type: 'code', text: codeBuffer.join('\n') });
  return blocks;
}

function stripInlineMarkdown(text) {
  return String(text || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

function drawHeader(doc) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const width = right - left;
  doc.rect(left, 34, width, 68).fill('#f2f7fc');
  doc.fillColor('#17324d').font('Helvetica-Bold').fontSize(16).text('PREFEITURA MUNICIPAL DE LAURO DE FREITAS', left, 48, { width, align: 'center' });
  doc.fillColor('#2d4a67').font('Helvetica').fontSize(10).text('Secretaria Municipal da Fazenda - Portal CRC', left, 72, { width, align: 'center' });
  doc.moveTo(left, 106).lineTo(right, 106).strokeColor('#c1d7ea').lineWidth(1).stroke();
  doc.y = 124;
}

function ensureSpace(doc, needed = 60) {
  if (doc.y > 740 - needed) {
    doc.addPage();
    drawHeader(doc);
  }
}

function renderDocument(blocks) {
  const doc = new PDFDocument({ size: 'A4', margin: 52 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  drawHeader(doc);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#102a43').text('Documento de Integracao e Ativacao', { align: 'center' });
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(11).fillColor('#486581').text('Guia unico para colocar o Portal CRC no ar', { align: 'center' });
  doc.moveDown(1.2);

  blocks.forEach((block) => {
    ensureSpace(doc);

    if (block.type === 'h1') {
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(15).fillColor('#0f2a45').text(stripInlineMarkdown(block.text));
      doc.moveDown(0.2);
      return;
    }
    if (block.type === 'h2') {
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#123b60').text(stripInlineMarkdown(block.text));
      doc.moveDown(0.2);
      return;
    }
    if (block.type === 'h3') {
      doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#1f4e79').text(stripInlineMarkdown(block.text));
      return;
    }
    if (block.type === 'li') {
      const indent = block.indent && block.indent >= 2 ? 22 : 8;
      doc.font('Helvetica').fontSize(10.5).fillColor('#1a1a1a').text(`\u2022 ${stripInlineMarkdown(block.text)}`, { indent, paragraphGap: 2 });
      return;
    }
    if (block.type === 'oli') {
      doc.font('Helvetica').fontSize(10.5).fillColor('#1a1a1a').text(stripInlineMarkdown(block.text), { indent: 8, paragraphGap: 2 });
      return;
    }
    if (block.type === 'quote') {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#5c6f82').text(stripInlineMarkdown(block.text), { indent: 12 });
      return;
    }
    if (block.type === 'code') {
      ensureSpace(doc, 80);
      const left = doc.page.margins.left;
      const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const lineCount = block.text.split('\n').length;
      const boxHeight = lineCount * 12 + 16;
      const startY = doc.y;
      doc.rect(left, startY, width, boxHeight).fill('#f4f6f8');
      doc.fillColor('#1f2d3d').font('Courier').fontSize(9).text(block.text, left + 8, startY + 8, { width: width - 16, lineGap: 1.5 });
      doc.y = startY + boxHeight + 6;
      doc.fillColor('#1a1a1a');
      return;
    }
    if (block.type === 'hr') {
      doc.moveDown(0.3);
      doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).strokeColor('#d2dde8').lineWidth(1).stroke();
      doc.moveDown(0.5);
      return;
    }
    if (block.type === 'space') {
      doc.moveDown(0.35);
      return;
    }
    doc.font('Helvetica').fontSize(10.5).fillColor('#1a1a1a').text(stripInlineMarkdown(block.text), { align: 'left', lineGap: 2 });
  });

  doc.moveDown(1.5);
  ensureSpace(doc, 70);
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#17324d').text('Assinatura institucional', { align: 'center' });
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(9.5).fillColor('#486581').text('Prefeitura Municipal de Lauro de Freitas - Secretaria Municipal da Fazenda', { align: 'center' });
  doc.text(`Emitido em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });

  doc.end();
}

const markdown = fs.readFileSync(inputPath, 'utf8');
renderDocument(parseMarkdown(markdown));
console.log(`PDF gerado em: ${outputPath}`);
