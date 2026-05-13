export default function Gallery() {
  return (
    <section style={{ padding: '96px 48px', borderTop: '0.5px solid var(--il-line)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          marginBottom: 56,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          <div>
            <p className="il-eyebrow" style={{ marginBottom: 20 }}>Galeria</p>
            <h2 className="il-h" style={{ fontSize: 44 }}>
              Matéria, <em>memória.</em>
            </h2>
          </div>
          <p className="il-body" style={{ maxWidth: 320 }}>
            Fragmentos do ateliê — mãos, metal, luz, pausa.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 16,
          gridAutoRows: '230px',
        }}>
          <Tile img="galeria-anel-botanico.png" rowSpan={2} />
          <Tile img="galeria-brincos-triangulo.png" />
          <Tile img="conversa-maos-artesao.png" />
          <Quote />
          <Tile img="sobre-colar-pedras.png" />
        </div>
      </div>
    </section>
  )
}

function Tile({ img, rowSpan = 1 }: { img: string; rowSpan?: number }) {
  return (
    <div style={{
      gridRow: rowSpan === 2 ? 'span 2' : 'auto',
      backgroundImage: `url(/${img})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      border: '0.5px solid var(--il-line)',
    }} />
  )
}

function Quote() {
  return (
    <div style={{
      background: 'var(--il-ether-deep)',
      color: 'var(--il-off)',
      padding: '32px 28px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <p style={{
        fontFamily: 'var(--il-font-serif)',
        fontStyle: 'italic',
        fontWeight: 300,
        fontSize: 22,
        lineHeight: 1.5,
        color: 'var(--il-gold-light)',
        margin: '0 0 18px',
        borderLeft: '0.5px solid var(--il-gold)',
        paddingLeft: 20,
      }}>
        "O luxo, aqui, está na atenção. No tempo. No sentido."
      </p>
      <p style={{
        fontFamily: 'var(--il-font-display)',
        fontSize: 9,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(184, 205, 217, 0.5)',
        margin: 0,
      }}>
        — Manifesto Ilumiluz
      </p>
    </div>
  )
}
