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

test('login com credenciais validas cria sessao e /me responde', async () => {
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    const login = await client.request('/api/v1/admin/login', { method: 'POST', body: { login: 'admin', senha: 'admin123' } });
    const body = await login.json();
    assert.equal(login.status, 200);
    assert.equal(body.admin.login, 'admin');
    assert.equal(body.admin.master, true);

    const me = await client.request('/api/v1/admin/me');
    const meBody = await me.json();
    assert.equal(me.status, 200);
    assert.equal(meBody.admin.login, 'admin');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('login com senha invalida retorna 401', async () => {
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    const login = await client.request('/api/v1/admin/login', { method: 'POST', body: { login: 'admin', senha: 'errada' } });
    assert.equal(login.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('login sem campos retorna 400', async () => {
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    const login = await client.request('/api/v1/admin/login', { method: 'POST', body: {} });
    assert.equal(login.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('/me sem sessao retorna 401', async () => {
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    const me = await client.request('/api/v1/admin/me');
    assert.equal(me.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('logout encerra a sessao', async () => {
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    await client.request('/api/v1/admin/login', { method: 'POST', body: { login: 'admin', senha: 'admin123' } });
    const logout = await client.request('/api/v1/admin/logout', { method: 'POST' });
    assert.equal(logout.status, 200);
    const me = await client.request('/api/v1/admin/me');
    assert.equal(me.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
