/**
 * /pedido/[id] — confirmação de pedido.
 *
 * Acessado após checkout. Se `?status=paid` está na URL (Stripe redirect),
 * exibe mensagem de sucesso imediatamente — o webhook atualiza o banco em
 * background. Sem o param mostra o status real do banco.
 */
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}

export const metadata: Metadata = {
  title: 'Pedido confirmado — Ilumiluz',
}

const fmt = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    cents / 100
  )

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:        { label: 'Aguardando pagamento', color: 'var(--il-muted)' },
  paid:           { label: 'Pago',                 color: '#27ae60' },
  payment_failed: { label: 'Pagamento recusado',   color: '#c0392b' },
  processing:     { label: 'Em preparação',         color: 'var(--il-ether-deep)' },
  shipped:        { label: 'Enviado',              color: 'var(--il-ether-deep)' },
  delivered:      { label: 'Entregue',             color: '#27ae60' },
  cancelled:      { label: 'Cancelado',            color: '#c0392b' },
}

export default async function OrderPage({ params, searchParams }: Props) {
  const { id } = await params
  const { status: statusParam } = await searchParams

  // Busca o pedido (sem exigir auth — link pode ser compartilhado)
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      shippingAddress: true,
    },
  })

  if (!order) notFound()

  // Verifica se o usuário logado é o dono do pedido (segurança)
  const session = await auth()
  if (order.userId && session?.user?.id !== order.userId) {
    // Pedido existe mas não pertence ao usuário logado
    notFound()
  }

  // Se veio do redirect do Stripe com status=paid, trata como confirmado
  // mesmo se o webhook ainda não chegou.
  const isPaid = order.status === 'paid' || statusParam === 'paid'
  const statusInfo = STATUS_LABELS[order.status] ?? { label: order.status, color: 'var(--il-muted)' }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--il-off)' }}>
      {/* Header minimal */}
      <header
        style={{
          height: 64,
          borderBottom: '0.5px solid var(--il-line)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 40px',
          background: 'var(--il-white)',
        }}
      >
        <Link href="/">
          <Image src="/logo-ilumiluz.svg" alt="Ilumiluz" width={96} height={24} priority />
        </Link>
      </header>

      <main
        style={{
          maxWidth: 700,
          margin: '0 auto',
          padding: '60px 40px 100px',
        }}
      >
        {/* Banner de sucesso */}
        {isPaid && (
          <div
            style={{
              background: 'var(--il-white)',
              border: '0.5px solid var(--il-line)',
              padding: '40px 48px',
              textAlign: 'center',
              marginBottom: 40,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--il-font-serif)',
                fontStyle: 'italic',
                fontSize: 32,
                fontWeight: 300,
                color: 'var(--il-gold)',
                marginBottom: 12,
              }}
            >
              Obrigada pela compra ✦
            </p>
            <p
              style={{
                fontFamily: 'var(--il-font-body)',
                fontSize: 14,
                color: 'var(--il-muted)',
                lineHeight: 1.8,
              }}
            >
              Seu pedido foi recebido e está sendo preparado com cuidado.
              <br />
              Você receberá atualizações em <strong>{order.customerEmail}</strong>.
            </p>
          </div>
        )}

        {/* Detalhes do pedido */}
        <div
          style={{
            background: 'var(--il-white)',
            border: '0.5px solid var(--il-line)',
            padding: '32px 40px',
          }}
        >
          {/* Número e status */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 32,
              paddingBottom: 24,
              borderBottom: '0.5px solid var(--il-line)',
            }}
          >
            <div>
              <p className="il-label" style={{ marginBottom: 6 }}>
                Pedido
              </p>
              <p
                style={{
                  fontFamily: 'var(--il-font-body)',
                  fontSize: 12,
                  color: 'var(--il-muted)',
                  letterSpacing: '0.05em',
                }}
              >
                #{order.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  border: `0.5px solid ${isPaid ? '#27ae60' : statusInfo.color}`,
                  fontFamily: 'var(--il-font-display)',
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: isPaid ? '#27ae60' : statusInfo.color,
                }}
              >
                {isPaid ? 'Pago' : statusInfo.label}
              </span>
              <p
                style={{
                  fontFamily: 'var(--il-font-body)',
                  fontSize: 11,
                  color: 'var(--il-muted)',
                  marginTop: 6,
                }}
              >
                {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Itens */}
          <p className="il-label" style={{ marginBottom: 16 }}>
            Itens
          </p>
          <div style={{ marginBottom: 32 }}>
            {order.items.map(item => {
              const snapshot = item.productSnapshot as {
                title?: string
                slug?: string
                imageUrl?: string
              }
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBlock: 14,
                    borderBottom: '0.5px solid var(--il-line-dark)',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--il-font-body)',
                        fontSize: 13,
                        color: 'var(--il-text)',
                        marginBottom: 2,
                      }}
                    >
                      {snapshot.title ?? 'Produto'}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--il-font-body)',
                        fontSize: 11,
                        color: 'var(--il-muted)',
                      }}
                    >
                      Qtd: {item.quantity}
                    </p>
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--il-font-serif)',
                      fontStyle: 'italic',
                      fontSize: 16,
                      color: 'var(--il-gold)',
                    }}
                  >
                    {fmt(item.unitAmount * item.quantity)}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Totais */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--il-font-body)',
                fontSize: 12,
                color: 'var(--il-muted)',
              }}
            >
              Subtotal
            </span>
            <span
              style={{
                fontFamily: 'var(--il-font-body)',
                fontSize: 13,
                color: 'var(--il-text)',
              }}
            >
              {fmt(order.totalAmount)}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--il-font-body)',
                fontSize: 12,
                color: 'var(--il-muted)',
              }}
            >
              Frete
            </span>
            <span
              style={{
                fontFamily: 'var(--il-font-body)',
                fontSize: 13,
                color: 'var(--il-muted)',
                fontStyle: 'italic',
              }}
            >
              {order.shippingAmount > 0 ? fmt(order.shippingAmount) : 'A calcular'}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: 16,
              borderTop: '0.5px solid var(--il-line)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--il-font-display)',
                fontSize: 10.5,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--il-deep)',
              }}
            >
              Total
            </span>
            <span
              style={{
                fontFamily: 'var(--il-font-serif)',
                fontStyle: 'italic',
                fontSize: 26,
                fontWeight: 300,
                color: 'var(--il-gold)',
              }}
            >
              {fmt(order.totalAmount + order.shippingAmount)}
            </span>
          </div>

          {/* Endereço de entrega */}
          {order.shippingAddress && (
            <div
              style={{
                marginTop: 32,
                paddingTop: 24,
                borderTop: '0.5px solid var(--il-line)',
              }}
            >
              <p className="il-label" style={{ marginBottom: 12 }}>
                Endereço de entrega
              </p>
              <p
                style={{
                  fontFamily: 'var(--il-font-body)',
                  fontSize: 13,
                  color: 'var(--il-text)',
                  lineHeight: 1.8,
                }}
              >
                {order.shippingAddress.name}
                <br />
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
                <br />
                {order.shippingAddress.city} — {order.shippingAddress.state},{' '}
                {order.shippingAddress.postalCode}
              </p>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 40,
            justifyContent: 'center',
          }}
        >
          <Link href="/colecao" className="il-ghost">
            <i /> Continuar comprando
          </Link>
          {session?.user && (
            <Link href="/conta/pedidos" className="il-ghost">
              <i /> Ver meus pedidos
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
