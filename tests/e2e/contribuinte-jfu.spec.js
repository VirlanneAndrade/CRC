const http = require('http');
const test = require('node:test');
const assert = require('node:assert/strict');

function loadApp(upstreamBaseUrl) {
  process.env.TRIBUTOS_API_BASE_URL = upstreamBaseUrl;
  process.env.TRIBUTOS_API_KEY = 'e2e-key';
  process.env.TRIBUTOS_AUTH_TYPE = 'x-api-key';
  delete require.cache[require.resolve('../../src/config/env')];
  delete require.cache[require.resolve('../../src/services/tributosClient')];
  delete require.cache[require.resolve('../../src/routes/tributosIntegration')];
  delete require.cache[require.resolve('../../server')];
  return require('../../server');
}

test('fluxo contribuinte: login API + resumo dashboard (caminho feliz)', async () => {
  const upstream = http.createServer((req, res) => {
    const isResumo = req.url.includes('resumo=true');
    res.writeHead(200, { 'content-type': 'application/json' });
    if (isResumo) {
      res.end(JSON.stringify({
        totalDividaAtiva: 999.99,
        quantidadeInscricoesDivida: 1,
        totalAVencer: 100,
        quantidadeTributosAVencer: 1,
        quantidadeAcordosAtivos: 0,
        quantidadeInscricoes: 2,
        quantidadeImoveis: 1,
        quantidadeEmpresas: 1,
      }));
      return;
    }
    res.end(JSON.stringify({
      cpfCnpj: '03456789012',
      nomeRazaoSocial: 'Maria Fernanda',
      tipoPessoa: 'PF',
      nivelGovBr: 'Ouro',
      email: 'maria@teste.com',
      endereco: 'Rua X - Centro - Lauro de Freitas/BA',
    }));
  });

  await new Promise((resolve) => upstream.listen(0, resolve));
  const app = loadApp(`http://127.0.0.1:${upstream.address().port}`);
  const server = app.listen(0);
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    const contrib = await fetch(`${base}/api/tributos/contribuinte?cpfCnpj=03456789012`);
    assert.equal(contrib.status, 200);
    const contribBody = await contrib.json();
    assert.equal(contribBody.nomeRazaoSocial, 'Maria Fernanda');
    assert.equal(typeof contribBody.endereco, 'string');
    assert.equal(contribBody.endereco, 'Rua X - Centro - Lauro de Freitas/BA');

    const resumo = await fetch(`${base}/api/tributos/resumo?cpfCnpj=03456789012`);
    assert.equal(resumo.status, 200);
    const resumoBody = await resumo.json();
    assert.equal(resumoBody.totalDividaAtiva, 999.99);
    assert.equal(resumoBody.quantidadeImoveis, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => upstream.close(resolve));
  }
});

test('fluxo contribuinte: falha quando upstream retorna erro', async () => {
  const upstream = http.createServer((_req, res) => {
    res.writeHead(503, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ erro: 'Indisponivel' }));
  });

  await new Promise((resolve) => upstream.listen(0, resolve));
  const app = loadApp(`http://127.0.0.1:${upstream.address().port}`);
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const resp = await fetch(`http://127.0.0.1:${port}/api/tributos/contribuinte?cpfCnpj=03456789012`);
    assert.equal(resp.status, 503);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await new Promise((resolve) => upstream.close(resolve));
  }
});

test('E2E Playwright contribuinte-jfu pendente de infraestrutura browser', { skip: true }, () => {
  // Cenarios UI previstos:
  // 1) Login contribuinte carrega dados reais no cabecalho
  // 2) Dashboard exibe cards do resumo fiscal (nao valores mock)
  // 3) Falha na API impede entrada no portal
});
