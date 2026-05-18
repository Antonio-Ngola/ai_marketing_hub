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

export const ConteudoList: React.FC = () => {
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
      case 'rejeitado': return '#f56565';
      case 'publicado': return '#4299e1';
      default: return '#a0aec0';
    }
  };

  const isAdmin = user?.is_admin === true;

  return (
    <div>
      <nav style={{ background: '#667eea', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>AI Marketing Hub</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Olá, {user?.name || 'usuário'}!</span>
          <button onClick={() => navigate('/dashboard')} style={{ marginRight: '10px', padding: '5px 15px', background: '#48bb78', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Dashboard
          </button>
          {isAdmin && (
            <button onClick={() => navigate('/admin')} style={{ marginRight: '10px', padding: '5px 15px', background: '#9c27b0', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Admin
            </button>
          )}
          <button onClick={logout} style={{ padding: '5px 15px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </nav>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Meus Conteúdos</h1>
          <button className="btn-primary" onClick={() => navigate('/conteudo/novo')}>
            + Novo Conteúdo
          </button>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center' }}>Carregando...</div>
        ) : conteudos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <p>Nenhum conteúdo encontrado.</p>
            <button className="btn-primary" style={{ marginTop: '10px' }} onClick={() => navigate('/conteudo/novo')}>
              Criar primeiro conteúdo
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {conteudos.map((conteudo) => (
              <div key={conteudo.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ 
                      background: getStatusColor(conteudo.status), 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '5px', 
                      fontSize: '12px',
                      display: 'inline-block',
                      marginBottom: '10px'
                    }}>
                      {conteudo.status}
                    </span>
                    <p><strong>Tipo:</strong> {conteudo.tipo_conteudo}</p>
                    <p><strong>Conteúdo:</strong> {conteudo.texto_conteudo?.substring(0, 100)}...</p>
                    <p><strong>Criado em:</strong> {new Date(conteudo.criado_em).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <button 
                      style={{ marginRight: '5px', padding: '5px 10px', background: '#4299e1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                      onClick={() => navigate(`/conteudo/${conteudo.id}`)}
                    >
                      Ver
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