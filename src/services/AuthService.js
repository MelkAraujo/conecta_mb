const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    async login(email, senha) {
        // 1. Busca o usuário pelo e-mail
        const [usuarios] = await db.execute(
            'SELECT * FROM usuarios WHERE email = ? AND ativo = 1',
            [email]
        );

        if (usuarios.length === 0) {
            throw new Error('Usuário ou senha inválidos.');
        }

        const usuario = usuarios[0];

        // 2. Compara a senha enviada com o hash do banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

        if (!senhaValida) {
            throw new Error('Usuário ou senha inválidos.');
        }

        // 3. Gera o Token (O "Crachá")
        const token = jwt.sign(
            { id: usuario.id, pessoa_id: usuario.pessoa_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Expira em 1 dia
        );

        return { token };
    }
}

module.exports = new AuthService();