const PessoaService = require('../services/PessoaService');

class PessoaController {
    async store(req, res) {
        try {
            const novoUsuario = await PessoaService.cadastrarCompleto(req.body);
            return res.status(201).json({
                message: "Cadastro realizado com sucesso!",
                data: novoUsuario
            });
        } catch (error) {
            // Tratamento simples de erro para CPF ou E-mail já existentes
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ error: "CPF ou E-mail já cadastrado no sistema." });
            }
            return res.status(500).json({ error: "Erro interno no servidor." });
        }
    }
}

module.exports = new PessoaController();
  