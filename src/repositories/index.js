// Seam de repositorios: producao usa Prisma; testes injetam substituto em memoria
// via __setRepositories(). getRepositories() e chamado dentro dos handlers para
// que a injecao aconteca antes do primeiro acesso ao banco.

const { getPrisma } = require('../lib/prisma');
const { buildPrismaRepositories } = require('./prismaRepositories');

let repositories = null;

function getRepositories() {
  if (!repositories) {
    repositories = buildPrismaRepositories(getPrisma());
  }
  return repositories;
}

function __setRepositories(custom) {
  repositories = custom;
}

function __resetRepositories() {
  repositories = null;
}

module.exports = {
  getRepositories,
  __setRepositories,
  __resetRepositories,
};
