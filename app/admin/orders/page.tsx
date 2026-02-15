'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  Truck, 
  Search, 
  Phone, 
  MapPin, 
  Calendar,
  ChevronRight,
  Filter,
  Loader2
} from 'lucide-react'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all') // all, pending, completed
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (!error) setOrders(data || [])
    setLoading(false)
  }

  // অর্ডারের স্ট্যাটাস পরিবর্তন (Pending -> Completed)
  async function updateStatus(orderId: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    
    if (!error) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
  }

  // ফিল্টারিং লজিক
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
        order.order_number.toString().includes(searchTerm) || 
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone?.includes(searchTerm)
    
    const matchesTab = activeTab === 'all' ? true : order.status === activeTab
    return matchesSearch && matchesTab
  })

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      
      {/* Header & Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3 mb-6">
          <ShoppingBag className="text-red-600" /> অনলাইন অর্ডার ব্যবস্থাপনা
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatSmall title="মোট অর্ডার" value={orders.length} icon={<ShoppingBag size={20}/>} color="text-blue-600" bg="bg-blue-100" />
            <StatSmall title="পেন্ডিং" value={orders.filter(o => o.status === 'pending').length} icon={<Clock size={20}/>} color="text-orange-600" bg="bg-orange-100" />
            <StatSmall title="ডেলিভারড" value={orders.filter(o => o.status === 'completed').length} icon={<CheckCircle size={20}/>} color="text-green-600" bg="bg-green-100" />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="অর্ডার নাম্বার বা কাস্টমারের নাম দিয়ে খুঁজুন..." 
            className="w-full p-4 pl-12 rounded-2xl border-none shadow-sm focus:ring-2 ring-red-500 outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            {['all', 'pending', 'completed'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        activeTab === tab ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    {tab === 'all' ? 'সবগুলো' : tab === 'pending' ? 'পেন্ডিং' : 'ডেলিভারড'}
                </button>
            ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-red-600" size={40} /></div>
        ) : filteredOrders.length === 0 ? (
            <div className="bg-white p-20 rounded-3xl text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold">কোনো অর্ডার পাওয়া যায়নি!</p>
            </div>
        ) : (
            filteredOrders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        
                        {/* কাস্টমার ও অর্ডার তথ্য */}
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-black text-gray-900">#ORD-{order.order_number}</span>
                                <span className={`flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                                    order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                                }`}>
                                    {order.status === 'pending' ? <Clock size={12}/> : <CheckCircle size={12}/>}
                                    {order.status}
                                </span>
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                                    {order.order_type}
                                </span>
                            </div>

                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    {order.customer_name}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                                    <span className="flex items-center gap-1.5"><Phone size={14} className="text-red-500"/> {order.customer_phone || 'N/A'}</span>
                                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-red-500"/> {order.customer_address || 'Walk-in'}</span>
                                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-red-500"/> {new Date(order.created_at).toLocaleDateString('bn-BD')}</span>
                                </div>
                            </div>
                        </div>

                        {/* টাকা ও অ্যাকশন */}
                        <div className="flex flex-row md:flex-col justify-between md:items-end gap-4 min-w-[150px]">
                            <div className="text-left md:text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">মোট বিল</p>
                                <p className="text-3xl font-black text-red-600 leading-none">৳{order.total_amount}</p>
                            </div>
                            
                            {order.status === 'pending' ? (
                                <button 
                                    onClick={() => updateStatus(order.id, 'completed')}
                                    className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95"
                                >
                                    <Truck size={18} /> মার্ক ডেলিভারড
                                </button>
                            ) : (
                                <div className="text-green-600 font-bold flex items-center gap-1 text-sm bg-green-50 px-4 py-2 rounded-xl">
                                    <CheckCircle size={16} /> সফলভাবে ডেলিভারড
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  )
}

// ছোট স্ট্যাট কার্ড কম্পোনেন্ট
function StatSmall({ title, value, icon, color, bg }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`${bg} ${color} p-3 rounded-xl`}>{icon}</div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{title}</p>
                <p className={`text-xl font-black ${color}`}>{value}</p>
            </div>
        </div>
    )
}