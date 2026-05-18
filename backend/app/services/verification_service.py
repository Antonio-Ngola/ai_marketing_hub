import random
from datetime import datetime, timedelta
from typing import Dict

# Armazenamento temporário de códigos (em produção usar Redis)
verification_codes: Dict[str, dict] = {}

class VerificationService:
    
    @staticmethod
    def generate_code() -> str:
        """Gerar código de 6 dígitos"""
        return str(random.randint(100000, 999999))
    
    @staticmethod
    def send_by_email(email: str, code: str) -> bool:
        """Enviar código por email"""
        try:
            # Para desenvolvimento, apenas simular
            print(f"📧 Simulando email para {email}: Código {code}")
            return True
        except Exception as e:
            print(f"Erro ao enviar email: {e}")
            return False
    
    @staticmethod
    def send_by_sms(phone: str, code: str) -> bool:
        """Enviar código por SMS"""
        try:
            print(f"📱 Simulando SMS para {phone}: Código {code}")
            return True
        except Exception as e:
            print(f"Erro ao enviar SMS: {e}")
            return False
    
    @staticmethod
    def send_by_whatsapp(phone: str, code: str) -> bool:
        """Enviar código por WhatsApp"""
        try:
            print(f"💬 Simulando WhatsApp para {phone}: Código {code}")
            return True
        except Exception as e:
            print(f"Erro ao enviar WhatsApp: {e}")
            return False
    
    @staticmethod
    def send_verification(contact: str, method: str, code: str = None) -> tuple:
        """Enviar código de verificação"""
        if not code:
            code = VerificationService.generate_code()
        
        success = False
        if method == 'email':
            success = VerificationService.send_by_email(contact, code)
        elif method == 'sms':
            success = VerificationService.send_by_sms(contact, code)
        elif method == 'whatsapp':
            success = VerificationService.send_by_whatsapp(contact, code)
        else:
            return False, "Método inválido"
        
        if success:
            # Armazenar código com expiração (10 minutos)
            verification_codes[contact] = {
                'code': code,
                'expires_at': datetime.now() + timedelta(minutes=10),
                'method': method
            }
            print(f"💾 Código armazenado para {contact}: {code} (expira em 10 min)")
            return True, "Código enviado com sucesso"
        
        return False, "Erro ao enviar código"
    
    @staticmethod
    def verify_code(contact: str, code: str, remove: bool = True) -> bool:
        """Verificar se o código é válido
        
        Args:
            contact: Email ou telefone
            code: Código de 6 dígitos
            remove: Se True, remove o código após verificação (padrão True)
        """
        stored = verification_codes.get(contact)
        
        if not stored:
            print(f"❌ Nenhum código encontrado para {contact}")
            return False
        
        if datetime.now() > stored['expires_at']:
            # Código expirado
            print(f"⏰ Código expirado para {contact}")
            del verification_codes[contact]
            return False
        
        if stored['code'] == code:
            # Código válido
            if remove:
                print(f"✅ Código válido para {contact}, removendo do cache")
                del verification_codes[contact]
            else:
                print(f"✅ Código válido para {contact}, mantendo no cache")
            return True
        
        print(f"❌ Código incorreto para {contact}: esperado {stored['code']}, recebido {code}")
        return False