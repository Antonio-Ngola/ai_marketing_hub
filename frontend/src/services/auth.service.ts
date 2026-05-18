import api from './api';
import { User, LoginResponse } from '../types/index';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // Usar URLSearchParams para form data
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);
    
    const response = await api.post('/api/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  async register(userData: { nome: string; email: string; senha: string; telefone?: string }): Promise<User> {
    const response = await api.post('/api/auth/register', {
      nome: userData.nome,
      email: userData.email,
      senha: userData.senha,
      telefone: userData.telefone || '',
    });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};