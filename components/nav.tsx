'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import CartDrawer from '@/components/cart/cart-drawer'

const links = [
  { label: 'Coleção',  href: '/colecao' },
  { label: 'Sobre',    href: '/sobre' },
  { label: 'Processo', href: '/processo' },
  { label: 'Contato',  href: '/contato' },
]

export default function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  const openCart  = useCartStore(s => s.openCart)
  const totalItems = useCartStore(s => s.totalItems)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Não renderiza count antes de hidratar (evita mismatch SSR)
  const count = mounted ? totalItems() : 0

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 30,
          height: 72,
          background: scrolled ? 'rgba(242, 242, 242, 0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
          borderBottom: scrolled ? '0.5px solid var(--il-line)' : '0.5px solid transparent',
          transition: 'background .3s var(--il-ease-standard), border-color .3s var(--il-ease-standard)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 48px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" aria-label="Ilumiluz — página inicial">
            <Image
              src="/logo-ilumiluz.svg"
              alt="Ilumiluz"
              width={108}
              height={28}
              priority
            />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {links.map(l => {
              const active = pathname === l.href || pathname.startsWith(l.href + '/')
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className="il-navlink"
                  data-active={active ? '' : undefined}
                  style={{
                    fontFamily: 'var(--il-font-display)',
                    fontSize: 10.5,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: active ? 'var(--il-deep)' : 'var(--il-muted)',
                  }}
                >
                  {l.label}
                </Link>
              )
            })}

            <span style={{ width: 1, height: 14, background: 'var(--il-line-dark)' }} />

            <Link
              href="/sob-medida"
              style={{
                fontFamily: 'var(--il-font-display)',
                fontSize: 10.5,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--il-gold)',
              }}
            >
              Criar uma joia
            </Link>

            <span style={{ width: 1, height: 14, background: 'var(--il-line-dark)' }} />

            {/* Ícone do carrinho com badge */}
            <button
              onClick={openCart}
              aria-label={
                count > 0
                  ? `Carrinho — ${count} ${count === 1 ? 'item' : 'itens'}`
                  : 'Abrir carrinho'
              }
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 4,
                color: 'var(--il-muted)',
                transition: 'color var(--il-dur-fast) var(--il-ease-standard)',
              }}
            >
              {/* Sacola */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>

              {/* Badge */}
              {count > 0 && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -5,
                    minWidth: 16,
                    height: 16,
                    background: 'var(--il-gold)',
                    color: 'var(--il-off)',
                    fontSize: 9,
                    fontFamily: 'var(--il-font-display)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    padding: '0 3px',
                    lineHeight: 1,
                  }}
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Cart drawer — montado junto com o Nav para compartilhar o store */}
      <CartDrawer />
    </>
  )
}
