const authMiddleware = require('../middlewares/authMiddleware');
const UnidadeController = require('../controllers/UnidadeController');
const router = require('express').Router();
const roleMiddleware = require('../middlewares/roleMiddleware'); // Middleware para verificar papéis

// Rota para vincular uma pessoa a uma unidade

router.post('/vincular', authMiddleware, UnidadeController.vincular);
router.patch('/vincular/:id/status', authMiddleware, roleMiddleware(['Administrador(a)', 'Sindico(a)']), UnidadeController.atualizarStatus);

module.exports = router;