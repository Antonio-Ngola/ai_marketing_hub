export type User = {
  id: number
  name: string
  email: string
  is_active?: boolean
  is_admin?: boolean
  phone?: string
}

export type Stats = {
  total_users?: number
  total_content?: number
  pending_approvals?: number
}
