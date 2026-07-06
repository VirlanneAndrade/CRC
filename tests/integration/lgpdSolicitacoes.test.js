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

test('cria solicitacao LGPD e lista por usuario', async () => {
  const { server, base } = startServer();
  const userId = 'contribuinte-1';
  try {
    const criar = await fetch(`${base}/api/v1/lgpd/solicitacoes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({ tipo: 'Acesso aos dados pessoais', descricao: 'Quero meus dados' }),
    });
    const criado = await criar.json();
    assert.equal(criar.status, 201);
    assert.match(criado.solicitacao.numero, /^LGPD-\d{4}-\d{4}$/);

    const lista = await fetch(`${base}/api/v1/lgpd/solicitacoes`, { headers: { 'x-user-id': userId } });
    const listaBody = await lista.json();
    assert.equal(lista.status, 200);
    assert.equal(listaBody.solicitacoes.length, 1);
    assert.equal(listaBody.solicitacoes[0].status, 'Em analise');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('rejeita solicitacao sem tipo ou descricao', async () => {
  const { server, base } = startServer();
  try {
    const resp = await fetch(`${base}/api/v1/lgpd/solicitacoes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-id': 'u1' },
      body: JSON.stringify({ tipo: '', descricao: '' }),
    });
    assert.equal(resp.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('solicitacoes sao isoladas por usuario', async () => {
  const { server, base } = startServer();
  try {
    await fetch(`${base}/api/v1/lgpd/solicitacoes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-id': 'user-a' },
      body: JSON.stringify({ tipo: 'Exclusão de dados', descricao: 'apague' }),
    });
    const lista = await fetch(`${base}/api/v1/lgpd/solicitacoes`, { headers: { 'x-user-id': 'user-b' } });
    const body = await lista.json();
    assert.equal(body.solicitacoes.length, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
