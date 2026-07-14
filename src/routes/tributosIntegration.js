/* =============================================================
   Rotas de integração com a API de Tributos (JFU)
   ============================================================= */

const express = require('express');
const env = require('../config/env');
const tributos = require('../services/tributosClient');
const { mapContribuinte, mapResumoFiscal } = require('../services/tributosMapper');

const router = express.Router();

/** Envia JSON da JFU ou erro; em sucesso aplica o mapper (contrato CRC). */
function replyMapped(res, result, mapper) {
  if (!result.ok) {
    return res.status(result.status).json(result.body);
  }
  return res.status(result.status).json(mapper(result.body));
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

router.get('/api/tributos/health', async (_req, res) => {
  const result = await tributos.health();
  res.status(result.status).json(result.body);
});

/* Contribuinte: query cpfCnpj → JFU contribuintes.rule → mapContribuinte */
router.get('/api/tributos/contribuinte', async (req, res) => {
  replyMapped(res, await tributos.getContribuinte(req.query.cpfCnpj), mapContribuinte);
});

/* Resumo fiscal: mesma rule com resumo=true → mapResumoFiscal */
router.get('/api/tributos/resumo', async (req, res) => {
  replyMapped(res, await tributos.getResumoFiscal(req.query.cpfCnpj), mapResumoFiscal);
});

router.get('/api/tributos/situacao-fiscal', async (req, res) => {
  const result = await tributos.getSituacaoFiscal(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});

router.get('/api/tributos/inscricoes/imobiliarias', async (req, res) => {
  const result = await tributos.getInscricoesImobiliarias(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});
router.get('/api/tributos/inscricoes/imobiliarias/:inscricao', async (req, res) => {
  const result = await tributos.getInscricaoImobiliaria(req.params.inscricao);
  res.status(result.status).json(result.body);
});
router.get('/api/tributos/inscricoes/economicas', async (req, res) => {
  const result = await tributos.getInscricoesEconomicas(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});
router.get('/api/tributos/inscricoes/economicas/:inscricao', async (req, res) => {
  const result = await tributos.getInscricaoEconomica(req.params.inscricao);
  res.status(result.status).json(result.body);
});

router.get('/api/tributos/lancamentos', async (req, res) => {
  const { cpfCnpj, ...filtros } = req.query;
  const result = await tributos.getLancamentos(cpfCnpj, filtros);
  res.status(result.status).json(result.body);
});
router.get('/api/tributos/divida-ativa', async (req, res) => {
  const { cpfCnpj, ...filtros } = req.query;
  const result = await tributos.getDividaAtiva(cpfCnpj, filtros);
  res.status(result.status).json(result.body);
});

router.get('/api/tributos/parcelamentos', async (req, res) => {
  const result = await tributos.getParcelamentos(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/acordos/simular', async (req, res) => {
  const result = await tributos.simularAcordo(req.body);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/acordos/formalizar', async (req, res) => {
  const result = await tributos.formalizarAcordo(req.body);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/acordos/:acordoId/cancelar', async (req, res) => {
  const result = await tributos.cancelarAcordo(req.params.acordoId, (req.body || {}).motivo);
  res.status(result.status).json(result.body);
});

router.post('/api/tributos/documentos/segunda-via', async (req, res) => {
  const result = await tributos.emitirSegundaVia(req.body);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/documentos/guia-unificada', async (req, res) => {
  const result = await tributos.emitirGuiaUnificada(req.body);
  res.status(result.status).json(result.body);
});

router.post('/api/tributos/certidoes/emitir', async (req, res) => {
  const result = await tributos.emitirCertidao(req.body);
  res.status(result.status).json(result.body);
});
router.get('/api/tributos/certidoes/autenticar/:codigo', async (req, res) => {
  const result = await tributos.autenticarCertidao(req.params.codigo);
  res.status(result.status).json(result.body);
});

router.get('/api/tributos/alvaras', async (req, res) => {
  const result = await tributos.getAlvaras(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});
router.get('/api/tributos/alvaras/:inscricao/elegibilidade', async (req, res) => {
  const result = await tributos.getElegibilidadeAlvara(req.params.inscricao);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/alvaras/emitir', async (req, res) => {
  const result = await tributos.emitirAlvara(req.body);
  res.status(result.status).json(result.body);
});

router.get('/api/tributos/cga', async (req, res) => {
  const result = await tributos.getCga(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/cga/emitir', async (req, res) => {
  const result = await tributos.emitirCga(req.body);
  res.status(result.status).json(result.body);
});

router.post('/api/tributos/itiv/calcular', async (req, res) => {
  const result = await tributos.calcularItiv(req.body);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/itiv/emitir-guia', async (req, res) => {
  const result = await tributos.emitirGuiaItiv(req.body);
  res.status(result.status).json(result.body);
});

router.get('/api/tributos/nfse', async (req, res) => {
  const result = await tributos.getNfse(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/nfse/emitir', async (req, res) => {
  const result = await tributos.emitirNfse(req.body);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/nfse/:numero/cancelar', async (req, res) => {
  const result = await tributos.cancelarNfse(req.params.numero, (req.body || {}).motivo);
  res.status(result.status).json(result.body);
});

router.get('/api/tributos/protocolos', async (req, res) => {
  const result = await tributos.getProtocolos(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/protocolos', async (req, res) => {
  const result = await tributos.abrirProtocolo(req.body);
  res.status(result.status).json(result.body);
});
router.get('/api/tributos/protocolos/:numero', async (req, res) => {
  const result = await tributos.getProtocolo(req.params.numero);
  res.status(result.status).json(result.body);
});

router.get('/api/tributos/notificacoes', async (req, res) => {
  const result = await tributos.getNotificacoes(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});
router.get('/api/tributos/notificacoes/:id', async (req, res) => {
  const result = await tributos.getNotificacao(req.params.id);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/notificacoes/:id/ciencia', async (req, res) => {
  const result = await tributos.registrarCiencia(req.params.id);
  res.status(result.status).json(result.body);
});

router.get('/api/tributos/caixa-postal', async (req, res) => {
  const result = await tributos.getCaixaPostal(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});
router.post('/api/tributos/caixa-postal/:id/marcar-lida', async (req, res) => {
  const result = await tributos.marcarCaixaPostalLida(req.params.id);
  res.status(result.status).json(result.body);
});

router.get('/api/tributos/pagamentos', async (req, res) => {
  const result = await tributos.getPagamentos(req.query.cpfCnpj);
  res.status(result.status).json(result.body);
});

module.exports = router;
