const db = require('../services/db/db.service');
const logger = require('../services/monitoring/logger.service');

exports.create = async (req, res) => {
    const { title, description, priority } = req.body;
    try {
        const query = 'INSERT INTO tickets (title, description, priority) VALUES ($1, $2, $3) RETURNING *';
        const values = [title, description, priority || 'Baixa'];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        logger.error({ module: 'tickets', action: 'create_failed', error }, 'Erro ao criar ticket');
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

exports.findAll = async (req, res) => {
    try {
        // Simulated delay to study performance and pool usage under load
        const delay = parseInt(req.query.delay) || 0;
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await db.query('SELECT * FROM tickets ORDER BY created_at DESC');
        logger.debug({ module: 'tickets', action: 'list_success' }, 'Tickets buscados com sucesso');

        if (!result) {
            logger.error({ module: 'tickets', action: 'list_db_undefined' }, 'O serviço de DB retornou undefined!');
            return res.status(500).json({ error: 'Erro no banco' });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error({ module: 'tickets', action: 'list_failed', error }, 'Erro ao buscar tickets');
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

exports.findOne = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM tickets WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ticket não encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        logger.error({ module: 'tickets', action: 'find_one_failed', id, error }, 'Erro ao buscar ticket');
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { status, priority, title, description } = req.body;
    try {
        const query = 'UPDATE tickets SET status = $1, priority = $2, title = $3, description = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *';
        const result = await db.query(query, [status, priority, title, description, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ticket não encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        logger.error({ module: 'tickets', action: 'update_failed', id, error }, 'Error updating ticket');
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.delete = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ticket não encontrado' });
        }
        res.status(200).json({ message: 'Ticket apagado com sucesso' });
    } catch (error) {
        logger.error({ module: 'tickets', action: 'delete_failed', id, error }, 'Error deleting ticket');
        res.status(500).json({ error: 'Internal server error' });
    }
};
