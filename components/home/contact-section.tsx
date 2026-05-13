'use client'

import { useState } from 'react'

export default function ContactSection() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', story: '' })

  return (
    <section style={{ padding: '120px 48px', background: 'var(--il-ether-deep)', color: 'var(--il-off)' }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 80,
        alignItems: 'start',
      }}>
        <div>
          <p className="il-eyebrow" style={{ color: 'var(--il-gold-light)', marginBottom: 24 }}>
            Contato
          </p>
          <h2 style={{
            fontFamily: 'var(--il-font-display)',
            fontWeight: 600,
            fontSize: 56,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: 'var(--il-off)',
            margin: '0 0 28px',
          }}>
            Tudo começa com<br />
            uma{' '}
            <em style={{
              fontStyle: 'italic',
              fontFamily: 'var(--il-font-serif)',
              fontWeight: 300,
              fontSize: 62,
              color: 'var(--il-gold)',
              textTransform: 'none',
              letterSpacing: 0,
            }}>
              conversa.
            </em>
          </h2>
          <p style={{ fontSize: 13.5, lineHeight: 1.85, color: 'var(--il-ether-light)', maxWidth: 440, margin: '0 0 34px' }}>
            Se este é o momento de criar algo que dure — entre em contato.
            Respondemos a cada mensagem com o tempo que ela merece.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12.5, color: 'var(--il-ether-light)' }}>
            {[
              { label: 'Ateliê',    value: 'São Paulo, SP' },
              { label: 'Horário',   value: 'Ter–Sáb · Com hora marcada' },
              { label: 'Instagram', value: '@ilumiluz' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
                <span className="il-label" style={{ color: 'var(--il-gold-light)', minWidth: 70 }}>{label}</span>
                {value}
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={e => { e.preventDefault(); setSent(true) }}
          style={{ display: 'flex', flexDirection: 'column', gap: 22 }}
        >
          <Field
            label="Seu nome"
            value={form.name}
            onChange={v => setForm({ ...form, name: v })}
            placeholder="Como prefere ser chamada?"
          />
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={v => setForm({ ...form, email: v })}
            placeholder="seu@email.com"
          />
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="il-label" style={{ color: 'var(--il-gold-light)' }}>Sua história</span>
            <textarea
              className="il-textarea"
              value={form.story}
              onChange={e => setForm({ ...form, story: e.target.value })}
              placeholder="Conte sobre a joia que deseja criar ou transformar..."
              rows={4}
            />
          </label>
          <button
            type="submit"
            className="il-ghost"
            style={{ color: 'var(--il-off)', marginTop: 8, alignSelf: 'flex-start' }}
          >
            <i style={{ background: 'var(--il-gold)' }} />
            {sent ? 'Mensagem enviada' : 'Enviar mensagem'}
          </button>
        </form>
      </div>
    </section>
  )
}

function Field({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span className="il-label" style={{ color: 'var(--il-gold-light)' }}>{label}</span>
      <input
        type={type}
        className="il-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}
