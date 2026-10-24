'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mark } from '@/components/TopBar'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setError(error.message)
    router.push('/')
    router.refresh()
  }

  async function handleSignUp() {
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return setError(error.message)
    setError('Check your email to confirm your account.')
  }

  return (
    <main className="wl-login">
      <form className="wl-card-form" onSubmit={handleLogin}>
        <span className="wl-brand"><Mark />Watchlogs</span>
        <h1>Log in</h1>
        <p>Your log of the films and shows you&apos;ve seen and want to see.</p>

        <div className="wl-field">
          <label htmlFor="wl-email">Email</label>
          <input id="wl-email" className="wl-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="wl-field">
          <label htmlFor="wl-password">Password</label>
          <input id="wl-password" className="wl-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button className="wl-btn-primary" type="submit">Log in</button>
        <button className="wl-btn-secondary" type="button" onClick={handleSignUp}>Sign up</button>

        {error && <p className="wl-error" role="alert">{error}</p>}
      </form>
    </main>
  )
}
