# Documento de Integracao e Ativacao do Portal CRC

## Guia unico para colocar o sistema no ar

Data de referencia: 02/06/2026
Sistema: `crc-portal-contribuinte` (Portal CRC - Central de Relacionamento com o Contribuinte)
Municipio: Lauro de Freitas - Bahia

Este documento serve para DUAS pessoas ao mesmo tempo:

- A empresa de tributos / equipe de TI que vai FORNECER os dados (precisa saber o que expor e como).
- A equipe que vai CONFIGURAR o portal para ele funcionar (precisa saber o que preencher e em qual ordem).

Leia na ordem. Cada bloco explica "o que e", "por que precisa", mostra um "exemplo" e avisa o "erro comum". Nao pule etapas.

---

## 1) Visao geral (entenda antes de tudo)

O Portal CRC NAO inventa dados. Ele apenas mostra, para o contribuinte, as informacoes que vem de fora:

- O sistema de TRIBUTOS (a empresa/sistema dono dos dados fiscais) fornece cadastro, debitos, divida ativa, parcelamentos etc.
- O EQFIS / DTE fornece as notificacoes fiscais (Domicilio Eletronico).
- Os WEBHOOKS de notificacao (e-mail, WhatsApp, SMS) enviam avisos ao contribuinte.

Fluxo resumido:

- Contribuinte abre o Portal CRC.
- O Portal CRC chama a API da empresa de tributos / EQFIS.
- A API responde em JSON.
- O Portal mostra na tela e/ou gera o PDF (certidao, boleto, etc.).
- Quando ha aviso a enviar, o Portal chama o webhook de e-mail/WhatsApp/SMS.

Conclusao pratica: se a API de tributos nao entregar os dados no formato certo, o portal fica "vazio" ou da erro. Por isso a Secao 4 (contrato da API) e a parte mais importante para a empresa de tributos.

---

## 2) Pre-requisitos para o portal rodar

### 2.1 Ambiente
- Node.js 18 ou superior instalado no servidor.
- Acesso de rede do servidor do CRC ate a API de tributos/EQFIS (liberar firewall/porta).
- Uma porta livre para o portal (padrao 4001).

### 2.2 Arquivo `.env` (configuracao do portal)

O portal le um arquivo chamado `.env` na raiz do projeto. Cada linha e uma configuracao no formato `CHAVE=valor`. Abaixo, TODAS as variaveis, o que significam, exemplo e se sao obrigatorias.

- `PORT` (obrigatoria)
  - O que e: porta onde o portal abre.
  - Exemplo: `PORT=4001`
  - Acesso no navegador: `http://localhost:4001`
  - Erro comum: tentar abrir em `4000` quando esta configurado `4001`.

- `SESSION_SECRET` (obrigatoria em producao)
  - O que e: senha interna que protege as sessoes/login.
  - Exemplo: `SESSION_SECRET=uma_frase_grande_e_secreta_aqui`
  - Erro comum: deixar o valor de exemplo `trocar_em_producao` no ar.

- `NODE_ENV` (recomendada)
  - O que e: modo de execucao. Use `production` no ambiente final e `development` para testes.
  - Exemplo: `NODE_ENV=production`

- `CORS_ORIGIN` (recomendada)
  - O que e: de qual endereco o navegador pode acessar a API do portal.
  - Exemplo: `CORS_ORIGIN=https://crc.laurodefreitas.ba.gov.br`
  - Erro comum: manter `*` ou `localhost` em producao.

- `RATE_LIMIT_PUBLIC` (opcional)
  - O que e: limite de requisicoes publicas por janela de tempo (protecao contra abuso).
  - Exemplo: `RATE_LIMIT_PUBLIC=200`

- `LOG_LEVEL` (opcional)
  - O que e: nivel de detalhe dos logs (`info`, `debug`, `warn`, `error`).
  - Exemplo: `LOG_LEVEL=info`

- `DATABASE_URL` (fundacao / fases futuras)
  - O que e: endereco do banco PostgreSQL (preparacao para persistencia futura).
  - Exemplo: `DATABASE_URL=postgresql://usuario:senha@host:5432/crc_portal`

- `REDIS_URL` (fundacao / fases futuras)
  - O que e: endereco do Redis (cache/sessao futura).
  - Exemplo: `REDIS_URL=redis://host:6379`

- `EQFIS_API_BASE_URL` (obrigatoria para DTE/notificacoes)
  - O que e: endereco base da API do EQFIS/tributos que o portal vai chamar.
  - Exemplo: `EQFIS_API_BASE_URL=https://api.empresatributos.com.br/api/dte`
  - Erro comum: colocar a URL com `/` no final duplicado ou apontar para ambiente errado (homologacao x producao).

- `EQFIS_API_KEY` (obrigatoria se a API exigir chave)
  - O que e: chave de acesso enviada no header `X-API-Key`.
  - Exemplo: `EQFIS_API_KEY=coloque_a_chave_recebida`
  - Erro comum: deixar vazio quando a API exige autenticacao (resulta em 401/403).

- `EQFIS_TIMEOUT_MS` (opcional)
  - O que e: tempo maximo de espera por resposta, em milissegundos.
  - Exemplo: `EQFIS_TIMEOUT_MS=10000` (10 segundos)

### 2.3 Modelo de `.env` pronto para preencher

```
NODE_ENV=production
PORT=4001
SESSION_SECRET=troque_por_uma_frase_secreta_grande
CORS_ORIGIN=https://crc.laurodefreitas.ba.gov.br
RATE_LIMIT_PUBLIC=200
LOG_LEVEL=info

DATABASE_URL=postgresql://usuario:senha@host:5432/crc_portal
REDIS_URL=redis://host:6379

EQFIS_API_BASE_URL=https://api.empresatributos.com.br/api/dte
EQFIS_API_KEY=coloque_a_chave_recebida
EQFIS_TIMEOUT_MS=10000
```

---

## 3) O que a empresa de tributos precisa entregar (entregaveis)

Para o portal funcionar, a empresa dona do sistema de tributos deve entregar:

- URL de HOMOLOGACAO (testes) e URL de PRODUCAO.
- Metodo de autenticacao (Bearer Token ou header `x-api-key`) e as credenciais.
- Documentacao OpenAPI/Swagger (arquivo `.json` ou `.yaml`).
- Colecao Postman com exemplos reais de chamada.
- Dicionario de dados (campo a campo: nome, tipo, se e obrigatorio, dominio/valores possiveis).
- Regras de negocio (como calcula juros/multa, arredondamento, significado de cada status).
- Politica de rate limit e SLA (limites e tempo de resposta garantido).
- Janela de manutencao e canal de suporte tecnico (quem chamar quando der erro).
- Changelog/versionamento da API (avisar quando algo mudar).

Sem esses itens, a integracao nao pode ser homologada.

---

## 4) Contrato da API (a parte mais importante)

> Observacao: se a empresa de tributos ja tiver outros nomes de rota, basta enviar o mapeamento equivalente. O importante e existir o dado e o formato.

### 4.0 Como TODO dado deve vir (regras gerais, valem para tudo)

- Formato de troca: JSON em UTF-8.
- Transporte: HTTPS com TLS 1.2 ou superior (em producao).
- `cpfCnpj`: SOMENTE numeros, sem ponto, traco ou barra. 11 digitos para CPF, 14 para CNPJ.
  - Certo: `45434331000163`
  - Errado: `45.434.331/0001-63`
- Datas: padrao ISO 8601 `YYYY-MM-DD` (ex.: `2026-04-15`). Data com hora: `YYYY-MM-DDTHH:mm:ssZ`.
- Valores monetarios: numero decimal com 2 casas e ponto como separador (ex.: `1736.37`). Nao enviar `R$`, nao usar virgula.
- Booleanos: `true`/`false` (nao usar "sim"/"nao").
- Campos sem valor: enviar `null` (nao enviar a string "N/A").
- Paginacao: quando a resposta for lista grande, usar `page` e `total`.
- Identificador de requisicao: enviar um id correlacionavel (header ou no corpo) para rastrear chamadas no suporte.

### 4.1 Saude (teste de conexao)
- `GET /health`
- Para que serve: validar o botao "Testar Conexao" do portal.
- Resposta esperada: HTTP 200 com um JSON simples de status.

### 4.2 Contribuintes
- `GET /v1/contribuintes?cpfCnpj={11 ou 14 digitos}`
- `GET /v1/contribuintes/{id}`

Campos minimos obrigatorios:
- `id` (texto/numero) - identificador unico.
- `tipoPessoa` (texto) - `PF` ou `PJ`.
- `cpfCnpj` (texto) - somente digitos.
- `nomeRazaoSocial` (texto).
- `nomeFantasia` (texto) - obrigatorio quando `PJ`.
- `email` (texto).
- `telefone` (texto).
- `endereco` (objeto) - `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `uf`, `cep`.
- `status` (texto) - situacao cadastral.

### 4.3 Inscricoes imobiliarias
- `GET /v1/inscricoes/imobiliarias?cpfCnpj={...}`
- `GET /v1/inscricoes/imobiliarias/{inscricao}`

Campos minimos obrigatorios:
- `inscricao` (texto).
- `tipo` (texto) - `imovel` ou `lote`.
- `proprietarioCpfCnpj` (texto) - somente digitos.
- `proprietarioNome` (texto).
- `enderecoImovel` (texto/objeto).
- `setor`, `quadra`, `lote` (texto).
- `areaTerreno` (numero) - em metros quadrados.
- `areaConstruida` (numero) - em metros quadrados.
- `valorVenal` (numero decimal 2 casas).
- `situacaoFiscal` (texto).

### 4.4 Inscricoes economicas
- `GET /v1/inscricoes/economicas?cpfCnpj={...}`
- `GET /v1/inscricoes/economicas/{inscricao}`

Campos minimos obrigatorios:
- `inscricao` (texto).
- `cnpj` (texto) - somente digitos.
- `razaoSocial` (texto).
- `nomeFantasia` (texto).
- `atividadePrincipal` (texto) - de preferencia com codigo CNAE.
- `regimeTributario` (texto).
- `dataAbertura` (data `YYYY-MM-DD`).
- `situacao` (texto).
- `endereco` (objeto).
- `responsavelNome` (texto).
- `responsavelCpf` (texto) - somente digitos.

### 4.5 Lancamentos tributarios
- `GET /v1/lancamentos?cpfCnpj={...}&status={aberto|vencido|a_vencer}&competencia=YYYY-MM`
- `GET /v1/lancamentos/{id}`

Campos minimos obrigatorios:
- `id` (texto/numero).
- `tributo` (texto) - IPTU, ISS, TFF, Taxa etc.
- `inscricao` (texto).
- `exercicioCompetencia` (texto) - ex.: `2026` ou `2026-01`.
- `valorOriginal` (numero decimal 2 casas).
- `valorAtualizado` (numero decimal 2 casas).
- `vencimento` (data `YYYY-MM-DD`).
- `status` (texto).
- `codigoBarras` (texto) - se houver.
- `linhaDigitavel` (texto) - se houver.
- `pixCopiaCola` (texto) - se houver.

### 4.6 Divida ativa
- `GET /v1/divida-ativa?cpfCnpj={...}`
- `GET /v1/divida-ativa/{cda}`

Campos minimos obrigatorios:
- `cda` (texto) - numero da certidao de divida ativa.
- `inscricao` (texto).
- `tributo` (texto).
- `valorPrincipal` (numero decimal 2 casas).
- `juros` (numero decimal 2 casas).
- `multa` (numero decimal 2 casas).
- `encargos` (numero decimal 2 casas).
- `valorTotal` (numero decimal 2 casas).
- `dataInscricao` (data `YYYY-MM-DD`).
- `situacao` (texto).
- `exigibilidade` (texto) - ex.: exigivel, suspensa.

### 4.7 Parcelamentos / acordos
- `GET /v1/parcelamentos?cpfCnpj={...}`
- `GET /v1/parcelamentos/{acordoId}`

Campos minimos obrigatorios:
- `acordoId` (texto/numero).
- `origem` (texto) - administrativo ou judicial.
- `quantidadeParcelas` (numero inteiro).
- `parcelaAtual` (numero inteiro).
- `valorParcela` (numero decimal 2 casas).
- `saldoDevedor` (numero decimal 2 casas).
- `vencimentoProximaParcela` (data `YYYY-MM-DD`).
- `status` (texto) - ativo, inadimplente, rescindido, quitado.

### 4.8 Notificacoes fiscais (DEC/DTE)
- `GET /v1/notificacoes?cpfCnpj={...}`

Campos minimos obrigatorios:
- `id` (texto/numero).
- `tipo` (texto).
- `assunto` (texto).
- `conteudoResumo` (texto).
- `dataEnvio` (data/hora ISO 8601).
- `prazoCiencia` (data `YYYY-MM-DD`).
- `statusCiencia` (texto) - ex.: pendente, ciencia tacita, ciencia efetiva.

### 4.9 Padrao de resposta e de erro (obrigatorio)

Sucesso:
- HTTP 200 (consulta) ou 201 (criacao).
- Corpo com `data` (objeto ou lista) e, quando paginado, `page` e `total`.

Erro (sempre no mesmo formato):
- HTTP 400 (validacao), 401/403 (autenticacao/permissao), 404 (nao encontrado), 409/422 (conflito/regra), 429 (excesso de chamadas), 500 (erro interno).
- Corpo JSON padrao:

```
{
  "erro": "Mensagem objetiva e clara",
  "codigo": "CODIGO_DE_NEGOCIO_OU_TECNICO",
  "detalhes": []
}
```

---

## 5) Endpoint que o Portal CRC ja chama hoje (EQFIS/DTE)

Hoje o portal consome as notificacoes assim:

- Chamada: `GET {EQFIS_API_BASE_URL}/notificacoes`
- Headers enviados pelo portal:
  - `X-Contribuinte-CPFCNPJ`: CPF/CNPJ do contribuinte, somente digitos (11 ou 14).
  - `X-API-Key`: enviado automaticamente quando `EQFIS_API_KEY` estiver preenchida no `.env`.
  - `Accept: application/json`
- Tempo maximo de espera: definido por `EQFIS_TIMEOUT_MS`.
- Validacao: se o CPF/CNPJ nao tiver 11 ou 14 digitos, o portal recusa antes de chamar (retorna 400).

Status da integracao pode ser conferido em: `GET /api/dte/status`.

Exemplo de chamada que a empresa de tributos deve conseguir responder:

```
GET https://api.empresatributos.com.br/api/dte/notificacoes
Accept: application/json
X-Contribuinte-CPFCNPJ: 45434331000163
X-API-Key: chave_de_acesso
```

---

## 6) Configuracao pela tela do administrador (passo a passo)

Apos subir o portal, entre no painel administrativo e configure as 3 areas abaixo. Os nomes dos campos sao exatamente os que o sistema espera.

### 6.1 Dados da Entidade (usados nos PDFs: certidao, boleto, alvara etc.)
Preencha:
- `nome` (obrigatorio) - nome oficial do municipio/entidade. Aparece no topo dos documentos.
- `cnpj` - CNPJ da prefeitura.
- `endereco` - endereco institucional.
- `uf` - sigla do estado (ex.: BA).
- `email` - e-mail oficial.
- `telefone` - telefone oficial.
- `responsavel` - nome do responsavel/secretaria.
- `logo` - imagem do brasao em base64 no formato `data:image/png;base64,...` (aceita png, jpeg ou webp).

Erro comum: enviar a logo como link/arquivo. O sistema espera a imagem em base64 (data URL). Se a logo nao aparecer no PDF, o formato esta errado.

### 6.2 Integracao de Tributos
Preencha:
- `apiBaseUrl` (obrigatorio) - URL base da API de tributos.
- `authType` - tipo de autenticacao: `bearer`, `x-api-key` ou `none`.
- `authToken` - o token/chave (quando `authType` nao for `none`).
- `healthPath` - caminho do teste de saude (padrao `/health`).
- `timeoutMs` - tempo maximo de espera (padrao `10000`).
- `sincronizacao` - frequencia de sincronizacao (ex.: `15min`).
- `recursos` - lista dos recursos habilitados (ex.: contribuintes, lancamentos, divida-ativa).

Depois de preencher, use o botao "Testar Conexao". Ele chama `apiBaseUrl + healthPath`:
- Como Bearer: header `Authorization: Bearer <token>`.
- Como x-api-key: header `x-api-key: <token>`.
- Como none: sem header de autenticacao.

Resultado esperado: status 200 e um trecho da resposta. Se vier erro de conexao, revise URL, token e liberacao de firewall.

### 6.3 Notificacoes (e-mail / WhatsApp / SMS)
Preencha as URLs de webhook que o portal vai chamar para disparar avisos:
- `emailWebhookUrl`
- `whatsappWebhookUrl`
- `smsWebhookUrl`
- `remetentePadrao` - nome que aparece como remetente (padrao `Portal CRC`).

Quando o portal dispara um teste/aviso, ele faz um `POST` para a URL do canal com este corpo JSON:

```
{
  "canal": "email",
  "destino": "contribuinte@exemplo.com",
  "mensagem": "Texto do aviso",
  "protocolo": "NTF-2026-00001",
  "remetente": "Portal CRC"
}
```

O webhook do parceiro deve responder HTTP 200 quando aceitar o envio. Se nao houver webhook configurado, o portal funciona em modo "simulado" (apenas registra, nao envia de verdade).

---

## 7) Roteiro de ativacao (checklist na ordem certa)

Siga exatamente nesta ordem:

1. Instalar dependencias: `npm install`.
2. Criar o arquivo `.env` com base no modelo da Secao 2.3 e preencher os valores reais.
3. Subir o portal: `npm start`.
4. Abrir no navegador: `http://localhost:4001` (ou a `PORT` configurada).
5. No painel admin, preencher os Dados da Entidade (Secao 6.1).
6. Configurar a Integracao de Tributos (Secao 6.2) e clicar em "Testar Conexao" ate dar 200.
7. Configurar os Webhooks de notificacao (Secao 6.3) e enviar um teste.
8. Validar a emissao de um documento (ex.: certidao) e conferir se a logo/dados da entidade aparecem.
9. Validar a autenticacao do documento pelo codigo gerado.
10. Conferir as notificacoes do DTE com um CPF/CNPJ de teste.

Se todos os passos acima passarem, o sistema esta pronto para uso.

---

## 8) Matriz de homologacao (criterios minimos de aceite)

A integracao so e considerada aprovada quando TODOS abaixo funcionarem:

- Teste de conectividade (`/health`) com sucesso (HTTP 200).
- Consulta de contribuinte PF e PJ retornando dados corretos.
- Consulta de inscricoes imobiliarias e economicas.
- Lancamentos retornando casos "aberto" e "vencido".
- Ao menos 1 caso de divida ativa retornado.
- Ao menos 1 parcelamento com parcelas futuras.
- Erros retornados no formato padrao (Secao 4.9) para cenarios invalidos.
- Teste de timeout/indisponibilidade tratado sem quebrar o portal.
- Notificacao DTE retornada para um CPF/CNPJ de teste.
- Emissao de documento (PDF) com dados da entidade e codigo de autenticacao validavel.

---

## 9) Seguranca, LGPD e suporte

- Trafegar apenas os dados pessoais estritamente necessarios.
- Mascarar dados sensiveis conforme o perfil de acesso.
- Registrar auditoria por consulta (quem consultou, quando e qual endpoint).
- Usar allowlist de IP ou assinatura entre sistemas, quando exigido.
- Ter rotina de rotacao de credenciais (trocar tokens periodicamente).
- Base legal LGPD: cumprimento de obrigacao legal e execucao de politica publica (Lei 13.709/2018).

### Proximo passo (sessao tecnica conjunta)
Agendar uma reuniao tecnica para:
- validar o contrato final de endpoints;
- entregar credenciais de homologacao;
- executar os testes da Secao 8 ponta a ponta.

Com a entrega completa dos itens deste documento, o Portal CRC podera consumir os dados com seguranca e previsibilidade.
