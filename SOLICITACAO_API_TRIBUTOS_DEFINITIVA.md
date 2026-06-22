# Solicitação de Integração — API de Tributos · Portal CRC

**Município:** Lauro de Freitas — BA
**Sistema consumidor:** Portal CRC (Central de Relacionamento com o Contribuinte)
**Data:** 02/06/2026

> Este documento foi gerado a partir da **leitura completa do código do portal** (todos os 24 módulos).
> Cada campo listado é **efetivamente lido e exibido** em alguma tela. Nada aqui é supérfluo.

---

## PARTE 1 — Requisitos técnicos obrigatórios da API

| Requisito | Especificação |
|-----------|---------------|
| Protocolo | HTTPS (TLS 1.2 ou superior) em produção |
| Autenticação | Bearer Token **ou** header `x-api-key` |
| Formato | JSON, codificação UTF-8 |
| Timeout | Máximo de 10 segundos por requisição |
| Versionamento | Prefixo de versão na URL (ex.: `/v1/`) |
| Filtro base | Todos os endpoints de consulta filtram por CPF ou CNPJ (11 ou 14 dígitos, sem máscara) |
| Paginação | Endpoints de lista devem aceitar `page` e `limit` e retornar `total` |
| Identificação | Header de correlação por requisição (ex.: `x-request-id`) |

**Padrão de resposta de erro (obrigatório em todos os endpoints):**
```json
{ "erro": "Mensagem objetiva", "codigo": "CODIGO_ERRO", "detalhes": [] }
```
Códigos HTTP esperados: 200/201 (sucesso), 400 (validação), 401/403 (acesso), 404 (não encontrado), 429 (limite), 500 (erro interno).

---

## PARTE 2 — Endpoints e campos (por módulo do portal)

### 0. Teste de conectividade
`GET /health` → `{ "status": "ok" }`
*(Usado pelo botão "Testar Conexão" no painel administrativo do CRC.)*

---

### 1. Dados do contribuinte
**Tela:** Perfil, cabeçalho, base de todos os módulos.
`GET /v1/contribuintes?cpfCnpj={cpfCnpj}`

| Campo | Descrição |
|-------|-----------|
| `id` | Identificador interno |
| `tipoPessoa` | `PF` ou `PJ` |
| `cpfCnpj` | Documento |
| `nomeRazaoSocial` | Nome completo / razão social |
| `nomeFantasia` | (quando PJ) |
| `email` | E-mail de contato |
| `telefone` | Telefone |
| `endereco` | logradouro, número, complemento, bairro, cidade, uf, cep |
| `nivelGovBr` | Bronze / Prata / Ouro (se houver; opcional) |
| `status` | Situação cadastral |

---

### 2. Resumo fiscal (cards do Painel/Dashboard)
**Tela:** Dashboard — 4 cards no topo.
`GET /v1/contribuintes/resumo?cpfCnpj={cpfCnpj}`

| Campo | Card do portal |
|-------|----------------|
| `totalDividaAtiva` | "Dívida Ativa" (valor R$) |
| `quantidadeInscricoesDivida` | "Dívida Ativa" (nº de inscrições) |
| `totalAVencer` | "A Vencer" (valor R$) |
| `quantidadeTributosAVencer` | "A Vencer" (nº de tributos) |
| `quantidadeAcordosAtivos` | "Acordos" (quantidade) |
| `quantidadeInscricoes` | "Inscrições" (total) |
| `quantidadeImoveis` | "Inscrições" (nº de imóveis) |
| `quantidadeEmpresas` | "Inscrições" (nº de empresas) |

---

### 3. Situação fiscal das inscrições
**Tela:** Situação Fiscal — tabela.
`GET /v1/situacao-fiscal?cpfCnpj={cpfCnpj}`

| Campo | Descrição |
|-------|-----------|
| `inscricao` | Nº da inscrição |
| `tipo` | `imovel` ou `empresa` |
| `situacao` | `regular`, `irregular`, `parcelado` |
| `valorDebitosAbertos` | Soma de débitos em aberto (R$) |
| `valorDividaAtiva` | Soma em dívida ativa (R$, ou null) |

---

### 4. Inscrições imobiliárias (Ficha Cadastral — Imóvel)
**Tela:** Ficha Cadastral → detalhe do imóvel.
`GET /v1/inscricoes/imobiliarias?cpfCnpj={cpfCnpj}`
`GET /v1/inscricoes/imobiliarias/{inscricao}`

| Campo | Descrição |
|-------|-----------|
| `inscricao` | Nº da inscrição imobiliária |
| `proprietarioNome` | Nome do proprietário |
| `proprietarioCpfCnpj` | CPF/CNPJ do proprietário |
| `enderecoImovel` | Logradouro completo |
| `tipoLogradouro` | Rua, Avenida, Travessa etc. |
| `bairro` | Bairro |
| `cep` | CEP |
| `cidade` | Cidade |
| `uf` | UF |
| `setor` | Setor |
| `quadra` | Quadra |
| `lote` | Lote |
| `areaTerreno` | Área do terreno (m²) |
| `areaConstruida` | Área construída (m²) |
| `valorVenal` | Valor venal (R$) |
| `usoImovel` | Residencial / Comercial / etc. |
| `padraoConstrutivo` | Simples / Médio / Alto |
| `anoConstrucao` | Ano da construção |

---

### 5. Inscrições econômicas (Ficha Cadastral — Empresa)
**Tela:** Ficha Cadastral → detalhe da empresa; Alvará; Cartão CGA.
`GET /v1/inscricoes/economicas?cpfCnpj={cpfCnpj}`
`GET /v1/inscricoes/economicas/{inscricao}`

| Campo | Descrição |
|-------|-----------|
| `inscricao` | Inscrição econômica/municipal |
| `cnpj` | CNPJ |
| `razaoSocial` | Razão social |
| `nomeFantasia` | Nome fantasia |
| `atividadePrincipal` | CNAE + descrição |
| `cnaePrincipal` | Código CNAE |
| `regimeTributario` | Simples Nacional / Lucro Presumido / etc. |
| `situacao` | Ativa / Suspensa / Baixada |
| `dataAbertura` | Data de abertura |
| `endereco` | Logradouro completo |
| `bairro`, `cep`, `cidade`, `uf` | Endereço |
| `responsavelNome` | Responsável |
| `responsavelCpf` | CPF do responsável |

---

### 6. Lançamentos / Tributos em aberto
**Telas:** Tributos em Aberto, 2ª Via, "A Vencer" do Dashboard.
`GET /v1/lancamentos?cpfCnpj={cpfCnpj}&status={aberto|vencido|a_vencer}&inscricao=&exercicio=&competencia=`

| Campo | Descrição |
|-------|-----------|
| `id` | Identificador do lançamento |
| `tributo` | IPTU, ISS, TFF, TLL, Taxa Lixo etc. |
| `inscricao` | Inscrição vinculada |
| `exercicio` | Ano de exercício |
| `competencia` | Competência (YYYY-MM, quando aplicável) |
| `valorOriginal` | Valor original (R$) |
| `valorAtualizado` | Valor atualizado (R$) |
| `juros` | Juros (R$) |
| `multa` | Multa (R$) |
| `vencimento` | Data de vencimento |
| `status` | `vencido` / `a_vencer` / `pago` |
| `codigoBarras` | Linha do código de barras (se já houver) |
| `linhaDigitavel` | Linha digitável (se já houver) |
| `pixCopiaCola` | PIX copia e cola (se já houver) |

---

### 7. Dívida ativa (Extrato da Dívida)
**Tela:** Extrato da Dívida — filtros por inscrição, exercício e tributo.
`GET /v1/divida-ativa?cpfCnpj={cpfCnpj}&inscricao=&exercicio=&tributo=`

| Campo | Descrição |
|-------|-----------|
| `cda` | Nº da Certidão de Dívida Ativa |
| `inscricao` | Inscrição |
| `tributo` | Tributo (IPTU, ISS...) |
| `exercicio` | Exercício |
| `valorPrincipal` / `valorOriginal` | Principal (R$) |
| `juros` | Juros (R$) |
| `multa` | Multa (R$) |
| `encargos` | Demais encargos (R$) |
| `valorAtualizado` | Valor total atualizado (R$) |
| `vencimento` | Data de vencimento |
| `dataInscricaoDivida` | Data de inscrição em dívida |
| `situacao` | `aberto`, `parcelado`, `suspenso`, `extinto` |
| `exigibilidade` | Exigível / Suspensa |
| `fase` | administrativa / judicial |

> **Importante:** o Extrato precisa retornar `juros` e `multa` **separados** do valor atualizado (o portal exibe colunas distintas: Original, Juros, Multa, Atualizado).

---

### 8. Acordo / Parcelamento — simulação, formalização e histórico
**Tela:** Acordo da Dívida.

**8.1 Listar acordos existentes (histórico):**
`GET /v1/parcelamentos?cpfCnpj={cpfCnpj}`

| Campo | Descrição |
|-------|-----------|
| `acordoId` | Nº do acordo (ex.: AC-2025-001) |
| `dataFormalizacao` | Data |
| `tipo` | À Vista / Parcelado |
| `origem` | administrativo / judicial |
| `valorTotal` | Valor total (R$) |
| `quantidadeParcelas` | Total de parcelas |
| `parcelaAtual` | Parcela corrente |
| `valorParcela` | Valor da parcela (R$) |
| `saldoDevedor` | Saldo devedor (R$) |
| `vencimentoProximaParcela` | Próximo vencimento |
| `status` | em dia / inadimplente / quitado / rescindido |

**8.2 Simular acordo:**
`POST /v1/acordos/simular`
Envio: `{ "cpfCnpj", "cdas": [], "formaPagamento": "vista|6|12|24|36", "dataPrimeiroVencimento" }`

| Campo de retorno | Descrição |
|------------------|-----------|
| `valorTotalAtualizado` | Total dos débitos atualizados (R$) |
| `percentualDescontoVista` | % de desconto à vista (portal hoje assume 20%) |
| `valorDesconto` | Valor do desconto (R$) |
| `valorAVista` | Valor final à vista (R$) |
| `percentualEntrada` | % de entrada no parcelamento (portal hoje assume 10%) |
| `valorEntrada` | Valor da entrada (R$) |
| `saldoRestante` | Saldo a parcelar (R$) |
| `quantidadeParcelas` | Nº de parcelas |
| `valorParcela` | Valor de cada parcela (R$) |
| `vencimentos` | Lista de datas das parcelas |

> **Atenção (regra de negócio):** o portal hoje usa valores **fixos no código** — 20% de desconto à vista, 10% de entrada, parcela = saldo/nº. **Informem as regras reais** (percentuais, juros de parcelamento, nº mínimo/máximo de parcelas, valor mínimo de parcela) para substituirmos o cálculo falso pelo oficial.

**8.3 Formalizar acordo:**
`POST /v1/acordos/formalizar` (mesmo envio da simulação)
Retorno: `acordoId`, `quantidadeParcelas`, `parcelas` (cada uma com `numero`, `vencimento`, `valor`), `dam` (`codigoBarras`, `linhaDigitavel`), `pixCopiaCola`.

**8.4 Cancelar/rescindir acordo:**
`POST /v1/acordos/{acordoId}/cancelar` — envio `{ "motivo" }` → retorno `{ "ok": true, "dataHoraCancelamento" }`

---

### 9. Emissão de 2ª via / boleto / guia unificada
**Telas:** 2ª Via, Tributos (botão "2ª Via" e "Gerar Guia" unificada).

**9.1 Boleto de um lançamento:**
`POST /v1/documentos/segunda-via`
Envio: `{ "cpfCnpj", "lancamentoId" }` **ou** `{ "cpfCnpj", "tributo", "inscricao", "exercicio" }`
Retorno: `codigoBarras`, `linhaDigitavel`, `pixCopiaCola`, `valor`, `vencimento`, `urlPdf`.

**9.2 Guia unificada (vários débitos em um boleto):**
`POST /v1/documentos/guia-unificada`
Envio: `{ "cpfCnpj", "lancamentoIds": [] }`
Retorno: `numeroGuia`, `valorTotal`, `codigoBarras`, `linhaDigitavel`, `pixCopiaCola`, `vencimento`, `urlPdf`.

> **Atenção:** hoje o código de barras e o PIX são **gerados aleatoriamente (falsos)** no navegador. Precisamos do **código de barras e PIX reais** do sistema bancário/arrecadação de vocês.

---

### 10. Certidões — emissão e autenticação
**Telas:** Certidões; Autenticação de Certidão.

**10.1 Emitir certidão:**
`POST /v1/certidoes/emitir`
Envio: `{ "cpfCnpj", "inscricao", "tipoInscricao", "vinculo", "tipoCertidao": "negativa|positiva_efeito_negativa|positiva" }`
Retorno: `codigoAutenticacao`, `urlPdf`, `validade`, `situacao`.

**10.2 Autenticar certidão por código:**
`GET /v1/certidoes/autenticar/{codigoAutenticacao}`

| Campo | Descrição |
|-------|-----------|
| `valida` | true/false |
| `tipo` | Tipo da certidão |
| `titular` | Nome do titular |
| `cpfCnpj` / `inscricao` | Documento/inscrição |
| `emissao` | Data/hora de emissão |
| `validade` | Data de validade |
| `urlOriginal` | Link do PDF original |

> *Observação:* hoje o CRC gera o PDF da certidão **internamente** (sem dados oficiais). Idealmente a certidão oficial vem do sistema de vocês, com registro/validação na base (`TRB_VALIDACAO_CERTIDAO`).

---

### 11. Alvará de funcionamento
**Tela:** Alvará (emissão e renovação).
`GET /v1/alvaras?cpfCnpj={cpfCnpj}` — listar
`GET /v1/alvaras/{inscricao}/elegibilidade` — verificar se pode emitir (sem débitos, licenças ok)
`POST /v1/alvaras/emitir` — emitir

| Campo | Descrição |
|-------|-----------|
| `numeroAlvara` | Nº do alvará |
| `inscricao` | Inscrição econômica |
| `cnpj` | CNPJ |
| `razaoSocial` | Razão social |
| `atividade` | Atividade |
| `situacao` | Ativo / Renovação / Vencido |
| `validade` | Data de validade |
| `elegivel` | true/false (no endpoint de elegibilidade) |
| `motivoBloqueio` | Motivo, se inelegível |
| `urlPdf` | PDF do alvará |

---

### 12. Cartão CGA (Cadastro Geral de Atividades)
**Tela:** Cartão CGA.
`GET /v1/cga?cpfCnpj={cpfCnpj}` — listar
`POST /v1/cga/emitir` — emitir

| Campo | Descrição |
|-------|-----------|
| `inscricao` | Inscrição econômica |
| `razaoSocial` | Razão social |
| `atividade` | Atividade principal |
| `situacao` | Ativo / Inativo |
| `urlPdf` | PDF do cartão |

---

### 13. ITIV — cálculo e guia
**Tela:** ITIV Online.
`POST /v1/itiv/calcular`
Envio: `{ "inscricaoImovel", "tipoTransacao": "compra_venda|doacao|permuta", "valorTransacao", "cpfCnpjAdquirente", "nomeAdquirente" }`

| Campo de retorno | Descrição |
|------------------|-----------|
| `baseCalculo` | Base de cálculo (maior entre venal e transação) |
| `aliquota` | Alíquota aplicada (%) |
| `valorImposto` | ITIV devido (R$) |
| `descricaoRegra` | Regra/fundamento aplicado |
| `isencao` | true/false + motivo (se aplicável) |

`POST /v1/itiv/emitir-guia` → `guiaId`, `codigoBarras`, `linhaDigitavel`, `pixCopiaCola`, `vencimento`, `urlPdf`.

> Hoje o botão "Calcular ITIV" **não faz cálculo nenhum**. Precisamos do motor de cálculo (alíquotas, base, regras de isenção).

---

### 14. NFSe — Nota Fiscal de Serviço Eletrônica
**Tela:** NFSe (emitir, listar, cancelar). Hoje funciona **só no navegador (localStorage)** — não há nota fiscal real.

> **Pergunta crítica para a empresa:** a NFSe é controlada por **este** sistema de tributos ou por **sistema separado**? Se for separado, informem qual sistema e como integrar.

`GET /v1/nfse?cpfCnpj={cpfCnpj}` — listar
`POST /v1/nfse/emitir` — emitir
`POST /v1/nfse/{numero}/cancelar` — cancelar (envio `{ "motivo" }`)

| Campo | Descrição |
|-------|-----------|
| `numero` | Nº da NFSe |
| `serie` | Série |
| `dataEmissao` | Data de emissão |
| `prestadorCpfCnpj` | Prestador |
| `tomadorCpfCnpj` | Tomador |
| `tomadorNome` | Nome/razão do tomador |
| `tomadorEmail` | E-mail do tomador |
| `codigoServico` | Código (Lista LC 116 — ex.: 01.01, 07.02, 17.01) |
| `descricaoServico` | Discriminação |
| `valorServico` | Valor do serviço (R$) |
| `aliquotaIss` | Alíquota ISS (%) |
| `valorIss` | Valor do ISS (R$) |
| `status` | Emitida / Cancelada |
| `motivoCancelamento` | Motivo (quando cancelada) |
| `urlPdf` / `urlXml` | Documentos oficiais |

---

### 15. Protocolo / Processos administrativos
**Tela:** Protocolo e Processos. Hoje os protocolos ficam **só no navegador**.

> **Pergunta:** o sistema de tributos recebe/gerencia esses processos, ou é fluxo interno (outro sistema de protocolo)?

`GET /v1/protocolos?cpfCnpj={cpfCnpj}` — listar
`POST /v1/protocolos` — abrir
`GET /v1/protocolos/{numero}` — detalhe

| Campo | Descrição |
|-------|-----------|
| `numero` | Nº do protocolo |
| `tipo` | Retificação Cadastral, Impugnação de Lançamento, Pedido de Isenção, Restituição/Compensação, Revisão de Valor Venal, Contestação de Dívida Ativa, Solicitação Geral |
| `assunto` | Título/assunto |
| `inscricao` | Inscrição relacionada (opcional) |
| `dataAbertura` | Data |
| `situacao` | em_analise, deferido, indeferido, pendente, arquivado |
| `detalhes` | Justificativa |
| `anexos` | Lista de documentos (nome, url) |

---

### 16. DEC / DTE — Notificações fiscais
**Tela:** Domicílio Eletrônico (DEC). Já existe um proxy parcial no CRC (`/api/dte/eqfis/notificacoes`).
`GET /v1/notificacoes?cpfCnpj={cpfCnpj}` — listar
`GET /v1/notificacoes/{id}` — detalhe
`POST /v1/notificacoes/{id}/ciencia` — registrar ciência (valor jurídico)

| Campo | Descrição |
|-------|-----------|
| `id` | Identificador |
| `numero` | Nº da notificação (ex.: NOT-2026-000123) |
| `assunto` | Assunto |
| `subtipo` | Notificação fiscal / Intimação / etc. |
| `origem` | Origem (ex.: EQFIS) |
| `cpfCnpj` | Documento do notificado |
| `dataEnvio` | Data/hora de envio |
| `prazoLeitura` | Prazo para leitura |
| `prazoRegularizacao` | Prazo para regularizar |
| `dataCiencia` | Data da ciência |
| `tipoCiencia` | expressa / tácita |
| `statusCiencia` | pendente / ciente / expirado |
| `valorDivergencia` | Valor envolvido (R$, se houver) |
| `descricao` | Corpo da notificação |
| `fundamento` | Fundamentação legal |
| `conduta` | Conduta esperada do contribuinte |
| `periodos` | Lista: competência, base NFSe, base PGDAS, diferença, status |
| `fiscalNome` | Auditor responsável |
| `fiscalCargo` | Cargo/matrícula |
| `hashAssinatura` | Hash de assinatura do documento |
| `anexos` | Lista (nome, url) |

---

### 17. Caixa Postal
**Tela:** Caixa Postal.
`GET /v1/caixa-postal?cpfCnpj={cpfCnpj}` — listar
`POST /v1/caixa-postal/{id}/marcar-lida` — marcar como lida

| Campo | Descrição |
|-------|-----------|
| `id` | Identificador |
| `data` | Data de envio |
| `assunto` | Assunto |
| `remetente` | Ex.: Secretaria de Fazenda, Procuradoria Geral |
| `lida` | true/false |
| `conteudo` | Corpo da mensagem |

---

### 18. Histórico de pagamentos *(desejável)*
**Uso:** comprovação de quitação / extrato de pagamentos.
`GET /v1/pagamentos?cpfCnpj={cpfCnpj}`

| Campo | Descrição |
|-------|-----------|
| `id` | Identificador |
| `data` | Data do pagamento |
| `tributo` | Tributo pago |
| `inscricao` | Inscrição |
| `exercicio` | Exercício/competência |
| `valor` | Valor pago (R$) |
| `formaPagamento` | Boleto / PIX |
| `numeroComprovante` | Nº do comprovante |
| `urlComprovante` | PDF do comprovante |

---

### 19. Procurações *(verificar de quem é a responsabilidade)*
**Tela:** e-Procuração. Hoje fica **só no navegador**.

> **Pergunta:** as procurações eletrônicas serão persistidas no sistema de tributos (tabelas `Procuracao` / `Procuracao_Servicos_ECAC`) ou em outro local?
Se for de vocês: precisaremos de endpoints para criar, listar, aceitar e revogar procuração, com campos: outorgante, procurador (CPF/nome), vigência (início/fim), módulos autorizados, status, assinatura.

---

## PARTE 3 — O que precisamos receber de vocês (entregáveis)

1. URL de **homologação** e URL de **produção**
2. **Credenciais** de acesso (token ou chave de API) para homologação
3. Documentação **Swagger/OpenAPI** (`.json` ou `.yaml`)
4. Coleção **Postman** com exemplos reais de requisição e resposta
5. **Dicionário de dados** completo (campo, tipo, tamanho, obrigatoriedade, domínio de valores)
6. **Regras de negócio**, principalmente:
   - cálculo de **juros e multa** da dívida ativa
   - regras de **acordo/parcelamento** (descontos, entrada, nº de parcelas, valor mínimo)
   - cálculo do **ITIV** (alíquotas, base, isenções)
   - regras de **certidão** (quando é negativa / positiva c/ efeito de negativa)
7. Política de **rate limit** (requisições por minuto/hora)
8. **SLA** de disponibilidade e janela de manutenção
9. Canal de **suporte técnico**
10. **Confirmar quais módulos são de responsabilidade deste sistema**: NFSe, Alvará, Protocolo e Procurações — ou se ficam em sistemas separados.

---

## PARTE 4 — Matriz de homologação (aceite mínimo)

- [ ] `/health` responde 200
- [ ] Consulta de contribuinte PF e PJ
- [ ] Resumo fiscal (cards do dashboard) com valores corretos
- [ ] Inscrições imobiliárias e econômicas com todos os campos
- [ ] Lançamentos abertos e vencidos
- [ ] Dívida ativa com juros e multa separados
- [ ] Pelo menos 1 parcelamento com parcelas futuras
- [ ] Simulação de acordo com regras reais
- [ ] Emissão de 2ª via com código de barras e PIX **reais**
- [ ] Emissão e autenticação de certidão
- [ ] Erros padronizados em cenários inválidos
- [ ] Teste de timeout/indisponibilidade (resiliência)

---

*Documento gerado por análise integral do código-fonte do Portal CRC.*
