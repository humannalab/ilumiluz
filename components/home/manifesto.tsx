import Link from 'next/link'

export default function Manifesto() {
  return (
    <section style={{ padding: '120px 48px', position: 'relative' }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 72,
        alignItems: 'center',
      }}>
        <div style={{
          aspectRatio: '3/4',
          backgroundImage: 'url(/manifesto-colar-folhas.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: '0.5px solid var(--il-line)',
        }} />

        <div>
          <p className="il-eyebrow" style={{ marginBottom: 24 }}>Sobre a Ilumiluz</p>
          <p style={{
            fontFamily: 'var(--il-font-serif)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 32,
            lineHeight: 1.35,
            color: 'var(--il-deep)',
            margin: '0 0 28px',
          }}>
            Joias não existem apenas para adornar.
          </p>
          <p className="il-body" style={{ marginBottom: 18, maxWidth: 460 }}>
            Na Ilumiluz, cada peça nasce de uma conversa. De histórias pessoais,
            memórias afetivas, intenções e símbolos que merecem ganhar forma.
          </p>
          <p className="il-body" style={{ marginBottom: 36, maxWidth: 460 }}>
            Acreditamos que uma joia pode ser um ponto de presença — algo que ancora,
            fortalece e atravessa ciclos ao lado de quem a usa.
          </p>
          <Link href="/sobre" className="il-ghost"><i />Conhecer o ateliê</Link>
        </div>
      </div>
    </section>
  )
}
