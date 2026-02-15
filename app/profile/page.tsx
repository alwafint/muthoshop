import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import { Package, Clock, CheckCircle, MapPin, ChevronRight, LogOut } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // লগইন না থাকলে লগইন পেজে পাঠিয়ে দাও
  if (!user) redirect('/login')

  // ইউজারের সব অর্ডার ফেচ করা (লেটেস্ট অর্ডার আগে থাকবে)
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* প্রোফাইল কার্ড */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-3xl font-black">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-black text-gray-800 leading-none mb-2">আমার অ্যাকাউন্ট</h1>
            <p className="text-gray-500 font-medium">{user.email}</p>
          </div>
          <Link href="/auth/logout" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-red-600 transition">
            <LogOut size={18} /> লগআউট
          </Link>
        </div>

        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <Package className="text-red-600" /> আমার অর্ডারসমূহ ({orders?.length || 0})
        </h2>

        {/* অর্ডার লিস্ট */}
        <div className="space-y-4">
          {!orders || orders.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center border border-dashed border-gray-300">
                <p className="text-gray-400 font-medium">আপনি এখনও কোনো অর্ডার করেননি।</p>
                <Link href="/" className="inline-block mt-4 text-red-600 font-bold hover:underline">কেনাকাটা শুরু করুন</Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition group">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <span className="font-black text-gray-800">অর্ডার #{order.order_number}</span>
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                            order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                        }`}>
                            {order.status === 'pending' ? <Clock size={12}/> : <CheckCircle size={12}/>}
                            {order.status}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                        অর্ডারের তারিখ: {new Date(order.created_at).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-black text-red-600">৳{order.total_amount}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{order.order_type === 'pos' ? 'Shop Purchase' : 'Online Order'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin size={14} className="text-red-400" />
                        <span className="truncate max-w-[200px] md:max-w-xs">{order.customer_address || 'দোকান থেকে কেনা'}</span>
                    </div>
                    {/* আপনি চাইলে এখানে অর্ডার ডিটেইলস পেজের লিংক দিতে পারেন */}
                    <button className="text-red-600 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        বিস্তারিত <ChevronRight size={16} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}