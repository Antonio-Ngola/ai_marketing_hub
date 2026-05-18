import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Stats {
  total_conteudos: number;
  total_aprovados: number;
  total_pendentes: number;
  total_publicados: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    total_conteudos: 0,
    total_aprovados: 0,
    total_pendentes: 0,
    total_publicados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarStats();
  }, []);

  const carregarStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/conteudo/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      setStats({
        total_conteudos: data.length,
        total_aprovados: data.filter((c: any) => c.status === 'aprovado').length,
        total_pendentes: data.filter((c: any) => c.status === 'pendente').length,
        total_publicados: data.filter((c: any) => c.status === 'publicado').length,
      });
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.is_admin === true || user?.email === 'admin@aimarketing.com';

  const cards = [
    { title: 'Total de Conteúdos', value: stats.total_conteudos, icon: '📝', color: '#667eea', bg: '#eef2ff' },
    { title: 'Aprovados', value: stats.total_aprovados, icon: '✅', color: '#48bb78', bg: '#f0fff4' },
    { title: 'Pendentes', value: stats.total_pendentes, icon: '⏳', color: '#ed8936', bg: '#fffaf0' },
    { title: 'Publicados', value: stats.total_publicados, icon: '📢', color: '#4299e1', bg: '#ebf8ff' },
  ];

  const socialCards = [
    { name: 'Instagram', icon: '📸', color: '#e4405f', connected: false },
    { name: 'Facebook', icon: '👍', color: '#1877f2', connected: false },
    { name: 'Twitter', icon: '🐦', color: '#1da1f2', connected: false },
    { name: 'WhatsApp', icon: '💬', color: '#25d366', connected: false },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* Header */}
      <nav style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '15px 30px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🎨 AI Marketing Hub</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤</span>
            <span>{user?.nome}</span>
          </span>
          <button 
            onClick={() => navigate('/conteudo')} 
            style={{ 
              padding: '8px 20px', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer'
            }}
          >
            📝 Conteúdos
          </button>
          {isAdmin && (
            <button 
              onClick={() => navigate('/admin')} 
              style={{ 
                padding: '8px 20px', 
                background: '#48bb78', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer'
              }}
            >
              👑 Admin
            </button>
          )}
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: '8px 20px', 
              background: '#e53e3e', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer'
            }}
          >
            🚪 Sair
          </button>
        </div>
      </nav>

      {/* Conteúdo */}
      <div style={{ padding: '30px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', color: '#2d3748', marginBottom: '8px' }}>
            Bem-vindo, {user?.nome}! 👋
          </h1>
          <p style={{ color: '#718096' }}>Aqui está o resumo das suas atividades no AI Marketing Hub.</p>
        </div>

        {/* Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          {cards.map((card, index) => (
            <div key={index} style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              borderLeft: `4px solid ${card.color}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#718096', fontSize: '14px' }}>{card.title}</p>
                  {loading ? (
                    <div style={{ width: '60px', height: '32px', background: '#e2e8f0', borderRadius: '4px' }} />
                  ) : (
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2d3748' }}>{card.value}</p>
                  )}
                </div>
                <div style={{ color: card.color, fontSize: '40px' }}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Redes Sociais */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '15px' }}>📱 Redes Sociais</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            {socialCards.map((social, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ color: social.color, fontSize: '30px' }}>{social.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold' }}>{social.name}</p>
                  <p style={{ fontSize: '12px', color: '#a0aec0' }}>❌ Não conectado</p>
                </div>
                <button style={{
                  padding: '6px 12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}>
                  Conectar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Atividades */}
        <div>
          <h2 style={{ fontSize: '20px', color: '#2d3748', marginBottom: '15px' }}>📊 Atividades Recentes</h2>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Carregando...</div>
            ) : stats.total_conteudos === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: '#718096', marginBottom: '15px' }}>🎯 Você ainda não tem nenhum conteúdo criado.</p>
                <button onClick={() => navigate('/conteudo')} style={{
                  padding: '10px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  Criar meu primeiro conteúdo
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: '15px', background: '#f0fff4', borderRadius: '10px' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#48bb78' }}>{stats.total_aprovados}</p>
                    <p style={{ fontSize: '12px' }}>Aprovados</p>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '15px', background: '#fffaf0', borderRadius: '10px' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ed8936' }}>{stats.total_pendentes}</p>
                    <p style={{ fontSize: '12px' }}>Pendentes</p>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: '15px', background: '#ebf8ff', borderRadius: '10px' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4299e1' }}>{stats.total_publicados}</p>
                    <p style={{ fontSize: '12px' }}>Publicados</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;