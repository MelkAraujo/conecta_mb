const express = require('express');
const router = express.Router();
const PessoaController = require('../controllers/PessoaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/cadastro', PessoaController.store);

// ROTA PROTEGIDA (Só quem tem token válido acessa)
// Observe que o authMiddleware vem ANTES do Controller
router.get('/perfil', authMiddleware, (req, res) => {
    res.json({ message: "Você acessou uma rota protegida!", seu_id: req.usuarioId });
});

module.exports = router;
     