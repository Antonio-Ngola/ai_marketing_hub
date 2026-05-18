import React from 'react'
import { Link } from 'react-router-dom'

const Sidebar: React.FC = () => {
  return (
    <aside style={{ width: 200, padding: 12, borderRight: '1px solid #eee' }}>
      <h3>Admin</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/admin">Dashboard</Link></li>
        <li><Link to="/admin/users">Usuários</Link></li>
      </ul>
    </aside>
  )
}

export default Sidebar
