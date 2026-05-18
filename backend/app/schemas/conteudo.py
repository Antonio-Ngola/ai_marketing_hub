from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ConteudoBase(BaseModel):
    tipo_conteudo: str  # texto, imagem, video, carrossel, story
    texto_conteudo: Optional[str] = None
    url_midia: Optional[str] = None
    legenda: Optional[str] = None
    hashtags: Optional[List[str]] = []
    agendado_para: Optional[datetime] = None

class ConteudoCreate(ConteudoBase):
    conta_social_id: Optional[int] = None

class ConteudoUpdate(ConteudoBase):
    pass

class ConteudoResponse(ConteudoBase):
    id: int
    usuario_id: int
    conta_social_id: Optional[int] = None
    status: str  # pendente, aprovado, rejeitado, publicado, falhou
    publicado_em: Optional[datetime] = None
    mensagem_erro: Optional[str] = None
    criado_em: datetime
    atualizado_em: datetime
    
    class Config:
        from_attributes = True