from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Usuario
from app.api.auth import get_current_user
from app.core.upload import save_upload_file, delete_upload_file

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload de arquivo (imagem, vídeo, documento)"""
    
    # Verificar tipo de arquivo
    allowed_types = ["image/", "video/", "application/pdf", "text/plain"]
    if not any(file.content_type.startswith(t) for t in allowed_types):
        raise HTTPException(status_code=400, detail="Tipo de arquivo não suportado")
    
    # Salvar arquivo
    file_info = save_upload_file(file)
    
    return {
        "message": "Arquivo enviado com sucesso",
        "file": file_info
    }

@router.post("/upload-multiple")
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload de múltiplos arquivos"""
    
    uploaded_files = []
    for file in files:
        file_info = save_upload_file(file)
        uploaded_files.append(file_info)
    
    return {
        "message": f"{len(uploaded_files)} arquivos enviados",
        "files": uploaded_files
    }

@router.delete("/upload/{filename}")
def delete_file(
    filename: str,
    subfolder: str = "documents",
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletar arquivo"""
    
    from app.core.upload import UPLOAD_DIR
    file_path = UPLOAD_DIR / subfolder / filename
    
    if delete_upload_file(str(file_path)):
        return {"message": "Arquivo deletado com sucesso"}
    else:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")