# CRC — Central de Relacionamento com o Contribuinte
## Documentação Técnica Completa v1.0

---

## 1. Visão Geral

O **CRC** é um portal web para relacionamento entre o contribuinte e a administração tributária municipal. Projetado como SPA (Single Page Application) com Node.js/Express no backend e JavaScript puro no frontend, renderizando templates EJS.

**Objetivo**: Permitir ao contribuinte consultar sua situação fiscal, emitir documentos, fazer acordos de dívida, receber notificações e interagir com o município — tudo online, via computador ou celular.

---

## 2. Arquitetura

```
crc-portal-contribuinte/
├── server.js              # Express (porta 4000), EJS, session, morgan
├── package.json           # Node.js deps: express, ejs, express-session, dotenv, morgan
├── views/
│   └── index.ejs          # Template principal (login + app + modais + tour + chat)
├── public/
│   ├── css/styles.css     # 620+ linhas — design system completo (dark/light theme)
│   └── js/app.js          # 940+ linhas — toda a lógica do SPA (pages, auth, chat, tour)
└── DOCUMENTACAO.md        # Este arquivo
```

### Stack
| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + Express 4.21 |
| Template Engine | EJS |
| Frontend | Vanilla JS (SPA client-side) |
| Estilo | CSS custom properties (dark/light theme) |
| Dados (demo) | localStorage |
| Responsividade | Media queries (1024/768/480px) |

---

## 3. Autenticação

### 3.1 Login Contribuinte
- **Gov.BR**: Botão "Entrar com Gov.BR" (integração futura via OAuth2)
- **Acesso Local**: CPF + Senha (demo: qualquer valor funciona)
- Nível Gov.BR: Bronze / Prata / **Ouro** (determina funcionalidades disponíveis)

### 3.2 Login Administrativo
- Tela separada com transição animada (logo laranja)
- Credenciais padrão:
  - `admin` / `admin123` (Administrador)
  - `suporte` / `sup2026` (Suporte Técnico)
  - `dev` / `dev2026` (Desenvolvedor)
- Dados em `localStorage` (chave: `crc_admin_users`)
- Usuários admin gerenciam configurações; contribuinte **não** vê menu "Administração"

### 3.3 Procuração Eletrônica (e-Procuração)
- Contribuinte pode outorgar poderes a procuradores
- Procurador acessa o portal "como" o outorgante, com perfil alternado
- Assinatura eletrônica via Gov.BR (nível Ouro ou certificado digital)
- Poderes granulares por sistema: NFSe, Tributos, Certidões, etc.

---

## 4. Módulos do Portal

### 4.1 PRINCIPAL
| Módulo | Página | Descrição |
|--------|--------|-----------|
| Dashboard | `dashboard` | Painel com summary cards (Dívida Ativa, A Vencer, Acordos, Inscrições) + Acesso Rápido |
| Situação Fiscal | `situacao_fiscal` | Tabela com todas as inscrições do CPF (imóveis/empresas), situação e ações |

### 4.2 EMISSÕES
| Módulo | Página | Descrição |
|--------|--------|-----------|
| Certidões | `certidoes` | Emissão de certidões de débitos por inscrição (PDF) |
| Alvará | `alvara` | Emissão/renovação de alvará de funcionamento |
| Cartão CGA | `cartao_cga` | Emissão do Cartão de Cadastro Geral de Atividades |
| 2ª Via | `segunda_via` | Geração de 2ª via de boletos (IPTU, ISS, TFF, Dívida Ativa, Parcelamento) com opção de salvar na agenda |

### 4.3 FINANCEIRO
| Módulo | Página | Descrição |
|--------|--------|-----------|
| Extrato da Dívida | `extrato_divida` | Débitos inscritos em dívida ativa com filtros (inscrição, exercício, tributo) |
| Tributos em Aberto | `tributos` | Pagamentos pendentes com seleção múltipla para gerar guia unificada |
| Acordo da Dívida | `acordo` | Simulação interativa de parcelamento (6x a 36x) ou à vista (20% desc.) + histórico de acordos |
| ITIV Online | `itiv` | Cálculo automático do Imposto de Transmissão (compra/venda, doação, permuta) |
| NFSe | `nfse` | Emissão, consulta, cancelamento de Notas Fiscais de Serviço Eletrônicas |

### 4.4 DOCUMENTOS
| Módulo | Página | Descrição |
|--------|--------|-----------|
| Ficha Cadastral | `ficha_cadastral` | Consulta de dados cadastrais de imóveis e empresas + solicitação de retificação |
| Autenticação Certidão | `autenticacao` | Validação de autenticidade de certidão por código |
| Legislação | `legislacao` | Leis, decretos e portarias municipais (PDFs) |

### 4.5 SERVIÇOS
| Módulo | Página | Descrição |
|--------|--------|-----------|
| e-Procuração | `procuracao` | Outorga de poderes eletrônicos com assinatura Gov.BR. Trocar perfil para acessar como procurador. |
| Protocolo | `protocolo` | Abertura/acompanhamento de processos: retificação, impugnação, isenção, restituição |
| DEC | `dec` | Domicílio Eletrônico do Contribuinte — notificações fiscais oficiais |
| Caixa Postal | `caixa_postal` | Mensagens da Prefeitura |
| Notificações | `notificacoes` | Configuração de alertas por E-mail, WhatsApp e SMS |

### 4.6 CONTA
| Módulo | Página | Descrição |
|--------|--------|-----------|
| Meu Perfil | `perfil` | Dados pessoais, foto, endereço, nível Gov.BR |
| FAQ | `faq` | Perguntas frequentes com categorias e busca |

---

## 5. Painel Administrativo

Acessível apenas por admin/suporte/dev. Organizado em **7 abas**:

| Aba | Descrição |
|-----|-----------|
| **Entidade** | Cadastro do município (nome, CNPJ, IBGE, logotipo para cabeçalho de docs) + integração API tributos |
| **Gov.BR** | Client ID/Secret, callback URL, ambiente, serviços (autenticação, assinatura, biometria) |
| **IA Chatbot** | Provedor (OpenAI/Claude/Gemini/Ollama), API Key, modelo, temperatura, system prompt, temas bloqueados, respostas pré-configuradas |
| **Módulos** | Habilitar/desabilitar módulos do menu conforme contrato do município |
| **Usuários** | CRUD de usuários admin/suporte/dev |
| **Configurações** | Regras de notificação ao contribuinte, dados gerais do portal, modo manutenção |
| **Logs** | Log de atividades dos administradores |

---

## 6. Funcionalidades Transversais

### 6.1 Chat IA (Assistente CRC)
- Robô flutuante no canto inferior direito
- Janela de chat com histórico
- Respostas baseadas em keywords (IPTU, certidões, acordos, etc.)
- Recusa educada para temas fora do escopo (política, culinária, etc.)
- Token e prompt configuráveis pelo admin

### 6.2 Tour Guiado
- Spotlight + tooltip contextual por página
- Robô acompanha o tour
- Steps específicos para: Dashboard, Acordo, 2ª Via, Perfil, Notificações

### 6.3 Tema Escuro/Claro
- Toggle na sidebar
- 40+ variáveis CSS customizadas
- Persistido em `localStorage`

### 6.4 Responsividade
- Desktop: sidebar fixa + conteúdo ao lado
- Tablet (≤1024px): ajustes de grid
- Mobile (≤768px): sidebar drawer + overlay + grids empilhados
- Small (≤480px): layout single-column, topbar compacta

### 6.5 Integração com Agenda
- Google Calendar: abre URL para criar evento
- ICS: download de arquivo .ics (iOS/Outlook)
- Disponível na 2ª Via de documentos (botão 📅)

---

## 7. Persistência (localStorage)

| Chave | Conteúdo |
|-------|----------|
| `arrecada_theme` | `'light'` ou `'dark'` |
| `arrecada_sidebar` | `'collapsed'` ou `'expanded'` |
| `arrecada_photo` | Base64 da foto de perfil |
| `arrecada_notif_seen` | `'1'` se modal de notificação já foi visto |
| `crc_modules` | JSON com módulos habilitados/desabilitados |
| `crc_admin_users` | JSON array de usuários admin |
| `crc_admin_name` | Nome do admin logado |
| `crc_admin_perfil` | Perfil do admin logado |
| `crc_entidade_config` | JSON com dados da entidade + logotipo (base64) |
| `crc_config_ia` | JSON com apiKey, prompt, provedor, modelo, temperatura |

---

## 8. Análise de Gaps — Funcionalidades a Implementar

### 8.1 Solicitar Retificação Cadastral
**Status**: NÃO IMPLEMENTADO
**Onde**: Ficha Cadastral → ao ver uma ficha, botão "Solicitar Retificação"
**Requisitos**:
- Formulário com: inscrição, campo a retificar, valor atual, valor correto, justificativa, anexo (comprovante)
- Gera protocolo automático
- Assinatura Gov.BR obrigatória

### 8.2 Gerar 2ª Via — Fluxo Completo
**Status**: PARCIAL (existe a tela com cards, mas sem geração real de boleto)
**Requisitos faltantes**:
- Ao clicar "Gerar": abrir modal com dados do boleto (código de barras, QR Code PIX, valor, vencimento)
- Botões: "Copiar Código", "Copiar PIX", "Baixar PDF"
- Integração futura com API de boletos

### 8.3 Procuração Eletrônica — Fluxo Completo
**Status**: PARCIAL (tabela de procurações existentes, mas sem formulário de criação)
**Requisitos faltantes**:
- **Criar Procuração**: formulário com CPF do procurador, nome, poderes (checkboxes por módulo), vigência, assinatura Gov.BR
- **Aceitar Procuração**: o procurador recebe notificação e aceita com Gov.BR
- **Acessar como Procurador**: seletor de perfil no topbar — "Acessando como: Maria Fernanda (Procurador)" — todos os dados mostrados são do outorgante
- **Revogar/Cancelar**: botão de cancelamento com confirmação

### 8.4 Protocolo — Tipos de Processo
**Status**: PARCIAL (tabela + botão "Novo Processo", mas sem formulário)
**Tipos de processo a implementar**:
- Retificação Cadastral (Imóvel/Empresa)
- Impugnação de Lançamento
- Pedido de Isenção
- Restituição / Compensação
- Revisão de Valor Venal
- Contestação de Dívida Ativa
- Solicitação Geral

### 8.5 Ficha Cadastral Detalhada
**Status**: PARCIAL (tabela com "Ver Ficha", mas sem tela de detalhe)
**Requisitos**:
- Ao clicar "Ver Ficha": mostrar todos os dados do imóvel/empresa
- Imóvel: inscrição, proprietário, endereço, área, valor venal, uso, padrão construtivo
- Empresa: CNPJ, razão social, atividade, regime tributário, situação
- Botão "Solicitar Retificação" em cada campo

### 8.6 Perfil como Procurador
**Status**: NÃO IMPLEMENTADO
**Requisitos**:
- No topbar: dropdown "Acessando como: [nome]"
- Listar outorgantes que deram procuração ao CPF logado
- Ao selecionar: carregar dados do outorgante em todo o portal
- Badge visual indicando "Acesso por Procuração"
- Limitar ações conforme poderes outorgados

---

## 9. Fluxos de Negócio

### 9.1 Fluxo do Contribuinte
```
Login (Gov.BR ou CPF/Senha)
  → Dashboard (resumo fiscal)
  → Consultar situação → Emitir certidão / 2ª via / Acordo
  → Solicitar retificação (gera protocolo)
  → Acompanhar protocolo
  → Configurar notificações (email/whatsapp/sms)
```

### 9.2 Fluxo do Procurador
```
Login (Gov.BR)
  → Verificar procurações recebidas
  → Selecionar outorgante → Acessar portal "como" outorgante
  → Executar ações conforme poderes (NFSe, Tributos, Certidões, etc.)
  → Sair do perfil de procurador → Voltar ao próprio perfil
```

### 9.3 Fluxo de Retificação
```
Ficha Cadastral → Ver Ficha → Solicitar Retificação
  → Preencher formulário (campo, valor correto, justificativa, anexo)
  → Assinar via Gov.BR
  → Protocolo gerado automaticamente
  → Acompanhar em "Protocolo e Processos"
```

### 9.4 Fluxo de Procuração
```
e-Procuração → + Nova Procuração
  → Informar CPF do procurador
  → Selecionar poderes (por módulo)
  → Definir vigência
  → Assinar com Gov.BR
  → Procurador recebe notificação e aceita
  → Procuração ativa
```

---

## 10. Segurança e Regras

| Regra | Descrição |
|-------|-----------|
| Acesso Admin | Tela de login separada, seção do menu oculta para contribuintes |
| Config dev bloqueada | `navigate('config_dev')` verifica `currentUserType==='admin'` |
| Chatbot restrito | Responde APENAS sobre o Portal; temas bloqueados são configuráveis |
| Procuração | Requer assinatura Gov.BR (nível Ouro ou certificado digital) |
| Retificação | Requer Gov.BR + anexo comprobatório |
| Dados demo | localStorage apenas; produção exige backend com banco de dados |

---

## 11. Arquitetura de Banco de Dados — MSSQL

O CRC em produção opera sobre um banco MSSQL com as seguintes tabelas e procedures:

### 11.1 Configuração e Identidade Visual

| Tabela | Função |
|--------|--------|
| `ACE_Parametro` | Parâmetros visuais e operacionais: `URL_Acesso_Portal`, `colormain`, `colorsecundary`, `logotopo`, `URLLOGO`, mensagens de boas-vindas por perfil (Jurídica, Avulsa, Condomínio) |
| `GER_ICONE` | Catálogo de ícones do sistema |
| `GER_ENTIDADE` | Dados da entidade municipal (nome, CNPJ, endereço, logotipo) |

### 11.2 Autenticação e Controle de Acesso

| Tabela | Função |
|--------|--------|
| `FR_USUARIO` | Cadastro de usuários (contribuintes e administrativos) |
| `GOVBR_TOKEN` | Tokens de sessão Gov.BR |
| `GOVBR_NIVEIS` | Níveis de confiabilidade Gov.BR (Bronze, Prata, Ouro) |
| `Acesso_Login_ECAC_LOG` | Log de cada tentativa de login |
| `ECAC_LOGIN_TOKEN` | Sessões ativas no portal |

### 11.3 Caixa Postal Eletrônica

| Tabela | Função |
|--------|--------|
| `ECAC_CAIXA_POSTAL_ENVIO` | Mensagens: `ECP_REMETENTE`, `ECP_MENSAGEM`, `ECP_ASSUNTO`, `ECP_LEITURA` |
| `ECAC_CAIXA_POSTAL_ENVIAR_EMAIL` | Fila de envio de e-mails para notificação |
| `ECAC_ENVIO_WPP_CAIXA_POSTAL_LOG` | Log de envios via WhatsApp |
| `ECAC_CAIXA_POSTAL_LOTE` | Processamento de mensagens em massa |
| `ECAC_CAIXA_POSTAL_LOG_ERROS` | Log de erros no envio |

### 11.4 Procurações Eletrônicas

| Tabela | Função |
|--------|--------|
| `Procuracao` | Outorgas: outorgante, procurador, `dtInicio`, `dtFim`, `Assinado` |
| `Procuracao_Servicos_ECAC` | Serviços autorizados por procuração |

### 11.5 Acordos e Dívida Ativa

| Tabela | Função |
|--------|--------|
| `Acordo` | Registro de acordos formalizados |
| `TRB_DIVIDA_ACORDO_WEB` | Vínculos entre débitos e acordos web |
| `ACORDO_DIVIDA_TABELA` | Valores administrativos e judiciais por débito |
| `ACORDO_DIVIDA_PARCELAS_TABELA` | Parcelas individuais do acordo |
| `GER_ACESSO_TRB` | Mapeamento de procedures por operação |

**Procedures:**
- `PROCEDURE_CANCELAMENTO_ACORDO` — Cancela acordo existente
- `PROC_SIMULADO_ACORDO` — Simula acordo antes da formalização

### 11.6 Emissão de Documentos e Guias

| Tabela | Função |
|--------|--------|
| `IPTU_CPF_CNPJ` | Inscrições imobiliárias por CPF/CNPJ |
| `TAXA_EXP_CPF_CNPJ` | Taxas de expediente |
| `ISS_AUTONOMO_TABELA` | Lançamentos de ISS |
| `TRB_VALIDACAO_CERTIDAO` | Validação de certidões emitidas |
| `TIPO_CERTIDOES_WEB` | Tipos de certidão disponíveis |

### 11.7 LGPD e Formulários Eletrônicos

| Tabela | Função |
|--------|--------|
| `ECAC_FORMULARIO_ELETRONICO` | Solicitações de acesso, retificação ou exclusão de dados |
| `ECAC_FORMULARIO_ELETRONICO_ANEXOS` | Documentos comprobatórios anexados |
| `ECAC_TERMO_USUARIO` | Aceites de termos de uso |

### 11.8 Integração e Regras de Negócio

**Procedure principal:**
- `STP_ECAC_INSERE_DADOS_NOTIFICACAO_CONTRIBUINTE` — Insere notificação para contribuinte

**Regras operacionais (regras.txt):**
- `REG_COD 1315` — Entrada em Procuração Eletrônica
- `REG_COD 1966` — Início de Acordo da Dívida

**Fontes de Dados SQL (fontesDados.txt):**
- Queries pré-definidas para cada formulário/grade da interface
- Ex: query `500000194` para Acordo da Dívida

### 11.9 Auditoria

| Tabela | Função |
|--------|--------|
| `ECAC_CAIXA_POSTAL_LOG_ERROS` | Erros de comunicação com Caixa Postal |
| `Acesso_PROTOCOLO_LOG_ERRO` | Erros no fluxo de protocolos |

> **Toda a comunicação entre front-end e banco é auditada** através dessas tabelas de log de erros.

---

## 12. Roadmap de Evolução

### Fase 1 — Frontend (Concluída)
- [x] Dashboard com resumo fiscal
- [x] 24 módulos funcionais (incluindo LGPD e Formulário Eletrônico)
- [x] Login duplo (contribuinte + admin)
- [x] Login alternativo: CPF + Senha e recuperação de senha
- [x] Chat IA configurável (chatbot restrito ao portal)
- [x] Responsividade completa (mobile + desktop)
- [x] Tema escuro/claro
- [x] Tour guiado
- [x] Configuração de entidade + logotipo
- [x] Procuração completa (criar + assinar Gov.BR + acessar como procurador + PDF)
- [x] Retificação cadastral (via Protocolo, pré-preenchido)
- [x] 2ª via com boleto + código de barras + PIX Copia e Cola + agenda
- [x] Protocolo com formulário de abertura
- [x] Ficha cadastral detalhada (imóveis + empresas)
- [x] Acordo da Dívida com Formalizar + DAM + QR PIX
- [x] Tributos com Guia Unificada (selecionar + gerar boleto unificado)
- [x] DEC com leitura de mensagem + registro de ciência (valor jurídico)
- [x] Caixa Postal com leitura completa de mensagens
- [x] Certidões com modal de emissão PDF + código de autenticação
- [x] Autenticação de Certidão funcional (verificação de código)
- [x] NFSe com emissão funcional + cancelamento com justificativa
- [x] Alvará com emissão + renovação via protocolo
- [x] Cartão CGA com emissão funcional
- [x] Formulário Eletrônico LGPD (acesso, retificação, exclusão de dados)
- [x] Admin Master com RBAC (Administrador Master único, controle granular)
- [x] API Receita Federal (CNPJ público com fallback multi-API)
- [x] Modelo de Procuração configurável com placeholders

### Fase 2 — Backend + Banco MSSQL
- [ ] Integração com banco MSSQL (tabelas documentadas na seção 11)
- [ ] Autenticação Gov.BR real (OAuth2 / SAML)
- [ ] API REST para tributos (procedures PROC_SIMULADO_ACORDO, etc.)
- [ ] Geração de PDFs server-side (certidões, boletos, alvarás, CGA)
- [ ] Geração de QR Code PIX real (Banco do Brasil / Caixa API)
- [ ] API de notificações (SMTP, WhatsApp Business API, SMS gateway)
- [ ] WebSocket para notificações em tempo real
- [ ] Integração InfoJud/Serpro para CPF
- [ ] Procedures de cancelamento e simulação de acordo
- [ ] `STP_ECAC_INSERE_DADOS_NOTIFICACAO_CONTRIBUINTE`

### Fase 3 — Produção
- [ ] Docker + CI/CD (Dockerfile + GitHub Actions já configurados)
- [ ] HTTPS obrigatório
- [ ] Rate limiting
- [ ] LGPD compliance total (formulário + auditoria de consentimento)
- [ ] Auditoria de acesso (Acesso_Login_ECAC_LOG, ECAC_CAIXA_POSTAL_LOG_ERROS)
- [ ] Backup automático
- [ ] Multi-tenant (múltiplos municípios via GER_ENTIDADE)

---

*Documento atualizado em 13/03/2026 — CRC v2.0 (arquitetura MSSQL + fluxos funcionais completos)*
