# status_db.py (na raiz do projeto)
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from dotenv import load_dotenv
import psycopg2
import os

load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

print("=" * 50)
print("📊 STATUS DO BANCO DE DADOS")
print("=" * 50)

try:
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cursor = conn.cursor()
    
    # Contar registros em cada tabela
    tables = ['usuarios', 'contas_sociais', 'conteudos', 'campanhas']
    
    print("\n📈 Contagem de registros:")
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"   {table}: {count} registros")
    
    conn.close()
    
except Exception as e:
    print(f"\n❌ Erro ao conectar: {e}")