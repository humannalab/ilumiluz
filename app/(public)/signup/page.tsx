'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Erro ao criar conta.')
      return
    }

    // Auto-login após cadastro
    const login = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    if (login?.error) {
      // Conta criada mas login automático falhou — redireciona pro login manual
      router.push('/login?created=1')
      return
    }

    setDone(true)
    setTimeout(() => router.push('/'), 1500)
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl: '/' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--il-off)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
    }}>
      {/* Lado esquerdo — imagem */}
      <div style={{
        backgroundImage: 'url(/joia-hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(30, 26, 20, 0.4)',
        }} />
        <div style={{ position: 'absolute', bottom: 48, left: 48, right: 48 }}>
          <p style={{
            fontFamily: 'var(--il-font-serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 28,
            color: 'var(--il-off)',
            lineHeight: 1.4,
            margin: 0,
          }}>
            "Cada joia carrega uma intenção."
          </p>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px 72px',
      }}>
        <Link href="/" style={{ marginBottom: 56, display: 'inline-block' }}>
          <Image src="/logo-ilumiluz.svg" alt="Ilumiluz" width={96} height={25} />
        </Link>

        {done ? (
          <div>
            <p className="il-eyebrow" style={{ marginBottom: 20 }}>Conta criada</p>
            <h1 className="il-h" style={{ fontSize: 32, marginBottom: 16 }}>
              Bem-vinda, <em>{form.name.split(' ')[0] || 'à Ilumiluz'}.</em>
            </h1>
            <p className="il-body">Redirecionando…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <p className="il-eyebrow" style={{ marginBottom: 20 }}>Nova conta</p>
              <h1 className="il-h" style={{ fontSize: 32, marginBottom: 8 }}>
                Criar <em>conta.</em>
              </h1>
              <p className="il-body" style={{ marginBottom: 32 }}>
                Registre-se para guardar favoritos e acompanhar pedidos.
              </p>
            </div>

            <Field
              label="Nome"
              type="text"
              value={form.name}
              onChange={v => setForm({ ...form, name: v })}
              placeholder="Seu nome"
              required={false}
            />
            <Field
              label="E-mail"
              type="email"
              value={form.email}
              onChange={v => setForm({ ...form, email: v })}
              placeholder="seu@email.com"
            />
            <Field
              label="Senha"
              type="password"
              value={form.password}
              onChange={v => setForm({ ...form, password: v })}
              placeholder="Mínimo 8 caracteres"
            />
            <Field
              label="Confirmar senha"
              type="password"
              value={form.confirm}
              onChange={v => setForm({ ...form, confirm: v })}
              placeholder="••••••••"
            />

            {error && <p style={{ fontSize: 12.5, color: 'var(--il-gold)', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button type="submit" className="il-out" style={{ justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Criando conta…' : 'Criar conta →'}
              </button>
              <button type="button" onClick={handleGoogle} className="il-solid" style={{ justifyContent: 'center' }} disabled={loading}>
                Continuar com Google
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--il-muted)', margin: 0 }}>
              Já tem conta?{' '}
              <Link href="/login" style={{ color: 'var(--il-gold)' }}>Entrar →</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, required = true, autoFocus }: {
  label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string
  required?: boolean; autoFocus?: boolean
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span className="il-label">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required={required}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: '0.5px solid var(--il-line-dark)',
          padding: '10px 0',
          fontFamily: 'var(--il-font-body)',
          fontSize: 13.5,
          fontWeight: 300,
          color: 'var(--il-text)',
          outline: 'none',
          width: '100%',
          transition: 'border-color .2s',
        }}
        onFocus={e => (e.target.style.borderBottomColor = 'var(--il-gold)')}
        onBlur={e => (e.target.style.borderBottomColor = 'var(--il-line-dark)')}
      />
    </label>
  )
}
