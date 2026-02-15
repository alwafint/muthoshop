import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import ProductFilter from '@/components/ProductFilter' // নতুন কম্পোনেন্ট ইম্পোর্ট
import { ShoppingBasket } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  
  // ১. ডাটাবেস থেকে সব প্রোডাক্ট আনা
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      
      {/* Hero Banner (আগের মতোই) */}
      <section className="bg-red-600 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left z-10">
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              হাতের মুঠোয় <br />প্রয়োজনীয় পণ্য
            </h1>
            <p className="text-lg opacity-90 mb-8 max-w-md">
              সেরা দামে সেরা মানের পণ্য কিনুন ঘরে বসেই।
            </p>
            <button className="bg-white text-red-600 px-8 py-3 rounded-full font-bold shadow-xl hover:bg-gray-100 transition">
              অর্ডার করুন
            </button>
          </div>
          <div className="hidden md:block opacity-20 absolute right-[-50px] top-[-50px]">
            <ShoppingBasket size={400} />
          </div>
        </div>
      </section>

      {/* Main Section with Filter */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-gray-800 border-l-8 border-red-600 pl-4">
            আমাদের কালেকশন
          </h2>
          <span className="text-gray-500 text-sm font-bold">
            মোট পণ্য: {products?.length || 0} টি
          </span>
        </div>
        
        {/* এখানে আমরা নতুন ফিল্টার কম্পোনেন্ট ব্যবহার করছি */}
        <ProductFilter products={products || []} />

      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-10 py-10 text-center text-gray-500 text-sm">
        <p>© ২০২৪ মুঠোশপ | ই-কমার্স ও POS সলিউশন</p>
      </footer>
    </div>
  )
}