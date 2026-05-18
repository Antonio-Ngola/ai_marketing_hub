import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Stats {
  total_usuarios: number;
  total_conteudos: number;
  total_aprovados: number;
  total_pendentes: number;
  usuarios_ativos: number;
  usuarios_inativos: number;
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    total_usuarios: 0,
    total_conteudos: 0,
    total_aprovados: 0,
    total_pendentes: 0,
    usuarios_ativos: 0,
    usuarios_inativos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarStats();
  }, []);

  const carregarStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="card" style={{ textAlign: 'center' }}>Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <nav style={{ background: '#667eea', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>🎛️ Painel Administrativo</h2>
        <div>
          <span style={{ marginRight: '15px' }}>👑 Admin: {user?.nome}</span>
          <button 
            onClick={() => navigate('/admin/usuarios')} 
            style={{ marginRight: '10px', padding: '8px 16px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            👥 Usuários
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ marginRight: '10px', padding: '8px 16px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 16px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            🚪 Sair
          </button>
        </div>
      </nav>

      {/* Conteúdo */}
      <div className="container">
        <h1>Dashboard Administrativo</h1>
        <p style={{ marginBottom: '30px', color: '#666' }}>Visão geral do sistema e métricas principais</p>

        {/* Cards de estatísticas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #667eea' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>👥</div>
            <h3>Total de Usuários</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>{stats.total_usuarios}</p>
          </div>

          <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #48bb78' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📝</div>
            <h3>Total de Conteúdos</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#48bb78' }}>{stats.total_conteudos}</p>
          </div>

          <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #4299e1' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
            <h3>Conteúdos Aprovados</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4299e1' }}>{stats.total_aprovados}</p>
          </div>

          <div className="card" style={{ textAlign: 'center', borderTop: '4px solid #ed8936' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
            <h3>Conteúdos Pendentes</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ed8936' }}>{stats.total_pendentes}</p>
          </div>
        </div>

        {/* Segunda linha de cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🟢</div>
            <h3>Usuários Ativos</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#48bb78' }}>{stats.usuarios_ativos}</p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>🔴</div>
            <h3>Usuários Inativos</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#e53e3e' }}>{stats.usuarios_inativos}</p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📊</div>
            <h3>Taxa de Aprovação</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
              {stats.total_conteudos > 0 
                ? Math.round((stats.total_aprovados / stats.total_conteudos) * 100) 
                : 0}%
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>📈</div>
            <h3>Média por Usuário</h3>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#9c27b0' }}>
              {stats.total_usuarios > 0 
                ? (stats.total_conteudos / stats.total_usuarios).toFixed(1) 
                : 0}
            </p>
          </div>
        </div>

        {/* Botão de navegação */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/admin/usuarios')} 
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '16px' }}
          >
            👥 Gerenciar Usuários
          </button>
        </div>
      </div>
    </div>
  );
};