import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const ctx = useContext(AuthContext)
  if (!ctx) return <Navigate to="/login" />
  if (!ctx.token) return <Navigate to="/login" />
  return children
}

export default PrivateRoute
