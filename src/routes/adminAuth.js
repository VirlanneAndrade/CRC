const express = require('express');
const { getRepositories } = require('../repositories');
const { verify } = require('../services/passwordHash');
const { toSessionAdmin } = require('../services/adminMapper');
const { requireAdmin } = require('../middlewares/adminAuth');

const router = express.Router();

router.post('/api/v1/admin/login', async (req, res) => {
  const login = String(req.body?.login || '').trim();
  const senha = String(req.body?.senha || '');
  if (!login || !senha) return res.status(400).json({ erro: 'Login e senha sao obrigatorios.' });

  const repos = getRepositories();
  const user = await repos.usuario.findByLogin(login);
  if (!user || !user.ativo || !verify(senha, user.senhaHash)) {
    return res.status(401).json({ erro: 'Credenciais invalidas.' });
  }

  const sessionAdmin = toSessionAdmin(user);
  req.session.admin = sessionAdmin;

  try {
    await repos.usuario.setUltimoLogin(user.id);
  } catch (_err) {
    // Nao bloqueia login se a atualizacao de ultimo acesso falhar.
  }
  try {
    await repos.log.addAuditoria({
      usuarioId: user.id,
      acao: 'admin.login',
      entidade: 'UsuarioAdministrativo',
      detalhe: { login: user.login },
      ip: req.ip,
      userAgent: req.header('user-agent') || null,
    });
  } catch (_err) {
    // Auditoria nao deve quebrar o login.
  }

  res.json({ ok: true, admin: sessionAdmin });
});

router.post('/api/v1/admin/logout', (req, res) => {
  if (req.session) {
    delete req.session.admin;
  }
  res.json({ ok: true });
});

router.get('/api/v1/admin/me', requireAdmin, (req, res) => {
  res.json({ admin: req.session.admin });
});

module.exports = router;
