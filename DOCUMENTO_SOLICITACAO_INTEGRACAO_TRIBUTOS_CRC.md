# Documento para Empresa de Tributos

## Integração de Dados - Portal CRC (Consumidor)

Data: 18/05/2026  
Sistema consumidor: `crc-portal-contribuinte`  
Objetivo: habilitar consumo oficial de dados tributarios no Portal CRC para consultas, emissao de documentos, acordos e notificacoes.

---

## 1) O que o CRC precisa consumir

O Portal CRC precisa consumir, no minimo, os seguintes blocos de informacao:

- Cadastro de contribuintes (CPF/CNPJ, dados cadastrais e contatos)
- Inscricoes imobiliarias (imovel/lote, proprietario, situacao fiscal)
- Inscricoes economicas (empresa, atividade, regime, situacao)
- Lancamentos tributarios (IPTU, ISS, TFF, taxas e guias)
- Divida ativa (CDA, saldo, fase, exigibilidade)
- Parcelamentos/acordos (contrato, parcelas, status, atrasos)
- Notificacoes fiscais (DEC/DTE), quando aplicavel

---

## 2) Requisitos tecnicos obrigatorios da API da empresa de tributos

- Endpoint de saude para teste de conectividade:
  - `GET {BASE_URL}/health`
  - Retorno esperado: HTTP 200 com JSON de status
- API HTTPS em ambiente de producao (TLS 1.2+)
- Autenticacao suportada:
  - Bearer Token **ou**
  - Header `x-api-key`
- Timeout maximo recomendado por chamada: 10s
- Resposta JSON UTF-8
- Versionamento de API (ex.: `/v1`)
- Identificador correlacionavel por requisicao (header ou campo de retorno)

---

## 3) Contrato de endpoints a disponibilizar

> Observacao: se a empresa de tributos ja possuir outros nomes de rota, enviar mapeamento equivalente.

### 3.1 Saude

- `GET /health`
- Uso: validar botao "Testar Conexao" no CRC

### 3.2 Contribuintes

- `GET /v1/contribuintes?cpfCnpj={11|14_digitos}`
- `GET /v1/contribuintes/{id}`

Campos minimos:
- `id`
- `tipoPessoa` (`PF`|`PJ`)
- `cpfCnpj`
- `nomeRazaoSocial`
- `nomeFantasia` (quando PJ)
- `email`
- `telefone`
- `endereco` (logradouro, numero, complemento, bairro, cidade, uf, cep)
- `status`

### 3.3 Inscricoes imobiliarias

- `GET /v1/inscricoes/imobiliarias?cpfCnpj={...}`
- `GET /v1/inscricoes/imobiliarias/{inscricao}`

Campos minimos:
- `inscricao`
- `tipo` (`imovel`|`lote`)
- `proprietarioCpfCnpj`
- `proprietarioNome`
- `enderecoImovel`
- `setor`
- `quadra`
- `lote`
- `areaTerreno`
- `areaConstruida`
- `valorVenal`
- `situacaoFiscal`

### 3.4 Inscricoes economicas

- `GET /v1/inscricoes/economicas?cpfCnpj={...}`
- `GET /v1/inscricoes/economicas/{inscricao}`

Campos minimos:
- `inscricao`
- `cnpj`
- `razaoSocial`
- `nomeFantasia`
- `atividadePrincipal`
- `regimeTributario`
- `dataAbertura`
- `situacao`
- `endereco`
- `responsavelNome`
- `responsavelCpf`

### 3.5 Lancamentos tributarios

- `GET /v1/lancamentos?cpfCnpj={...}&status={aberto|vencido|a_vencer}&competencia=YYYY-MM`
- `GET /v1/lancamentos/{id}`

Campos minimos:
- `id`
- `tributo` (IPTU, ISS, TFF, Taxa etc.)
- `inscricao`
- `exercicioCompetencia`
- `valorOriginal`
- `valorAtualizado`
- `vencimento`
- `status`
- `codigoBarras` (se houver)
- `linhaDigitavel` (se houver)
- `pixCopiaCola` (se houver)

### 3.6 Divida ativa

- `GET /v1/divida-ativa?cpfCnpj={...}`
- `GET /v1/divida-ativa/{cda}`

Campos minimos:
- `cda`
- `inscricao`
- `tributo`
- `valorPrincipal`
- `juros`
- `multa`
- `encargos`
- `valorTotal`
- `dataInscricao`
- `situacao`
- `exigibilidade`

### 3.7 Parcelamentos/acordos

- `GET /v1/parcelamentos?cpfCnpj={...}`
- `GET /v1/parcelamentos/{acordoId}`

Campos minimos:
- `acordoId`
- `origem` (administrativo/judicial)
- `quantidadeParcelas`
- `parcelaAtual`
- `valorParcela`
- `saldoDevedor`
- `vencimentoProximaParcela`
- `status` (ativo, inadimplente, rescindido, quitado)

### 3.8 Notificacoes fiscais (DEC/DTE) - quando aplicavel

- `GET /v1/notificacoes?cpfCnpj={...}`

Campos minimos:
- `id`
- `tipo`
- `assunto`
- `conteudoResumo`
- `dataEnvio`
- `prazoCiencia`
- `statusCiencia`

---

## 4) Padrao de resposta e erro (obrigatorio)

### Sucesso

- HTTP 200/201
- JSON com `data` (objeto ou lista), `page`/`total` quando paginado

### Erro

- HTTP 400 (validacao), 401/403 (autenticacao/autorizacao), 404, 409, 422, 429, 500
- JSON padrao:

```json
{
  "erro": "Mensagem objetiva",
  "codigo": "CODIGO_NEGOCIO_OU_TECNICO",
  "detalhes": []
}
```

---

## 5) Seguranca, LGPD e auditoria

- Dados pessoais somente no estritamente necessario
- Mascaramento quando exigido por perfil de acesso
- Registro de auditoria por consulta (quem consultou, quando, qual endpoint)
- IP allowlist ou assinatura entre sistemas (quando exigido)
- Rotina de rotacao de credenciais

---

## 6) Itens que a empresa de tributos deve enviar (entregaveis)

- URL de homologacao e producao
- Metodo de autenticacao e credenciais de integracao
- Documentacao OpenAPI/Swagger (`.json` ou `.yaml`)
- Colecao Postman com exemplos
- Dicionario de dados (campos, tipos, obrigatoriedade, dominio)
- Regras de negocio (status, calculos, arredondamentos)
- Politica de rate limit e SLA
- Janela de manutencao e canal de suporte tecnico
- Changelog/versionamento da API

---

## 7) Matriz de homologacao (minimo para aceite)

- Teste de conectividade (`/health`) com sucesso
- Consulta de contribuinte PF e PJ
- Consulta de inscricoes imobiliarias e economicas
- Retorno de lancamentos abertos e vencidos
- Retorno de ao menos 1 caso de divida ativa
- Retorno de ao menos 1 parcelamento com parcelas futuras
- Retorno de erros padronizados para cenarios invalidos
- Teste de timeout e indisponibilidade (resiliencia)

---

## 8) Endpoints do CRC ja ativos para referencia

Estes endpoints ja existem no CRC e podem ser usados no alinhamento tecnico:

- `GET /health` (saude do CRC)
- `GET /api/dte/status`
- `GET /api/dte/eqfis/notificacoes?cpfCnpj=...`  
  Headers atualmente usados no proxy:
  - `X-Contribuinte-CPFCNPJ`
  - `X-API-Key` (quando configurado)

---

## 9) Contato tecnico e proximo passo

Solicitamos agendamento de sessao tecnica para:

- validacao do contrato final de endpoints;
- entrega de credenciais de homologacao;
- execucao de testes integrados ponta a ponta.

Com a entrega completa dos itens acima, o CRC podera consumir os dados com seguranca e previsibilidade.

