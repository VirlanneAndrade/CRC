const fs = require('fs');
const path = require('path');

const STORE_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(STORE_DIR, 'runtime-store.json');

function ensureStoreFile() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify({
        lgpdConsents: [],
        notificacoesPreferencias: {},
        certidoesEmitidas: [],
        documents: [],
        entidadeConfig: {},
        tributosConfig: {},
        notificacoesConfig: {},
        notificacoesTesteHistorico: [],
      }, null, 2),
      'utf8',
    );
  }
}

function readStore() {
  ensureStoreFile();
  try {
    const raw = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    return {
      lgpdConsents: Array.isArray(raw.lgpdConsents) ? raw.lgpdConsents : [],
      notificacoesPreferencias: raw.notificacoesPreferencias && typeof raw.notificacoesPreferencias === 'object' ? raw.notificacoesPreferencias : {},
      certidoesEmitidas: Array.isArray(raw.certidoesEmitidas) ? raw.certidoesEmitidas : [],
      documents: Array.isArray(raw.documents) ? raw.documents : [],
      entidadeConfig: raw.entidadeConfig && typeof raw.entidadeConfig === 'object' ? raw.entidadeConfig : {},
      tributosConfig: raw.tributosConfig && typeof raw.tributosConfig === 'object' ? raw.tributosConfig : {},
      notificacoesConfig: raw.notificacoesConfig && typeof raw.notificacoesConfig === 'object' ? raw.notificacoesConfig : {},
      notificacoesTesteHistorico: Array.isArray(raw.notificacoesTesteHistorico) ? raw.notificacoesTesteHistorico : [],
    };
  } catch (_err) {
    return {
      lgpdConsents: [],
      notificacoesPreferencias: {},
      certidoesEmitidas: [],
      documents: [],
      entidadeConfig: {},
      tributosConfig: {},
      notificacoesConfig: {},
      notificacoesTesteHistorico: [],
    };
  }
}

function writeStore(data) {
  ensureStoreFile();
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  readStore,
  writeStore,
};
