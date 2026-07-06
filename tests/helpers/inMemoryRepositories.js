// Substituto em memoria dos repositorios, usado nos testes para manter o CI
// livre de PostgreSQL. A interface espelha src/repositories/prismaRepositories.js.

const crypto = require('crypto');
const { hash } = require('../../src/services/passwordHash');

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function createInMemoryRepositories(options = {}) {
  const state = {
    entidade: null,
    tributos: null,
    notificacoes: null,
    ia: null,
    modulos: null,
    consentimentos: [],
    solicitacoes: [],
    preferencias: new Map(),
    documentos: [],
    perfis: [],
    usuarios: [],
    logsIntegracao: [],
    logsAuditoria: [],
  };

  function withPerfil(user) {
    if (!user) return null;
    const perfil = state.perfis.find((p) => p.id === user.perfilId) || null;
    return { ...clone(user), perfil: clone(perfil) };
  }

  const config = {
    async getEntidade() { return clone(state.entidade); },
    async saveEntidade(data) { state.entidade = { id: 1, ...clone(data), atualizadoEm: new Date() }; return clone(state.entidade); },
    async getTributos() { return clone(state.tributos); },
    async saveTributos(data) { state.tributos = { id: 1, ...clone(data), atualizadoEm: new Date() }; return clone(state.tributos); },
    async getNotificacoes() { return clone(state.notificacoes); },
    async saveNotificacoes(data) { state.notificacoes = { id: 1, ...clone(data), atualizadoEm: new Date() }; return clone(state.notificacoes); },
    async getIa() { return clone(state.ia); },
    async saveIa(data) { state.ia = { id: 1, ...clone(data), atualizadoEm: new Date() }; return clone(state.ia); },
    async getModulos() { return clone(state.modulos); },
    async saveModulos(modulos) { state.modulos = clone(modulos); return clone(state.modulos); },
  };

  const lgpd = {
    async listConsents(userId) {
      return state.consentimentos.filter((c) => c.userId === userId).map(clone);
    },
    async getLatestConsent(userId) {
      const items = state.consentimentos.filter((c) => c.userId === userId);
      return items.length ? clone(items[items.length - 1]) : null;
    },
    async addConsent(data) {
      const row = { id: crypto.randomUUID(), dataHora: new Date(), ...clone(data) };
      state.consentimentos.push(row);
      return clone(row);
    },
    async listSolicitacoes(userId) {
      return state.solicitacoes.filter((s) => s.userId === userId).slice().reverse().map(clone);
    },
    async countSolicitacoes() { return state.solicitacoes.length; },
    async addSolicitacao(data) {
      const row = { id: crypto.randomUUID(), status: 'Em analise', criadoEm: new Date(), ...clone(data) };
      state.solicitacoes.push(row);
      return clone(row);
    },
  };

  const preferencias = {
    async get(userId) { return clone(state.preferencias.get(userId)) || null; },
    async save(userId, data) {
      const row = { userId, ...clone(data), atualizadoEm: new Date() };
      state.preferencias.set(userId, row);
      return clone(row);
    },
  };

  const documento = {
    async add(data) {
      const row = { id: crypto.randomUUID(), criadoEm: new Date(), ...clone(data) };
      state.documentos.push(row);
      return clone(row);
    },
    async findByCodigo(codigo) {
      const items = state.documentos.filter((d) => d.codigoAutenticacao === codigo);
      return items.length ? clone(items[items.length - 1]) : null;
    },
  };

  const usuario = {
    async listPerfis() { return state.perfis.map(clone); },
    async upsertPerfil({ nome, descricao, permissoes }) {
      let perfil = state.perfis.find((p) => p.nome === nome);
      if (perfil) { perfil.descricao = descricao; perfil.permissoes = permissoes; }
      else { perfil = { id: crypto.randomUUID(), nome, descricao, permissoes }; state.perfis.push(perfil); }
      return clone(perfil);
    },
    async findPerfilByNome(nome) { return clone(state.perfis.find((p) => p.nome === nome)) || null; },
    async list() { return state.usuarios.map(withPerfil); },
    async findByLogin(login) { return withPerfil(state.usuarios.find((u) => u.login === login)); },
    async findById(id) { return withPerfil(state.usuarios.find((u) => u.id === id)); },
    async create(data) {
      const row = { id: crypto.randomUUID(), ativo: true, criadoEm: new Date(), ultimoLoginEm: null, ...clone(data) };
      state.usuarios.push(row);
      return withPerfil(row);
    },
    async update(id, data) {
      const row = state.usuarios.find((u) => u.id === id);
      if (!row) throw new Error('Usuario nao encontrado');
      Object.assign(row, clone(data));
      return withPerfil(row);
    },
    async remove(id) {
      const idx = state.usuarios.findIndex((u) => u.id === id);
      if (idx >= 0) state.usuarios.splice(idx, 1);
      return { id };
    },
    async setUltimoLogin(id) {
      const row = state.usuarios.find((u) => u.id === id);
      if (row) row.ultimoLoginEm = new Date();
      return withPerfil(row);
    },
  };

  const log = {
    async addIntegracao(data) { const row = { id: crypto.randomUUID(), criadoEm: new Date(), ...clone(data) }; state.logsIntegracao.push(row); return clone(row); },
    async addAuditoria(data) { const row = { id: crypto.randomUUID(), criadoEm: new Date(), ...clone(data) }; state.logsAuditoria.push(row); return clone(row); },
  };

  const repositories = { config, lgpd, preferencias, documento, usuario, log, _state: state };

  if (options.seedAdmin) {
    const perfilNames = ['master', 'admin', 'suporte', 'dev'];
    perfilNames.forEach((nome) => {
      state.perfis.push({ id: crypto.randomUUID(), nome, descricao: nome, permissoes: [] });
    });
    const master = state.perfis.find((p) => p.nome === 'master');
    state.usuarios.push({
      id: crypto.randomUUID(),
      login: 'admin',
      nome: 'Administrador Master',
      email: 'admin@crc.gov.br',
      senhaHash: hash('admin123'),
      ativo: true,
      perfilId: master.id,
      criadoEm: new Date(),
      ultimoLoginEm: null,
    });
  }

  return repositories;
}

module.exports = { createInMemoryRepositories };
