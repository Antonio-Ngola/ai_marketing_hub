import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Conteudo {
  id: number;
  tipo_conteudo: string;
  texto_conteudo: string;
  status: string;
  criado_em: string;
}

const ConteudoList: React.FC = () => {
  const [conteudos, setConteudos] = useState<Conteudo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    carregarConteudos();
  }, []);

  const carregarConteudos = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/conteudo/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setConteudos(data);
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'aprovado': return '#48bb78';
      case 'pendente': return '#ed8936';
      case 'rejeitado': return '#e53e3e';
      case 'publicado': return '#4299e1';
      default: return '#a0aec0';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'aprovado': return '✅ Aprovado';
      case 'pendente': return '⏳ Pendente';
      case 'rejeitado': return '❌ Rejeitado';
      case 'publicado': return '📢 Publicado';
      default: return status;
    }
  };

  const isAdmin = user?.is_admin === true;

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este conteúdo?')) {
      try {
        const response = await fetch(`http://localhost:8000/api/conteudo/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          await carregarConteudos();
        }
      } catch (error) {
        console.error('Erro ao deletar:', error);
      }
    }
  };

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
        <h1 style={{ margin: 0, fontSize: '24px' }}>📝 Gerenciar Conteúdos</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>Olá, {user?.nome}!</span>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ 
              padding: '8px 20px', 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer'
            }}
          >
            📊 Dashboard
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
            onClick={logout} 
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: '#2d3748', marginBottom: '8px' }}>Meus Conteúdos</h1>
            <p style={{ color: '#718096' }}>Gerencie todos os seus conteúdos criados</p>
          </div>
          <button 
            onClick={() => navigate('/conteudo/novo')}
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
            ➕ Criar novo conteúdo
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '15px' }}>
            Carregando conteúdos...
          </div>
        ) : conteudos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '15px' }}>
            <p style={{ fontSize: '18px', color: '#718096', marginBottom: '20px' }}>
              🎯 Você ainda não tem nenhum conteúdo criado.
            </p>
            <button 
              onClick={() => navigate('/conteudo/novo')}
              style={{
                padding: '10px 24px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Criar meu primeiro conteúdo
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {conteudos.map((conteudo) => (
              <div key={conteudo.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        background: getStatusColor(conteudo.status), 
                        color: 'white', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {getStatusText(conteudo.status)}
                      </span>
                      <span style={{ 
                        background: '#e2e8f0', 
                        color: '#4a5568', 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px'
                      }}>
                        #{conteudo.id}
                      </span>
                    </div>
                    <p style={{ color: '#2d3748', marginBottom: '10px', lineHeight: '1.5' }}>
                      {conteudo.texto_conteudo || 'Sem conteúdo textual'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#a0aec0' }}>
                      📅 Criado em: {new Date(conteudo.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      style={{ 
                        padding: '8px 16px', 
                        background: '#4299e1', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(conteudo.id)}
                      style={{ 
                        padding: '8px 16px', 
                        background: '#e53e3e', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConteudoList;