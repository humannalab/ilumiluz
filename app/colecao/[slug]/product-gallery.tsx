'use client'

import { useState } from 'react'
import Image from 'next/image'
import { productImageUrl } from '@/lib/sanity-queries'
import type { SanityImage } from '@/lib/sanity-queries'

interface Props {
  images: SanityImage[]
  title: string
}

export default function ProductGallery({ images, title }: Props) {
  const sorted = [...images].sort((a, b) => a.ordem - b.ordem)
  const [active, setActive] = useState(0)

  if (sorted.length === 0) {
    return (
      <div style={{
        aspectRatio: '3/4',
        background: 'var(--il-warm-mid)',
        position: 'sticky',
        top: 0,
        alignSelf: 'start',
      }} />
    )
  }

  const mainImg = sorted[active]
  const mainUrl = productImageUrl(mainImg, 900)

  return (
    <div style={{ position: 'sticky', top: 0, alignSelf: 'start', padding: '64px 0' }}>
      {/* Imagem principal */}
      <div style={{ position: 'relative', aspectRatio: '3/4', background: 'var(--il-warm-mid)' }}>
        <Image
          src={mainUrl}
          alt={mainImg.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Miniaturas */}
      {sorted.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {sorted.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                border: i === active ? '0.5px solid var(--il-gold)' : '0.5px solid var(--il-line)',
                padding: 0,
                background: 'none',
                cursor: 'pointer',
                flex: '0 0 64px',
                aspectRatio: '1/1',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                src={productImageUrl(img, 128)}
                alt={img.alt}
                fill
                sizes="64px"
                style={{ objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
