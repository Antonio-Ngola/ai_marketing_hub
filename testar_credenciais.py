# testar_credenciais.py
import psycopg2

usuarios = ['postgres', 'admin']
senhas = ['', 'postgres', 'admin', '123456', 'password']

print("🔍 Testando combinações de credenciais...\n")

for usuario in usuarios:
    for senha in senhas:
        senha_display = f"'{senha}'" if senha else "(vazia)"
        try:
            conn = psycopg2.connect(
                host='localhost',
                user=usuario,
                password=senha if senha else None,
                port=5432,
                database='postgres'
            )
            print(f"✅ FUNCIONOU! Usuário: {usuario}, Senha: {senha_display}")
            conn.close()
            break
        except:
            print(f"❌ Falhou: {usuario} / {senha_display}")
    else:
        continue
    break