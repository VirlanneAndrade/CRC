/* =============================================================
   Rotas de integração com a API de Tributos
   -------------------------------------------------------------
   Expõe os endpoints do tributosClient para o frontend do CRC.
   Cada rota repassa o resultado da API de tributos (status + body).

   Endpoint chave para a fase atual:
     GET /api/tributos/status  -> diz se a integração está configurada
     GET /api/tributos/health  -> testa a conexão real com a API deles
   ============================================================= */

const express = require('express');
const env = require('../config/env');
const tributos = require('../services/tributosClient');

const router = express.Router();

function reply(res, result) {
  return res.status(result.status).json(result.body);
}

/* ---- Diagnóstico / teste de conexão ---- */
router.get('/api/tributos/status', (_req, res) => {
  res.json({
    configurado: tributos.isConfigured(),
    baseUrl: env.TRIBUTOS_API_BASE_URL || null,
    authType: env.TRIBUTOS_AUTH_TYPE,
    timeoutMs: env.TRIBUTOS_TIMEOUT_MS,
  });
});

router.get('/api/tributos/health', async (_req, res) => reply(res, await tributos.health()));

/* ---- Consultas por contribuinte ---- */
router.get('/api/tributos/contribuinte', async (req, res) => reply(res, await tributos.getContribuinte(req.query.cpfCnpj)));
router.get('/api/tributos/resumo', async (req, res) => reply(res, await tributos.getResumoFiscal(req.query.cpfCnpj)));
router.get('/api/tributos/situacao-fiscal', async (req, res) => reply(res, await tributos.getSituacaoFiscal(req.query.cpfCnpj)));

router.get('/api/tributos/inscricoes/imobiliarias', async (req, res) => reply(res, await tributos.getInscricoesImobiliarias(req.query.cpfCnpj)));
router.get('/api/tributos/inscricoes/imobiliarias/:inscricao', async (req, res) => reply(res, await tributos.getInscricaoImobiliaria(req.params.inscricao)));
router.get('/api/tributos/inscricoes/economicas', async (req, res) => reply(res, await tributos.getInscricoesEconomicas(req.query.cpfCnpj)));
router.get('/api/tributos/inscricoes/economicas/:inscricao', async (req, res) => reply(res, await tributos.getInscricaoEconomica(req.params.inscricao)));

router.get('/api/tributos/lancamentos', async (req, res) => {
  const { cpfCnpj, ...filtros } = req.query;
  reply(res, await tributos.getLancamentos(cpfCnpj, filtros));
});
router.get('/api/tributos/divida-ativa', async (req, res) => {
  const { cpfCnpj, ...filtros } = req.query;
  reply(res, await tributos.getDividaAtiva(cpfCnpj, filtros));
});

/* ---- Acordos ---- */
router.get('/api/tributos/parcelamentos', async (req, res) => reply(res, await tributos.getParcelamentos(req.query.cpfCnpj)));
router.post('/api/tributos/acordos/simular', async (req, res) => reply(res, await tributos.simularAcordo(req.body)));
router.post('/api/tributos/acordos/formalizar', async (req, res) => reply(res, await tributos.formalizarAcordo(req.body)));
router.post('/api/tributos/acordos/:acordoId/cancelar', async (req, res) => reply(res, await tributos.cancelarAcordo(req.params.acordoId, (req.body || {}).motivo)));

/* ---- Documentos / boletos ---- */
router.post('/api/tributos/documentos/segunda-via', async (req, res) => reply(res, await tributos.emitirSegundaVia(req.body)));
router.post('/api/tributos/documentos/guia-unificada', async (req, res) => reply(res, await tributos.emitirGuiaUnificada(req.body)));

/* ---- Certidões ---- */
router.post('/api/tributos/certidoes/emitir', async (req, res) => reply(res, await tributos.emitirCertidao(req.body)));
router.get('/api/tributos/certidoes/autenticar/:codigo', async (req, res) => reply(res, await tributos.autenticarCertidao(req.params.codigo)));

/* ---- Alvará ---- */
router.get('/api/tributos/alvaras', async (req, res) => reply(res, await tributos.getAlvaras(req.query.cpfCnpj)));
router.get('/api/tributos/alvaras/:inscricao/elegibilidade', async (req, res) => reply(res, await tributos.getElegibilidadeAlvara(req.params.inscricao)));
router.post('/api/tributos/alvaras/emitir', async (req, res) => reply(res, await tributos.emitirAlvara(req.body)));

/* ---- Cartão CGA ---- */
router.get('/api/tributos/cga', async (req, res) => reply(res, await tributos.getCga(req.query.cpfCnpj)));
router.post('/api/tributos/cga/emitir', async (req, res) => reply(res, await tributos.emitirCga(req.body)));

/* ---- ITIV ---- */
router.post('/api/tributos/itiv/calcular', async (req, res) => reply(res, await tributos.calcularItiv(req.body)));
router.post('/api/tributos/itiv/emitir-guia', async (req, res) => reply(res, await tributos.emitirGuiaItiv(req.body)));

/* ---- NFSe ---- */
router.get('/api/tributos/nfse', async (req, res) => reply(res, await tributos.getNfse(req.query.cpfCnpj)));
router.post('/api/tributos/nfse/emitir', async (req, res) => reply(res, await tributos.emitirNfse(req.body)));
router.post('/api/tributos/nfse/:numero/cancelar', async (req, res) => reply(res, await tributos.cancelarNfse(req.params.numero, (req.body || {}).motivo)));

/* ---- Protocolos ---- */
router.get('/api/tributos/protocolos', async (req, res) => reply(res, await tributos.getProtocolos(req.query.cpfCnpj)));
router.post('/api/tributos/protocolos', async (req, res) => reply(res, await tributos.abrirProtocolo(req.body)));
router.get('/api/tributos/protocolos/:numero', async (req, res) => reply(res, await tributos.getProtocolo(req.params.numero)));

/* ---- Notificações DEC/DTE ---- */
router.get('/api/tributos/notificacoes', async (req, res) => reply(res, await tributos.getNotificacoes(req.query.cpfCnpj)));
router.get('/api/tributos/notificacoes/:id', async (req, res) => reply(res, await tributos.getNotificacao(req.params.id)));
router.post('/api/tributos/notificacoes/:id/ciencia', async (req, res) => reply(res, await tributos.registrarCiencia(req.params.id)));

/* ---- Caixa postal ---- */
router.get('/api/tributos/caixa-postal', async (req, res) => reply(res, await tributos.getCaixaPostal(req.query.cpfCnpj)));
router.post('/api/tributos/caixa-postal/:id/marcar-lida', async (req, res) => reply(res, await tributos.marcarCaixaPostalLida(req.params.id)));

/* ---- Pagamentos ---- */
router.get('/api/tributos/pagamentos', async (req, res) => reply(res, await tributos.getPagamentos(req.query.cpfCnpj)));

module.exports = router;
