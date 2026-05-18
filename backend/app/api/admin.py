from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Usuario, Conteudo
from app.api.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class AdminUserResponse(BaseModel):
    id: int
    nome: str
    email: str
    telefone: str = None
    is_ativo: bool
    is_admin: bool = False
    criado_em: datetime

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
    
    return {
        "total_usuarios": total_usuarios,
        "total_conteudos": total_conteudos,
        "total_aprovados": 0,
        "total_pendentes": 0,
        "total_publicados": 0,
        "total_rejeitados": 0,
        "total_campanhas": 0,
        "total_redes_sociais": 0,
        "usuarios_ativos": db.query(Usuario).filter(Usuario.is_ativo == True).count(),
        "usuarios_inativos": db.query(Usuario).filter(Usuario.is_ativo == False).count(),
        "crescimento_mensal": []
    }