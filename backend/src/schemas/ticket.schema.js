const { z } = require('zod');

const ticketSchema = z.object({
    title: z.string().min(10, 'Titulo deve ter mais de 10 caracteres!').max(100),
    description: z.string().min(10, 'Descrição deve ter mais de 10 caracteres!').optional(),
    priority: z.enum(['Baixa', 'Média', 'Alta']),
}).strict();

module.exports = { ticketSchema };