const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const inputPath = path.join(__dirname, 'DOCUMENTO_SOLICITACAO_INTEGRACAO_TRIBUTOS_CRC.md');
const outputPath = path.join(__dirname, 'DOCUMENTO_SOLICITACAO_INTEGRACAO_TRIBUTOS_CRC.pdf');

function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  return lines.map((line) => {
    if (line.startsWith('## ')) return { type: 'h2', text: line.slice(3).trim() };
    if (line.startsWith('### ')) return { type: 'h3', text: line.slice(4).trim() };
    if (line.startsWith('- ')) return { type: 'li', text: line.slice(2).trim() };
    if (line.startsWith('> ')) return { type: 'quote', text: line.slice(2).trim() };
    if (line.trim() === '---') return { type: 'hr' };
    if (!line.trim()) return { type: 'space' };
    return { type: 'p', text: line.trim() };
  });
}

function drawHeader(doc) {
  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const width = right - left;
  doc.rect(left, 34, width, 68).fill('#f2f7fc');
  doc.fillColor('#17324d').font('Helvetica-Bold').fontSize(16).text('PREFEITURA MUNICIPAL DE LAURO DE FREITAS', left, 48, { width, align: 'center' });
  doc.fillColor('#2d4a67').font('Helvetica').fontSize(10).text('Secretaria Municipal da Fazenda - Integração de Dados Tributários', left, 72, { width, align: 'center' });
  doc.moveTo(left, 106).lineTo(right, 106).strokeColor('#c1d7ea').lineWidth(1).stroke();
  doc.y = 124;
}

function renderDocument(blocks) {
  const doc = new PDFDocument({ size: 'A4', margin: 52 });
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  drawHeader(doc);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#102a43').text('Documento de Solicitação de Integração', { align: 'center' });
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(11).fillColor('#486581').text('Portal CRC - Empresa de Tributos', { align: 'center' });
  doc.moveDown(1.2);

  blocks.forEach((block) => {
    if (doc.y > 740) {
      doc.addPage();
      drawHeader(doc);
    }

    if (block.type === 'h2') {
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').fontSize(13).fillColor('#123b60').text(block.text);
      doc.moveDown(0.2);
      return;
    }
    if (block.type === 'h3') {
      doc.font('Helvetica-Bold').fontSize(11.5).fillColor('#1f4e79').text(block.text);
      return;
    }
    if (block.type === 'li') {
      doc.font('Helvetica').fontSize(10.5).fillColor('#1a1a1a').text(`• ${block.text}`, { indent: 8, paragraphGap: 2 });
      return;
    }
    if (block.type === 'quote') {
      doc.font('Helvetica-Oblique').fontSize(10).fillColor('#5c6f82').text(block.text, { indent: 12 });
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
    doc.font('Helvetica').fontSize(10.5).fillColor('#1a1a1a').text(block.text, { align: 'left', lineGap: 2 });
  });

  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#17324d').text('Assinatura institucional', { align: 'center' });
  doc.moveDown(0.2);
  doc.font('Helvetica').fontSize(9.5).fillColor('#486581').text('Prefeitura Municipal de Lauro de Freitas - Secretaria Municipal da Fazenda', { align: 'center' });
  doc.text(`Emitido em ${new Date().toLocaleString('pt-BR')}`, { align: 'center' });

  doc.end();
}

const markdown = fs.readFileSync(inputPath, 'utf8');
renderDocument(parseMarkdown(markdown));
console.log(`PDF gerado em: ${outputPath}`);
