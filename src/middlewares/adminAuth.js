function requireAdmin(req, res, next) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ erro: 'Autenticacao administrativa necessaria.' });
  }
  return next();
}

function requireMaster(req, res, next) {
  if (!req.session || !req.session.admin) {
    return res.status(401).json({ erro: 'Autenticacao administrativa necessaria.' });
  }
  if (!req.session.admin.master) {
    return res.status(403).json({ erro: 'Acao permitida apenas para o perfil master.' });
  }
  return next();
}

module.exports = { requireAdmin, requireMaster };
