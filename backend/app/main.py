from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import auth, conteudo, admin
from dotenv import load_dotenv

load_dotenv()

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Marketing Hub API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(auth.router, prefix="/api/auth", tags=["autenticacao"])
app.include_router(conteudo.router, prefix="/api/conteudo", tags=["conteudo"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(auth.router, prefix="/api/auth", tags=["autenticacao"])

@app.get("/")
def root():
    return {"message": "AI Marketing Hub API"}

@app.get("/health")
def health():
    return {"status": "healthy"}