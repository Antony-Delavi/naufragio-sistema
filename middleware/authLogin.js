const jwt = require('jsonwebtoken');

function verifyLogin(req, res, next) {
  const token = req.cookies.token;

  if(!token) return res.status(401).json({ msg: 'Acesso negado. Faça Login.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido ou expirado' });
  }
}

module.exports = verifyLogin;