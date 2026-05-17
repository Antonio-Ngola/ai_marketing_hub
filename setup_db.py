# setup_db.py (na raiz do projeto)
import sys
import os

# Adicionar backend ao path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

# Carregar .env da pasta backend
env_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
load_dotenv(env_path)

print("=" * 50)
print("🚀 CONFIGURANDO BANCO DE DADOS")
print("=" * 50)

def setup_database():
    # Pegar configurações do .env
    db_user = os.getenv("DB_USER", "admin")
    db_password = os.getenv("DB_PASSWORD", "admin")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "ai_marketing_hub")
    
    print(f"\n📋 Configurações:")
    print(f"   Host: {db_host}:{db_port}")
    print(f"   Usuário: {db_user}")
    print(f"   Banco: {db_name}")
    
    try:
        # Passo 1: Conectar ao PostgreSQL
        print("\n📡 Passo 1: Conectando ao PostgreSQL...")
        conn = psycopg2.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            port=db_port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print("   ✅ Conectado!")
        
        # Passo 2: Criar banco de dados se não existir
        print(f"\n📁 Passo 2: Verificando banco de dados '{db_name}'...")
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        if not cursor.fetchone():
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"   ✅ Banco '{db_name}' criado!")
        else:
            print(f"   ℹ️ Banco '{db_name}' já existe")
        
        cursor.close()
        conn.close()
        
        # Passo 3: Executar script SQL
        print("\n📝 Passo 3: Criando tabelas...")
        
        # Caminho para o arquivo SQL
        sql_file_path = os.path.join(os.path.dirname(__file__), 'database', 'init.sql')
        
        if not os.path.exists(sql_file_path):
            print(f"   ❌ Arquivo não encontrado: {sql_file_path}")
            print("   Certifique-se que o arquivo database/init.sql existe!")
            return False
        
        # Conectar ao banco específico
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        # Ler e executar o SQL
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()
            cursor.execute(sql_script)
            conn.commit()
            print("   ✅ Tabelas criadas com sucesso!")
        
        cursor.close()
        conn.close()
        
        # Passo 4: Verificar tabelas criadas
        print("\n🔍 Passo 4: Verificando tabelas criadas...")
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"\n   📊 Tabelas criadas ({len(tables)}):")
        for table in tables:
            print(f"      - {table[0]}")
        
        cursor.close()
        conn.close()
        
        print("\n" + "=" * 50)
        print("✅ SETUP CONCLUÍDO COM SUCESSO!")
        print("=" * 50)
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        print("\n🔧 Verifique:")
        print("   1. PostgreSQL está rodando?")
        print("   2. Credenciais no backend/.env estão corretas?")
        print("   3. Arquivo database/init.sql existe?")
        return False

if __name__ == "__main__":
    success = setup_database()
    sys.exit(0 if success else 1)