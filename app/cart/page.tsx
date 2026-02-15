import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { removeFromDbCart, updateDbCartQuantity } from './actions' // ইম্পোর্ট

export default async function CartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: cartItems } = await supabase
    .from('cart_items')
    .select(`id, quantity, products ( id, name, price, image_url )`)
    .eq('user_id', user.id)

  const subtotal = cartItems?.reduce((acc, item: any) => acc + (item.products.price * item.quantity), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl font-black mb-8 text-gray-800">আপনার শপিং ব্যাগ</h1>

        {!cartItems || cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed">
            <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold">আপনার ব্যাগটি খালি!</p>
            <Link href="/" className="inline-block mt-6 bg-red-600 text-white px-8 py-3 rounded-full font-bold">কেনাকাটা শুরু করুন</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: any) => (
                <div key={item.id} className="bg-white p-4 rounded-3xl shadow-sm border flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                    <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 truncate">{item.products.name}</h3>
                    <p className="text-red-600 font-black">৳{item.products.price}</p>
                    
                    <div className="mt-3 flex items-center gap-4">
                       <div className="flex items-center bg-gray-100 rounded-xl p-1 px-3 gap-4">
                          {/* মাইনাস বাটন */}
                          <form action={updateDbCartQuantity.bind(null, item.id, item.quantity - 1)}>
                            <button type="submit" className="text-gray-500 hover:text-red-600"><Minus size={16}/></button>
                          </form>
                          
                          <span className="font-bold text-sm">{item.quantity}</span>
                          
                          {/* প্লাস বাটন */}
                          <form action={updateDbCartQuantity.bind(null, item.id, item.quantity + 1)}>
                            <button type="submit" className="text-gray-500 hover:text-red-600"><Plus size={16}/></button>
                          </form>
                       </div>

                       {/* ডিলিট বাটন */}
                       <form action={removeFromDbCart.bind(null, item.id)}>
                         <button type="submit" className="text-gray-400 hover:text-red-600 transition-colors">
                           <Trash2 size={18} />
                         </button>
                       </form>
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <p className="text-lg font-black text-gray-800">৳{item.products.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border h-fit sticky top-24">
              <h2 className="text-xl font-black mb-6">অর্ডার সামারি</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between font-medium"><span>পণ্যের দাম</span><span>৳{subtotal}</span></div>
                <div className="flex justify-between font-medium"><span>ডেলিভারি</span><span className="text-green-600">ফ্রি</span></div>
                <div className="border-t pt-4 flex justify-between text-red-600"><span className="font-bold">সর্বমোট</span><span className="text-3xl font-black">৳{subtotal}</span></div>
              </div>
              <Link href="/checkout" className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2">
                চেকআউট করুন <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}