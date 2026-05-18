import os
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException
import uuid
from datetime import datetime

# Configurações
UPLOAD_DIR = Path("uploads")
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
ALLOWED_VIDEO_TYPES = ["video/mp4", "video/mpeg", "video/quicktime"]
ALLOWED_DOCUMENT_TYPES = ["application/pdf", "text/plain"]
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Criar pastas se não existirem
for folder in ["images", "videos", "documents"]:
    (UPLOAD_DIR / folder).mkdir(parents=True, exist_ok=True)

def save_upload_file(file: UploadFile, folder: str = "documents") -> dict:
    """Salva arquivo e retorna informações"""
    
    # Verificar tamanho
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    
    if size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Arquivo muito grande (máx 50MB)")
    
    # Determinar tipo
    if file.content_type in ALLOWED_IMAGE_TYPES:
        subfolder = "images"
    elif file.content_type in ALLOWED_VIDEO_TYPES:
        subfolder = "videos"
    else:
        subfolder = "documents"
    
    # Gerar nome único
    extension = os.path.splitext(file.filename)[1]
    unique_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{extension}"
    
    # Criar caminho
    file_path = UPLOAD_DIR / subfolder / unique_name
    
    # Salvar arquivo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "filename": unique_name,
        "original_name": file.filename,
        "path": str(file_path),
        "url": f"/uploads/{subfolder}/{unique_name}",
        "size": size,
        "content_type": file.content_type,
        "subfolder": subfolder
    }

def delete_upload_file(file_path: str):
    """Deleta arquivo do servidor"""
    if os.path.exists(file_path):
        os.remove(file_path)
        return True
    return False