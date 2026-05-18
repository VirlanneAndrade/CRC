# Levantamento de Requisitos — Situação Fiscal, Emissões e Financeiro

Data: 18/05/2026  
Projeto: `crc-portal-contribuinte`

## 1) Stack e arquitetura observada

- Frontend principal: JavaScript vanilla em `public/js/app.js`
- Backend: Node.js + Express em `server.js`
- Views: EJS (`views/index.ejs`)
- Persistência atual:
  - dados simulados em arrays no frontend (hardcoded);
  - `localStorage` para alguns fluxos (ex.: NFSe, perfil, sessões simuladas).
- APIs backend existentes:
  - `GET /api/consulta-cnpj/:cnpj`
  - `GET /api/consulta-cpf/:cpf`
  - `POST /api/procuracao/pdf`
- Não há, no estado atual, APIs reais para os módulos de Situação Fiscal, Emissões e Financeiro.

---

## 2) SITUAÇÃO FISCAL

### 2.1 O que foi feito (AS-IS)

- Existe tela `situacao_fiscal` com tabela de inscrições (imóvel/empresa), status, débitos e ações.
- Ações navegam para outros módulos:
  - `Extrato` -> `extrato_divida`
  - `Certidão` -> `certidoes`
  - `Acordo` -> `acordo`
- Os dados são estáticos (mock), sem consulta ao backend/banco em tempo real.

### 2.2 O que deveria fazer (TO-BE)

- Carregar automaticamente inscrições vinculadas ao CPF/CNPJ autenticado.
- Exibir situação fiscal consolidada por inscrição (regular, irregular, parcelada etc.) com cálculo real.
- Integrar com dívida ativa, certidões e acordos com dados oficiais e atualizados.
- Permitir filtros (tipo de inscrição, situação, exercício, existência de débito).

### 2.3 O que faz hoje (funcionalmente)

- Mostra uma grade fiscal mockada para demonstração.
- Direciona o usuário para fluxos relacionados (extrato, certidão, acordo).
- Não salva alterações, não consulta serviço externo e não aplica regras dinâmicas por contribuinte real.

### 2.4 Como faz hoje (implementação)

- Renderização 100% no frontend em `pages.situacao_fiscal`.
- Conteúdo embutido no template da página (HTML string no JS).
- Navegação via `navigate('modulo')`.

### 2.5 O que falta para configurar 100%

1. API backend para listar inscrições e situação fiscal por contribuinte.
2. Integração com base tributária (MSSQL/procedures previstas na documentação).
3. Cálculo real de débitos/estado por inscrição.
4. Controle de acesso por identidade real (Gov.BR/CPF autenticado de verdade).
5. Filtros funcionais e paginação para volumes altos.
6. Auditoria de consultas e trilha de acesso.

---

## 3) EMISSÕES (Certidões, Alvará, Cartão CGA, 2ª Via)

## 3.1 Certidões

### O que foi feito
- Tela de certidões com lista e botão "Emitir PDF".
- Modal com código, validade e dados principais.
- Botão "Baixar PDF" atualmente exibe fluxo simulado (alerta de integração pendente).

### O que deveria fazer
- Gerar certidão oficial em PDF server-side.
- Registrar e validar autenticidade em base (`TRB_VALIDACAO_CERTIDAO`).
- Permitir consulta por código em módulo de autenticação.

### O que faz hoje
- Simula emissão e apresenta dados em modal.
- Não gera PDF oficial no backend para certidões.

### Como faz
- Fonte de dados local em `CERTIDOES_DATA`.
- Função `emitirCertidaoPDF(idx)` monta modal e simula saída.

### O que falta para 100%
1. Endpoint backend de emissão oficial de certidão.
2. Persistência de número/código/hash da certidão.
3. Assinatura digital/verificação e trilha de auditoria.
4. Download real de PDF com layout oficial e validação.

## 3.2 Alvará

### O que foi feito
- Tela de emissão e renovação.
- Emissão abre modal com dados e opção "Baixar PDF" (simulado).
- Renovação encaminha para protocolo com pré-preenchimento.

### O que deveria fazer
- Emitir alvará com validação da situação cadastral/fiscal.
- Renovação com workflow formal (análise, exigência, deferimento/indeferimento).

### O que faz hoje
- Simula emissão visualmente.
- Encaminha solicitação de renovação para módulo de protocolo.

### Como faz
- `pages.alvara`, `emitirAlvaraPDF(...)`, `solicitarRenovacaoAlvara(...)`.
- Sem integração com cadastro econômico real.

### O que falta para 100%
1. Regras de elegibilidade reais (débitos, licenças, CNAE, vigência).
2. Geração oficial de documento e número de controle.
3. Integração com processo administrativo de renovação.
4. Registro histórico e status por emissão/renovação.

## 3.3 Cartão CGA

### O que foi feito
- Tela com inscrições econômicas e botão para gerar cartão.
- Modal com dados de emissão e opção de PDF (simulado).

### O que deveria fazer
- Gerar cartão CGA oficial com dados cadastrais atualizados.
- Vincular com situação de inscrição municipal ativa.

### O que faz hoje
- Simula geração em modal com dados mock.

### Como faz
- `pages.cartao_cga` + `gerarCartaoCGA(...)` no frontend.

### O que falta para 100%
1. API oficial de emissão CGA.
2. Validação cadastral em banco.
3. PDF oficial com QR/código de validação.
4. Histórico de emissões por usuário e inscrição.

## 3.4 2ª Via

### O que foi feito
- Tela com múltiplos cards de débitos/tributos.
- Geração de boleto/PIX em modal com:
  - código de barras,
  - PIX copia e cola,
  - opção de copiar e salvar na agenda.
- Fluxo funcional de interface.

### O que deveria fazer
- Gerar DAM/guia real via integração bancária/arrecadação.
- Calcular encargos em tempo real na data da emissão.
- Retornar linha digitável e QR Pix válidos para pagamento real.

### O que faz hoje
- Simula boleto e QR (geração local fake).
- Permite copiar dados simulados.

### Como faz
- Função `gerarBoleto(...)` monta modal frontend.
- Não consome endpoint de arrecadação real.

### O que falta para 100%
1. Integração com motor de arrecadação bancária.
2. Cálculo oficial de atualização monetária/juros/multa no backend.
3. QR Pix dinâmico real (PSP/banco).
4. Conciliação de pagamento e baixa automática.
5. Comprovante oficial pós-pagamento.

---

## 4) FINANCEIRO (Extrato, Tributos, Acordo, ITIV, NFSe)

## 4.1 Extrato da Dívida

### O que foi feito
- Tela com filtros visuais e grade de débitos.
- Ações para 2ª via e acordo.
- Dados apresentados em tabela mock.

### O que deveria fazer
- Consultar dívida ativa real por contribuinte/inscrição/exercício/tributo.
- Exibir composição oficial e status atualizado.

### O que faz hoje
- Mostra extrato simulado para demonstração do fluxo.

### Como faz
- `pages.extrato_divida` com HTML estático.

### O que falta para 100%
1. Endpoint de consulta com filtros reais.
2. Integração com base de dívida ativa e parcelas.
3. Exportação oficial (PDF/CSV) auditável.

## 4.2 Tributos em Aberto

### O que foi feito
- Lista de pendências com seleção múltipla.
- Geração de guia unificada (simulada) para itens selecionados.

### O que deveria fazer
- Buscar pendências reais por contribuinte.
- Consolidar guias conforme regras fiscais e competências válidas.

### O que faz hoje
- Usa array `TRIBUTOS_ABERTOS` local.
- Calcula total localmente e chama geração de boleto simulado.

### Como faz
- `toggleAllTributos`, `gerarGuiaUnificada`, `pages.tributos`.

### O que falta para 100%
1. API de pendências reais por inscrição/competência.
2. Regra de consolidação de guia no backend.
3. Emissão oficial de guia unificada e número de controle.
4. Controle de duplicidade e idempotência de emissão.

## 4.3 Acordo da Dívida

### O que foi feito
- Simulação interativa (à vista e parcelado).
- Formalização em modal com DAM/PIX simulados.
- Histórico visual de acordos.

### O que deveria fazer
- Simular conforme regras oficiais do município (procedures).
- Formalizar acordo com gravação real de parcelas.
- Permitir cancelamento/renegociação conforme normativo.

### O que faz hoje
- Simula cálculo com valores fixos frontend.
- Exibe confirmação visual sem persistência oficial.

### Como faz
- `simular()`, `formalizarAcordo()`, `pages.acordo`.

### O que falta para 100%
1. Integração com procedures de simulação/formalização/cancelamento.
2. Persistência oficial de acordo e parcelas.
3. Geração de DAM/PIX reais e agenda de vencimentos.
4. Consulta de status (em dia, rompido, quitado) em tempo real.

## 4.4 ITIV Online

### O que foi feito
- Tela de entrada de dados da transação.
- Botão "Calcular ITIV" (sem cálculo real implementado).

### O que deveria fazer
- Calcular ITIV com base venal/regras legais vigentes.
- Gerar guia de recolhimento e protocolo do processo.

### O que faz hoje
- Apenas interface de captura de dados.

### Como faz
- `pages.itiv` renderiza formulário frontend sem integração.

### O que falta para 100%
1. Motor de cálculo ITIV no backend.
2. Integração com cadastro imobiliário e regras de isenção.
3. Emissão da guia e acompanhamento do processo.
4. Validação documental e trilha de auditoria.

## 4.5 NFSe

### O que foi feito
- Lista de notas.
- Emissão de nova NFSe com validação básica de campos.
- Cálculo de ISS no frontend.
- Cancelamento com motivo.
- Persistência local em `localStorage`.

### O que deveria fazer
- Emissão fiscal eletrônica oficial com integração ao padrão municipal.
- Numeração oficial e autorização em backend.
- Cancelamento com regras legais e registro oficial.
- Exportação XML/PDF e integração contábil.

### O que faz hoje
- Funciona como simulador local de emissão/cancelamento.
- Não integra com serviço fiscal oficial.

### Como faz
- `getNFSes()`, `saveNFSes()`, `emitirNFSe()`, `cancelarNFSe()`, `pages.nfse`.

### O que falta para 100%
1. Backend NFSe oficial (autorização, rejeição, protocolo, RPS se aplicável).
2. Base persistente transacional (não `localStorage`).
3. Regras fiscais por serviço/alíquota/tomador.
4. PDF/XML oficiais e consulta por chave.
5. Integração com escrituração e relatórios fiscais.

---

## 5) Checklist único para configuração 100% (prioridade para o dev)

1. **Backend por domínio**: criar APIs reais para Situação Fiscal, Emissões e Financeiro.
2. **Banco de dados**: conectar MSSQL e implementar procedures/tabelas da documentação.
3. **Autenticação real**: integrar Gov.BR/OAuth e controle de sessão/autorizações.
4. **Emissão oficial de documentos**: certidões, alvará, CGA, DAM/boletos, NFSe.
5. **Pagamento e arrecadação**: integração bancária/PIX real + conciliação.
6. **Auditoria e logs**: trilha completa por operação crítica.
7. **Validações legais/fiscais**: regras de negócio no backend (não apenas frontend).
8. **Ambiente de produção**: HTTPS, variáveis seguras, monitoramento e backups.
9. **Testes automatizados**:
   - unitários (regras de cálculo/validação),
   - integração (APIs e banco),
   - E2E (fluxos de contribuinte e procurador).

---

## 6) Resumo executivo para repasse ao levantador

- O portal está **funcional como protótipo avançado de frontend**, com boa navegação e fluxos simulados.
- Há funcionalidades visíveis para os módulos pedidos, mas a maior parte ainda está em **modo mock/simulado** para dados fiscais e emissões oficiais.
- Para chegar a 100% produtivo, o foco é implementar **integrações backend + banco + fiscal/arrecadação + autenticação real + auditoria**.

