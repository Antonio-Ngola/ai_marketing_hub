import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsuarios: 0, totalConteudos: 0 });

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
      setStats({
        totalUsuarios: data.total_usuarios || 0,
        totalConteudos: data.total_conteudos || 0
      });
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  return (
    <div>
      <nav style={{ background: '#667eea', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Painel Admin</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Admin: {user?.name || 'admin'}</span>
          <button onClick={() => navigate('/admin/usuarios')} style={{ marginRight: '10px', padding: '5px 15px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Usuários
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px', padding: '5px 15px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Dashboard
          </button>
          <button onClick={logout} style={{ padding: '5px 15px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </nav>

      <div className="container">
        <h1>Dashboard Administrativo</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div className="card">
            <h3>Total de Usuários</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{stats.totalUsuarios}</p>
          </div>
          <div className="card">
            <h3>Total de Conteúdos</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#48bb78' }}>{stats.totalConteudos}</p>
          </div>
        </div>
      </div>
    </div>
  );
};