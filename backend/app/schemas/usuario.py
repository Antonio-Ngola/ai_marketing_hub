from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    is_admin: Optional[bool] = False

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioResponse(UsuarioBase):
    id: int
    is_ativo: bool
    criado_em: datetime
    is_admin: Optional[bool] = False
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str