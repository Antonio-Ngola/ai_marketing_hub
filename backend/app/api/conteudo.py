from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Usuario, Conteudo
from app.schemas.conteudo import ConteudoCreate, ConteudoUpdate, ConteudoResponse
from app.core.security import get_current_user

router = APIRouter()

@router.post("/", response_model=ConteudoResponse)
def criar_conteudo(
    conteudo: ConteudoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Criar um novo conteúdo"""
    db_conteudo = Conteudo(
        **conteudo.model_dump(),
        usuario_id=current_user.id
    )
    db.add(db_conteudo)
    db.commit()
    db.refresh(db_conteudo)
    return db_conteudo

@router.get("/", response_model=List[ConteudoResponse])
def listar_conteudos(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Listar todos os conteúdos do usuário"""
    query = db.query(Conteudo).filter(Conteudo.usuario_id == current_user.id)
    
    if status:
        query = query.filter(Conteudo.status == status)
    
    conteudos = query.offset(skip).limit(limit).all()
    return conteudos

@router.get("/{conteudo_id}", response_model=ConteudoResponse)
def obter_conteudo(
    conteudo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Obter um conteúdo específico"""
    conteudo = db.query(Conteudo).filter(
        Conteudo.id == conteudo_id,
        Conteudo.usuario_id == current_user.id
    ).first()
    
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    return conteudo

@router.put("/{conteudo_id}", response_model=ConteudoResponse)
def atualizar_conteudo(
    conteudo_id: int,
    conteudo_update: ConteudoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Atualizar um conteúdo"""
    conteudo = db.query(Conteudo).filter(
        Conteudo.id == conteudo_id,
        Conteudo.usuario_id == current_user.id
    ).first()
    
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    
    for key, value in conteudo_update.model_dump(exclude_unset=True).items():
        setattr(conteudo, key, value)
    
    db.commit()
    db.refresh(conteudo)
    return conteudo

@router.delete("/{conteudo_id}")
def deletar_conteudo(
    conteudo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Deletar um conteúdo"""
    conteudo = db.query(Conteudo).filter(
        Conteudo.id == conteudo_id,
        Conteudo.usuario_id == current_user.id
    ).first()
    
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    
    db.delete(conteudo)
    db.commit()
    return {"message": "Conteúdo deletado com sucesso"}

@router.patch("/{conteudo_id}/aprovar")
def aprovar_conteudo(
    conteudo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Aprovar um conteúdo pendente"""
    conteudo = db.query(Conteudo).filter(
        Conteudo.id == conteudo_id,
        Conteudo.usuario_id == current_user.id
    ).first()
    
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    
    conteudo.status = "aprovado"
    db.commit()
    return {"message": "Conteúdo aprovado com sucesso"}

@router.patch("/{conteudo_id}/rejeitar")
def rejeitar_conteudo(
    conteudo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Rejeitar um conteúdo pendente"""
    conteudo = db.query(Conteudo).filter(
        Conteudo.id == conteudo_id,
        Conteudo.usuario_id == current_user.id
    ).first()
    
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    
    conteudo.status = "rejeitado"
    db.commit()
    return {"message": "Conteúdo rejeitado"}
# Adicione estas funções no final do arquivo backend/app/api/conteudo.py

@router.put("/{conteudo_id}", response_model=ConteudoResponse)
def atualizar_conteudo(
    conteudo_id: int,
    conteudo_update: ConteudoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Atualizar um conteúdo"""
    conteudo = db.query(Conteudo).filter(
        Conteudo.id == conteudo_id,
        Conteudo.usuario_id == current_user.id
    ).first()
    
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    
    for key, value in conteudo_update.model_dump(exclude_unset=True).items():
        setattr(conteudo, key, value)
    
    db.commit()
    db.refresh(conteudo)
    return conteudo

@router.delete("/{conteudo_id}")
def deletar_conteudo(
    conteudo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Deletar um conteúdo"""
    conteudo = db.query(Conteudo).filter(
        Conteudo.id == conteudo_id,
        Conteudo.usuario_id == current_user.id
    ).first()
    
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    
    db.delete(conteudo)
    db.commit()
    return {"message": "Conteúdo deletado com sucesso"}

@router.patch("/{conteudo_id}/aprovar")
def aprovar_conteudo(
    conteudo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Aprovar um conteúdo pendente"""
    conteudo = db.query(Conteudo).filter(
        Conteudo.id == conteudo_id,
        Conteudo.usuario_id == current_user.id
    ).first()
    
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    
    conteudo.status = "aprovado"
    db.commit()
    return {"message": "Conteúdo aprovado com sucesso"}

@router.patch("/{conteudo_id}/rejeitar")
def rejeitar_conteudo(
    conteudo_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    """Rejeitar um conteúdo pendente"""
    conteudo = db.query(Conteudo).filter(
        Conteudo.id == conteudo_id,
        Conteudo.usuario_id == current_user.id
    ).first()
    
    if not conteudo:
        raise HTTPException(status_code=404, detail="Conteúdo não encontrado")
    
    conteudo.status = "rejeitado"
    db.commit()
    return {"message": "Conteúdo rejeitado"}