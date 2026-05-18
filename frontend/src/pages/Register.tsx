import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Lista de países com bandeiras e códigos
const paises = [
  { codigo: '+244', bandeira: '🇦🇴', nome: 'Angola', pais: 'Angola' },
  { codigo: '+351', bandeira: '🇵🇹', nome: 'Portugal', pais: 'Portugal' },
  { codigo: '+55', bandeira: '🇧🇷', nome: 'Brasil', pais: 'Brasil' },
  { codigo: '+238', bandeira: '🇨🇻', nome: 'Cabo Verde', pais: 'Cabo Verde' },
  { codigo: '+245', bandeira: '🇬🇼', nome: 'Guiné-Bissau', pais: 'Guiné-Bissau' },
  { codigo: '+239', bandeira: '🇸🇹', nome: 'São Tomé e Príncipe', pais: 'São Tomé e Príncipe' },
  { codigo: '+258', bandeira: '🇲🇿', nome: 'Moçambique', pais: 'Moçambique' },
  { codigo: '+1', bandeira: '🇺🇸', nome: 'Estados Unidos', pais: 'Estados Unidos' },
  { codigo: '+44', bandeira: '🇬🇧', nome: 'Reino Unido', pais: 'Reino Unido' },
  { codigo: '+33', bandeira: '🇫🇷', nome: 'França', pais: 'França' },
  { codigo: '+49', bandeira: '🇩🇪', nome: 'Alemanha', pais: 'Alemanha' },
  { codigo: '+34', bandeira: '🇪🇸', nome: 'Espanha', pais: 'Espanha' },
  { codigo: '+39', bandeira: '🇮🇹', nome: 'Itália', pais: 'Itália' },
  { codigo: '+86', bandeira: '🇨🇳', nome: 'China', pais: 'China' },
  { codigo: '+81', bandeira: '🇯🇵', nome: 'Japão', pais: 'Japão' },
  { codigo: '+7', bandeira: '🇷🇺', nome: 'Rússia', pais: 'Rússia' },
  { codigo: '+61', bandeira: '🇦🇺', nome: 'Austrália', pais: 'Austrália' },
  { codigo: '+91', bandeira: '🇮🇳', nome: 'Índia', pais: 'Índia' },
  { codigo: '+27', bandeira: '🇿🇦', nome: 'África do Sul', pais: 'África do Sul' },
  { codigo: '+20', bandeira: '🇪🇬', nome: 'Egito', pais: 'Egito' },
  { codigo: '+234', bandeira: '🇳🇬', nome: 'Nigéria', pais: 'Nigéria' },
  { codigo: '+254', bandeira: '🇰🇪', nome: 'Quênia', pais: 'Quênia' },
];

const Register: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [codigoPais, setCodigoPais] = useState('+244'); // Angola como padrão
  const [telefone, setTelefone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (nome.length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres');
      return;
    }
    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }
    if (forcaSenha.porcentagem < 80) {
      setError(`Senha muito fraca (${forcaSenha.porcentagem}%). Atinga pelo menos 80%`);
      return;
    }
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const telefoneCompleto = telefone ? `${codigoPais}${telefone}` : '';
      await register(nome, email, senha, telefoneCompleto);
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao cadastrar. Email pode já estar em uso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#667eea' }}>Criar Conta</h1>
        
        <form onSubmit={handleSubmit}>
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
          
          {/* Medidor de força da senha */}
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
          
          {/* Seletor de país com bandeira */}
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#4a5568', fontWeight: 'bold' }}>
            📞 Telefone (opcional)
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <select
              value={codigoPais}
              onChange={(e) => setCodigoPais(e.target.value)}
              style={{
                width: '35%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: 'white'
              }}
            >
              {paises.map((pais) => (
                <option key={pais.codigo} value={pais.codigo}>
                  {pais.bandeira} {pais.codigo} - {pais.nome}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Número de telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              style={{ width: '65%', padding: '12px', border: '1px solid #ddd', borderRadius: '5px', fontSize: '16px' }}
            />
          </div>
          
          {/* Preview do número completo */}
          {telefone && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '10px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '5px',
              fontSize: '14px',
              color: '#1976d2'
            }}>
              📱 Telefone completo: <strong>{codigoPais}{telefone}</strong>
            </div>
          )}
          
          {error && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '12px', fontSize: '16px' }} 
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
          Já tem conta? <Link to="/login" style={{ color: '#667eea' }}>Faça login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;