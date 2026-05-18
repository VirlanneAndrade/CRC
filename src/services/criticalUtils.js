const crypto = require('crypto');

function generateCodigoCertidao() {
  const year = new Date().getFullYear();
  const serial = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `CERT-${year}-${serial}-${suffix}`;
}

function maskDocumento(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.***.***-${digits.slice(-2)}`;
  }
  if (digits.length === 14) {
    return `${digits.slice(0, 2)}.***.***/****-${digits.slice(-2)}`;
  }
  return '***';
}

module.exports = {
  generateCodigoCertidao,
  maskDocumento,
};
