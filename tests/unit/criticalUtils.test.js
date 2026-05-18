const test = require('node:test');
const assert = require('node:assert/strict');

const { generateCodigoCertidao, maskDocumento } = require('../../src/services/criticalUtils');

test('generateCodigoCertidao gera codigo no padrao CERT-ANO-XXXXX-HEX', () => {
  const codigo = generateCodigoCertidao();
  assert.match(codigo, /^CERT-\d{4}-\d{5}-[A-F0-9]{6}$/);
});

test('maskDocumento mascara CPF e CNPJ', () => {
  assert.equal(maskDocumento('03456789012'), '034.***.***-12');
  assert.equal(maskDocumento('12345678000190'), '12.***.***/****-90');
});
