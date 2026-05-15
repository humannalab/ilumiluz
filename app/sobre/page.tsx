import type { Metadata } from 'next'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Sobre — Ilumiluz',
  description: 'Ateliê de joias contemporâneas criadas com intenção. Conheça a história da Ilumiluz.',
}

export default function SobrePage() {
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
            Sobre
          </p>
          <h1 className="il-h" style={{ fontSize: 52, marginBottom: 32 }}>
            Joias que carregam <em>quem você é</em>
          </h1>
          <p style={{
            fontFamily: 'var(--il-font-serif)',
            fontStyle: 'italic',
            fontSize: 22,
            fontWeight: 300,
            color: 'var(--il-muted)',
            lineHeight: 1.7,
            maxWidth: 620,
            margin: '0 auto',
          }}>
            A Ilumiluz nasceu da crença de que uma joia não é enfeite —
            é extensão. É memória, intenção e presença no corpo.
          </p>
        </section>

        {/* Divisor */}
        <div style={{ height: '0.5px', background: 'var(--il-line)', margin: '0 48px' }} />

        {/* Texto principal */}
        <section style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '80px 48px',
        }}>
          <div style={{
            fontFamily: 'var(--il-font-body)',
            fontSize: 15,
            fontWeight: 300,
            lineHeight: 2,
            color: 'var(--il-text)',
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
          }}>
            <p>
              O ateliê é um espaço de criação localizado em São Paulo, dedicado
              à produção de joias contemporâneas feitas à mão. Cada peça parte
              de um material — ouro, prata, pedra — e de uma história: a sua.
            </p>
            <p>
              Trabalhamos com encomendas sob medida, peças de coleção e a
              transformação de joias herdadas. O processo é lento porque precisa
              ser. Cada etapa exige atenção, e é nessa atenção que a peça
              ganha alma.
            </p>
            <p>
              Acreditamos que o luxo real não está no excesso, mas no
              significado. Uma joia Ilumiluz não grita. Ela permanece.
            </p>
          </div>
        </section>

        {/* Valores */}
        <section style={{
          background: 'var(--il-deep)',
          padding: '80px 48px',
        }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <p className="il-eyebrow" style={{ justifyContent: 'center', color: 'var(--il-gold)', marginBottom: 56, textAlign: 'center' }}>
              O que nos guia
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 48,
            }}>
              {[
                { titulo: 'Intenção', texto: 'Cada peça é pensada antes de ser feita. Nada aqui é acidental.' },
                { titulo: 'Presença', texto: 'O trabalho manual é uma escolha. Estar presente no processo é parte do resultado.' },
                { titulo: 'Permanência', texto: 'Fazemos joias para durar. Para passar. Para se tornarem relíquias.' },
              ].map(v => (
                <div key={v.titulo} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontFamily: 'var(--il-font-serif)',
                    fontStyle: 'italic',
                    fontSize: 26,
                    fontWeight: 300,
                    color: 'var(--il-gold)',
                    marginBottom: 16,
                  }}>
                    {v.titulo}
                  </p>
                  <p style={{
                    fontFamily: 'var(--il-font-body)',
                    fontSize: 13,
                    fontWeight: 300,
                    color: 'rgba(201, 131, 154, 0.7)',
                    lineHeight: 1.85,
                  }}>
                    {v.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
