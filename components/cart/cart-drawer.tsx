'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart-store'

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

/**
 * Drawer deslizável de carrinho — renderizado no root layout.
 * Abre/fecha via useCartStore.isOpen.
 * Usa mounted guard para evitar hydration mismatch com localStorage.
 */
export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalAmount } =
    useCartStore()
  const [mounted, setMounted] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  // Foca o botão fechar quando abre (acessibilidade)
  useEffect(() => {
    if (isOpen && mounted) closeBtnRef.current?.focus()
  }, [isOpen, mounted])

  // Fecha com Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  if (!mounted) return null

  const total = totalAmount()

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(30, 26, 20, 0.4)',
          backdropFilter: 'blur(2px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 300ms var(--il-ease-standard)',
        }}
      />

      {/* Painel */}
      <aside
        role="dialog"
        aria-label="Carrinho de compras"
        aria-modal="true"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: 400,
          maxWidth: '92vw',
          background: 'var(--il-white)',
          borderLeft: '0.5px solid var(--il-line)',
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 350ms var(--il-ease-standard)',
          boxShadow: isOpen ? '-24px 0 48px rgba(30,26,20,0.08)' : 'none',
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px 32px',
            borderBottom: '0.5px solid var(--il-line)',
            flexShrink: 0,
          }}
        >
          <p className="il-label" style={{ margin: 0 }}>
            Carrinho
            {items.length > 0 && (
              <span style={{ marginLeft: 8, fontStyle: 'normal', letterSpacing: 0 }}>
                ({items.reduce((s, i) => s + i.quantity, 0)})
              </span>
            )}
          </p>
          <button
            ref={closeBtnRef}
            onClick={closeCart}
            aria-label="Fechar carrinho"
            style={{
              color: 'var(--il-muted)',
              fontSize: 22,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Lista de itens */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 32px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 72 }}>
              <p
                style={{
                  fontFamily: 'var(--il-font-serif)',
                  fontStyle: 'italic',
                  fontSize: 22,
                  color: 'var(--il-muted)',
                  marginBottom: 24,
                }}
              >
                Seu carrinho está vazio
              </p>
              <button onClick={closeCart} className="il-ghost">
                <i /> Ver coleção
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.sanityProductId}
                style={{
                  display: 'flex',
                  gap: 16,
                  paddingBlock: 20,
                  borderBottom: '0.5px solid var(--il-line-dark)',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 76,
                    height: 96,
                    flexShrink: 0,
                    background: 'var(--il-warm-mid)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {item.product.imageUrl && (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.title}
                      fill
                      sizes="76px"
                      style={{ objectFit: 'cover' }}
                    />
                  )}
                </div>

                {/* Dados */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--il-font-body)',
                      fontSize: 13,
                      fontWeight: 400,
                      color: 'var(--il-text)',
                      marginBottom: 4,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.product.title}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--il-font-serif)',
                      fontStyle: 'italic',
                      fontSize: 16,
                      fontWeight: 300,
                      color: 'var(--il-gold)',
                      marginBottom: 14,
                    }}
                  >
                    {fmt(item.product.price * item.quantity)}
                  </p>

                  {/* Controle de quantidade */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                      aria-label="Diminuir quantidade"
                      onClick={() =>
                        updateQuantity(item.sanityProductId, item.quantity - 1)
                      }
                      style={{
                        width: 28,
                        height: 28,
                        border: '0.5px solid var(--il-line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--il-muted)',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        width: 32,
                        textAlign: 'center',
                        fontFamily: 'var(--il-font-body)',
                        fontSize: 12,
                        color: 'var(--il-text)',
                        borderTop: '0.5px solid var(--il-line)',
                        borderBottom: '0.5px solid var(--il-line)',
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      aria-label="Aumentar quantidade"
                      onClick={() =>
                        updateQuantity(item.sanityProductId, item.quantity + 1)
                      }
                      style={{
                        width: 28,
                        height: 28,
                        border: '0.5px solid var(--il-line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--il-muted)',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.sanityProductId)}
                      style={{
                        marginLeft: 12,
                        fontFamily: 'var(--il-font-body)',
                        fontSize: 11,
                        color: 'var(--il-muted)',
                        textDecoration: 'underline',
                        textUnderlineOffset: 2,
                      }}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé com total + CTA */}
        {items.length > 0 && (
          <div
            style={{
              padding: '24px 32px',
              borderTop: '0.5px solid var(--il-line)',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--il-font-body)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--il-muted)',
                }}
              >
                Subtotal
              </span>
              <span
                style={{
                  fontFamily: 'var(--il-font-serif)',
                  fontStyle: 'italic',
                  fontSize: 22,
                  fontWeight: 300,
                  color: 'var(--il-gold)',
                }}
              >
                {fmt(total)}
              </span>
            </div>
            <p
              style={{
                fontFamily: 'var(--il-font-body)',
                fontSize: 11,
                color: 'var(--il-muted)',
                marginBottom: 20,
              }}
            >
              Frete calculado no checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="il-solid"
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              Finalizar compra →
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
