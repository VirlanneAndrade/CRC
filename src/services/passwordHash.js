const crypto = require('crypto');

const KEYLEN = 64;
const SALT_BYTES = 16;

function hash(senha) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const derived = crypto.scryptSync(String(senha), salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verify(senha, stored) {
  if (typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expected] = parts;
  const derived = crypto.scryptSync(String(senha), salt, KEYLEN).toString('hex');
  const expectedBuf = Buffer.from(expected, 'hex');
  const derivedBuf = Buffer.from(derived, 'hex');
  if (expectedBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, derivedBuf);
}

module.exports = { hash, verify };
