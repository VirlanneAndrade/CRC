const test = require('node:test');
const assert = require('node:assert/strict');

function loadTributosClient(envOverrides = {}) {
  Object.assign(process.env, envOverrides);
  delete require.cache[require.resolve('../../src/config/env')];
  delete require.cache[require.resolve('../../src/services/tributosClient')];
  return require('../../src/services/tributosClient');
}

test('buildRuleUrl monta URL JFU com sys e cpfCnpj', () => {
  const client = loadTributosClient({
    TRIBUTOS_API_BASE_URL: 'http://177.8.224.178:4090/sifmp',
  });
  const url = client.buildRuleUrl({ cpfCnpj: '09592400000108' });
  assert.equal(
    url,
    'http://177.8.224.178:4090/sifmp/contribuintes.rule?sys=JFU&cpfCnpj=09592400000108'
  );
});

test('buildRuleUrl inclui resumo=true para resumo fiscal', () => {
  const client = loadTributosClient({
    TRIBUTOS_API_BASE_URL: 'http://177.8.224.178:4090/sifmp',
  });
  const url = client.buildRuleUrl({ cpfCnpj: '09592400000108', resumo: 'true' });
  assert.match(url, /resumo=true/);
  assert.match(url, /sys=JFU/);
});

test('buildHeaders envia X-API-Key quando AUTH_TYPE=x-api-key', () => {
  const client = loadTributosClient({
    TRIBUTOS_API_BASE_URL: 'http://example.com/sifmp',
    TRIBUTOS_API_KEY: 'chave-secreta',
    TRIBUTOS_AUTH_TYPE: 'x-api-key',
  });
  const headers = client.buildHeaders();
  assert.equal(headers['X-API-Key'], 'chave-secreta');
  assert.equal(headers.Authorization, undefined);
});

test('ensureValidCpfCnpj rejeita documento invalido', () => {
  const client = loadTributosClient({ TRIBUTOS_API_BASE_URL: 'http://example.com/sifmp' });
  assert.equal(client.ensureValidCpfCnpj('123'), null);
});

test('getContribuinte retorna 503 quando integracao nao configurada', async () => {
  const client = loadTributosClient({ TRIBUTOS_API_BASE_URL: '' });
  const result = await client.getContribuinte('12345678901');
  assert.equal(result.status, 503);
  assert.equal(result.body.codigo, 'TRIBUTOS_NAO_CONFIGURADO');
});

test('getContribuinte retorna 400 para documento invalido', async () => {
  const client = loadTributosClient({ TRIBUTOS_API_BASE_URL: 'http://example.com/sifmp' });
  const result = await client.getContribuinte('abc');
  assert.equal(result.status, 400);
  assert.equal(result.body.codigo, 'DOCUMENTO_INVALIDO');
});

test('getSituacaoFiscal retorna NAO_IMPLEMENTADO', async () => {
  const client = loadTributosClient({ TRIBUTOS_API_BASE_URL: 'http://example.com/sifmp' });
  const result = await client.getSituacaoFiscal();
  assert.equal(result.status, 503);
  assert.equal(result.body.codigo, 'NAO_IMPLEMENTADO');
});
