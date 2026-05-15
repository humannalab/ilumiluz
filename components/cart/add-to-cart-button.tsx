'use client'

import { useCartStore } from '@/stores/cart-store'

interface Props {
  sanityProductId: string
  title: string
  price: number
  slug: string
  imageUrl?: string
}

/**
 * Botão "Adicionar ao carrinho" — conectado ao Zustand store.
 * Abre o drawer automaticamente ao adicionar.
 */
export default function AddToCartButton({
  sanityProductId,
  title,
  price,
  slug,
  imageUrl,
}: Props) {
  const addItem = useCartStore(s => s.addItem)

  function handleClick() {
    addItem(sanityProductId, { title, price, slug, imageUrl })
  }

  return (
    <button
      className="il-out"
      style={{ justifyContent: 'center' }}
      onClick={handleClick}
    >
      Adicionar ao carrinho →
    </button>
  )
}
