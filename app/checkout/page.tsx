'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { submitOrder } from '@/app/actions'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { 
  User, Phone, MapPin, Truck, 
  CreditCard, ShieldCheck, ChevronLeft, 
  ShoppingBag, Loader2 
} from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const [customer, setCustomer] = useState({ 
    name: '', 
    phone: '', 
    address: '',
    area: 'ঢাকা সিটি' // ডিফল্ট এরিয়া
  })

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return alert("আপনার কার্ট খালি!")
    
    setLoading(true)
    // ডাটাবেসে অর্ডার সাবমিট করা
    const res = await submitOrder(cart, total(), 'online', customer)
    
    if (res.success) {
      router.push(`/order-success?id=${res.orderId}`)
      clearCart()
    } else {
      alert("ভুল হয়েছে: " + res.error)
    }
    setLoading(false)
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <ShoppingBag size={80} className="text-gray-200 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">আপনার কার্টে কোনো পণ্য নেই</h2>
          <Link href="/" className="mt-6 text-red-600 font-bold flex items-center gap-2">
             <ChevronLeft size={20} /> কেনাকাটা চালিয়ে যান
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center gap-2 mb-8">
           <Link href="/cart" className="p-2 bg-white rounded-full text-gray-400 hover:text-red-600 shadow-sm transition">
              <ChevronLeft size={24} />
           </Link>
           <h1 className="text-2xl md:text-3xl font-black text-gray-800">অর্ডার সম্পন্ন করুন</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* বাম পাশ: কাস্টমার ইনফরমেশন ফর্ম */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleOrder} id="checkout-form">
              
              {/* ডেলিভারি তথ্য */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-red-100 p-2 rounded-xl text-red-600">
                    <Truck size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">ডেলিভারি ঠিকানা</h2>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 flex items-center gap-2 ml-1">
                        <User size={16} /> আপনার নাম
                      </label>
                      <input 
                        required 
                        type="text" 
                        placeholder="উদাঃ আরিফ আহমেদ"
                        className="checkout-input"
                        onChange={e => setCustomer({...customer, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-600 flex items-center gap-2 ml-1">
                        <Phone size={16} /> মোবাইল নাম্বার
                      </label>
                      <input 
                        required 
                        type="tel" 
                        placeholder="উদাঃ 017XXXXXXXX"
                        className="checkout-input"
                        onChange={e => setCustomer({...customer, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-600 flex items-center gap-2 ml-1">
                      <MapPin size={16} /> পূর্ণাঙ্গ ঠিকানা (বাসা/ফ্ল্যাট নং, রাস্তা)
                    </label>
                    <textarea 
                      required 
                      placeholder="উদাঃ বাসা-১২, রোড-৫, সেক্টর-৩, উত্তরা, ঢাকা।"
                      className="checkout-input h-28 resize-none py-3"
                      onChange={e => setCustomer({...customer, address: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600 ml-1">এরিয়া</label>
                        <select 
                          className="checkout-input cursor-pointer"
                          onChange={e => setCustomer({...customer, area: e.target.value})}
                        >
                            <option>ঢাকা সিটি</option>
                            <option>ঢাকার বাইরে</option>
                        </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* পেমেন্ট পদ্ধতি */}
              <div className="mt-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                    <CreditCard size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">পেমেন্ট পদ্ধতি</h2>
                </div>

                <label className="flex items-center justify-between p-4 rounded-2xl border-2 border-red-600 bg-red-50 cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">ক্যাশ অন ডেলিভারি</p>
                            <p className="text-xs text-gray-500">পণ্য হাতে পেয়ে পেমেন্ট করুন</p>
                        </div>
                    </div>
                    <Truck className="text-red-600 opacity-20" size={32} />
                </label>
              </div>
            </form>
          </div>

          {/* ডান পাশ: অর্ডার সামারি */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-red-100/30 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-red-600" /> অর্ডার সামারি
              </h2>

              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-6 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={20}/></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 font-medium">৳{item.price} x {item.cartQuantity}</p>
                    </div>
                    <p className="font-bold text-gray-800 text-sm">৳{item.price * item.cartQuantity}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 border-t pt-6">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>পণ্যের দাম</span>
                  <span>৳{total()}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="text-green-600 font-bold">ফ্রি</span>
                </div>
                
                <div className="border-t border-dashed pt-4 flex justify-between items-center text-red-600">
                  <span className="font-bold text-lg">সর্বমোট</span>
                  <span className="text-4xl font-black">৳{total()}</span>
                </div>

                <div className="bg-orange-50 p-4 rounded-2xl flex items-start gap-3 mt-4 border border-orange-100">
                  <ShieldCheck className="text-orange-500 shrink-0" size={20} />
                  <p className="text-[11px] text-orange-800 font-medium">
                    "অর্ডার নিশ্চিত করুন" বাটনে ক্লিক করলে আপনার অর্ডারটি আমাদের কাছে পৌঁছাবে এবং আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।
                  </p>
                </div>

                <button 
                  type="submit" 
                  form="checkout-form"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-red-700 disabled:bg-gray-300 transition-all shadow-lg shadow-red-200 active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" /> প্রসেস হচ্ছে...</>
                  ) : (
                    'অর্ডার নিশ্চিত করুন'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .checkout-input {
          @apply w-full bg-gray-50 border-2 border-transparent p-4 rounded-2xl outline-none transition-all text-gray-800 font-medium;
        }
        .checkout-input:focus {
          @apply border-red-600 bg-white shadow-lg shadow-red-50;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f1f1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}