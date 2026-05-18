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

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [createForm, setCreateForm] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    is_admin: false
  });
  
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    is_admin: false
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  const carregarUsuarios = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      showMessage('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    const token = getToken();
    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o usuário "${userName}"?`)) {
      const token = getToken();
      try {
        const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          showMessage(`Usuário ${userName} deletado com sucesso!`, 'success');
          await carregarUsuarios();
        } else {
          showMessage('Erro ao deletar usuário', 'error');
        }
      } catch (error) {
        showMessage('Erro ao deletar usuário', 'error');
      }
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    try {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      });
      
      if (response.ok) {
        showMessage(`Usuário ${createForm.nome} criado com sucesso!`, 'success');
        setShowCreateModal(false);
        setCreateForm({ nome: '', email: '', senha: '', telefone: '', is_admin: false });
        await carregarUsuarios();
      } else {
        const error = await response.json();
        showMessage(error.detail || 'Erro ao criar usuário', 'error');
      }
    } catch (error) {
      showMessage('Erro ao criar usuário', 'error');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const token = getToken();
    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        showMessage(`Usuário ${editForm.nome} atualizado com sucesso!`, 'success');
        setShowEditModal(false);
        setSelectedUser(null);
        await carregarUsuarios();
      } else {
        showMessage('Erro ao atualizar usuário', 'error');
      }
    } catch (error) {
      showMessage('Erro ao atualizar usuário', 'error');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone || '',
      is_admin: user.is_admin
    });
    setShowEditModal(true);
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
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
      {/* Header */}
      <nav style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: 'white', 
        padding: '15px 30px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2>👥 Gerenciar Usuários</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/admin')} 
            style={{ padding: '8px 20px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            📊 Voltar
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ padding: '8px 20px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            🏠 Dashboard
          </button>
          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 20px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            🚪 Sair
          </button>
        </div>
      </nav>

      <div style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: '#2d3748' }}>Usuários do Sistema</h1>
            <p style={{ color: '#718096' }}>Gerencie todos os usuários da plataforma</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            ➕ Novo Usuário
          </button>
        </div>

        {message && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '12px', 
            background: messageType === 'success' ? '#48bb78' : '#e53e3e', 
            color: 'white', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* Cards de estatísticas */}
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
                      fontSize: '12px'
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
                      fontSize: '12px'
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
                        {userItem.is_ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      <button
                        onClick={() => openEditModal(userItem)}
                        style={{
                          padding: '6px 12px',
                          background: '#4299e1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✏️ Editar
                      </button>
                      {userItem.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(userItem.id, userItem.nome)}
                          style={{
                            padding: '6px 12px',
                            background: '#e53e3e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🗑️ Deletar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criar Usuário */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            width: '500px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px' }}>➕ Criar Novo Usuário</h2>
            <form onSubmit={handleCreateUser}>
              <input
                type="text"
                placeholder="Nome completo"
                value={createForm.nome}
                onChange={(e) => setCreateForm({ ...createForm, nome: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={createForm.senha}
                onChange={(e) => setCreateForm({ ...createForm, senha: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                required
              />
              <input
                type="text"
                placeholder="Telefone (opcional)"
                value={createForm.telefone}
                onChange={(e) => setCreateForm({ ...createForm, telefone: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  checked={createForm.is_admin}
                  onChange={(e) => setCreateForm({ ...createForm, is_admin: e.target.checked })}
                />
                <span>👑 Usuário Administrador</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Criar
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '12px', background: '#a0aec0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Usuário */}
      {showEditModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            width: '500px',
            maxWidth: '90%'
          }}>
            <h2 style={{ marginBottom: '20px' }}>✏️ Editar Usuário</h2>
            <form onSubmit={handleEditUser}>
              <input
                type="text"
                placeholder="Nome completo"
                value={editForm.nome}
                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
                required
              />
              <input
                type="text"
                placeholder="Telefone"
                value={editForm.telefone}
                onChange={(e) => setEditForm({ ...editForm, telefone: e.target.value })}
                style={{ width: '100%', padding: '10px', marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  checked={editForm.is_admin}
                  onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                />
                <span>👑 Usuário Administrador</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Salvar
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ flex: 1, padding: '12px', background: '#a0aec0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;