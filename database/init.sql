-- =============================================
-- AI MARKETING HUB - ESTRUTURA DO BANCO DE DADOS
-- =============================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABELA: usuarios
-- =============================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    is_admin BOOLEAN DEFAULT FALSE,
    is_ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para atualizar atualizado_em
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER atualizar_usuarios_timestamp 
    BEFORE UPDATE ON usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION atualizar_timestamp();

-- =============================================
-- 2. TABELA: contas_sociais
-- =============================================
CREATE TABLE contas_sociais (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    plataforma VARCHAR(50) NOT NULL,
    id_pagina_perfil VARCHAR(100) NOT NULL,
    nome_pagina_perfil VARCHAR(255),
    token_acesso TEXT NOT NULL,
    token_atualizacao TEXT,
    token_expiracao_em TIMESTAMP,
    is_ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, plataforma, id_pagina_perfil)
);

CREATE TRIGGER atualizar_contas_sociais_timestamp 
    BEFORE UPDATE ON contas_sociais 
    FOR EACH ROW 
    EXECUTE FUNCTION atualizar_timestamp();

-- =============================================
-- 3. TABELA: conteudos
-- =============================================
CREATE TABLE conteudos (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    conta_social_id INT REFERENCES contas_sociais(id) ON DELETE SET NULL,
    tipo_conteudo VARCHAR(20) NOT NULL CHECK (tipo_conteudo IN ('texto', 'imagem', 'video', 'carrossel', 'story')),
    texto_conteudo TEXT,
    url_midia TEXT,
    id_publico_midia VARCHAR(255),
    legenda TEXT,
    hashtags TEXT[],
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'publicado', 'falhou')),
    agendado_para TIMESTAMP,
    publicado_em TIMESTAMP,
    mensagem_erro TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER atualizar_conteudos_timestamp 
    BEFORE UPDATE ON conteudos 
    FOR EACH ROW 
    EXECUTE FUNCTION atualizar_timestamp();

-- =============================================
-- 4. TABELA: aprovacoes
-- =============================================
CREATE TABLE aprovacoes (
    id SERIAL PRIMARY KEY,
    conteudo_id INT NOT NULL REFERENCES conteudos(id) ON DELETE CASCADE,
    aprovado_por VARCHAR(100),
    metodo_aprovacao VARCHAR(20) DEFAULT 'sms' CHECK (metodo_aprovacao IN ('sms', 'email', 'app')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('aprovado', 'rejeitado', 'pendente')),
    comentarios TEXT,
    aprovado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endereco_ip INET,
    user_agent TEXT
);

-- =============================================
-- 5. TABELA: campanhas
-- =============================================
CREATE TABLE campanhas (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('promocao', 'sorteio', 'anuncio', 'engajamento', 'conscientizacao')),
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    orcamento DECIMAL(10, 2),
    publico_alvo JSONB,
    status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('rascunho', 'ativa', 'pausada', 'concluida', 'cancelada')),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT validar_datas CHECK (data_fim >= data_inicio)
);

CREATE TRIGGER atualizar_campanhas_timestamp 
    BEFORE UPDATE ON campanhas 
    FOR EACH ROW 
    EXECUTE FUNCTION atualizar_timestamp();

-- =============================================
-- 6. TABELA: posts_campanha
-- =============================================
CREATE TABLE posts_campanha (
    id SERIAL PRIMARY KEY,
    campanha_id INT NOT NULL REFERENCES campanhas(id) ON DELETE CASCADE,
    conteudo_id INT NOT NULL REFERENCES conteudos(id) ON DELETE CASCADE,
    agendado_para TIMESTAMP NOT NULL,
    publicado_em TIMESTAMP,
    metricas_engajamento JSONB,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campanha_id, conteudo_id)
);

-- =============================================
-- 7. TABELA: metricas
-- =============================================
CREATE TABLE metricas (
    id SERIAL PRIMARY KEY,
    conteudo_id INT REFERENCES conteudos(id) ON DELETE CASCADE,
    campanha_id INT REFERENCES campanhas(id) ON DELETE CASCADE,
    conta_social_id INT REFERENCES contas_sociais(id) ON DELETE SET NULL,
    data_metrica DATE DEFAULT CURRENT_DATE,
    impressoes INT DEFAULT 0,
    alcance INT DEFAULT 0,
    engajamento INT DEFAULT 0,
    curtidas INT DEFAULT 0,
    compartilhamentos INT DEFAULT 0,
    comentarios INT DEFAULT 0,
    cliques INT DEFAULT 0,
    ctr DECIMAL(5, 2),
    coletado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (conteudo_id IS NOT NULL OR campanha_id IS NOT NULL)
);

-- =============================================
-- 8. TABELA: tarefas_agendadas
-- =============================================
CREATE TABLE tarefas_agendadas (
    id SERIAL PRIMARY KEY,
    tarefa_id VARCHAR(100) UNIQUE,
    tipo_tarefa VARCHAR(50) NOT NULL,
    conteudo_id INT REFERENCES conteudos(id) ON DELETE SET NULL,
    campanha_id INT REFERENCES campanhas(id) ON DELETE SET NULL,
    agendado_para TIMESTAMP NOT NULL,
    executado_em TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'executado', 'falhou', 'cancelado')),
    tentativas INT DEFAULT 0,
    mensagem_erro TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 9. TABELA: notificacoes
-- =============================================
CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    conteudo_id INT REFERENCES conteudos(id) ON DELETE SET NULL,
    tipo_notificacao VARCHAR(20) NOT NULL CHECK (tipo_notificacao IN ('aprovacao_solicitada', 'publicado', 'falhou', 'alerta_campanha')),
    canal VARCHAR(20) NOT NULL CHECK (canal IN ('sms', 'email', 'push')),
    destinatario VARCHAR(100) NOT NULL,
    assunto VARCHAR(255),
    mensagem TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'entregue', 'falhou')),
    enviado_em TIMESTAMP,
    mensagem_erro TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 10. TABELA: logs_sistema
-- =============================================
CREATE TABLE logs_sistema (
    id BIGSERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('info', 'aviso', 'erro', 'debug')),
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    endereco_ip INET,
    user_agent TEXT,
    dados_extra JSONB,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES ADICIONAIS
-- =============================================
CREATE INDEX idx_conteudos_status_agendado ON conteudos(status, agendado_para) WHERE status = 'pendente';
CREATE INDEX idx_campanhas_usuario_status ON campanhas(usuario_id, status);
CREATE INDEX idx_contas_sociais_usuario_id ON contas_sociais(usuario_id);
CREATE INDEX idx_contas_sociais_plataforma ON contas_sociais(plataforma);
CREATE INDEX idx_conteudos_usuario_id ON conteudos(usuario_id);
CREATE INDEX idx_conteudos_status ON conteudos(status);
CREATE INDEX idx_conteudos_agendado_para ON conteudos(agendado_para);
CREATE INDEX idx_campanhas_datas ON campanhas(data_inicio, data_fim);
CREATE INDEX idx_notificacoes_status ON notificacoes(status);
CREATE INDEX idx_logs_criado_em ON logs_sistema(criado_em);

-- =============================================
-- VIEWS ÚTEIS
-- =============================================
CREATE VIEW view_conteudos_pendentes AS
SELECT 
    c.id AS conteudo_id,
    c.texto_conteudo,
    c.tipo_conteudo,
    c.agendado_para,
    u.nome AS usuario_nome,
    u.telefone,
    cs.plataforma,
    cs.nome_pagina_perfil
FROM conteudos c
JOIN usuarios u ON c.usuario_id = u.id
LEFT JOIN contas_sociais cs ON c.conta_social_id = cs.id
WHERE c.status = 'pendente'
ORDER BY c.criado_em DESC;

-- =============================================
-- COMENTÁRIOS
-- =============================================
COMMENT ON TABLE usuarios IS 'Usuários do sistema';
COMMENT ON TABLE contas_sociais IS 'Contas conectadas às redes sociais';
COMMENT ON TABLE conteudos IS 'Conteúdo gerado aguardando aprovação/publicação';
COMMENT ON TABLE aprovacoes IS 'Registro de aprovações via SMS, email ou app';
COMMENT ON TABLE campanhas IS 'Campanhas de marketing';
COMMENT ON TABLE metricas IS 'Métricas de performance';