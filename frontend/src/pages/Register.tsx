import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const paises = [
  { codigo: '+244', bandeira: '🇦🇴', nome: 'Angola' },
  { codigo: '+351', bandeira: '🇵🇹', nome: 'Portugal' },
  { codigo: '+55', bandeira: '🇧🇷', nome: 'Brasil' },
  { codigo: '+238', bandeira: '🇨🇻', nome: 'Cabo Verde' },
  { codigo: '+245', bandeira: '🇬🇼', nome: 'Guiné-Bissau' },
  { codigo: '+239', bandeira: '🇸🇹', nome: 'São Tomé e Príncipe' },
  { codigo: '+258', bandeira: '🇲🇿', nome: 'Moçambique' },
  { codigo: '+1', bandeira: '🇺🇸', nome: 'Estados Unidos' },
  { codigo: '+44', bandeira: '🇬🇧', nome: 'Reino Unido' },
  { codigo: '+33', bandeira: '🇫🇷', nome: 'França' },
  { codigo: '+49', bandeira: '🇩🇪', nome: 'Alemanha' },
  { codigo: '+34', bandeira: '🇪🇸', nome: 'Espanha' },
  { codigo: '+39', bandeira: '🇮🇹', nome: 'Itália' },
  { codigo: '+86', bandeira: '🇨🇳', nome: 'China' },
  { codigo: '+81', bandeira: '🇯🇵', nome: 'Japão' },
  { codigo: '+7', bandeira: '🇷🇺', nome: 'Rússia' },
  { codigo: '+61', bandeira: '🇦🇺', nome: 'Austrália' },
  { codigo: '+91', bandeira: '🇮🇳', nome: 'Índia' },
  { codigo: '+27', bandeira: '🇿🇦', nome: 'África do Sul' },
];

const Register: React.FC = () => {
  const [step, setStep] = useState(1); // 1: Dados, 2: Verificação
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [codigoPais, setCodigoPais] = useState('+244');
  const [telefone, setTelefone] = useState('');
  const [metodoVerificacao, setMetodoVerificacao] = useState('email');
  const [codigoVerificacao, setCodigoVerificacao] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const { register } = useAuth();
  const navigate = useNavigate();

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

  const forcaSenha = calcularForcaSenha(senha);

  const getContact = () => {
    if (metodoVerificacao === 'email') return email;
    return `${codigoPais}${telefone}`;
  };

  const enviarCodigoVerificacao = async () => {
    const contact = getContact();
    if (!contact) {
      setError('Preencha o contato primeiro');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, method: metodoVerificacao })
      });
      
      if (response.ok) {
        setSuccess(`Código enviado para ${contact}`);
        setTempoRestante(60);
        const timer = setInterval(() => {
          setTempoRestante((prev) => {
            if (prev <= 1) clearInterval(timer);
            return prev - 1;
          });
        }, 1000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Erro ao enviar código');
      }
    } catch (err) {
      setError('Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  const verificarCodigo = async () => {
    if (!codigoVerificacao) {
      setError('Digite o código de verificação');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: getContact(), code: codigoVerificacao })
      });
      
      if (response.ok) {
        setSuccess('Código verificado! Finalizando cadastro...');
        setTimeout(() => {
          finalizarCadastro();
        }, 1500);
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

  const finalizarCadastro = async () => {
    try {
      const telefoneCompleto = telefone ? `${codigoPais}${telefone}` : '';
      await register(nome, email, senha, telefoneCompleto);
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao criar conta');
      setStep(1);
    }
  };

  const validarStep1 = () => {
    if (nome.length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres');
      return false;
    }
    if (!email.includes('@')) {
      setError('Email inválido');
      return false;
    }
    if (forcaSenha.porcentagem < 80) {
      setError(`Senha muito fraca (${forcaSenha.porcentagem}%)`);
      return false;
    }
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validarStep1()) {
      setStep(2);
      enviarCodigoVerificacao();
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#667eea' }}>
          {step === 1 ? 'Criar Conta' : 'Verificar Contato'}
        </h1>
        
        {step === 1 ? (
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            <input
              type="text"
              placeholder="Nome completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              required
            />
            
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              required
            />
            
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              required
            />
            
            {senha && (
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
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              required
            />
            
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4a5568', fontWeight: 'bold' }}>
              📞 Telefone (opcional)
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <select
                value={codigoPais}
                onChange={(e) => setCodigoPais(e.target.value)}
                style={{ width: '35%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }}
              >
                {paises.map((pais) => (
                  <option key={pais.codigo} value={pais.codigo}>
                    {pais.bandeira} {pais.codigo}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Número"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                style={{ width: '65%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
              />
            </div>
            
            {error && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}
            
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
              Continuar
            </button>
          </form>
        ) : (
          <div>
            <p style={{ marginBottom: '20px', textAlign: 'center' }}>
              Escolha como receber o código de verificação:
            </p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setMetodoVerificacao('email')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: metodoVerificacao === 'email' ? '#667eea' : '#e2e8f0',
                  color: metodoVerificacao === 'email' ? 'white' : '#4a5568',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📧 Email
              </button>
              <button
                type="button"
                onClick={() => setMetodoVerificacao('sms')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: metodoVerificacao === 'sms' ? '#667eea' : '#e2e8f0',
                  color: metodoVerificacao === 'sms' ? 'white' : '#4a5568',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                📱 SMS
              </button>
              <button
                type="button"
                onClick={() => setMetodoVerificacao('whatsapp')}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: metodoVerificacao === 'whatsapp' ? '#667eea' : '#e2e8f0',
                  color: metodoVerificacao === 'whatsapp' ? 'white' : '#4a5568',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                💬 WhatsApp
              </button>
            </div>
            
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#718096' }}>
              Código será enviado para: <strong>{getContact()}</strong>
            </p>
            
            <input
              type="text"
              placeholder="Digite o código de 6 dígitos"
              value={codigoVerificacao}
              onChange={(e) => setCodigoVerificacao(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px', textAlign: 'center' }}
              maxLength={6}
            />
            
            {error && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}
            {success && <p style={{ color: 'green', marginBottom: '10px', textAlign: 'center' }}>{success}</p>}
            
            <button
              type="button"
              onClick={enviarCodigoVerificacao}
              disabled={loading || tempoRestante > 0}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                background: tempoRestante > 0 ? '#a0aec0' : '#48bb78',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: tempoRestante > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {tempoRestante > 0 ? `Reenviar em ${tempoRestante}s` : 'Reenviar código'}
            </button>
            
            <button
              type="button"
              onClick={verificarCodigo}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Verificar e Cadastrar'}
            </button>
            
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '10px',
                background: 'transparent',
                color: '#667eea',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ← Voltar
            </button>
          </div>
        )}
        
        {step === 1 && (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Já tem conta? <Link to="/login" style={{ color: '#667eea' }}>Faça login</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;