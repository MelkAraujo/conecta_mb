const db = require('../config/database');

class UnidadeService {
    // 1. SOLICITAR VÍNCULO (Agora com Transação e Auditoria)
    async vincularPessoa(dados, realizadoPorId) {
        const { pessoa_id, unidade_id, tipo_vinculo, data_inicio } = dados;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Verificar duplicidade
            const [existe] = await connection.execute(
                'SELECT id FROM unidade_pessoas WHERE pessoa_id = ? AND unidade_id = ? AND data_fim IS NULL',
                [pessoa_id, unidade_id]
            );

            if (existe.length > 0) {
                throw new Error('Esta pessoa já possui um vínculo ativo ou pendente com esta unidade.');
            }

            // Inserir Vínculo (Status nasce como Pendente)
            const [result] = await connection.execute(
                `INSERT INTO unidade_pessoas (pessoa_id, unidade_id, tipo_vinculo, data_inicio, status) 
                 VALUES (?, ?, ?, ?, 'Pendente')`,
                [pessoa_id, unidade_id, tipo_vinculo, data_inicio || new Date()]
            );

            const vinculoId = result.insertId;

            // Gravar no Histórico (Auditoria da Solicitação)
            await connection.execute(
                `INSERT INTO historico_vinculos 
                 (vinculo_id, pessoa_id, unidade_id, acao, realizado_por, observacao) 
                 VALUES (?, ?, ?, 'Solicitação', ?, ?)`,
                [vinculoId, pessoa_id, unidade_id, realizadoPorId, 'Morador solicitou vínculo pelo sistema']
            );

            await connection.commit();
            return { id: vinculoId, ...dados, status: 'Pendente' };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async listarPorUnidade(unidade_id) {
        const [moradores] = await db.execute(
            `SELECT p.nome, up.tipo_vinculo, up.data_inicio, up.status
             FROM unidade_pessoas up
             JOIN pessoas p ON up.pessoa_id = p.id
             WHERE up.unidade_id = ? AND up.data_fim IS NULL`,
            [unidade_id]
        );
        return moradores;
    }

    // 2. DECIDIR VÍNCULO (Aprovar/Rejeitar)
    async decidirVinculo(vinculoId, novoStatus, administradorId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Atualiza o vínculo com a coluna correta: decidido_por
            const [updateRes] = await connection.execute(
                `UPDATE unidade_pessoas 
                 SET status = ?, decidido_por = ?, data_decisao = NOW() 
                 WHERE id = ?`,
                [novoStatus, administradorId, vinculoId]
            );

            if (updateRes.affectedRows === 0) {
                throw new Error('Vínculo não encontrado.');
            }

            // Busca dados para o log
            const [v] = await connection.execute(
                'SELECT pessoa_id, unidade_id FROM unidade_pessoas WHERE id = ?', 
                [vinculoId]
            );

            // Grava na trilha de auditoria
            await connection.execute(
                `INSERT INTO historico_vinculos 
                 (vinculo_id, pessoa_id, unidade_id, acao, realizado_por, observacao) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    vinculoId, 
                    v[0].pessoa_id, 
                    v[0].unidade_id, 
                    novoStatus, 
                    administradorId, 
                    `Decisão tomada pelo administrador(a).`
                ]
            );

            await connection.commit();
            return { message: `Vínculo atualizado para ${novoStatus}` };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async listarPendentes() {
    const query = `
        SELECT 
            up.id AS vinculo_id,
            p.nome AS morador_nome,
            u.numero AS unidade_numero,
            u.bloco AS unidade_bloco,
            up.tipo_vinculo,
            up.data_inicio,
            up.status
        FROM unidade_pessoas up
        JOIN pessoas p ON up.pessoa_id = p.id
        JOIN unidades u ON up.unidade_id = u.id
        WHERE up.status = 'Pendente'
        ORDER BY up.data_inicio ASC`;

        const [rows] = await db.execute(query);
        return rows;
    }

    
    async buscarUnidades(termo) {
        // Se não mandar termo, busca tudo. Se mandar, busca por aproximação
        const parametro = termo ? `%${termo}%` : '%';

        const query = `
            SELECT 
                u.id AS unidade_id,
                u.numero,
                u.bloco,
                p.nome AS morador_nome,
                up.tipo_vinculo,
                up.status
            FROM unidades u
            LEFT JOIN unidade_pessoas up ON u.id = up.unidade_id AND (up.data_fim IS NULL OR up.status = 'Pendente')
            LEFT JOIN pessoas p ON up.pessoa_id = p.id
            WHERE u.numero LIKE ?
            ORDER BY u.bloco, u.numero`;

        const [rows] = await db.execute(query, [parametro]);

        // Formatação inteligente para o Front-end (Agrupando moradores por unidade)
        const unidadesAgrupadas = rows.reduce((acc, row) => {
            // Se a unidade ainda não está no array final, adicionamos
            if (!acc[row.unidade_id]) {
                acc[row.unidade_id] = {
                    id: row.unidade_id,
                    numero: row.numero,
                    bloco: row.bloco,
                    moradores: []
                };
            }
            
            // Se tiver morador vinculado, coloca dentro do array de moradores daquela unidade
            if (row.morador_nome) {
                acc[row.unidade_id].moradores.push({
                    nome: row.morador_nome,
                    vinculo: row.tipo_vinculo,
                    status: row.status
                });
            }
            
            return acc;
        }, {});

        // Converte o objeto de volta para um array limpo
        return Object.values(unidadesAgrupadas);
    }
}

module.exports = new UnidadeService();