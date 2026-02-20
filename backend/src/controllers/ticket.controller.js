const db = require('../services/db/db.service');
const AppError = require('../utils/AppError');

exports.create = async (req, res, next) => {
    const { title, description, priority } = req.body;
    try {
        const query = 'INSERT INTO tickets (title, description, priority) VALUES ($1, $2, $3) RETURNING *';
        const values = [title, description, priority || 'Baixa'];
        const result = await db.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

exports.findAll = async (req, res, next) => {
    try {
        const delay = parseInt(req.query.delay) || 0;
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await db.query('SELECT * FROM tickets ORDER BY created_at DESC');

        if (!result) {
            throw new AppError('Falha ao recuperar registros do banco', 500);
        }

        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
};

exports.findOne = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM tickets WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return next(new AppError('Ticket não encontrado', 404));
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    const { id } = req.params;
    const { status, priority, title, description } = req.body;
    try {
        const query = 'UPDATE tickets SET status = $1, priority = $2, title = $3, description = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *';
        const result = await db.query(query, [status, priority, title, description, id]);
        if (result.rows.length === 0) {
            return next(new AppError('Ticket não encontrado para atualização', 404));
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM tickets WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return next(new AppError('Ticket não encontrado para exclusão', 404));
        }
        res.status(200).json({ message: 'Ticket apagado com sucesso' });
    } catch (error) {
        next(error);
    }
};
