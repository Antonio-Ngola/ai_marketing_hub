from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    telefone = Column(String(20))
    is_ativo = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    conteudos = relationship("Conteudo", back_populates="usuario", cascade="all, delete-orphan")

class Conteudo(Base):
    __tablename__ = "conteudos"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    conta_social_id = Column(Integer, nullable=True)
    tipo_conteudo = Column(String(20), nullable=False)
    texto_conteudo = Column(Text, nullable=True)
    url_midia = Column(Text, nullable=True)
    legenda = Column(Text, nullable=True)
    hashtags = Column(ARRAY(String), nullable=True)
    status = Column(String(20), default='pendente')
    agendado_para = Column(DateTime, nullable=True)
    publicado_em = Column(DateTime, nullable=True)
    mensagem_erro = Column(Text, nullable=True)
    criado_em = Column(DateTime, server_default=func.now())
    atualizado_em = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="conteudos")