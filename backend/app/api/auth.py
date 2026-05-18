from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import hashlib
import secrets
from app.database import get_db
from app.models import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, Token
from app.core.config import settings
from app.core.security import create_access_token, get_current_user
from app.services.verification_service import VerificationService

router = APIRouter()

# Função simples de hash (apenas para teste - NÃO use em produção!)
def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex() + ":" + salt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        stored_hash, salt = hashed_password.split(":")
        new_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode(), salt.encode(), 100000).hex()
        return stored_hash == new_hash
    except:
        return False

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user or not verify_password(password, user.senha_hash):
        return False
    return user

@router.post("/register", response_model=UsuarioResponse)
def register(user: UsuarioCreate, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.senha)
    db_user = Usuario(
        nome=user.nome,
        email=user.email,
        senha_hash=hashed_password,
        telefone=user.telefone
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UsuarioResponse)
def read_users_me(current_user: Usuario = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "nome": current_user.nome,
        "email": current_user.email,
        "telefone": current_user.telefone,
        "is_ativo": current_user.is_ativo,
        "is_admin": getattr(current_user, 'is_admin', False),
        "criado_em": current_user.criado_em
    }

# ==================== VERIFICAÇÃO ====================

@router.post("/send-verification")
def send_verification(
    request: dict,
    db: Session = Depends(get_db)
):
    """Enviar código de verificação"""
    contact = request.get("contact")
    method = request.get("method")
    
    if not contact or not method:
        raise HTTPException(status_code=400, detail="Contact e method são obrigatórios")
    
    # Verificar se o contato já está em uso
    if method == 'email':
        existing_user = db.query(Usuario).filter(Usuario.email == contact).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email já está em uso")
    else:
        existing_user = db.query(Usuario).filter(Usuario.telefone == contact).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Telefone já está em uso")
    
    success, message = VerificationService.send_verification(contact, method)
    
    if not success:
        raise HTTPException(status_code=500, detail=message)
    
    return {"message": message, "contact": contact, "method": method}

@router.post("/verify-code")
def verify_code(
    request: dict,
    db: Session = Depends(get_db)
):
    """Verificar código de autenticação"""
    contact = request.get("contact")
    code = request.get("code")
    
    if not contact or not code:
        raise HTTPException(status_code=400, detail="Contact e code são obrigatórios")
    
    is_valid = VerificationService.verify_code(contact, code)
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Código inválido ou expirado")
    
    return {"message": "Código verificado com sucesso", "verified": True}