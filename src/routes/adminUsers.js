const express = require('express');
const { getRepositories } = require('../repositories');
const { hash } = require('../services/passwordHash');
const { isMaster, toPublicUser } = require('../services/adminMapper');
const { requireAdmin, requireMaster } = require('../middlewares/adminAuth');

const router = express.Router();
const PERFIS_VALIDOS = ['master', 'admin', 'suporte', 'dev'];

async function resolvePerfilId(repos, nome) {
  if (!nome) return null;
  const perfil = await repos.usuario.findPerfilByNome(nome);
  return perfil ? perfil.id : null;
}

function auditar(req, acao, detalhe) {
  const repos = getRepositories();
  return repos.log.addAuditoria({
    usuarioId: req.session?.admin?.id || null,
    acao,
    entidade: 'UsuarioAdministrativo',
    detalhe: detalhe || null,
    ip: req.ip,
    userAgent: req.header('user-agent') || null,
  }).catch(() => {});
}

router.get('/api/v1/admin/usuarios', requireAdmin, async (_req, res) => {
  const repos = getRepositories();
  const usuarios = await repos.usuario.list();
  res.json({ usuarios: usuarios.map(toPublicUser) });
});

router.post('/api/v1/admin/usuarios', requireAdmin, async (req, res) => {
  const login = String(req.body?.login || '').trim();
  const nome = String(req.body?.nome || '').trim();
  const email = String(req.body?.email || '').trim();
  const senha = String(req.body?.senha || '');
  const perfil = String(req.body?.perfil || 'admin').trim();

  if (!login || !nome || !senha) return res.status(400).json({ erro: 'Login, nome e senha sao obrigatorios.' });
  if (!PERFIS_VALIDOS.includes(perfil) || perfil === 'master') {
    return res.status(400).json({ erro: 'Perfil invalido.' });
  }

  const repos = getRepositories();
  const existente = await repos.usuario.findByLogin(login);
  if (existente) return res.status(409).json({ erro: 'Ja existe um usuario com esse login.' });

  const perfilId = await resolvePerfilId(repos, perfil);
  const criado = await repos.usuario.create({
    login,
    nome,
    email: email || null,
    senhaHash: hash(senha),
    ativo: true,
    perfilId,
  });
  await auditar(req, 'admin.usuarios.create', { login, perfil });
  res.status(201).json({ ok: true, usuario: toPublicUser(criado) });
});

router.put('/api/v1/admin/usuarios/:id', requireAdmin, async (req, res) => {
  const repos = getRepositories();
  const alvo = await repos.usuario.findById(req.params.id);
  if (!alvo) return res.status(404).json({ erro: 'Usuario nao encontrado.' });

  const alvoMaster = isMaster(alvo);
  if (alvoMaster && !req.session.admin.master) {
    return res.status(403).json({ erro: 'Apenas o master pode editar o proprio usuario master.' });
  }

  const data = {};
  if (req.body?.nome !== undefined) data.nome = String(req.body.nome).trim();
  if (req.body?.email !== undefined) data.email = String(req.body.email).trim() || null;

  if (req.body?.perfil !== undefined && !alvoMaster) {
    const perfil = String(req.body.perfil).trim();
    if (!PERFIS_VALIDOS.includes(perfil) || perfil === 'master') {
      return res.status(400).json({ erro: 'Perfil invalido.' });
    }
    data.perfilId = await resolvePerfilId(repos, perfil);
  }

  const atualizado = await repos.usuario.update(alvo.id, data);
  await auditar(req, 'admin.usuarios.update', { id: alvo.id, login: alvo.login });
  res.json({ ok: true, usuario: toPublicUser(atualizado) });
});

router.post('/api/v1/admin/usuarios/:id/senha', requireAdmin, async (req, res) => {
  const senha = String(req.body?.senha || '');
  if (senha.length < 4) return res.status(400).json({ erro: 'Senha deve ter ao menos 4 caracteres.' });

  const repos = getRepositories();
  const alvo = await repos.usuario.findById(req.params.id);
  if (!alvo) return res.status(404).json({ erro: 'Usuario nao encontrado.' });
  if (isMaster(alvo) && !req.session.admin.master) {
    return res.status(403).json({ erro: 'Apenas o master pode alterar a senha do master.' });
  }

  await repos.usuario.update(alvo.id, { senhaHash: hash(senha) });
  await auditar(req, 'admin.usuarios.reset-senha', { id: alvo.id, login: alvo.login });
  res.json({ ok: true });
});

router.patch('/api/v1/admin/usuarios/:id/ativo', requireAdmin, async (req, res) => {
  const ativo = req.body?.ativo === true;
  const repos = getRepositories();
  const alvo = await repos.usuario.findById(req.params.id);
  if (!alvo) return res.status(404).json({ erro: 'Usuario nao encontrado.' });
  if (isMaster(alvo) && !ativo) {
    return res.status(403).json({ erro: 'O usuario master nao pode ser desativado.' });
  }

  const atualizado = await repos.usuario.update(alvo.id, { ativo });
  await auditar(req, 'admin.usuarios.toggle-ativo', { id: alvo.id, ativo });
  res.json({ ok: true, usuario: toPublicUser(atualizado) });
});

router.delete('/api/v1/admin/usuarios/:id', requireMaster, async (req, res) => {
  const repos = getRepositories();
  const alvo = await repos.usuario.findById(req.params.id);
  if (!alvo) return res.status(404).json({ erro: 'Usuario nao encontrado.' });
  if (isMaster(alvo)) return res.status(403).json({ erro: 'O usuario master nao pode ser excluido.' });

  await repos.usuario.remove(alvo.id);
  await auditar(req, 'admin.usuarios.delete', { id: alvo.id, login: alvo.login });
  res.json({ ok: true });
});

module.exports = router;
