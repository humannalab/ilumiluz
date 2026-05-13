import Link from 'next/link'

export default function Hero() {
  return (
    <section style={{ padding: '64px 48px 96px', position: 'relative' }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 72,
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: -48, top: 6,
            width: 0.5, height: 80,
            background: 'var(--il-gold)',
          }} />
          <p className="il-eyebrow" style={{ marginBottom: 28 }}>
            É a tua luz que ilumina o mundo
          </p>
          <h1 className="il-h" style={{ fontSize: 84, lineHeight: 0.92, marginBottom: 28 }}>
            Joias para<br />quem vive com{' '}
            <em>intenção.</em>
          </h1>
          <p className="il-body" style={{ maxWidth: 440, marginBottom: 40 }}>
            Ilumiluz é um ateliê de joias contemporâneas criadas com intenção.
            Peças sob medida que marcam momentos, traduzem histórias e acompanham
            quem você é — ou está se tornando.
          </p>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
            <Link href="/sob-medida" className="il-ghost"><i />Criar uma joia</Link>
            <Link href="/colecao" className="il-ghost" style={{ color: 'var(--il-muted)' }}>
              <i style={{ background: 'var(--il-muted)' }} />Ver coleção
            </Link>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{
            aspectRatio: '4/5',
            backgroundImage: 'url(/hero-anel-lirio.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '0.5px solid var(--il-line)',
          }} />
          <div style={{
            position: 'absolute',
            top: 28, right: -16,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: 'var(--il-font-display)',
            fontSize: 10,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--il-muted)',
          }}>
            Coleção 01 — Presença
          </div>
        </div>
      </div>
    </section>
  )
}
