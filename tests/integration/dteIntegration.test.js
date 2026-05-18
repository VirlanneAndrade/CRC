const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('../../server');

test('GET /api/dte/status retorna status da integracao', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/dte/status`);
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.eqfisProxyEnabled, true);
    assert.equal(body.dteServedFromRepository, true);
    assert.equal(body.dteRoute, '/dte');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /dte carrega o app unificado do CRC', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const resp = await fetch(`http://127.0.0.1:${port}/dte`);
    const html = await resp.text();

    assert.equal(resp.status, 200);
    assert.match(html, /Central de Relacionamento com o Contribuinte/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/dte/eqfis/notificacoes valida cpfCnpj obrigatorio', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/dte/eqfis/notificacoes`);
    const body = await resp.json();

    assert.equal(resp.status, 400);
    assert.match(body.erro, /CPF\/CNPJ inválido/i);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('GET /api/dte/eqfis/notificacoes encaminha chamada para EQFIS', async () => {
  const originalFetch = global.fetch;
  let forwardedHeaders = null;

  global.fetch = async (_url, options = {}) => {
    forwardedHeaders = options.headers;
    return {
      ok: true,
      status: 200,
      async json() {
        return { total: 1, itens: [{ id: 'demo' }] };
      },
    };
  };

  const server = app.listen(0);
  const { port } = server.address();

  try {
    const resp = await originalFetch(`http://127.0.0.1:${port}/api/dte/eqfis/notificacoes?cpfCnpj=12345678901`);
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.total, 1);
    assert.equal(forwardedHeaders['X-Contribuinte-CPFCNPJ'], '12345678901');
  } finally {
    global.fetch = originalFetch;
    await new Promise((resolve) => server.close(resolve));
  }
});
