# test_api.py
import requests

# Registrar usuário
print("📝 Registrando usuário...")
response = requests.post(
    "http://localhost:8000/api/auth/register",
    json={
        "nome": "Toni Ngola",
        "email": "toni@email.com", 
        "senha": "123456",
        "telefone": "976460161"
    }
)
print(f"Status: {response.status_code}")
print(f"Resposta: {response.json()}")

# Fazer login
print("\n🔐 Fazendo login...")
response = requests.post(
    "http://localhost:8000/api/auth/login",
    data={
        "username": "toni@email.com",
        "password": "123456"
    }
)
print(f"Status: {response.status_code}")
print(f"Resposta: {response.json()}")