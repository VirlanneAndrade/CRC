const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('../../server');

test('LGPD termo vigente deve ser retornado', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/v1/lgpd/termo-vigente`);
    const body = await resp.json();
    assert.equal(resp.status, 200);
    assert.equal(typeof body.versao, 'string');
    assert.match(body.hash, /^sha256:/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('LGPD status deve indicar falta de aceite atual', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/v1/lgpd/status`, {
      headers: { 'x-user-id': `user-${Date.now()}` },
    });
    const body = await resp.json();
    assert.equal(resp.status, 200);
    assert.equal(body.acceptedCurrent, false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Preferencias de notificacoes exigem canal validado', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/v1/notificacoes/preferencias`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ canais: [{ tipo: 'email', destino: 'x@y.com', validado: false }], tiposNotificacao: [] }),
    });
    assert.equal(resp.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Emissao e autenticacao de certidao devem funcionar', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const emitir = await fetch(`http://127.0.0.1:${port}/api/v1/certidoes/emitir`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ inscricao: 'EMP-2024-00345', tipoCert: 'Certidao Negativa', tipo: 'Empresa', vinculo: 'Responsavel' }),
    });
    const emissao = await emitir.json();
    assert.equal(emitir.status, 201);
    assert.match(emissao.codigoAutenticacao, /^CERT-/);

    const auth = await fetch(`http://127.0.0.1:${port}/api/v1/documentos/autenticar/${encodeURIComponent(emissao.codigoAutenticacao)}`);
    const validacao = await auth.json();
    assert.equal(auth.status, 200);
    assert.equal(validacao.valida, true);

    const download = await fetch(`http://127.0.0.1:${port}${emissao.urlDownload}`);
    assert.equal(download.status, 200);
    assert.equal(download.headers.get('content-type'), 'application/pdf');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Emissao de alvara deve gerar PDF para download', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const emitir = await fetch(`http://127.0.0.1:${port}/api/v1/alvaras/emitir`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ inscricao: 'EMP-2024-00345', cnpj: '12.345.678/0001-90', nome: 'Empresa Alpha', validade: '31/12/2026' }),
    });
    const body = await emitir.json();
    assert.equal(emitir.status, 201);
    assert.match(body.codigoAutenticacao, /^ALV-/);

    const download = await fetch(`http://127.0.0.1:${port}${body.urlDownload}`);
    assert.equal(download.status, 200);
    assert.equal(download.headers.get('content-type'), 'application/pdf');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
