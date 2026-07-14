/* Normaliza respostas da API DE TRIBUTOS para o contrato do CRC (contribuinte + resumo fiscal).
function pickFirst(value) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Endereço no contrato CRC é sempre string única (API DE TRIBUTOS manda texto; objeto legado é montado). */
function normalizeEndereco(raw) {
  if (typeof raw === 'string') {
    const text = raw.trim();
    return text || null;
  }
  if (!raw || typeof raw !== 'object') return null;

  const logradouro = raw.logradouro ?? raw.endereco ?? null;
  const numero = raw.numero ?? null;
  const complemento = raw.complemento ?? null;
  const bairro = raw.bairro ?? null;
  const cidade = raw.cidade ?? raw.municipio ?? null;
  const uf = raw.uf ?? null;
  const cep = raw.cep ?? null;

  const rua = [logradouro, numero].filter(Boolean).join(', ');
  const cidadeUf = [cidade, uf].filter(Boolean).join('/');
  const cepPart = cep ? `CEP: ${cep}` : null;
  const parts = [rua || null, complemento, bairro, cidadeUf || null, cepPart].filter(Boolean);
  return parts.length ? parts.join(' — ') : null;
}

function inferTipoPessoa(cpfCnpj, raw) {
  const explicit = String(raw?.tipoPessoa || raw?.tipo_pessoa || '').toUpperCase();
  if (explicit === 'PF' || explicit === 'PJ') return explicit;
  const digits = String(cpfCnpj || raw?.cpfCnpj || raw?.cpf_cnpj || '').replace(/\D/g, '');
  if (digits.length === 14) return 'PJ';
  if (digits.length === 11) return 'PF';
  return null;
}

/** Extrai objeto útil de body.data / body.resultado / body.contribuinte / etc. */
function unwrapPayload(body) {
  if (!body || typeof body !== 'object') return {};
  const nested = body.data ?? body.resultado ?? body.contribuinte ?? body.resumo ?? body;
  return pickFirst(nested) || nested || {};
}

/** API DE TRIBUTOS → contrato GET /api/tributos/contribuinte (endereco: string | null). */
function mapContribuinte(body) {
  const raw = unwrapPayload(body);
  const cpfCnpj = String(raw.cpfCnpj ?? raw.cpf_cnpj ?? '').replace(/\D/g, '');
  const tipoPessoa = inferTipoPessoa(cpfCnpj, raw);
  return {
    id: raw.id ?? raw.codigo ?? (cpfCnpj || null),
    tipoPessoa,
    cpfCnpj: cpfCnpj || null,
    nomeRazaoSocial: raw.nomeRazaoSocial ?? raw.nome_razao_social ?? raw.nome ?? raw.razaoSocial ?? null,
    nomeFantasia: raw.nomeFantasia ?? raw.nome_fantasia ?? null,
    email: raw.email ?? null,
    telefone: raw.telefone ?? raw.celular ?? null,
    endereco: normalizeEndereco(raw.endereco),
    nivelGovBr: raw.nivelGovBr ?? raw.nivel_gov_br ?? raw.govbr ?? null,
    status: raw.status ?? raw.situacao ?? raw.situacaoCadastral ?? null,
  };
}

/** API DE TRIBUTOS → contrato GET /api/tributos/resumo (totais para cards do dashboard). */
function mapResumoFiscal(body) {
  const raw = unwrapPayload(body);
  return {
    totalDividaAtiva: toNumber(raw.totalDividaAtiva ?? raw.total_divida_ativa),
    quantidadeInscricoesDivida: toNumber(raw.quantidadeInscricoesDivida ?? raw.quantidade_inscricoes_divida),
    totalAVencer: toNumber(raw.totalAVencer ?? raw.total_a_vencer),
    quantidadeTributosAVencer: toNumber(raw.quantidadeTributosAVencer ?? raw.quantidade_tributos_a_vencer),
    quantidadeAcordosAtivos: toNumber(raw.quantidadeAcordosAtivos ?? raw.quantidade_acordos_ativos),
    quantidadeInscricoes: toNumber(raw.quantidadeInscricoes ?? raw.quantidade_inscricoes),
    quantidadeImoveis: toNumber(raw.quantidadeImoveis ?? raw.quantidade_imoveis),
    quantidadeEmpresas: toNumber(raw.quantidadeEmpresas ?? raw.quantidade_empresas),
  };
}

module.exports = {
  mapContribuinte,
  mapResumoFiscal,
  normalizeEndereco,
  unwrapPayload,
};
