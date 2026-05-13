import Image from 'next/image'
import Link from 'next/link'

const cols = [
  { title: 'Navegar',  links: [{ label: 'Coleção', href: '/colecao' }, { label: 'Sobre', href: '/sobre' }, { label: 'Processo', href: '/processo' }, { label: 'Contato', href: '/contato' }] },
  { title: 'Ateliê',   links: [{ label: 'Agendar visita', href: '/sob-medida' }, { label: 'Transformar joia', href: '/sob-medida' }, { label: 'Catálogo', href: '/colecao' }, { label: 'WhatsApp', href: '#' }] },
  { title: 'Seguir',   links: [{ label: 'Instagram', href: '#' }, { label: 'Pinterest', href: '#' }, { label: 'Email', href: 'mailto:contato@ilumiluz.com' }] },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--il-deep)', color: 'var(--il-gold-light)', padding: '72px 48px 40px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: 48,
          paddingBottom: 56,
          borderBottom: '0.5px solid rgba(201, 131, 154, 0.2)',
        }}>
          <div>
            <Link href="/" style={{ display: 'inline-block', marginBottom: 20 }}>
              <Image src="/logo-ilumiluz-branco.svg" alt="Ilumiluz" width={108} height={28} />
            </Link>
            <p style={{
              fontFamily: 'var(--il-font-serif)',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 18,
              color: 'var(--il-gold)',
              margin: '0 0 20px',
            }}>
              É a tua luz que ilumina o mundo.
            </p>
            <p style={{ fontSize: 12, lineHeight: 1.75, color: 'rgba(201, 131, 154, 0.7)', maxWidth: 340, margin: 0 }}>
              Ateliê de joias contemporâneas. Peças sob medida e transformação de joias herdadas. São Paulo — por hora marcada.
            </p>
          </div>

          {cols.map(col => (
            <div key={col.title}>
              <p style={{
                fontFamily: 'var(--il-font-display)',
                fontSize: 9,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--il-gold)',
                margin: '0 0 20px',
              }}>
                {col.title}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {col.links.map(l => (
                  <li key={l.label}>
                    <Link href={l.href} className="il-footer-link">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 28,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--il-font-display)',
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(201, 131, 154, 0.4)',
        }}>
          <span>© 2026 Ilumiluz</span>
          <span>Feito com presença</span>
          <Link href="/privacidade" style={{ color: 'inherit' }}>Política de privacidade</Link>
        </div>
      </div>
    </footer>
  )
}
