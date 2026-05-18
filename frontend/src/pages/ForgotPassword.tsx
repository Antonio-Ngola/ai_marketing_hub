import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Código, 3: Nova senha
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);

  const enviarCodigo = async () => {
    if (!email) {
      setError('Digite seu email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setSuccess(`Código enviado para ${email}`);
        setStep(2);
        setTempoRestante(60);
        const timer = setInterval(() => {
          setTempoRestante((prev) => {
            if (prev <= 1) clearInterval(timer);
            return prev - 1;
          });
        }, 1000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Email não encontrado');
      }
    } catch (err) {
      setError('Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  const verificarCodigo = async () => {
    if (!code || code.length !== 6) {
      setError('Digite o código de 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: email, code })
      });

      if (response.ok) {
        setSuccess('Código verificado! Agora crie sua nova senha');
        setStep(3);
      } else {
        const data = await response.json();
        setError(data.detail || 'Código inválido');
      }
    } catch (err) {
      setError('Erro ao verificar código');
    } finally {
      setLoading(false);
    }
  };

  const reenviarCodigo = async () => {
    if (tempoRestante > 0) return;
    await enviarCodigo();
  };

  const redefinirSenha = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword })
      });

      if (response.ok) {
        setSuccess('Senha redefinida com sucesso! Redirecionando para o login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Erro ao redefinir senha');
      }
    } catch (err) {
      setError('Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  const calcularForcaSenha = (senha: string): { porcentagem: number; nivel: string; cor: string } => {
    let pontuacao = 0;
    if (senha.length >= 6) pontuacao += 20;
    if (/[A-Z]/.test(senha)) pontuacao += 20;
    if (/[a-z]/.test(senha)) pontuacao += 20;
    if (/[0-9]/.test(senha)) pontuacao += 20;
    if (/[!@#$%^&*]/.test(senha)) pontuacao += 20;
    
    let nivel = '';
    let cor = '';
    if (pontuacao < 40) { nivel = 'Fraca'; cor = '#f44336'; }
    else if (pontuacao < 80) { nivel = 'Média'; cor = '#ff9800'; }
    else { nivel = 'Forte'; cor = '#4caf50'; }
    
    return { porcentagem: pontuacao, nivel, cor };
  };

  const forcaSenha = calcularForcaSenha(newPassword);

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '450px', maxWidth: '90%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#667eea' }}>
          🔐 Recuperar Senha
        </h1>

        {step === 1 && (
          <>
            <p style={{ marginBottom: '20px', textAlign: 'center', color: '#718096' }}>
              Digite seu email para receber um código de verificação
            </p>
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            />
            {error && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}
            {success && <p style={{ color: 'green', marginBottom: '10px', textAlign: 'center' }}>{success}</p>}
            <button
              onClick={enviarCodigo}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ marginBottom: '10px', textAlign: 'center', color: '#718096' }}>
              Digite o código enviado para <strong>{email}</strong>
            </p>
            <input
              type="text"
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', textAlign: 'center' }}
              maxLength={6}
            />
            {error && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}
            {success && <p style={{ color: 'green', marginBottom: '10px', textAlign: 'center' }}>{success}</p>}
            <button
              onClick={verificarCodigo}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '16px', marginBottom: '10px' }}
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Verificar código'}
            </button>
            <button
              onClick={reenviarCodigo}
              disabled={tempoRestante > 0}
              style={{
                width: '100%',
                padding: '12px',
                background: tempoRestante > 0 ? '#a0aec0' : 'transparent',
                color: tempoRestante > 0 ? '#fff' : '#667eea',
                border: tempoRestante > 0 ? 'none' : '1px solid #667eea',
                borderRadius: '5px',
                cursor: tempoRestante > 0 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {tempoRestante > 0 ? `Reenviar em ${tempoRestante}s` : 'Reenviar código'}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <p style={{ marginBottom: '20px', textAlign: 'center', color: '#718096' }}>
              Digite sua nova senha
            </p>
            <input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            />
            
            {newPassword && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${forcaSenha.porcentagem}%`, height: '100%', background: forcaSenha.cor, transition: 'width 0.3s' }} />
                </div>
                <p style={{ fontSize: '12px', color: forcaSenha.cor, marginTop: '5px' }}>
                  Força: {forcaSenha.nivel} ({forcaSenha.porcentagem}%)
                </p>
              </div>
            )}
            
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            />
            {error && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}
            {success && <p style={{ color: 'green', marginBottom: '10px', textAlign: 'center' }}>{success}</p>}
            <button
              onClick={redefinirSenha}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? 'Redefinindo...' : 'Redefinir senha'}
            </button>
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
            ← Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;