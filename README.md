# AI Marketing Hub

Plataforma de gestão de campanhas de marketing com integrações de IA.

## Estrutura do Projeto

```
ai-marketing-hub/
├── backend/                # API FastAPI
├── frontend/               # Aplicação React + TypeScript
└── database/               # Scripts de inicialização do banco
```

## Quickstart

### 1. Preparar o Backend

```bash
cd ai_marketing_hub/backend
python -m venv .venv
```

No Windows PowerShell:

```bash
.\.venv\Scripts\Activate.ps1
```

No Windows CMD:

```cmd
.\.venv\Scripts\activate.bat
```

No macOS/Linux:

```bash
source .venv/bin/activate
```

### 2. Instalar dependências do backend

Certifique-se de estar com o ambiente virtual ativado antes de instalar:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Se houver erro no `pip`, use `python -m pip install -r requirements.txt`.

### 3. Configurar variáveis de ambiente

Copie o arquivo de exemplo do backend e defina as variáveis:

```bash
copy .env.example .env
```

No macOS/Linux:

```bash
cp .env.example .env
```

Edite `backend/.env` para ajustar os valores do PostgreSQL, JWT e integrações.

### 4. Criar o banco PostgreSQL local

Crie o banco de dados local no PostgreSQL:

```bash
createdb ai_marketing_hub
```

Se você já tiver um banco configurado, altere `DATABASE_URL` em `backend/.env`.

### 5. Iniciar o backend

```bash
uvicorn app.main:app --reload
```

A API estará disponível em `http://localhost:8000`

### 6. Preparar e iniciar o frontend

Em outro terminal:

```bash
cd ai_marketing_hub/frontend
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## Estrutura do Projeto

```
ai-marketing-hub/
├── backend/                # API FastAPI
│   ├── app/                # código da aplicação
│   ├── requirements.txt    # dependências Python
│   └── .env.example        # exemplo de variáveis de ambiente do backend
├── frontend/               # Aplicação React + TypeScript
└── database/               # Scripts de inicialização do banco
```

## Requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

## Observações

- A variável `DATABASE_URL` deve apontar para o seu PostgreSQL local.
- Use `backend/.env` para carregar variáveis de ambiente no backend.
- Se houver problemas com `pip install`, certifique-se de ativar `.venv` antes.

## Licença

MIT
