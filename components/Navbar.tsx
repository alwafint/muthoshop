'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, User, X, ShoppingBasket } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { createClient } from '@/utils/supabase/client'

export default function Navbar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const cart = useCartStore((state) => state.cart)
  const addToCart = useCartStore((state) => state.addToCart)
  const cartCount = cart.reduce((acc, item) => acc + item.cartQuantity, 0)
  
  const supabase = createClient()
  const searchRef = useRef<HTMLDivElement>(null)

  // ১. পেজ লোড হওয়ার পর সব প্রোডাক্ট একবার নিয়ে আসা (সার্চ ফাস্ট করার জন্য)
  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase.from('products').select('id, name, price, barcode, image_url, stock')
      if (data) setAllProducts(data)
    }
    loadProducts()
  }, [])

  // ২. সার্চ লজিক: একটি অক্ষর লিখলেই ফিল্টার হবে
  useEffect(() => {
    if (query.length > 0) {
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.barcode.includes(query)
      ).slice(0, 8) // সর্বোচ্চ ৮টি রেজাল্ট দেখাবে
      setResults(filtered)
      setIsSearching(true)
    } else {
      setResults([])
      setIsSearching(false)
    }
  }, [query, allProducts])

  // বাইরে ক্লিক করলে সার্চ রেজাল্ট বন্ধ হবে
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearching(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <span className="text-2xl md:text-3xl font-black text-red-600 tracking-tighter">মুঠোশপ</span>
        </Link>

        {/* Powerful Search Bar */}
        <div className="flex-1 relative" ref={searchRef}>
          <div className="relative group">
            <input 
              type="text" 
              placeholder="পণ্য খুঁজুন (যেমন: চাল, ডাল...)" 
              className="w-full bg-gray-100 border-2 border-transparent focus:border-red-600 focus:bg-white rounded-2xl py-2.5 md:py-3 px-12 outline-none transition-all text-sm md:text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length > 0 && setIsSearching(true)}
            />
            <Search className={`absolute left-4 top-3 md:top-3.5 transition-colors ${query ? 'text-red-600' : 'text-gray-400'}`} size={20} />
            
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-3 md:top-3.5 text-gray-400 hover:text-red-600">
                <X size={20} />
              </button>
            )}
          </div>

          {/* Instant Search Results Dropdown */}
          {isSearching && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {results.length > 0 ? (
                <div className="p-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase px-3 py-2">সার্চ রেজাল্ট ({results.length})</p>
                  {results.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex items-center justify-between p-3 hover:bg-red-50 rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 flex-1" onClick={() => { setIsSearching(false); setQuery('') }}>
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                           <ShoppingBasket size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-red-600 font-black">৳{product.price}</p>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        className="bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Add to Cart"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-2">
                   <Search size={40} className="opacity-20" />
                   <p className="text-sm font-medium">দুঃখিত, এই নামে কোনো পণ্য পাওয়া যায়নি!</p>
                </div>
              )}
              
              {results.length > 0 && (
                <div className="bg-gray-50 p-3 text-center border-t">
                   <button onClick={() => setIsSearching(false)} className="text-xs font-bold text-red-600 hover:underline">সবগুলো রেজাল্ট দেখুন</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-5 shrink-0">
          <Link href="/profile" className="hidden md:flex p-2 text-gray-600 hover:text-red-600 transition">
            <User size={26} />
          </Link>
          
          <Link href="/cart" className="relative p-2.5 md:p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200 hover:scale-105 transition-all">
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-red-900 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}