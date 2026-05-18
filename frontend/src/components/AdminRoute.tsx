import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

const AdminRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const ctx = useContext(AuthContext)
  if (!ctx) return <Navigate to="/login" />
  if (!ctx.token) return <Navigate to="/login" />
  if (!ctx.user?.is_admin) return <Navigate to="/" />
  return children
}

export default AdminRoute
