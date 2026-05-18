import React, { useState } from 'react'
import { authService } from '../services/auth.service'
import './register.css'

type Country = {
  code: string
  name: string
  dial: string
  flag: string
}

const COUNTRIES: Country[] = [
  { code: 'AO', name: 'Angola', dial: '+244', flag: '🇦🇴' },
  { code: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },
  { code: 'BR', name: 'Brasil', dial: '+55', flag: '🇧🇷' },
  { code: 'MZ', name: 'Moçambique', dial: '+258', flag: '🇲🇿' },
]

function scorePassword(pw: string) {
  let score = 0
  if (pw.length >= 8) score += 30
  if (/[A-Z]/.test(pw)) score += 20
  if (/[0-9]/.test(pw)) score += 20
  if (/[^A-Za-z0-9]/.test(pw)) score += 20
  if (pw.length >= 12) score += 10
  return Math.min(100, score)
}

const Register: React.FC = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState(COUNTRIES[0].code)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const pwScore = scorePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (password !== confirm) {
      setMessage('A senha e a confirmação não coincidem.')
      return
    }
    if (pwScore < 80) {
      setMessage('A senha deve atingir pelo menos 80% de força.')
      return
    }
    setLoading(true)
    try {
      const sel = COUNTRIES.find((c) => c.code === country)!
      await authService.register({
        nome: name,
        email,
        senha: password,
        telefone: `${sel.dial} ${phone}`,
      })
      setMessage('Cadastro realizado com sucesso. Faça login.')
      setName('')
      setEmail('')
      setPhone('')
      setPassword('')
      setConfirm('')
    } catch (err: any) {
      setMessage(err?.response?.data?.detail || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <h2>Cadastro</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <label>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          E-mail
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="phone-row">
          Telefone
          <div className="phone-input">
            <select value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.dial})
                </option>
              ))}
            </select>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="912345678" />
          </div>
        </label>
        <label>
          Senha
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        <div className="pw-meter">
          <div className="meter-bar" style={{ width: `${pwScore}%` }} />
          <div className="meter-text">Força: {pwScore}%</div>
        </div>

        <label>
          Confirmar Senha
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </label>

        <button type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</button>
        {message && <div className="message">{message}</div>}
      </form>
    </div>
  )
}

export default Register
