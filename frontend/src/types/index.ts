export interface User {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  is_ativo: boolean;
  is_admin: boolean;
  criado_em: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Conteudo {
  id: number;
  usuario_id: number;
  tipo_conteudo: string;
  texto_conteudo?: string;
  status: string;
  criado_em: string;
}