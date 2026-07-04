const test = require('node:test');
const assert = require('node:assert/strict');
const { hash, verify } = require('../../src/services/passwordHash');

test('hash gera formato scrypt e verify confirma a senha correta', () => {
  const stored = hash('admin123');
  assert.match(stored, /^scrypt\$[0-9a-f]+\$[0-9a-f]+$/);
  assert.equal(verify('admin123', stored), true);
});

test('verify rejeita senha incorreta', () => {
  const stored = hash('admin123');
  assert.equal(verify('errada', stored), false);
});

test('hash gera saltos diferentes para a mesma senha', () => {
  assert.notEqual(hash('igual'), hash('igual'));
});

test('verify rejeita hash malformado', () => {
  assert.equal(verify('x', 'formato-invalido'), false);
  assert.equal(verify('x', null), false);
});
