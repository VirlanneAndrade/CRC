const http = require('http');
const test = require('node:test');
const assert = require('node:assert/strict');

function loadApp(upstreamBaseUrl) {
  process.env.TRIBUTOS_API_BASE_URL = upstreamBaseUrl;
  process.env.TRIBUTOS_API_KEY = 'test-api-key';
  process.env.TRIBUTOS_AUTH_TYPE = 'x-api-key';
  delete require.cache[require.resolve('../../src/config/env')];
  delete require.cache[require.resolve('../../src/services/tributosClient')];
  delete require.cache[require.resolve('../../src/routes/tributosIntegration')];
  delete require.cache[require.resolve('../../server')];
  return require('../../server');
}

test('GET /api/tributos/contribuinte consulta JFU e mapeia resposta', async () => {
  let upstreamRequest = null;
  const upstream = http.createServer((req, res) => {
    upstreamRequest = { url: req.url, apiKey: req.headers['x-api-key'] };
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      cpfCnpj: '09592400000108',
      nomeRazaoSocial: 'Empresa Homologacao',
      tipoPessoa: 'PJ',
      nomeFantasia: 'Homolog',
      email: 'teste@empresa.com',
      telefone: '71999990000',
      endereco: { logradouro: 'Rua 1', bairro: 'Centro', cidade: 'Lauro de Freitas', uf: 'BA', cep: '42700000' },
      nivelGovBr: 'Ouro',
      status: 'Ativo',
    }));
  });

  await new Promise((resolve) => upstream.listen(0, resolve));
  const upstreamPort = upstream.address().port;
  const upstreamBase = `http://127.0.0.1:${upstreamPort}`;

  const app = loadApp(upstreamBase);
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/tributos/contribuinte?cpfCnpj=09592400000108`);
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.cpfCnpj, '09592400000108');
    assert.equal(body.nomeRazaoSocial, 'Empresa Homologacao');
    assert.match(upstreamRequest.url, /contribuintes\.rule/);
    assert.match(upstreamRequest.url, /sys=JFU/);
    assert.match(upstreamRequest.url, /cpfCnpj=09592400000108/);
    assert.equal(upstreamRequest.apiKey, 'test-api-key');
    assert.doesNotMatch(upstreamRequest.url, /resumo=true/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => upstream.close(resolve));
  }
});

test('GET /api/tributos/resumo envia resumo=true ao upstream', async () => {
  let upstreamRequest = null;
  const upstream = http.createServer((req, res) => {
    upstreamRequest = { url: req.url };
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({
      totalDividaAtiva: 100.5,
      quantidadeInscricoesDivida: 1,
      totalAVencer: 50,
      quantidadeTributosAVencer: 2,
      quantidadeAcordosAtivos: 0,
      quantidadeInscricoes: 3,
      quantidadeImoveis: 2,
      quantidadeEmpresas: 1,
    }));
  });

  await new Promise((resolve) => upstream.listen(0, resolve));
  const upstreamPort = upstream.address().port;
  const app = loadApp(`http://127.0.0.1:${upstreamPort}`);
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/tributos/resumo?cpfCnpj=09592400000108`);
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.totalDividaAtiva, 100.5);
    assert.equal(body.quantidadeImoveis, 2);
    assert.match(upstreamRequest.url, /resumo=true/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => upstream.close(resolve));
  }
});

test('GET /api/tributos/contribuinte retorna 400 para documento invalido', async () => {
  const upstream = http.createServer((_req, res) => {
    res.writeHead(500);
    res.end();
  });
  await new Promise((resolve) => upstream.listen(0, resolve));
  const app = loadApp(`http://127.0.0.1:${upstream.address().port}`);
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/tributos/contribuinte?cpfCnpj=123`);
    const body = await resp.json();
    assert.equal(resp.status, 400);
    assert.equal(body.codigo, 'DOCUMENTO_INVALIDO');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => upstream.close(resolve));
  }
});

test('GET /api/tributos/situacao-fiscal retorna NAO_IMPLEMENTADO', async () => {
  const upstream = http.createServer((_req, res) => { res.end(); });
  await new Promise((resolve) => upstream.listen(0, resolve));
  const app = loadApp(`http://127.0.0.1:${upstream.address().port}`);
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/tributos/situacao-fiscal?cpfCnpj=12345678901`);
    const body = await resp.json();
    assert.equal(resp.status, 503);
    assert.equal(body.codigo, 'NAO_IMPLEMENTADO');
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => upstream.close(resolve));
  }
});
