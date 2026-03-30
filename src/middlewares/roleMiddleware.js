const db = require('../config/database');

module.exports = (papeisPermitidos) => {
    return async (req, res, next) => {
        try {
            // Buscamos o papel do usuário no banco
            const [rows] = await db.execute(
                `SELECT p.nome FROM usuarios u 
                 JOIN papeis p ON u.papel_id = p.id 
                 WHERE u.id = ?`,
                [req.usuarioId]
            );

            if (rows.length === 0 || !papeisPermitidos.includes(rows[0].nome)) {
                return res.status(403).json({ error: 'Acesso negado: privilégios insuficientes.' });
            }

            next();
        } catch (error) {
            res.status(500).json({ error: 'Erro ao validar permissões de acesso.' });
        }
    };
};