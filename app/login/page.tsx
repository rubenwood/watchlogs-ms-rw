'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--wl-bg)' }}>
        <form className="wl-card-form" onSubmit={handleLogin}>

        <input className="wl-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className="wl-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />

        <button className="wl-btn-primary" type="submit">Log in</button>
        <button className="wl-btn-secondary" type="button" onClick={handleSignUp}>Sign up</button>

        {error && <p className="wl-error">{error}</p>}
        </form>
    </div>
    )
}