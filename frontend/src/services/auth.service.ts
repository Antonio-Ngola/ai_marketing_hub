import api from './api'

type RegisterPayload = {
  name: string
  email: string
  phone: string
  password: string
}

export async function register(payload: RegisterPayload) {
  return api.post('/api/auth/register', payload)
}

type LoginPayload = { email: string; password: string }

export async function login(payload: LoginPayload) {
  return api.post('/api/auth/login', payload)
}

export async function me() {
  return api.get('/api/auth/me')
}

export default { register, login, me }
