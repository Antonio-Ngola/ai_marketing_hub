export type Conteudo = {
  id: number
  title: string
  description: string
  status?: string
  author?: string
}

export type User = {
  id: number
  nome?: string
  name?: string
  email: string
  telefone?: string
  is_admin?: boolean
}

export type LoginResponse = {
  access_token: string
  token_type: string
}
