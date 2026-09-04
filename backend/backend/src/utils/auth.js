const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-troque-em-producao';

function hashValor(valor) {
  return bcrypt.hashSync(String(valor), 10);
}

function compararValor(valor, hash) {
  return bcrypt.compareSync(String(valor), hash);
}

function gerarToken(payload, expiresIn = '30d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function verificarToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { hashValor, compararValor, gerarToken, verificarToken, JWT_SECRET };
