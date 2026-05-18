import api from './api'

export async function getUsers() {
  return api.get('/api/admin/users')
}

export async function updateUser(id: number, data: any) {
  return api.put(`/api/admin/users/${id}`, data)
}

export async function toggleUserStatus(id: number) {
  return api.patch(`/api/admin/users/${id}/toggle-status`)
}

export async function deleteUser(id: number) {
  return api.delete(`/api/admin/users/${id}`)
}

export async function getStats() {
  return api.get('/api/admin/stats')
}

export default { getUsers, updateUser, toggleUserStatus, deleteUser, getStats }
