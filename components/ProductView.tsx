'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { 
  ShoppingBasket, Plus, Minus, CheckCircle, 
  Truck, ShieldCheck, ArrowLeft 
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProductView({ product }: { product: any }) {
  const [imageError, setImageError] = useState(false)
  const [qty, setQty] = useState(1)
  
  const { addToCart, cart } = useCartStore()
  const router = useRouter()

  // কার্টে অলরেডি আছে কিনা চেক করা
  const cartItem = cart.find(item => item.id === product.id)
  const currentQty = cartItem ? cartItem.cartQuantity : 0

  const handleAddToCart = () => {
    // যতগুলো কোয়ান্টিটি সিলেক্ট করেছে, ততবার লুপ চালিয়ে এড করা (অথবা স্টোর আপডেট করা)
    // সিম্পলিসিটির জন্য আমরা লুপ চালাচ্ছি
    for(let i=0; i < qty; i++){
        addToCart(product)
    }
    // কার্ট পেজে নিয়ে যাওয়ার অপশন (চাইলে রাখতে পারেন)
    // router.push('/cart') 
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
      
      {/* Back Button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold mb-6 transition">
        <ArrowLeft size={20} /> ফিরে যান
      </button>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        
        {/* Left: Image Section */}
        <div className="aspect-square bg-gray-50 rounded-3xl flex items-center justify-center relative overflow-hidden group">
          {product.image_url && !imageError ? (
             <img 
               src={product.image_url} 
               alt={product.name} 
               className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
               onError={() => setImageError(true)}
             />
          ) : (
             <ShoppingBasket size={80} className="text-gray-200" />
          )}
          {product.stock <= 5 && product.stock > 0 && (
             <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                স্টক সীমিত!
             </span>
          )}
        </div>

        {/* Right: Info Section */}
        <div className="flex flex-col justify-center">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                {product.category || 'General'}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-4 leading-tight">
                {product.name}
            </h1>
            
            <div className="flex items-end gap-4 mb-6">
                <span className="text-4xl font-black text-red-600">৳{product.price}</span>
                <span className="text-lg text-gray-400 line-through mb-1">৳{product.price + Math.floor(product.price * 0.1)}</span>
            </div>

            {/* Description / Features */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <CheckCircle size={18} className="text-green-500" />
                    <span>১০০% অরজিনাল পণ্য</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck size={18} className="text-blue-500" />
                    <span>দ্রুত হোম ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <ShieldCheck size={18} className="text-orange-500" />
                    <span>ক্যাশ অন ডেলিভারি সুবিধা</span>
                </div>
            </div>

            {/* Quantity Selector (Desktop) */}
            <div className="hidden md:flex items-center gap-6 mb-8">
                <div className="flex items-center gap-4 bg-gray-100 rounded-full p-2 px-4">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-white rounded-full transition"><Minus size={18}/></button>
                    <span className="text-xl font-bold w-6 text-center">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-white rounded-full transition"><Plus size={18}/></button>
                </div>
                <button 
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 bg-red-600 text-white py-4 rounded-full font-bold text-lg hover:bg-red-700 transition shadow-lg shadow-red-200 active:scale-95 disabled:bg-gray-300"
                >
                    {product.stock <= 0 ? 'স্টক আউট' : 'কার্টে যোগ করুন'}
                </button>
            </div>
            
            {/* Desktop Message */}
            {currentQty > 0 && (
                <div className="hidden md:block p-3 bg-green-50 text-green-700 rounded-xl text-center text-sm font-bold border border-green-200">
                    এই পণ্যটি আপনার কার্টে {currentQty} টি আছে
                </div>
            )}
        </div>
      </div>

      {/* Mobile Sticky Footer (মোবাইলের জন্য ফিক্সড বার) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 px-6 md:hidden flex items-center gap-4 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-2 px-3">
            <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16}/></button>
            <span className="font-bold w-4 text-center">{qty}</span>
            <button onClick={() => setQty(qty + 1)}><Plus size={16}/></button>
        </div>
        <button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-300"
        >
            {product.stock <= 0 ? 'Stock Out' : `কার্টে নিন - ৳${product.price * qty}`}
        </button>
      </div>

    </div>
  )
}