import requests

print('🔐 Fazendo login...')
login = requests.post(
    'http://localhost:8000/api/auth/login',
    data={'username': 'toni@email.com', 'password': '123456'}
)

if login.status_code != 200:
    print('❌ Falha no login')
    exit()

token = login.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print('✅ Login feito com sucesso!\n')

print('📝 Criando conteúdo...')
conteudo = requests.post(
    'http://localhost:8000/api/conteudo/',
    json={
        'tipo_conteudo': 'texto',
        'texto_conteudo': 'Olá mundo! Este é meu primeiro post! 🚀',
        'hashtags': ['marketing', 'ia', 'automacao']
    },
    headers=headers
)
print(f'Status: {conteudo.status_code}')
if conteudo.status_code == 200:
    print(f'✅ Conteúdo criado: {conteudo.json()}\n')
else:
    print(f'❌ Erro: {conteudo.text}\n')

print('📋 Listando conteúdos...')
lista = requests.get('http://localhost:8000/api/conteudo/', headers=headers)
print(f'Total: {len(lista.json())} conteúdos')
for item in lista.json():
    print(f"  - ID: {item['id']} | Tipo: {item['tipo_conteudo']} | Status: {item['status']}")