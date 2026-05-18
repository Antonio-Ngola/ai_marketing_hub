import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client
import os
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
            # Configurações do email
            smtp_server = os.getenv("EMAIL_HOST", "smtp.gmail.com")
            smtp_port = int(os.getenv("EMAIL_PORT", 587))
            sender_email = os.getenv("EMAIL_USER", "")
            sender_password = os.getenv("EMAIL_PASSWORD", "")
            
            if not sender_email:
                # Para desenvolvimento, apenas simular
                print(f"📧 Simulando email para {email}: Código {code}")
                return True
            
            # Criar mensagem
            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = email
            msg['Subject'] = "Código de Verificação - AI Marketing Hub"
            
            body = f"""
            <html>
            <body>
                <h2>Bem-vindo ao AI Marketing Hub! 🎨</h2>
                <p>Seu código de verificação é:</p>
                <h1 style="color: #667eea; font-size: 32px;">{code}</h1>
                <p>Este código é válido por 10 minutos.</p>
                <p>Se não solicitou este código, ignore este email.</p>
                <br>
                <p>Equipe AI Marketing Hub</p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            # Enviar email
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
            server.quit()
            
            return True
        except Exception as e:
            print(f"Erro ao enviar email: {e}")
            return False
    
    @staticmethod
    def send_by_sms(phone: str, code: str) -> bool:
        """Enviar código por SMS usando Twilio"""
        try:
            account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
            twilio_phone = os.getenv("TWILIO_PHONE_NUMBER", "")
            
            if not account_sid:
                # Para desenvolvimento, apenas simular
                print(f"📱 Simulando SMS para {phone}: Código {code}")
                return True
            
            client = Client(account_sid, auth_token)
            message = client.messages.create(
                body=f"Seu código de verificação do AI Marketing Hub é: {code}. Válido por 10 minutos.",
                from_=twilio_phone,
                to=phone
            )
            return True
        except Exception as e:
            print(f"Erro ao enviar SMS: {e}")
            return False
    
    @staticmethod
    def send_by_whatsapp(phone: str, code: str) -> bool:
        """Enviar código por WhatsApp usando Twilio"""
        try:
            account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
            auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
            twilio_whatsapp = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")
            
            if not account_sid:
                # Para desenvolvimento, apenas simular
                print(f"💬 Simulando WhatsApp para {phone}: Código {code}")
                return True
            
            client = Client(account_sid, auth_token)
            message = client.messages.create(
                body=f"Seu código de verificação do AI Marketing Hub é: {code}. Válido por 10 minutos.",
                from_=f"whatsapp:{twilio_whatsapp}",
                to=f"whatsapp:{phone}"
            )
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
        
        if success:
            # Armazenar código com expiração (10 minutos)
            verification_codes[contact] = {
                'code': code,
                'expires_at': datetime.now() + timedelta(minutes=10),
                'method': method
            }
            return True, "Código enviado com sucesso"
        
        return False, "Erro ao enviar código"
    
    @staticmethod
    def verify_code(contact: str, code: str) -> bool:
        """Verificar se o código é válido"""
        stored = verification_codes.get(contact)
        
        if not stored:
            return False
        
        if datetime.now() > stored['expires_at']:
            # Código expirado
            del verification_codes[contact]
            return False
        
        if stored['code'] == code:
            # Código válido
            del verification_codes[contact]
            return True
        
        return False