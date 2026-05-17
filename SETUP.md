# Instruções de Configuração - AI Marketing Hub

## Pré-requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (ou Docker)
- Docker e Docker Compose (opcional)

## Setup com Docker (Recomendado)

### 1. Clonar o Repositório
```bash
git clone <repo-url>
cd ai_marketing_hub
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
```

### 3. Iniciar os Containers
```bash
docker-compose up -d
```

Este comando inicia:
- PostgreSQL (porta 5432)
- Backend FastAPI (porta 8000)
- Frontend React (porta 5173)

### 4. Verificar o Status
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

---

## Setup Manual (Desenvolvimento Local)

### Backend

#### 1. Criar Ambiente Virtual Python
```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate
```

#### 2. Instalar Dependências
```bash
pip install -r requirements.txt
```

#### 3. Configurar Banco de Dados
```bash
# Criar banco de dados PostgreSQL
createdb ai_marketing_hub

# Executar migrations (quando implementadas)
alembic upgrade head
```

#### 4. Executar API
```bash
uvicorn app.main:app --reload
```

A API estará em `http://localhost:8000`

### Frontend

#### 1. Instalar Dependências
```bash
cd frontend
npm install
```

#### 2. Executar Servidor de Desenvolvimento
```bash
npm run dev
```

A aplicação estará em `http://localhost:5173`

---

## Estrutura de Pastas

```
ai_marketing_hub/
├── backend/
│   ├── app/
│   │   ├── models/           # Modelos SQLAlchemy
│   │   ├── schemas/          # Schemas Pydantic
│   │   ├── endpoints/        # Endpoints/Rotas
│   │   ├── services/         # Lógica de negócio
│   │   ├── core/             # Configurações
│   │   └── main.py           # Entrada da API
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/            # Páginas/Views
│   │   ├── services/         # Serviços API
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── database/
│   └── init.sql              # Script inicial do BD
└── docker-compose.yml
```

---

## Variáveis de Ambiente

Criar arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://admin:admin123@localhost:5432/ai_marketing_hub

# API
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=true

# Security
SECRET_KEY=your-secret-key

# Social Media & Integrations
# TWITTER_API_KEY=
# FACEBOOK_API_KEY=
# TWILIO_ACCOUNT_SID=
```

---

## Comandos Úteis

### Docker
```bash
# Visualizar logs
docker-compose logs -f

# Parar containers
docker-compose down

# Recriar containers
docker-compose up -d --build

# Acessar shell do backend
docker-compose exec backend bash

# Acessar psql
docker-compose exec db psql -U admin -d ai_marketing_hub
```

### Backend
```bash
# Instalar novo pacote
pip install <package-name>
pip freeze > requirements.txt

# Executar testes (quando implementados)
pytest
```

### Frontend
```bash
# Adicionar novo pacote
npm install <package-name>

# Build para produção
npm run build

# Preview de produção
npm run preview
```

---

## Próximos Passos

1. **Models**: Implementar modelos SQLAlchemy em `backend/app/models/`
2. **Schemas**: Criar schemas Pydantic em `backend/app/schemas/`
3. **Endpoints**: Implementar rotas em `backend/app/endpoints/`
4. **Services**: Adicionar lógica de integração em `backend/app/services/`
5. **Components**: Criar componentes React em `frontend/src/components/`
6. **Pages**: Implementar páginas em `frontend/src/pages/`

---

## Suporte

Para dúvidas ou problemas, verifique:
- Logs do Docker/terminal
- Documentação da API: http://localhost:8000/docs
- Console do navegador (frontend)

