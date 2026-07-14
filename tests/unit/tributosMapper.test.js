const test = require('node:test');
const assert = require('node:assert/strict');

const { mapContribuinte, mapResumoFiscal, normalizeEndereco } = require('../../src/services/tributosMapper');

test('mapContribuinte normaliza payload canônico com endereco string montada', () => {
  const mapped = mapContribuinte({
    id: '99',
    tipoPessoa: 'PJ',
    cpfCnpj: '09592400000108',
    nomeRazaoSocial: 'Empresa Exemplo LTDA',
    nomeFantasia: 'Exemplo',
    email: 'contato@exemplo.com',
    telefone: '71999990000',
    endereco: {
      logradouro: 'Rua A',
      numero: '10',
      bairro: 'Centro',
      cidade: 'Lauro de Freitas',
      uf: 'BA',
      cep: '42700000',
    },
    nivelGovBr: 'Ouro',
    status: 'Ativo',
  });

  assert.equal(mapped.cpfCnpj, '09592400000108');
  assert.equal(mapped.tipoPessoa, 'PJ');
  assert.equal(mapped.nomeRazaoSocial, 'Empresa Exemplo LTDA');
  assert.equal(mapped.nomeFantasia, 'Exemplo');
  assert.equal(typeof mapped.endereco, 'string');
  assert.equal(mapped.endereco, 'Rua A, 10 — Centro — Lauro de Freitas/BA — CEP: 42700000');
  assert.equal(mapped.nivelGovBr, 'Ouro');
});

test('mapContribuinte preserva endereco string da JFU', () => {
  const mapped = mapContribuinte({
    cpfCnpj: '26434105568',
    nomeRazaoSocial: 'JULIETA JOSE NOVAES SILVA',
    endereco: 'RUA JOAO ORTINS, 00032 - VILA PRAIANA - CENTRO - LAURO DE FREITAS/BA - CEP: 42700000',
  });

  assert.equal(
    mapped.endereco,
    'RUA JOAO ORTINS, 00032 - VILA PRAIANA - CENTRO - LAURO DE FREITAS/BA - CEP: 42700000'
  );
});

test('normalizeEndereco retorna null para vazio', () => {
  assert.equal(normalizeEndereco(null), null);
  assert.equal(normalizeEndereco(''), null);
  assert.equal(normalizeEndereco({}), null);
});

test('mapContribuinte aceita snake_case e objeto data', () => {
  const mapped = mapContribuinte({
    data: {
      cpf_cnpj: '12345678901',
      nome_razao_social: 'Maria Silva',
      nivel_gov_br: 'Prata',
      endereco: { logradouro: 'Rua B', bairro: 'Portão' },
    },
  });

  assert.equal(mapped.cpfCnpj, '12345678901');
  assert.equal(mapped.tipoPessoa, 'PF');
  assert.equal(mapped.nomeRazaoSocial, 'Maria Silva');
  assert.equal(mapped.nivelGovBr, 'Prata');
  assert.equal(mapped.endereco, 'Rua B — Portão');
});

test('mapResumoFiscal normaliza campos do dashboard', () => {
  const mapped = mapResumoFiscal({
    total_divida_ativa: 4872.35,
    quantidade_inscricoes_divida: 3,
    total_a_vencer: 1590,
    quantidade_tributos_a_vencer: 2,
    quantidade_acordos_ativos: 2,
    quantidade_inscricoes: 5,
    quantidade_imoveis: 3,
    quantidade_empresas: 2,
  });

  assert.equal(mapped.totalDividaAtiva, 4872.35);
  assert.equal(mapped.quantidadeInscricoesDivida, 3);
  assert.equal(mapped.totalAVencer, 1590);
  assert.equal(mapped.quantidadeTributosAVencer, 2);
  assert.equal(mapped.quantidadeAcordosAtivos, 2);
  assert.equal(mapped.quantidadeInscricoes, 5);
  assert.equal(mapped.quantidadeImoveis, 3);
  assert.equal(mapped.quantidadeEmpresas, 2);
});
