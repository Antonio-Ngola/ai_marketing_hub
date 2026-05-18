from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
from app.database import get_db
from app.models import Usuario, Conteudo
from app.core.security import get_current_user
from app.core.security import create_access_token  # Se precisar
from pydantic import BaseModel, EmailStr
import hashlib
import secrets

router = APIRouter()

# Função de hash (copiada do auth.py)
def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex() + ":" + salt

# Schemas
class AdminUserResponse(BaseModel):
    id: int
    nome: str
    email: str
    telefone: str = ""
    is_ativo: bool
    is_admin: bool = False
    criado_em: datetime
    
    class Config:
        from_attributes = True

class AdminUserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    telefone: str = ""
    is_admin: bool = False

class AdminUserUpdate(BaseModel):
    nome: str
    email: EmailStr
    telefone: str = ""
    is_admin: bool = False

def verificar_admin(current_user: Usuario = Depends(get_current_user)):
    if not getattr(current_user, 'is_admin', False) and current_user.email != "admin@aimarketing.com":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores."
        )
    return current_user

@router.get("/users", response_model=List[AdminUserResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_admin)
):
    """Listar todos os usuários"""
    usuarios = db.query(Usuario).all()
    return usuarios

@router.get("/users/{user_id}", response_model=AdminUserResponse)
def obter_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_admin)
):
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario

@router.post("/users", response_model=AdminUserResponse)
def criar_usuario(
    user_data: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_admin)
):
    """Criar um novo usuário"""
    # Verificar se email já existe
    existing_user = db.query(Usuario).filter(Usuario.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já está em uso")
    
    hashed_password = get_password_hash(user_data.senha)
    novo_usuario = Usuario(
        nome=user_data.nome,
        email=user_data.email,
        senha_hash=hashed_password,
        telefone=user_data.telefone,
        is_admin=user_data.is_admin,
        is_ativo=True
    )
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)
    return novo_usuario

@router.put("/users/{user_id}", response_model=AdminUserResponse)
def atualizar_usuario(
    user_id: int,
    user_data: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_admin)
):
    """Atualizar dados de um usuário"""
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    usuario.nome = user_data.nome
    usuario.email = user_data.email
    usuario.telefone = user_data.telefone
    usuario.is_admin = user_data.is_admin
    
    db.commit()
    db.refresh(usuario)
    return usuario

@router.patch("/users/{user_id}/toggle-status")
def toggle_usuario_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_admin)
):
    """Ativar/Inativar um usuário"""
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    usuario.is_ativo = not usuario.is_ativo
    db.commit()
    
    return {
        "message": f"Usuário {'ativado' if usuario.is_ativo else 'inativado'} com sucesso",
        "is_ativo": usuario.is_ativo
    }

@router.delete("/users/{user_id}")
def deletar_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_admin)
):
    """Deletar um usuário permanentemente"""
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if usuario.id == current_user.id:
        raise HTTPException(status_code=400, detail="Não é possível deletar seu próprio usuário")
    
    db.delete(usuario)
    db.commit()
    
    return {"message": "Usuário deletado com sucesso"}

@router.get("/stats")
def obter_estatisticas(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_admin)
):
    """Obter estatísticas do sistema"""
    total_usuarios = db.query(Usuario).count()
    total_conteudos = db.query(Conteudo).count()
    total_aprovados = db.query(Conteudo).filter(Conteudo.status == "aprovado").count()
    total_pendentes = db.query(Conteudo).filter(Conteudo.status == "pendente").count()
    usuarios_ativos = db.query(Usuario).filter(Usuario.is_ativo == True).count()
    usuarios_inativos = total_usuarios - usuarios_ativos
    
    return {
        "total_usuarios": total_usuarios,
        "total_conteudos": total_conteudos,
        "total_aprovados": total_aprovados,
        "total_pendentes": total_pendentes,
        "usuarios_ativos": usuarios_ativos,
        "usuarios_inativos": usuarios_inativos
    }