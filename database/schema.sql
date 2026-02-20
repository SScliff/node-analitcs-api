CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Aberto', -- 'Aberto', 'Em Andamento', 'Fechado'
    priority VARCHAR(50) DEFAULT 'Baixa', -- 'Baixa', 'Média', 'Alta'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Placeholder for study: Add indexes later to monitor performance changes
-- CREATE INDEX idx_tickets_status ON tickets(status);
