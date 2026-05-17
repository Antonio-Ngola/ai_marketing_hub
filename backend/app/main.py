from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth
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

@app.get("/")
async def root():
    return {"message": "Welcome to AI Marketing Hub API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}