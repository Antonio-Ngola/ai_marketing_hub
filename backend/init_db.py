# backend/init_db.py
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Carregar variáveis do arquivo .env
load_dotenv()

def init_database():
    # Pegar configurações do .env
    db_user = os.getenv("DB_USER", "admin")
    db_password = os.getenv("DB_PASSWORD", "admin123")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "ai_marketing_hub")
    
    print(f"🔧 Conectando ao PostgreSQL em {db_host}:{db_port} com usuário {db_user}")
    
    try:
        # Conectar ao PostgreSQL (sem banco específico)
        conn = psycopg2.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            port=db_port
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Criar banco de dados se não existir
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
        if not cursor.fetchone():
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"✅ Banco de dados '{db_name}' criado com sucesso!")
        else:
            print(f"ℹ️ Banco de dados '{db_name}' já existe")
        
        cursor.close()
        conn.close()
        
        # Executar script SQL para criar as tabelas
        print("📝 Criando tabelas...")
        
        # Caminho para o arquivo SQL (ajustado para sua estrutura)
        sql_file_path = os.path.join(os.path.dirname(__file__), '..', 'database', 'init.sql')
        
        if not os.path.exists(sql_file_path):
            print(f"❌ Arquivo SQL não encontrado em: {sql_file_path}")
            print("Verifique se o arquivo init.sql existe na pasta database/")
            return
        
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        cursor = conn.cursor()
        
        with open(sql_file_path, 'r', encoding='utf-8') as f:
            sql_script = f.read()
            cursor.execute(sql_script)
            conn.commit()
            print("✅ Tabelas criadas com sucesso!")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        print("\nVerifique se:")
        print("1. O PostgreSQL está rodando")
        print("2. As configurações no .env estão corretas")
        print("3. O usuário e senha estão corretos")

if __name__ == "__main__":
    init_database()