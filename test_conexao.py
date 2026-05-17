# test_conexao.py (na raiz do projeto)
import sys
import os

# Adicionar backend ao path para importar configurações
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from dotenv import load_dotenv
import psycopg2
import os

# Carregar .env da pasta backend
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

print("=" * 50)
print("🔍 TESTE DE CONEXÃO COM POSTGRESQL")
print("=" * 50)

print(f"\n📋 Configurações carregadas do .env:")
print(f"   Host: {os.getenv('DB_HOST', 'localhost')}")
print(f"   Porta: {os.getenv('DB_PORT', '5432')}")
print(f"   Usuário: {os.getenv('DB_USER', 'admin')}")
print(f"   Banco: {os.getenv('DB_NAME', 'ai_marketing_hub')}")

try:
    # Tentar conectar
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    print("\n✅ CONEXÃO BEM SUCEDIDA!")
    print("🎉 Banco de dados PostgreSQL está funcionando corretamente!")
    
    # Mostrar versão do PostgreSQL
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()[0]
    print(f"\n📦 Versão do PostgreSQL: {version[:50]}...")
    
    conn.close()
    print("\n✨ Teste concluído com sucesso!")
    
except Exception as e:
    print(f"\n❌ ERRO DE CONEXÃO: {e}")
    print("\n🔧 Soluções possíveis:")
    print("   1. Verifique se o PostgreSQL está rodando:")
    print("      - Windows: 'services.msc' e procure por 'postgresql'")
    print("      - Linux: 'sudo systemctl status postgresql'")
    print("      - Mac: 'brew services list | grep postgres'")
    print("\n   2. Verifique as credenciais no arquivo backend/.env")
    print("   3. Teste manualmente com: psql -U admin -d postgres")