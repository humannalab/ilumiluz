import type { Metadata } from 'next'
import Nav from '@/components/nav'
import Footer from '@/components/footer'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Ilumiluz',
}

export default function PrivacidadePage() {
  return (
    <>
      <Nav />
      <main style={{ background: 'var(--il-off)', paddingTop: 72 }}>
        <section style={{ maxWidth: 720, margin: '0 auto', padding: '80px 48px 120px' }}>
          <p className="il-eyebrow" style={{ marginBottom: 24 }}>Legal</p>
          <h1 className="il-h" style={{ fontSize: 36, marginBottom: 48 }}>
            Política de Privacidade
          </h1>

          <div style={{
            fontFamily: 'var(--il-font-body)',
            fontSize: 14,
            fontWeight: 300,
            lineHeight: 1.9,
            color: 'var(--il-text)',
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
          }}>
            <Section titulo="1. Quem somos">
              Ilumiluz é um ateliê de joias localizado em São Paulo, Brasil.
              Operamos a loja online em ilumiluz.com e podemos ser contactados
              pelo e-mail contato@ilumiluz.com.
            </Section>

            <Section titulo="2. Dados que coletamos">
              Coletamos os dados necessários para processar seus pedidos e
              melhorar sua experiência: nome, e-mail, endereço de entrega e
              informações de pagamento (processadas com segurança pelo Stripe —
              não armazenamos dados de cartão). Se você faz login com Google,
              recebemos nome, e-mail e foto de perfil.
            </Section>

            <Section titulo="3. Como usamos seus dados">
              Seus dados são usados exclusivamente para: processar e entregar
              pedidos, enviar confirmações e atualizações de pedido, e
              melhorar nossos produtos e serviços. Não vendemos nem
              compartilhamos seus dados com terceiros para fins de marketing.
            </Section>

            <Section titulo="4. Pagamentos">
              Todos os pagamentos são processados pelo Stripe, Inc., que é
              certificado PCI-DSS nível 1. Não temos acesso aos dados
              completos do seu cartão de crédito.
            </Section>

            <Section titulo="5. Cookies">
              Usamos cookies essenciais para manter sua sessão ativa e seu
              carrinho de compras. Não usamos cookies de rastreamento ou
              publicidade de terceiros.
            </Section>

            <Section titulo="6. Seus direitos (LGPD)">
              De acordo com a Lei Geral de Proteção de Dados (Lei nº
              13.709/2018), você tem direito a acessar, corrigir ou solicitar
              a exclusão dos seus dados pessoais. Para exercer esses direitos,
              entre em contato pelo e-mail contato@ilumiluz.com.
            </Section>

            <Section titulo="7. Retenção de dados">
              Mantemos seus dados enquanto sua conta estiver ativa ou conforme
              necessário para cumprir obrigações legais (ex: registros fiscais
              de pedidos por 5 anos).
            </Section>

            <Section titulo="8. Alterações">
              Esta política pode ser atualizada periodicamente. Notificaremos
              por e-mail em caso de mudanças significativas.
            </Section>

            <p style={{ color: 'var(--il-muted)', fontSize: 12, marginTop: 16 }}>
              Última atualização: maio de 2026
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{
        fontFamily: 'var(--il-font-display)',
        fontSize: 11,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: 'var(--il-deep)',
        marginBottom: 12,
      }}>
        {titulo}
      </h2>
      <p style={{ margin: 0, color: 'var(--il-muted)' }}>{children}</p>
    </div>
  )
}
