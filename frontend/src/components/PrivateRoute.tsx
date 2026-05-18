import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Se for admin, redirecionar para admin panel em vez de acessar rotas normais
  const isAdmin = user.is_admin === true || user.email === 'admin@aimarketing.com';
  if (isAdmin) {
    return <Navigate to="/admin" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;