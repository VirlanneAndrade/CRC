const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPrismaRepositories } = require('../../src/repositories/prismaRepositories');

// Fake Prisma minimo que registra as chamadas para validar o mapeamento.
function createFakePrisma() {
  const calls = [];
  const singleton = (name) => ({
    findUnique: async (args) => { calls.push([`${name}.findUnique`, args]); return { id: 1, marker: name }; },
    upsert: async (args) => { calls.push([`${name}.upsert`, args]); return { id: 1, ...args.update }; },
  });
  return {
    calls,
    configuracaoPortal: singleton('configuracaoPortal'),
    configuracaoApiTributos: singleton('configuracaoApiTributos'),
    configuracaoNotificacao: singleton('configuracaoNotificacao'),
    configuracaoIa: singleton('configuracaoIa'),
    configuracaoModulos: {
      findUnique: async () => ({ id: 1, modulos: { dashboard: true } }),
      upsert: async (args) => ({ id: 1, modulos: args.update.modulos }),
    },
    logAcessoDocumento: {
      create: async (args) => ({ id: 'doc-1', ...args.data }),
      findFirst: async (args) => { calls.push(['logAcessoDocumento.findFirst', args]); return { codigoAutenticacao: args.where.codigoAutenticacao }; },
    },
  };
}

test('configRepository usa upsert com id=1 para singletons', async () => {
  const prisma = createFakePrisma();
  const repos = buildPrismaRepositories(prisma);
  await repos.config.saveEntidade({ nome: 'X' });
  const call = prisma.calls.find(([name]) => name === 'configuracaoPortal.upsert');
  assert.ok(call, 'deve chamar upsert');
  assert.deepEqual(call[1].where, { id: 1 });
  assert.equal(call[1].create.id, 1);
});

test('config.getModulos retorna apenas o campo modulos', async () => {
  const prisma = createFakePrisma();
  const repos = buildPrismaRepositories(prisma);
  const modulos = await repos.config.getModulos();
  assert.deepEqual(modulos, { dashboard: true });
});

test('config.saveModulos devolve o objeto de modulos salvo', async () => {
  const prisma = createFakePrisma();
  const repos = buildPrismaRepositories(prisma);
  const saved = await repos.config.saveModulos({ nfse: false });
  assert.deepEqual(saved, { nfse: false });
});

test('documento.findByCodigo consulta por codigoAutenticacao', async () => {
  const prisma = createFakePrisma();
  const repos = buildPrismaRepositories(prisma);
  const row = await repos.documento.findByCodigo('CERT-2026-1');
  assert.equal(row.codigoAutenticacao, 'CERT-2026-1');
});
