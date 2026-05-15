import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Contato — Ilumiluz',
  description: 'Entre em contato com o ateliê Ilumiluz. São Paulo.',
}

export default function ContatoPage() {
  return (
    <>
      <Nav />
      <main style={{ background: 'var(--il-off)', paddingTop: 72 }}>

        {/* Hero */}
        <section style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '100px 48px 72px',
          textAlign: 'center',
        }}>
          <p className="il-eyebrow" style={{ justifyContent: 'center', marginBottom: 32 }}>
            Contato
          </p>
          <h1 className="il-h" style={{ fontSize: 52, marginBottom: 28 }}>
            Fale com o <em>ateliê</em>
          </h1>
          <p style={{
            fontFamily: 'var(--il-font-body)',
            fontSize: 15,
            fontWeight: 300,
            color: 'var(--il-muted)',
            lineHeight: 1.85,
            maxWidth: 480,
            margin: '0 auto',
          }}>
            Para encomendas, visitas ao ateliê ou qualquer dúvida —
            estamos por aqui.
          </p>
        </section>

        <div style={{ height: '0.5px', background: 'var(--il-line)', margin: '0 48px' }} />

        {/* Canais de contato */}
        <section style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: '80px 48px 100px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
        }}>
          {[
            {
              titulo: 'WhatsApp',
              descricao: 'Resposta mais rápida. Para dúvidas, encomendas e agendamento de visitas.',
              cta: 'Conversar no WhatsApp',
              href: 'https://wa.me/5511999999999',
              externo: true,
            },
            {
              titulo: 'E-mail',
              descricao: 'Para assuntos mais detalhados ou envio de referências e inspirações.',
              cta: 'contato@ilumiluz.com',
              href: 'mailto:contato@ilumiluz.com',
              externo: true,
            },
            {
              titulo: 'Instagram',
              descricao: 'Acompanhe o processo, as peças em criação e os bastidores do ateliê.',
              cta: '@ilumiluz',
              href: 'https://instagram.com/ilumiluz',
              externo: true,
            },
            {
              titulo: 'Ateliê',
              descricao: 'São Paulo — SP. Visitas com hora marcada. Endereço compartilhado ao agendar.',
              cta: 'Agendar visita',
              href: '/sob-medida',
              externo: false,
            },
          ].map(c => (
            <div
              key={c.titulo}
              style={{
                padding: '48px 40px',
                border: '0.5px solid var(--il-line)',
                background: 'var(--il-white)',
              }}
            >
              <p className="il-label" style={{ marginBottom: 16 }}>{c.titulo}</p>
              <p style={{
                fontFamily: 'var(--il-font-body)',
                fontSize: 13.5,
                fontWeight: 300,
                color: 'var(--il-muted)',
                lineHeight: 1.85,
                marginBottom: 28,
                minHeight: 60,
              }}>
                {c.descricao}
              </p>
              <Link
                href={c.href}
                target={c.externo ? '_blank' : undefined}
                rel={c.externo ? 'noopener noreferrer' : undefined}
                className="il-ghost"
              >
                <i /> {c.cta}
              </Link>
            </div>
          ))}
        </section>

      </main>
      <Footer />
    </>
  )
}
