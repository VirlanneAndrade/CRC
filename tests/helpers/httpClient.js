// Cliente HTTP minimalista com persistencia de cookie de sessao para os testes
// de integracao que dependem do express-session.

function createClient(baseUrl) {
  let cookie = '';
  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (cookie) headers.cookie = cookie;
    let body = options.body;
    if (body && typeof body !== 'string') {
      headers['content-type'] = 'application/json';
      body = JSON.stringify(body);
    }
    const resp = await fetch(`${baseUrl}${path}`, { ...options, headers, body });
    const setCookie = resp.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    return resp;
  }
  return { request };
}

module.exports = { createClient };
