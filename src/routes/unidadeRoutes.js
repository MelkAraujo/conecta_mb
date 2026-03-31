const authMiddleware = require('../middlewares/authMiddleware');
const UnidadeController = require('../controllers/UnidadeController');
const router = require('express').Router();
const roleMiddleware = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * /api/unidades/vincular:
 *   post:
 *     summary: Solicita o vínculo de uma pessoa a uma unidade.
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pessoa_id
 *               - unidade_id
 *               - tipo_vinculo
 *             properties:
 *               pessoa_id:
 *                 type: integer
 *                 description: ID da pessoa no sistema.
 *                 example: 1
 *               unidade_id:
 *                 type: integer
 *                 description: ID da unidade (apartamento).
 *                 example: 15
 *               tipo_vinculo:
 *                 type: string
 *                 description: Relação com a unidade.
 *                 example: "Morador"
 *               data_inicio:
 *                 type: string
 *                 format: date
 *                 description: Data de início do vínculo.
 *                 example: "2026-03-31"
 *     responses:
 *       201:
 *         description: Solicitação de vínculo criada com status Pendente.
 *       400:
 *         description: Erro de validação ou vínculo já existente.
 *       401:
 *         description: Não autorizado (Token ausente ou inválido).
 */
router.post('/vincular', authMiddleware, UnidadeController.vincular);

/**
 * @swagger
 * /api/unidades/vincular/{id}/status:
 *   patch:
 *     summary: Aprova ou rejeita uma solicitação de vínculo.
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do vínculo que será atualizado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - novoStatus
 *             properties:
 *               novoStatus:
 *                 type: string
 *                 enum: [Aprovado, Rejeitado]
 *                 description: A decisão do Síndico.
 *                 example: "Aprovado"
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso.
 *       400:
 *         description: Erro na requisição ou status inválido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 */
router.patch('/vincular/:id/status', authMiddleware, roleMiddleware(['Administrador(a)', 'Sindico(a)']), UnidadeController.atualizarStatus);

/**
 * @swagger
 * /api/unidades/pendentes:
 *   get:
 *     summary: Lista todos os vínculos que aguardam aprovação.
 *     tags: [Unidades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retorna a lista de pendências.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 */
router.get('/pendentes', authMiddleware, roleMiddleware(['Administrador(a)', 'Sindico(a)']), UnidadeController.listarPendentes);

/**
 * @swagger
 * /api/unidades/busca:
 *   get:
 *     summary: Busca unidades e seus moradores.
 *     tags: [Unidades]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Número da unidade para busca.
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Acesso negado.
 */
router.get('/busca', authMiddleware, roleMiddleware(['Administrador(a)', 'Sindico(a)']), UnidadeController.buscar);

module.exports = router;