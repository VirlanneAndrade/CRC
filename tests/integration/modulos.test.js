const test = require('node:test');
const { beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../../server');
const { __setRepositories } = require('../../src/repositories');
const { createInMemoryRepositories } = require('../helpers/inMemoryRepositories');
const { createClient } = require('../helpers/httpClient');

function startServer() {
  const server = app.listen(0);
  const { port } = server.address();
  return { server, base: `http://127.0.0.1:${port}` };
}

beforeEach(() => {
  __setRepositories(createInMemoryRepositories({ seedAdmin: true }));
});

test('GET /modulos e publico e retorna defaults', async () => {
  const { server, base } = startServer();
  try {
    const resp = await fetch(`${base}/api/v1/modulos`);
    const body = await resp.json();
    assert.equal(resp.status, 200);
    assert.equal(body.modulos.dashboard, true);
    assert.equal(typeof body.modulos.nfse, 'boolean');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('PUT /modulos exige sessao master', async () => {
  const { server, base } = startServer();
  try {
    const resp = await fetch(`${base}/api/v1/modulos`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ modulos: { nfse: false } }),
    });
    assert.equal(resp.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('master salva modulos e o GET reflete a mudanca', async () => {
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    await client.request('/api/v1/admin/login', { method: 'POST', body: { login: 'admin', senha: 'admin123' } });
    const put = await client.request('/api/v1/modulos', { method: 'PUT', body: { modulos: { nfse: false } } });
    const putBody = await put.json();
    assert.equal(put.status, 200);
    assert.equal(putBody.modulos.nfse, false);

    const get = await fetch(`${base}/api/v1/modulos`);
    const getBody = await get.json();
    assert.equal(getBody.modulos.nfse, false);
    assert.equal(getBody.modulos.dashboard, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
