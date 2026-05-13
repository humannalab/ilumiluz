import Link from 'next/link'
import { getFeaturedProducts } from '@/lib/sanity-queries'
import SanityProductCard from './sanity-product-card'

export default async function Collection() {
  const products = await getFeaturedProducts()

  return (
    <section style={{ padding: '96px 48px', borderTop: '0.5px solid var(--il-line)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 56,
        }}>
          <div>
            <p className="il-eyebrow" style={{ marginBottom: 20 }}>Coleção</p>
            <h2 className="il-h" style={{ fontSize: 44, lineHeight: 1 }}>
              Criações <em>em curso.</em>
            </h2>
          </div>
          <Link href="/colecao" className="il-ghost"><i />Ver tudo</Link>
        </div>

        {products.length === 0 ? (
          /* Estado vazio: aparece enquanto o catálogo ainda não tem peças em destaque */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  height: 420,
                  background: 'var(--il-warm-mid)',
                  borderRadius: 2,
                  opacity: 0.4 + i * 0.15,
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(products.length, 3)}, 1fr)`,
            gap: 24,
          }}>
            {products.slice(0, 3).map((product) => (
              <SanityProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
