import requests
import os

print("=" * 50)
print("TESTANDO CRUD COMPLETO E UPLOAD")
print("=" * 50)

# Login
print("\n🔐 Login...")
login = requests.post(
    "http://localhost:8000/api/auth/login",
    data={"username": "toni@email.com", "password": "123456"}
)
token = login.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("✅ Logado!")

# 1. Criar conteúdo
print("\n📝 1. Criando conteúdo...")
conteudo = requests.post(
    "http://localhost:8000/api/conteudo/",
    json={
        "tipo_conteudo": "texto",
        "texto_conteudo": "Post para testar atualização!",
        "hashtags": ["teste", "python"]
    },
    headers=headers
)
conteudo_id = conteudo.json()["id"]
print(f"✅ Criado ID: {conteudo_id}")

# 2. Atualizar conteúdo
print("\n✏️ 2. Atualizando conteúdo...")
atualizado = requests.put(
    f"http://localhost:8000/api/conteudo/{conteudo_id}",
    json={
        "tipo_conteudo": "texto",
        "texto_conteudo": "Conteúdo ATUALIZADO! 🎉",
        "hashtags": ["teste", "atualizado"]
    },
    headers=headers
)
print(f"✅ Atualizado: {atualizado.json()['texto_conteudo']}")

# 3. Aprovar conteúdo
print("\n✅ 3. Aprovando conteúdo...")
aprovado = requests.patch(
    f"http://localhost:8000/api/conteudo/{conteudo_id}/aprovar",
    headers=headers
)
print(f"✅ {aprovado.json()['message']}")

# 4. Listar conteúdos
print("\n📋 4. Listando conteúdos...")
lista = requests.get("http://localhost:8000/api/conteudo/", headers=headers)
print(f"Total: {len(lista.json())} conteúdos")
for item in lista.json():
    print(f"   - ID: {item['id']} | Status: {item['status']}")

# 5. Upload de arquivo (se tiver imagem)
print("\n📤 5. Testando upload...")
test_file = "test_upload.txt"
with open(test_file, "w") as f:
    f.write("Teste de upload do AI Marketing Hub!")

if os.path.exists(test_file):
    with open(test_file, "rb") as f:
        upload = requests.post(
            "http://localhost:8000/api/upload/upload",
            files={"file": (test_file, f, "text/plain")},
            headers=headers
        )
    print(f"✅ Upload: {upload.json()['message']}")
    os.remove(test_file)

# 6. Deletar conteúdo
print("\n🗑️ 6. Deletando conteúdo...")
deletado = requests.delete(
    f"http://localhost:8000/api/conteudo/{conteudo_id}",
    headers=headers
)
print(f"✅ {deletado.json()['message']}")

print("\n" + "=" * 50)
print("🎉 TODOS OS TESTES PASSARAM!")
print("=" * 50)