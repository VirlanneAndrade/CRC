const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('../../server');

test('GET /health deve retornar status ok', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  try {
    const resp = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await resp.json();

    assert.equal(resp.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'crc-portal-contribuinte');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
