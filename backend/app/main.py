from dotenv import load_dotenv
from app.api import auth, conteudo
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth
from app.api import auth, conteudo, upload
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base

load_dotenv()

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Marketing Hub API")

# CORS Configuration
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth.router, prefix="/api/auth", tags=["autenticacao"])
app.include_router(conteudo.router, prefix="/api/conteudo", tags=["conteudo"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "Welcome to AI Marketing Hub API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}