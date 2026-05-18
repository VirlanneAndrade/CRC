const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

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
    const entidade = {
      nome: 'Prefeitura Municipal de Teste',
      cnpj: '12.345.678/0001-99',
      endereco: 'Rua Exemplo, 100',
      uf: 'BA',
    };
    const emitir = await fetch(`http://127.0.0.1:${port}/api/v1/certidoes/emitir`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ inscricao: 'EMP-2024-00345', tipoCert: 'Certidao Negativa', tipo: 'Empresa', vinculo: 'Responsavel', entidade }),
    });
    const emissao = await emitir.json();
    assert.equal(emitir.status, 201);
    assert.match(emissao.codigoAutenticacao, /^CERT-/);

    const auth = await fetch(`http://127.0.0.1:${port}/api/v1/documentos/autenticar/${encodeURIComponent(emissao.codigoAutenticacao)}`);
    const validacao = await auth.json();
    assert.equal(auth.status, 200);
    assert.equal(validacao.valida, true);
    assert.equal(validacao.entidade.nome, entidade.nome);
    assert.equal(validacao.entidade.cnpj, entidade.cnpj);

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

test('Configuracao de entidade deve ser persistida pela API', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const payload = {
      nome: 'Prefeitura Municipal da Praia',
      cnpj: '01.222.333/0001-44',
      endereco: 'Av. Central, 200',
      telefone: '(71) 3000-0000',
    };
    const putResp = await fetch(`http://127.0.0.1:${port}/api/v1/entidade/config`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.equal(putResp.status, 200);

    const getResp = await fetch(`http://127.0.0.1:${port}/api/v1/entidade/config`);
    const body = await getResp.json();
    assert.equal(getResp.status, 200);
    assert.equal(body.entidade.nome, payload.nome);
    assert.equal(body.entidade.cnpj, payload.cnpj);
    assert.equal(body.entidade.endereco, payload.endereco);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('Configuracao de integracao de tributos deve salvar e testar conexao', async () => {
  const upstream = http.createServer((_req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'tributos' }));
  });
  await new Promise((resolve) => upstream.listen(0, resolve));
  const upstreamPort = upstream.address().port;

  const server = app.listen(0);
  const { port } = server.address();
  try {
    const payload = {
      apiBaseUrl: `http://127.0.0.1:${upstreamPort}`,
      authType: 'bearer',
      authToken: 'token-x',
      healthPath: '/health',
      timeoutMs: 3000,
      sincronizacao: '15min',
      recursos: ['cadastro', 'divida'],
    };
    const putResp = await fetch(`http://127.0.0.1:${port}/api/v1/integracoes/tributos`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.equal(putResp.status, 200);

    const testResp = await fetch(`http://127.0.0.1:${port}/api/v1/integracoes/tributos/testar`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const testBody = await testResp.json();
    assert.equal(testResp.status, 200);
    assert.equal(testBody.ok, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => upstream.close(resolve));
  }
});

test('Teste de notificacao deve retornar protocolo no modo simulado', async () => {
  const server = app.listen(0);
  const { port } = server.address();
  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/v1/notificacoes/teste/enviar`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ canal: 'email', destino: 'teste@exemplo.com', mensagem: 'ping' }),
    });
    const body = await resp.json();
    assert.equal(resp.status, 200);
    assert.equal(body.ok, true);
    assert.match(body.protocolo, /^NTF-/);
    assert.equal(body.modo, 'simulado');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
