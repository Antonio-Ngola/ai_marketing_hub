"""Script simples para adicionar/atualizar um usuário com is_admin=True.
Uso: python create_admin.py [email] [senha]
Se não informado, usa admin@example.com / Admin1234!
"""
import sys
from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models import Usuario
import hashlib
import secrets


def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex() + ":" + salt


def main():
    email = sys.argv[1] if len(sys.argv) > 1 else 'admin@example.com'
    senha = sys.argv[2] if len(sys.argv) > 2 else 'Admin1234!'

    # Adiciona a coluna is_admin caso não exista
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;"))
        conn.commit()

    session = SessionLocal()
    try:
        user = session.query(Usuario).filter(Usuario.email == email).first()
        if user:
            user.is_admin = True
            session.add(user)
            session.commit()
            print(f"Usuário existente atualizado para admin: {email}")
        else:
            hashed = get_password_hash(senha)
            new = Usuario(nome='Administrador', email=email, senha_hash=hashed, telefone=None, is_admin=True)
            session.add(new)
            session.commit()
            print(f"Usuário admin criado: {email} / {senha}")
    except Exception as e:
        print('Erro:', e)
    finally:
        session.close()


if __name__ == '__main__':
    main()
