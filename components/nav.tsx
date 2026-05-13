'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
  { label: 'Coleção', href: '/colecao' },
  { label: 'Sobre',   href: '/sobre' },
  { label: 'Processo', href: '/processo' },
  { label: 'Contato', href: '/contato' },
]

export default function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 30,
      height: 72,
      background: scrolled ? 'rgba(242, 242, 242, 0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(8px)' : 'none',
      borderBottom: scrolled ? '0.5px solid var(--il-line)' : '0.5px solid transparent',
      transition: 'background .3s var(--il-ease-standard), border-color .3s var(--il-ease-standard)',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 48px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
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
        </div>
      </div>
    </nav>
  )
}
