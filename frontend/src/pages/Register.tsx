import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
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
      await register(nome, email, senha);
      navigate('/dashboard');
    } catch (err) {
      setError('Erro ao cadastrar. Email pode já estar em uso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="card" style={{ width: '450px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#667eea' }}>Criar Conta</h1>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
            required
          />
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
            required
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
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
            style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px' }}
            required
          />
          
          {error && <p style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</p>}
          
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
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