import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  is_ativo: boolean;
  is_admin: boolean;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        await carregarUsuarios();
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  return (
    <div>
      <nav style={{ background: '#667eea', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gerenciar Usuários</h2>
        <div>
          <button onClick={() => navigate('/admin')} style={{ marginRight: '10px', padding: '5px 15px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Voltar
          </button>
          <button onClick={logout} style={{ padding: '5px 15px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </nav>

      <div className="container">
        <h1>Usuários do Sistema</h1>
        
        {loading ? (
          <div className="card" style={{ textAlign: 'center' }}>Carregando...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f7fafc' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Telefone</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Tipo</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((userItem) => (
                  <tr key={userItem.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{userItem.id}</td>
                    <td style={{ padding: '12px' }}>{userItem.nome}</td>
                    <td style={{ padding: '12px' }}>{userItem.email}</td>
                    <td style={{ padding: '12px' }}>{userItem.telefone || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: userItem.is_ativo ? '#48bb78' : '#f56565',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '5px',
                        fontSize: '12px'
                      }}>
                        {userItem.is_ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        background: userItem.is_admin ? '#667eea' : '#a0aec0',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '5px',
                        fontSize: '12px'
                      }}>
                        {userItem.is_admin ? 'Admin' : 'Usuário'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button
                        onClick={() => toggleUserStatus(userItem.id)}
                        style={{
                          padding: '5px 10px',
                          background: userItem.is_ativo ? '#f56565' : '#48bb78',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        {userItem.is_ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};