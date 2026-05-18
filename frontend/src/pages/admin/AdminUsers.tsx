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
  criado_em: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const { user, logout } = useAuth();
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
      showMessage('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        showMessage(`Usuário ${currentStatus ? 'desativado' : 'ativado'} com sucesso!`, 'success');
        await carregarUsuarios();
      }
    } catch (error) {
      showMessage('Erro ao alterar status', 'error');
    }
  };

  const toggleAdminStatus = async (userId: number, isAdmin: boolean) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_admin: !isAdmin })
      });
      
      if (response.ok) {
        showMessage(`Usuário agora é ${!isAdmin ? 'Administrador' : 'Usuário Padrão'}!`, 'success');
        await carregarUsuarios();
      }
    } catch (error) {
      showMessage('Erro ao alterar permissão', 'error');
    }
  };

  const deleteUser = async (userId: number, userName: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
      try {
        const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          showMessage(`Usuário ${userName} deletado com sucesso!`, 'success');
          await carregarUsuarios();
        }
      } catch (error) {
        showMessage('Erro ao deletar usuário', 'error');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="card" style={{ textAlign: 'center' }}>Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <nav style={{ background: '#667eea', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>👥 Gerenciar Usuários</h2>
        <div>
          <button 
            onClick={() => navigate('/admin')} 
            style={{ marginRight: '10px', padding: '8px 16px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            📊 Voltar ao Admin
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ marginRight: '10px', padding: '8px 16px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            🏠 Dashboard
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
        <h1>👥 Gerenciar Usuários</h1>
        <p style={{ marginBottom: '20px', color: '#666' }}>Gerencie todos os usuários da plataforma</p>

        {/* Mensagem de feedback */}
        {message && (
          <div className="card" style={{ 
            marginBottom: '20px', 
            background: messageType === 'success' ? '#48bb78' : '#e53e3e', 
            color: 'white',
            padding: '10px',
            borderRadius: '5px'
          }}>
            {message}
          </div>
        )}

        {/* Estatísticas rápidas */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '15px' }}>
            <strong>Total:</strong> {users.length}
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '15px' }}>
            <strong>👑 Admins:</strong> {users.filter(u => u.is_admin).length}
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '15px' }}>
            <strong>🟢 Ativos:</strong> {users.filter(u => u.is_ativo).length}
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '15px' }}>
            <strong>🔴 Inativos:</strong> {users.filter(u => !u.is_ativo).length}
          </div>
        </div>

        {/* Tabela de usuários */}
        <div className="card" style={{ overflowX: 'auto', padding: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
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
                  <td style={{ padding: '12px' }}>
                    <strong>{userItem.nome}</strong>
                    {userItem.id === user?.id && <span style={{ marginLeft: '5px', fontSize: '12px', color: '#667eea' }}>(Você)</span>}
                  </td>
                  <td style={{ padding: '12px' }}>{userItem.email}</td>
                  <td style={{ padding: '12px' }}>{userItem.telefone || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: userItem.is_ativo ? '#48bb78' : '#e53e3e',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      display: 'inline-block'
                    }}>
                      {userItem.is_ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      background: userItem.is_admin ? '#667eea' : '#a0aec0',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      display: 'inline-block'
                    }}>
                      {userItem.is_admin ? '👑 Admin' : '👤 Usuário'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => toggleUserStatus(userItem.id, userItem.is_ativo)}
                        style={{
                          padding: '6px 12px',
                          background: userItem.is_ativo ? '#e53e3e' : '#48bb78',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {userItem.is_ativo ? '🔴 Desativar' : '🟢 Ativar'}
                      </button>
                      
                      <button
                        onClick={() => toggleAdminStatus(userItem.id, userItem.is_admin)}
                        disabled={userItem.id === user?.id}
                        style={{
                          padding: '6px 12px',
                          background: userItem.is_admin ? '#a0aec0' : '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: userItem.id === user?.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          opacity: userItem.id === user?.id ? 0.5 : 1
                        }}
                        title={userItem.id === user?.id ? "Não é possível alterar seu próprio tipo" : ""}
                      >
                        {userItem.is_admin ? '👤 Remover Admin' : '👑 Tornar Admin'}
                      </button>
                      
                      <button
                        onClick={() => deleteUser(userItem.id, userItem.nome)}
                        disabled={userItem.id === user?.id}
                        style={{
                          padding: '6px 12px',
                          background: '#e53e3e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: userItem.id === user?.id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          opacity: userItem.id === user?.id ? 0.5 : 1
                        }}
                        title={userItem.id === user?.id ? "Não é possível deletar seu próprio usuário" : ""}
                      >
                        🗑️ Deletar
                      </button>
                    </div>
                  </td>
                 </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};