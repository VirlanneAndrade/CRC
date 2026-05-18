const test = require('node:test');
const assert = require('node:assert/strict');

const {
  sanitizeCpfCnpj,
  ensureValidCpfCnpj,
} = require('../../src/services/eqfisClient');

test('sanitizeCpfCnpj remove qualquer caractere nao numerico', () => {
  assert.equal(sanitizeCpfCnpj('12.345.678/0001-90'), '12345678000190');
});

test('ensureValidCpfCnpj aceita CPF e CNPJ validos por tamanho', () => {
  assert.equal(ensureValidCpfCnpj('123.456.789-00'), '12345678900');
  assert.equal(ensureValidCpfCnpj('12.345.678/0001-90'), '12345678000190');
});

test('ensureValidCpfCnpj rejeita documento com tamanho invalido', () => {
  assert.equal(ensureValidCpfCnpj('12345'), null);
});
