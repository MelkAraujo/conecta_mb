const UnidadeService = require('../services/UnidadeService');

class UnidadeController {
    async vincular(req, res) {
        try {
            // O req.usuarioId vem do seu authMiddleware! 
            // Poderíamos validar se quem está vinculando é um ADMIN.
            const vinculo = await UnidadeService.vincularPessoa(req.body, req.usuarioId);
            return res.status(201).json(vinculo);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }

    async atualizarStatus(req, res) {
        try {
            const { id } = req.params;      // Pega o ID que vem na URL (/vincular/2/status)
            const { novoStatus } = req.body; // Pega 'Aprovado' ou 'Rejeitado' do JSON
            const administradorId = req.usuarioId; // ID do Admin que vem do Token

            // Chamamos o service que já tem a lógica de transação e histórico
            const resultado = await UnidadeService.decidirVinculo(id, novoStatus, administradorId);
            
            return res.json(resultado);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new UnidadeController();