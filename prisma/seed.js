const { PrismaClient } = require('@prisma/client');
const { hash } = require('../src/services/passwordHash');

const prisma = new PrismaClient();

const PERFIS = [
  { nome: 'master', descricao: 'Acesso total ao portal', permissoes: ['*'] },
  { nome: 'admin', descricao: 'Administracao do portal', permissoes: ['config', 'usuarios', 'modulos'] },
  { nome: 'suporte', descricao: 'Suporte tecnico', permissoes: ['config', 'modulos'] },
  { nome: 'dev', descricao: 'Desenvolvimento e integracoes', permissoes: ['config', 'modulos', 'integracoes'] },
];

async function main() {
  const perfisByNome = {};
  for (const perfil of PERFIS) {
    const saved = await prisma.perfilPortal.upsert({
      where: { nome: perfil.nome },
      update: { descricao: perfil.descricao, permissoes: perfil.permissoes },
      create: perfil,
    });
    perfisByNome[perfil.nome] = saved;
  }

  await prisma.usuarioAdministrativo.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      nome: 'Administrador Master',
      email: 'admin@crc.gov.br',
      senhaHash: hash('admin123'),
      ativo: true,
      perfilId: perfisByNome.master.id,
    },
  });

  console.log('Seed concluido: perfis e usuario admin padrao.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
