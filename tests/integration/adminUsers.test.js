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

async function loginMaster(client) {
  await client.request('/api/v1/admin/login', { method: 'POST', body: { login: 'admin', senha: 'admin123' } });
}

beforeEach(() => {
  __setRepositories(createInMemoryRepositories({ seedAdmin: true }));
});

test('CRUD de usuarios exige autenticacao', async () => {
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    const resp = await client.request('/api/v1/admin/usuarios');
    assert.equal(resp.status, 401);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('master cria, edita e exclui usuario', async () => {
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    await loginMaster(client);

    const criar = await client.request('/api/v1/admin/usuarios', { method: 'POST', body: { login: 'suporte1', nome: 'Suporte Um', email: 's1@x.com', senha: 'sup123', perfil: 'suporte' } });
    const criado = await criar.json();
    assert.equal(criar.status, 201);
    assert.equal(criado.usuario.login, 'suporte1');
    const id = criado.usuario.id;

    const editar = await client.request(`/api/v1/admin/usuarios/${id}`, { method: 'PUT', body: { nome: 'Suporte Editado', perfil: 'dev' } });
    const editado = await editar.json();
    assert.equal(editar.status, 200);
    assert.equal(editado.usuario.nome, 'Suporte Editado');
    assert.equal(editado.usuario.perfil, 'dev');

    const excluir = await client.request(`/api/v1/admin/usuarios/${id}`, { method: 'DELETE' });
    assert.equal(excluir.status, 200);

    const lista = await client.request('/api/v1/admin/usuarios');
    const listaBody = await lista.json();
    assert.equal(listaBody.usuarios.some((u) => u.id === id), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('nao permite criar usuario com perfil master', async () => {
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    await loginMaster(client);
    const criar = await client.request('/api/v1/admin/usuarios', { method: 'POST', body: { login: 'x', nome: 'X', senha: '1234', perfil: 'master' } });
    assert.equal(criar.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('nao permite excluir o usuario master', async () => {
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    await loginMaster(client);
    const lista = await client.request('/api/v1/admin/usuarios');
    const listaBody = await lista.json();
    const master = listaBody.usuarios.find((u) => u.master);
    const excluir = await client.request(`/api/v1/admin/usuarios/${master.id}`, { method: 'DELETE' });
    assert.equal(excluir.status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('usuario nao-master nao pode excluir (requireMaster)', async () => {
  const repos = createInMemoryRepositories({ seedAdmin: true });
  __setRepositories(repos);
  const { server, base } = startServer();
  const client = createClient(base);
  try {
    await loginMaster(client);
    const criar = await client.request('/api/v1/admin/usuarios', { method: 'POST', body: { login: 'suporte2', nome: 'Suporte Dois', senha: 'sup123', perfil: 'suporte' } });
    const criado = await criar.json();
    await client.request('/api/v1/admin/logout', { method: 'POST' });

    const client2 = createClient(base);
    await client2.request('/api/v1/admin/login', { method: 'POST', body: { login: 'suporte2', senha: 'sup123' } });
    const excluir = await client2.request(`/api/v1/admin/usuarios/${criado.usuario.id}`, { method: 'DELETE' });
    assert.equal(excluir.status, 403);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
