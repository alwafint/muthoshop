'use client'
import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { 
  LayoutGrid, Utensils, Droplets, Carrot, Beef, Apple, Milk, 
  Cookie, CupSoda, Coffee, User, SprayCan, Baby, 
  Home, PlusSquare, IceCream, Package 
} from 'lucide-react'

// ১৬টি ক্যাটাগরির আইকন ম্যাপিং (বাংলা নাম অনুযায়ী)
const categoryIcons: any = {
  'চাল ও ডাল': <Utensils size={18} />,
  'তেল ও মশলা': <Droplets size={18} />,
  'শাক-সবজি': <Carrot size={18} />,
  'মাছ ও মাংস': <Beef size={18} />,
  'ফলমূল': <Apple size={18} />,
  'দুধ ও দুগ্ধজাত': <Milk size={18} />,
  'নাস্তা ও বিস্কুট': <Cookie size={18} />,
  'পানীয়': <CupSoda size={18} />,
  'প্রাতরাশ': <Coffee size={18} />,
  'পার্সোনাল কেয়ার': <User size={18} />,
  'পরিচ্ছন্নতা সামগ্রী': <SprayCan size={18} />,
  'বেবি কেয়ার': <Baby size={18} />,
  'গৃহস্থালি': <Home size={18} />,
  'ওষুধ ও স্বাস্থ্যসেবা': <PlusSquare size={18} />,
  'ফ্রোজেন ফুড': <IceCream size={18} />,
  'General': <Package size={18} />
}

export default function ProductFilter({ products }: { products: any[] }) {
  const [activeCategory, setActiveCategory] = useState('All')

  // ইউনিক ক্যাটাগরি বের করা
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category || 'General')))]

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => (p.category || 'General') === activeCategory)

  return (
    <div>
      {/* Category Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide mb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all duration-300
              ${activeCategory === cat 
                ? 'bg-red-600 text-white shadow-lg shadow-red-200 scale-105' 
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50 hover:shadow-md'}
            `}
          >
            {cat === 'All' ? <LayoutGrid size={18} /> : categoryIcons[cat] || <Package size={18} />}
            {cat === 'All' ? 'সব পণ্য' : cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 transition-all duration-500">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">এই ক্যাটাগরিতে বর্তমানে কোনো পণ্য নেই।</p>
        </div>
      )}
    </div>
  )
}