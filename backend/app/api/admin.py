from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Usuario, Conteudo
from app.api.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

# Schema sem o campo telefone obrigatório
class AdminUserResponse(BaseModel):
    id: int
    nome: str
    email: str
    is_ativo: bool
    is_admin: bool = False
    criado_em: datetime
    
    class Config:
        from_attributes = True

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

@router.get("/users/{user_id}")
def obter_usuario(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_admin)
):
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return usuario

@router.put("/users/{user_id}")
def atualizar_usuario(
    user_id: int,
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_admin)
):
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if 'nome' in user_data:
        usuario.nome = user_data['nome']
    if 'email' in user_data:
        usuario.email = user_data['email']
    if 'is_admin' in user_data:
        usuario.is_admin = user_data['is_admin']
    
    db.commit()
    db.refresh(usuario)
    
    return {"message": "Usuário atualizado com sucesso"}

@router.patch("/users/{user_id}/toggle-status")
def toggle_usuario_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verificar_admin)
):
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
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    if usuario.id == current_user.id:
        raise HTTPException(status_code=400, detail="Não é possível deletar seu próprio usuário")
    
    db.delete(usuario)
    db.commit()
    
    return {"message": "Usuário deletado com sucesso"}