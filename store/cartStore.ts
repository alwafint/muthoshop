import { create } from 'zustand'
import { Product, CartItem } from '@/types'

interface CartState {
  cart: CartItem[]
  heldCarts: { id: number, items: CartItem[], time: string }[] // হোল্ড করা কার্ট
  discount: number // ডিসকাউন্ট (টাকা)
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setDiscount: (amount: number) => void
  holdCart: () => void
  resumeCart: (id: number) => void
  clearCart: () => void
  total: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  heldCarts: [],
  discount: 0,
  
  addToCart: (product) => {
    const { cart } = get()
    const existing = cart.find((item) => item.id === product.id)
    if (existing) {
      set({ cart: cart.map((item) => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item) })
    } else {
      set({ cart: [...cart, { ...product, cartQuantity: 1 }] })
    }
  },
  
  removeFromCart: (id) => set({ cart: get().cart.filter((item) => item.id !== id) }),
  
  updateQuantity: (id, quantity) => set({ cart: get().cart.map((item) => item.id === id ? { ...item, cartQuantity: quantity } : item) }),
  
  setDiscount: (amount) => set({ discount: amount }),

  // বর্তমান কার্ট হোল্ড করে রাখা
  holdCart: () => {
    const { cart, heldCarts } = get()
    if (cart.length === 0) return
    const newHeldCart = { id: Date.now(), items: cart, time: new Date().toLocaleTimeString() }
    set({ heldCarts: [...heldCarts, newHeldCart], cart: [], discount: 0 })
  },

  // হোল্ড করা কার্ট পুনরায় চালু করা
  resumeCart: (id) => {
    const { heldCarts } = get()
    const target = heldCarts.find(c => c.id === id)
    if (target) {
      set({ cart: target.items, heldCarts: heldCarts.filter(c => c.id !== id) })
    }
  },

  clearCart: () => set({ cart: [], discount: 0 }),
  
  subtotal: () => get().cart.reduce((sum, item) => sum + item.price * item.cartQuantity, 0),
  total: () => get().subtotal() - get().discount,
}))