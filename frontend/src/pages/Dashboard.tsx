import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  return (
    <div style={{ maxWidth: 900, margin: '1.5rem auto' }}>
      <h2>Dashboard</h2>
      <p>Bem-vindo{user?.name ? `, ${user.name}` : ''} ao AI Marketing Hub.</p>
      {user?.is_admin && <p>Você é admin — acesse o painel admin.</p>}
    </div>
  )
}

export default Dashboard
