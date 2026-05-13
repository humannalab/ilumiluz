'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

// Exportado como wrapper com Suspense para Next.js não reclamar de
// useSearchParams() sem boundary durante o prerender estático.
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'

  const [step, setStep] = useState<'credentials' | '2fa'>('credentials')
  const [form, setForm] = useState({ email: '', password: '', totpCode: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      totpCode: step === '2fa' ? form.totpCode : '',
      redirect: false,
    })

    setLoading(false)

    if (res?.error === '2FA_REQUIRED') {
      setStep('2fa')
      return
    }
    if (res?.error) {
      setError(res.error === '2FA_INVALID'
        ? 'Código inválido. Tente novamente.'
        : 'E-mail ou senha incorretos.')
      return
    }
    router.push(callbackUrl)
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!form.email) { setError('Digite seu e-mail primeiro.'); return }
    setLoading(true)
    await signIn('resend', { email: form.email, redirect: false })
    setLoading(false)
    setMagicSent(true)
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl })
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
            "Joias não existem apenas para adornar."
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

        {magicSent ? (
          <div>
            <p className="il-eyebrow" style={{ marginBottom: 20 }}>Verifique seu e-mail</p>
            <h1 className="il-h" style={{ fontSize: 32, marginBottom: 16 }}>
              Link <em>enviado.</em>
            </h1>
            <p className="il-body">
              Enviámos um link de acesso para <strong>{form.email}</strong>.
              Verifique a caixa de entrada — e o spam.
            </p>
          </div>
        ) : step === '2fa' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <p className="il-eyebrow" style={{ marginBottom: 20 }}>Verificação em dois passos</p>
              <h1 className="il-h" style={{ fontSize: 32, marginBottom: 8 }}>
                Código <em>2FA.</em>
              </h1>
              <p className="il-body" style={{ marginBottom: 32 }}>
                Abra o teu autenticador e insere o código de 6 dígitos.
              </p>
            </div>
            <Field
              label="Código 2FA"
              type="text"
              value={form.totpCode}
              onChange={v => setForm({ ...form, totpCode: v })}
              placeholder="000000"
              autoFocus
            />
            {error && <p style={{ fontSize: 12.5, color: 'var(--il-gold)', margin: 0 }}>{error}</p>}
            <button type="submit" className="il-out" disabled={loading}>
              {loading ? 'Verificando…' : 'Confirmar →'}
            </button>
            <button type="button" onClick={() => setStep('credentials')}
              style={{ fontSize: 12.5, color: 'var(--il-muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
              ← Voltar
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <p className="il-eyebrow" style={{ marginBottom: 20 }}>Acesso à conta</p>
              <h1 className="il-h" style={{ fontSize: 32, marginBottom: 8 }}>
                Bem-vinda <em>de volta.</em>
              </h1>
              <p className="il-body" style={{ marginBottom: 32 }}>
                Entre com e-mail e senha, ou use o Google.
              </p>
            </div>

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
              placeholder="••••••••"
            />

            {error && <p style={{ fontSize: 12.5, color: 'var(--il-gold)', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button type="submit" className="il-out" style={{ justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar →'}
              </button>
              <button type="button" onClick={handleGoogle} className="il-solid" style={{ justifyContent: 'center' }} disabled={loading}>
                Continuar com Google
              </button>
            </div>

            <div style={{ borderTop: '0.5px solid var(--il-line)', paddingTop: 20 }}>
              <p className="il-body" style={{ marginBottom: 12, fontSize: 12.5 }}>
                Prefere um link por e-mail, sem senha?
              </p>
              <button type="button" onClick={handleMagicLink} className="il-ghost" disabled={loading}>
                <i />Enviar magic link
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: 'var(--il-muted)', margin: 0 }}>
              Ainda sem conta?{' '}
              <Link href="/signup" style={{ color: 'var(--il-gold)' }}>Criar uma →</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, autoFocus }: {
  label: string; type: string; value: string
  onChange: (v: string) => void; placeholder: string; autoFocus?: boolean
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
        required
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
