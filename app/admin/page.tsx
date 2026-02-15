'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  TrendingUp, 
  ShoppingBag, 
  AlertCircle, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  PackageCheck
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    todaySales: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockCount: 0
  })
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    setLoading(true)
    
    // আজকের তারিখ বের করা (ISO format)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    // ১. আজকের টোটাল সেলস এবং অর্ডার সংখ্যা
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, status, order_type')
      .gte('created_at', todayStr)

    const todaySales = orders?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0
    const todayOrders = orders?.length || 0

    // ২. পেন্ডিং অনলাইন অর্ডার সংখ্যা
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('order_type', 'online')

    // ৩. লো-স্টক প্রোডাক্ট (স্টক ৫ বা তার কম)
    const { data: lowStock, count: lsCount } = await supabase
      .from('products')
      .select('name, stock, barcode')
      .lte('stock', 5)
      .order('stock', { ascending: true })

    // ৪. সাম্প্রতিক ৫টি অর্ডার
    const { data: recent } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    setStats({
      todaySales,
      totalOrders: todayOrders,
      pendingOrders: pendingCount || 0,
      lowStockCount: lsCount || 0
    })
    setLowStockProducts(lowStock || [])
    setRecentOrders(recent || [])
    setLoading(false)
  }

  if (loading) return <div className="p-10 text-center font-bold">লোড হচ্ছে...</div>

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">মুঠোশপ ড্যাশবোর্ড</h1>
          <p className="text-gray-500">স্বাগতম এডমিন, আজকের ব্যবসার সংক্ষিপ্ত বিবরণ নিচে দেখুন।</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/pos" className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-red-700 flex items-center gap-2">
            <ShoppingBag size={18} /> Open POS
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="আজকের মোট বিক্রি" 
          value={`৳${stats.todaySales}`} 
          icon={<DollarSign className="text-green-600" />} 
          color="bg-green-100" 
        />
        <StatCard 
          title="আজকের অর্ডার" 
          value={stats.totalOrders} 
          icon={<PackageCheck className="text-blue-600" />} 
          color="bg-blue-100" 
        />
        <StatCard 
          title="পেন্ডিং অনলাইন অর্ডার" 
          value={stats.pendingOrders} 
          icon={<TrendingUp className="text-orange-600" />} 
          color="bg-orange-100" 
        />
        <StatCard 
          title="লো-স্টক আইটেম" 
          value={stats.lowStockCount} 
          icon={<AlertCircle className="text-red-600" />} 
          color="bg-red-100" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* লো-স্টক লিস্ট */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" /> স্টক শেষ হওয়ার পথে
            </h2>
          </div>
          <div className="space-y-4">
            {lowStockProducts.length === 0 ? (
                <p className="text-gray-400 text-sm italic">সব স্টক পর্যাপ্ত আছে।</p>
            ) : (
                lowStockProducts.map((p, i) => (
                    <div key={i} className="flex justify-between items-center border-b pb-2">
                        <div>
                            <p className="font-medium text-gray-700 text-sm">{p.name}</p>
                            <p className="text-xs text-gray-400">Barcode: {p.barcode}</p>
                        </div>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded font-bold text-xs">
                            {p.stock} left
                        </span>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* সাম্প্রতিক অর্ডার লিস্ট */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> সাম্প্রতিক বিক্রি (Recent Sales)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b">
                  <th className="pb-3 uppercase">Order No</th>
                  <th className="pb-3 uppercase">Type</th>
                  <th className="pb-3 uppercase">Amount</th>
                  <th className="pb-3 uppercase">Status</th>
                  <th className="pb-3 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="text-sm hover:bg-gray-50 transition">
                    <td className="py-3 font-bold">#{order.order_number}</td>
                    <td className="py-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            order.order_type === 'pos' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                            {order.order_type}
                        </span>
                    </td>
                    <td className="py-3 font-semibold">৳{order.total_amount}</td>
                    <td className="py-3">
                        <span className={`text-xs ${order.status === 'completed' ? 'text-green-500' : 'text-orange-500'}`}>
                           ● {order.status}
                        </span>
                    </td>
                    <td className="py-3 text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`${color} p-4 rounded-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  )
}