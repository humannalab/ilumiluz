/**
 * Cart store — Zustand + localStorage.
 *
 * Persiste apenas `items` (não `isOpen`).
 * Funciona sem login; o login é exigido só no checkout.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartProductSnapshot {
  title: string
  price: number   // em reais (float)
  slug: string
  imageUrl?: string
}

export interface CartItem {
  sanityProductId: string
  quantity: number
  product: CartProductSnapshot
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean

  // Ações
  addItem: (sanityProductId: string, product: CartProductSnapshot) => void
  removeItem: (sanityProductId: string) => void
  updateQuantity: (sanityProductId: string, quantity: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void

  // Derivados
  totalItems: () => number
  totalAmount: () => number  // em reais
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (sanityProductId, product) => {
        set(state => {
          const existing = state.items.find(i => i.sanityProductId === sanityProductId)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.sanityProductId === sanityProductId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
              isOpen: true,
            }
          }
          return {
            items: [...state.items, { sanityProductId, quantity: 1, product }],
            isOpen: true,
          }
        })
      },

      removeItem: (sanityProductId) => {
        set(state => ({
          items: state.items.filter(i => i.sanityProductId !== sanityProductId),
        }))
      },

      updateQuantity: (sanityProductId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sanityProductId)
          return
        }
        set(state => ({
          items: state.items.map(i =>
            i.sanityProductId === sanityProductId ? { ...i, quantity } : i
          ),
        }))
      },

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    {
      name: 'ilumiluz-cart',
      // Persiste apenas os itens, não o estado do drawer
      partialize: (state) => ({ items: state.items }),
    }
  )
)
