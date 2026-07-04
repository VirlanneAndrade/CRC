const MASTER_LOGIN = 'admin';

function perfilNome(user) {
  return user?.perfil?.nome || 'admin';
}

function isMaster(user) {
  return user?.login === MASTER_LOGIN || perfilNome(user) === 'master';
}

function toSessionAdmin(user) {
  return {
    id: user.id,
    login: user.login,
    nome: user.nome,
    perfil: perfilNome(user),
    master: isMaster(user),
  };
}

function toPublicUser(user) {
  return {
    id: user.id,
    login: user.login,
    nome: user.nome,
    email: user.email || '',
    perfil: perfilNome(user),
    ativo: user.ativo,
    master: isMaster(user),
    ultimoLoginEm: user.ultimoLoginEm || null,
    criadoEm: user.criadoEm || null,
  };
}

module.exports = { MASTER_LOGIN, perfilNome, isMaster, toSessionAdmin, toPublicUser };
