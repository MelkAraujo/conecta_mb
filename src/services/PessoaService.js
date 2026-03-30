const db = require('../config/database');
const bcrypt = require('bcrypt');

class PessoaService {
    async cadastrarCompleto(dados) {
        const { nome, data_nascimento, cpf, email, senha } = dados;
        
        // Iniciamos uma conexão do pool para controlar a transação
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Inserir na tabela Pessoas
            const [resPessoa] = await connection.execute(
                'INSERT INTO pessoas (nome, data_nascimento) VALUES (?, ?)',
                [nome, data_nascimento]
            );
            const pessoaId = resPessoa.insertId;

            // 2. Inserir o CPF na tabela Documentos
            await connection.execute(
                'INSERT INTO documentos (pessoa_id, tipo, numero) VALUES (?, ?, ?)',
                [pessoaId, 'CPF', cpf]
            );

            // 3. Hash da senha e inserção no Usuário
            const saltRounds = 10;
            const senhaHash = await bcrypt.hash(senha, saltRounds);

            await connection.execute(
                'INSERT INTO usuarios (pessoa_id, email, senha_hash) VALUES (?, ?, ?)',
                [pessoaId, email, senhaHash]
            );

            // Se chegou aqui sem erros, confirma as alterações no banco
            await connection.commit();
            return { id: pessoaId, nome, email };

        } catch (error) {
            // Caso ocorra qualquer erro (CPF duplicado, e-mail existente, etc), desfaz tudo
            await connection.rollback();
            throw error; 
        } finally {
            connection.release(); // Libera a conexão de volta para o pool
        }
    }
}

module.exports = new PessoaService();