import React, { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'

const Dashboard: React.FC = () => {
  const ctx = useContext(AuthContext as any)
  return (
    <div style={{ maxWidth: 900, margin: '1.5rem auto' }}>
      <h2>Dashboard</h2>
      <p>Bem-vindo{ctx?.user?.name ? `, ${ctx.user.name}` : ''} ao AI Marketing Hub.</p>
      {ctx?.user?.is_admin && <p>Você é admin — acesse o painel admin.</p>}
    </div>
  )
}

export default Dashboard
