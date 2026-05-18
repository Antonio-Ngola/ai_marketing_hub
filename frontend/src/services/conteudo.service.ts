import api from './api'

type ConteudoPayload = {
  title: string
  description: string
  status?: string
}

export async function getConteudos() {
  return api.get('/api/conteudo/')
}

export async function createConteudo(payload: ConteudoPayload) {
  return api.post('/api/conteudo/', payload)
}

export async function updateConteudo(id: number, payload: ConteudoPayload) {
  return api.put(`/api/conteudo/${id}`, payload)
}

export async function deleteConteudo(id: number) {
  return api.delete(`/api/conteudo/${id}`)
}

export default { getConteudos, createConteudo, updateConteudo, deleteConteudo }
