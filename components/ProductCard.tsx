'use client'
import { useState } from 'react'
import { Plus, ShoppingBasket, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { addToDbCart } from '@/app/cart/actions'
import { useCartStore } from '@/store/cartStore'

export default function ProductCard({ product }: { product: any }) {
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const addToLocalCart = useCartStore((state) => state.addToCart)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAdding(true)
    
    try {
      const result = (await addToDbCart(product.id, 1)) as any
      if (result?.error) {
        alert('পণ্য কার্টে যোগ করতে দয়া করে লগইন করুন।')
      } else {
        addToLocalCart(product)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <div className="bg-white h-full rounded-3xl border border-gray-100 p-4 hover:shadow-2xl hover:shadow-red-100 transition-all duration-300 flex flex-col relative overflow-hidden">
        <div className="aspect-square bg-gray-50 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden">
          {product.image_url && !imageError ? (
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
              onError={() => setImageError(true)} 
            />
          ) : (
            <ShoppingBasket size={40} className="text-gray-200" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-sm h-10 line-clamp-2 leading-tight mb-1">{product.name}</h3>
          <p className="text-[10px] text-gray-400 font-mono mb-3 uppercase tracking-tighter">{product.barcode}</p>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 line-through">৳{product.price + 20}</span>
              <span className="text-xl font-black text-red-600 leading-none">৳{product.price}</span>
          </div>
          <button onClick={handleAddToCart} disabled={isAdding} className="bg-red-50 text-red-600 p-3 rounded-2xl hover:bg-red-600 hover:text-white transition-all z-20">
            {isAdding ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
          </button>
        </div>
      </div>
    </Link>
  )
}