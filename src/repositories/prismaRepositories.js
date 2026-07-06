// Repositorios backed por Prisma/PostgreSQL (producao).
// Cada fabrica recebe uma instancia de PrismaClient para facilitar testes.

function buildConfigRepository(prisma) {
  return {
    async getEntidade() {
      return prisma.configuracaoPortal.findUnique({ where: { id: 1 } });
    },
    async saveEntidade(data) {
      return prisma.configuracaoPortal.upsert({
        where: { id: 1 },
        update: data,
        create: { id: 1, ...data },
      });
    },
    async getTributos() {
      return prisma.configuracaoApiTributos.findUnique({ where: { id: 1 } });
    },
    async saveTributos(data) {
      return prisma.configuracaoApiTributos.upsert({
        where: { id: 1 },
        update: data,
        create: { id: 1, ...data },
      });
    },
    async getNotificacoes() {
      return prisma.configuracaoNotificacao.findUnique({ where: { id: 1 } });
    },
    async saveNotificacoes(data) {
      return prisma.configuracaoNotificacao.upsert({
        where: { id: 1 },
        update: data,
        create: { id: 1, ...data },
      });
    },
    async getIa() {
      return prisma.configuracaoIa.findUnique({ where: { id: 1 } });
    },
    async saveIa(data) {
      return prisma.configuracaoIa.upsert({
        where: { id: 1 },
        update: data,
        create: { id: 1, ...data },
      });
    },
    async getModulos() {
      const row = await prisma.configuracaoModulos.findUnique({ where: { id: 1 } });
      return row ? row.modulos : null;
    },
    async saveModulos(modulos) {
      const row = await prisma.configuracaoModulos.upsert({
        where: { id: 1 },
        update: { modulos },
        create: { id: 1, modulos },
      });
      return row.modulos;
    },
  };
}

function buildLgpdRepository(prisma) {
  return {
    async listConsents(userId) {
      return prisma.consentimentoLgpd.findMany({
        where: { userId },
        orderBy: { dataHora: 'asc' },
      });
    },
    async getLatestConsent(userId) {
      return prisma.consentimentoLgpd.findFirst({
        where: { userId },
        orderBy: { dataHora: 'desc' },
      });
    },
    async addConsent(data) {
      return prisma.consentimentoLgpd.create({ data });
    },
    async listSolicitacoes(userId) {
      return prisma.solicitacaoLgpd.findMany({
        where: { userId },
        orderBy: { criadoEm: 'desc' },
      });
    },
    async countSolicitacoes() {
      return prisma.solicitacaoLgpd.count();
    },
    async addSolicitacao(data) {
      return prisma.solicitacaoLgpd.create({ data });
    },
  };
}

function buildPreferenciasRepository(prisma) {
  return {
    async get(userId) {
      return prisma.preferenciaUsuario.findUnique({ where: { userId } });
    },
    async save(userId, data) {
      return prisma.preferenciaUsuario.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
      });
    },
  };
}

function buildDocumentoRepository(prisma) {
  return {
    async add(data) {
      return prisma.logAcessoDocumento.create({ data });
    },
    async findByCodigo(codigo) {
      return prisma.logAcessoDocumento.findFirst({
        where: { codigoAutenticacao: codigo },
        orderBy: { criadoEm: 'desc' },
      });
    },
  };
}

function buildUsuarioRepository(prisma) {
  return {
    async listPerfis() {
      return prisma.perfilPortal.findMany({ orderBy: { nome: 'asc' } });
    },
    async upsertPerfil({ nome, descricao, permissoes }) {
      return prisma.perfilPortal.upsert({
        where: { nome },
        update: { descricao, permissoes },
        create: { nome, descricao, permissoes },
      });
    },
    async findPerfilByNome(nome) {
      return prisma.perfilPortal.findUnique({ where: { nome } });
    },
    async list() {
      return prisma.usuarioAdministrativo.findMany({
        orderBy: { criadoEm: 'asc' },
        include: { perfil: true },
      });
    },
    async findByLogin(login) {
      return prisma.usuarioAdministrativo.findUnique({
        where: { login },
        include: { perfil: true },
      });
    },
    async findById(id) {
      return prisma.usuarioAdministrativo.findUnique({
        where: { id },
        include: { perfil: true },
      });
    },
    async create(data) {
      return prisma.usuarioAdministrativo.create({ data, include: { perfil: true } });
    },
    async update(id, data) {
      return prisma.usuarioAdministrativo.update({
        where: { id },
        data,
        include: { perfil: true },
      });
    },
    async remove(id) {
      return prisma.usuarioAdministrativo.delete({ where: { id } });
    },
    async setUltimoLogin(id) {
      return prisma.usuarioAdministrativo.update({
        where: { id },
        data: { ultimoLoginEm: new Date() },
      });
    },
  };
}

function buildLogRepository(prisma) {
  return {
    async addIntegracao(data) {
      return prisma.logIntegracao.create({ data });
    },
    async addAuditoria(data) {
      return prisma.logAuditoria.create({ data });
    },
  };
}

function buildPrismaRepositories(prisma) {
  return {
    config: buildConfigRepository(prisma),
    lgpd: buildLgpdRepository(prisma),
    preferencias: buildPreferenciasRepository(prisma),
    documento: buildDocumentoRepository(prisma),
    usuario: buildUsuarioRepository(prisma),
    log: buildLogRepository(prisma),
  };
}

module.exports = {
  buildPrismaRepositories,
  buildConfigRepository,
  buildLgpdRepository,
  buildPreferenciasRepository,
  buildDocumentoRepository,
  buildUsuarioRepository,
  buildLogRepository,
};
