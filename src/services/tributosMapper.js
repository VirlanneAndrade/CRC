/* Normaliza respostas da API JFU (Webrun) para o contrato documentado do CRC. */

function pickFirst(value) {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeEndereco(raw) {
  if (!raw || typeof raw !== 'object') {
    if (typeof raw === 'string' && raw.trim()) {
      return {
        logradouro: raw.trim(),
        numero: null,
        complemento: null,
        bairro: null,
        cidade: null,
        uf: null,
        cep: null,
      };
    }
    return {
      logradouro: null,
      numero: null,
      complemento: null,
      bairro: null,
      cidade: null,
      uf: null,
      cep: null,
    };
  }
  return {
    logradouro: raw.logradouro ?? raw.endereco ?? null,
    numero: raw.numero ?? null,
    complemento: raw.complemento ?? null,
    bairro: raw.bairro ?? null,
    cidade: raw.cidade ?? raw.municipio ?? null,
    uf: raw.uf ?? null,
    cep: raw.cep ?? null,
  };
}

function inferTipoPessoa(cpfCnpj, raw) {
  const explicit = String(raw?.tipoPessoa || raw?.tipo_pessoa || '').toUpperCase();
  if (explicit === 'PF' || explicit === 'PJ') return explicit;
  const digits = String(cpfCnpj || raw?.cpfCnpj || raw?.cpf_cnpj || '').replace(/\D/g, '');
  if (digits.length === 14) return 'PJ';
  if (digits.length === 11) return 'PF';
  return null;
}

function unwrapPayload(body) {
  if (!body || typeof body !== 'object') return {};
  const nested = body.data ?? body.resultado ?? body.contribuinte ?? body.resumo ?? body;
  return pickFirst(nested) || nested || {};
}

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
