import type { Metadata } from 'next'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Processo — Ilumiluz',
  description: 'Como uma joia Ilumiluz é criada — do primeiro contato à entrega.',
}

const etapas = [
  {
    num: '01',
    titulo: 'Conversa',
    texto:
      'Tudo começa com um encontro. Presencialmente no ateliê ou por vídeo — conversamos sobre a peça que você imagina, o que ela precisa carregar e para qual momento ela é feita.',
  },
  {
    num: '02',
    titulo: 'Projeto',
    texto:
      'A partir da conversa, desenvolvemos esboços e uma proposta formal com materiais, dimensões e valor. Você aprova cada detalhe antes de começarmos.',
  },
  {
    num: '03',
    titulo: 'Criação',
    texto:
      'A joia é feita à mão no nosso ateliê em São Paulo. O processo leva entre 3 e 6 semanas dependendo da complexidade. Você recebe atualizações durante o caminho.',
  },
  {
    num: '04',
    titulo: 'Entrega',
    texto:
      'A peça é entregue pessoalmente quando possível, ou enviada com embalagem protegida e rastreamento. Junto vem um certificado de autenticidade e as instruções de cuidado.',
  },
]

export default function ProcessoPage() {
  return (
    <>
      <Nav />
      <main style={{ background: 'var(--il-off)', paddingTop: 72 }}>

        {/* Hero */}
        <section style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '100px 48px 80px',
          textAlign: 'center',
        }}>
          <p className="il-eyebrow" style={{ justifyContent: 'center', marginBottom: 32 }}>
            Processo
          </p>
          <h1 className="il-h" style={{ fontSize: 52, marginBottom: 28 }}>
            Do encontro à <em>peça</em>
          </h1>
          <p style={{
            fontFamily: 'var(--il-font-body)',
            fontSize: 15,
            fontWeight: 300,
            color: 'var(--il-muted)',
            lineHeight: 1.85,
            maxWidth: 540,
            margin: '0 auto',
          }}>
            Cada joia Ilumiluz segue um processo artesanal e colaborativo.
            Você faz parte de cada etapa.
          </p>
        </section>

        <div style={{ height: '0.5px', background: 'var(--il-line)', margin: '0 48px' }} />

        {/* Etapas */}
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 48px 100px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {etapas.map((e, i) => (
              <div
                key={e.num}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: 40,
                  paddingBlock: 48,
                  borderBottom: i < etapas.length - 1 ? '0.5px solid var(--il-line)' : 'none',
                }}
              >
                {/* Número */}
                <div style={{ paddingTop: 4 }}>
                  <span style={{
                    fontFamily: 'var(--il-font-serif)',
                    fontStyle: 'italic',
                    fontSize: 44,
                    fontWeight: 300,
                    color: 'var(--il-gold-pale)',
                    lineHeight: 1,
                  }}>
                    {e.num}
                  </span>
                </div>
                {/* Conteúdo */}
                <div>
                  <h2 className="il-h" style={{ fontSize: 24, marginBottom: 16 }}>
                    {e.titulo}
                  </h2>
                  <p style={{
                    fontFamily: 'var(--il-font-body)',
                    fontSize: 14,
                    fontWeight: 300,
                    color: 'var(--il-muted)',
                    lineHeight: 1.9,
                    margin: 0,
                  }}>
                    {e.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
