import React, { createContext, useEffect, useState } from 'react'
import * as authService from '../services/auth.service'

type User = { id?: number; email?: string; name?: string; is_admin?: boolean }

type AuthContextType = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      // set axios header
      (async () => {
        try {
          const res = await authService.me()
          setUser(res.data)
        } catch (e) {
          setToken(null)
          setUser(null)
        }
      })()
    } else {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password })
    const t = res.data?.access_token || res.data?.token || null
    setToken(t)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
