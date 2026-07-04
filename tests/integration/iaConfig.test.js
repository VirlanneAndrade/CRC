const test = require('node:test');
const { beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../../server');
const { __setRepositories } = require('../../src/repositories');
const { createInMemoryRepositories } = require('../helpers/inMemoryRepositories');

function startServer() {
  const server = app.listen(0);
  const { port } = server.address();
  return { server, base: `http://127.0.0.1:${port}` };
}

beforeEach(() => {
  __setRepositories(createInMemoryRepositories());
});

test('GET /ia/config nao expoe a apiKey em texto puro', async () => {
  const { server, base } = startServer();
  try {
    await fetch(`${base}/api/v1/ia/config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provedor: 'openai', modelo: 'gpt-4o-mini', apiKey: 'sk-super-secreta-1234', systemPrompt: 'Ajude', temperatura: 0.5 }),
    });
    const resp = await fetch(`${base}/api/v1/ia/config`);
    const body = await resp.json();
    assert.equal(resp.status, 200);
    assert.equal(body.config.hasApiKey, true);
    assert.equal(body.config.apiKey, undefined);
    assert.match(body.config.apiKeyMask, /1234$/);
    assert.ok(!body.config.apiKeyMask.includes('super'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('PUT com apiKey vazia preserva a chave existente', async () => {
  const { server, base } = startServer();
  try {
    await fetch(`${base}/api/v1/ia/config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provedor: 'openai', apiKey: 'sk-original-9999' }),
    });
    await fetch(`${base}/api/v1/ia/config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provedor: 'anthropic', modelo: 'claude', apiKey: '' }),
    });
    const resp = await fetch(`${base}/api/v1/ia/config`);
    const body = await resp.json();
    assert.equal(body.config.provedor, 'anthropic');
    assert.equal(body.config.hasApiKey, true);
    assert.match(body.config.apiKeyMask, /9999$/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
