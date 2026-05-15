/**
 * /conta/pedidos — histórico de pedidos do usuário logado.
 */
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meus pedidos — Ilumiluz',
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

export default async function PedidosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/conta/pedidos')

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div
        style={{
          marginBottom: 40,
          paddingBottom: 24,
          borderBottom: '0.5px solid var(--il-line)',
        }}
      >
        <p className="il-eyebrow" style={{ marginBottom: 12 }}>
          Minha conta
        </p>
        <h1
          className="il-h"
          style={{ fontSize: 28 }}
        >
          Meus pedidos
        </h1>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 48 }}>
          <p
            style={{
              fontFamily: 'var(--il-font-serif)',
              fontStyle: 'italic',
              fontSize: 22,
              color: 'var(--il-muted)',
              marginBottom: 24,
            }}
          >
            Você ainda não fez nenhum pedido.
          </p>
          <Link href="/colecao" className="il-ghost">
            <i /> Explorar a coleção
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const statusInfo = STATUS_LABELS[order.status] ?? {
              label: order.status,
              color: 'var(--il-muted)',
            }
            const totalItens = order.items.reduce((s, i) => s + i.quantity, 0)

            return (
              <Link
                key={order.id}
                href={`/pedido/${order.id}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  background: 'var(--il-white)',
                  border: '0.5px solid var(--il-line)',
                  padding: '24px 28px',
                  transition: 'border-color var(--il-dur-fast) var(--il-ease-standard)',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.borderColor = 'var(--il-gold)')
                }
                onMouseLeave={e =>
                  (e.currentTarget.style.borderColor = 'var(--il-line)')
                }
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 16,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: 'var(--il-font-body)',
                        fontSize: 12,
                        color: 'var(--il-muted)',
                        marginBottom: 4,
                        letterSpacing: '0.05em',
                      }}
                    >
                      #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--il-font-body)',
                        fontSize: 13,
                        color: 'var(--il-text)',
                        marginBottom: 4,
                      }}
                    >
                      {totalItens} {totalItens === 1 ? 'peça' : 'peças'}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--il-font-body)',
                        fontSize: 11,
                        color: 'var(--il-muted)',
                      }}
                    >
                      {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p
                      style={{
                        fontFamily: 'var(--il-font-serif)',
                        fontStyle: 'italic',
                        fontSize: 20,
                        fontWeight: 300,
                        color: 'var(--il-gold)',
                        marginBottom: 8,
                      }}
                    >
                      {fmt(order.totalAmount)}
                    </p>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        border: `0.5px solid ${statusInfo.color}`,
                        fontFamily: 'var(--il-font-display)',
                        fontSize: 9,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: statusInfo.color,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
