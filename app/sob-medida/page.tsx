import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Joia Sob Medida — Ilumiluz',
  description: 'Crie uma joia única com o ateliê Ilumiluz. Encomendas e transformação de joias herdadas.',
}

export default function SobMedidaPage() {
  return (
    <>
      <Nav />
      <main style={{ background: 'var(--il-off)', paddingTop: 72 }}>

        {/* Hero */}
        <section style={{
          background: 'var(--il-deep)',
          padding: '120px 48px 100px',
          textAlign: 'center',
        }}>
          <p className="il-eyebrow" style={{ justifyContent: 'center', color: 'var(--il-gold)', marginBottom: 32 }}>
            Sob medida
          </p>
          <h1 className="il-h" style={{ fontSize: 56, color: 'var(--il-off)', marginBottom: 28, maxWidth: 700, margin: '0 auto 28px' }}>
            Uma joia feita <em>só para você</em>
          </h1>
          <p style={{
            fontFamily: 'var(--il-font-body)',
            fontSize: 15,
            fontWeight: 300,
            color: 'rgba(201, 131, 154, 0.8)',
            lineHeight: 1.85,
            maxWidth: 500,
            margin: '0 auto 48px',
          }}>
            Do esboço ao acabamento — criamos a peça que você imagina,
            ou transformamos uma joia que você já ama em algo novo.
          </p>
          <Link
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="il-solid"
          >
            Iniciar minha encomenda →
          </Link>
        </section>

        {/* Serviços */}
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 48px' }}>
          <p className="il-eyebrow" style={{ justifyContent: 'center', marginBottom: 56, textAlign: 'center' }}>
            O que criamos
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 2,
          }}>
            {[
              {
                titulo: 'Criação do zero',
                texto: 'Você traz uma ideia — um sonho, uma referência, uma emoção — e a gente transforma em joia. Anéis, brincos, colares, pulseiras.',
              },
              {
                titulo: 'Transformação',
                texto: 'Tem uma joia herdada que não usa mais? Transformamos em algo que você vai querer usar todos os dias, mantendo a memória do original.',
              },
              {
                titulo: 'Par de alianças',
                texto: 'Alianças são o símbolo de uma promessa. Criamos com você, levando em conta forma, peso, acabamento e o que o vínculo representa.',
              },
            ].map(s => (
              <div
                key={s.titulo}
                style={{
                  padding: '48px 36px',
                  background: 'var(--il-white)',
                  border: '0.5px solid var(--il-line)',
                }}
              >
                <p style={{
                  fontFamily: 'var(--il-font-serif)',
                  fontStyle: 'italic',
                  fontSize: 22,
                  fontWeight: 300,
                  color: 'var(--il-gold)',
                  marginBottom: 16,
                }}>
                  {s.titulo}
                </p>
                <p style={{
                  fontFamily: 'var(--il-font-body)',
                  fontSize: 13.5,
                  fontWeight: 300,
                  color: 'var(--il-muted)',
                  lineHeight: 1.85,
                  margin: 0,
                }}>
                  {s.texto}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: '0.5px', background: 'var(--il-line)', margin: '0 48px' }} />

        {/* CTA final */}
        <section style={{ padding: '80px 48px 100px', textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--il-font-serif)',
            fontStyle: 'italic',
            fontSize: 26,
            fontWeight: 300,
            color: 'var(--il-text)',
            marginBottom: 12,
          }}>
            O primeiro passo é uma conversa.
          </p>
          <p style={{
            fontFamily: 'var(--il-font-body)',
            fontSize: 14,
            color: 'var(--il-muted)',
            marginBottom: 40,
          }}>
            Sem compromisso. Só para entender o que você imagina.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="il-solid"
            >
              Conversar no WhatsApp →
            </Link>
            <Link href="/contato" className="il-ghost">
              <i /> Outros contatos
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
