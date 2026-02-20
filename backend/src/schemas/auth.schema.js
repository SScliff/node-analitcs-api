const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres!').max(100),
    email: z.email('Email inválido!'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres!'),
}).strict();

const loginSchema = z.object({
    email: z.email('Email inválido!'),
    password: z.string().min(1, 'Senha é obrigatória!'),
}).strict();

module.exports = { registerSchema, loginSchema };
