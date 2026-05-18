import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { Login } from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { ConteudoList } from './pages/ConteudoList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rotas protegidas */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/conteudo" element={
            <PrivateRoute>
              <ConteudoList />
            </PrivateRoute>
          } />
          
          {/* Rotas Admin */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/usuarios" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          
          {/* Rota padrão */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;