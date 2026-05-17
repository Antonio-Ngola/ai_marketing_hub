# backend/app/models.py
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Date, ForeignKey, Numeric, JSON, Index, CheckConstraint, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY, INET
from sqlalchemy.orm import relationship
from app.database import Base

# =============================================
# 1. MODELO: Usuario
# =============================================
class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    telefone = Column(String(20))
    is_ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    contas_sociais = relationship("ContaSocial", back_populates="usuario", cascade="all, delete-orphan")
    conteudos = relationship("Conteudo", back_populates="usuario", cascade="all, delete-orphan")
    campanhas = relationship("Campanha", back_populates="usuario", cascade="all, delete-orphan")
    notificacoes = relationship("Notificacao", back_populates="usuario", cascade="all, delete-orphan")
    logs = relationship("LogSistema", back_populates="usuario")

# =============================================
# 2. MODELO: ContaSocial
# =============================================
class ContaSocial(Base):
    __tablename__ = "contas_sociais"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    plataforma = Column(String(50), nullable=False)
    id_pagina_perfil = Column(String(100), nullable=False)
    nome_pagina_perfil = Column(String(255))
    token_acesso = Column(Text, nullable=False)
    token_atualizacao = Column(Text)
    token_expiracao_em = Column(DateTime)
    is_ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="contas_sociais")
    conteudos = relationship("Conteudo", back_populates="conta_social")
    metricas = relationship("Metrica", back_populates="conta_social")
    
    __table_args__ = (
        UniqueConstraint('usuario_id', 'plataforma', 'id_pagina_perfil', name='uq_conta_social'),
    )

# =============================================
# 3. MODELO: Conteudo
# =============================================
class Conteudo(Base):
    __tablename__ = "conteudos"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    conta_social_id = Column(Integer, ForeignKey("contas_sociais.id", ondelete="SET NULL"))
    tipo_conteudo = Column(String(20), nullable=False)
    texto_conteudo = Column(Text)
    url_midia = Column(Text)
    id_publico_midia = Column(String(255))
    legenda = Column(Text)
    hashtags = Column(ARRAY(String))
    status = Column(String(20), default='pendente')
    agendado_para = Column(DateTime)
    publicado_em = Column(DateTime)
    mensagem_erro = Column(Text)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="conteudos")
    conta_social = relationship("ContaSocial", back_populates="conteudos")
    aprovacoes = relationship("Aprovacao", back_populates="conteudo", cascade="all, delete-orphan")
    metricas = relationship("Metrica", back_populates="conteudo")
    
    __table_args__ = (
        CheckConstraint("tipo_conteudo IN ('texto', 'imagem', 'video', 'carrossel', 'story')", name="ck_tipo_conteudo"),
        CheckConstraint("status IN ('pendente', 'aprovado', 'rejeitado', 'publicado', 'falhou')", name="ck_status_conteudo"),
    )

# [Continue com os outros modelos...]