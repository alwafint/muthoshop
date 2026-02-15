'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Calendar
} from 'lucide-react'

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCost: 0,
    totalProfit: 0,
    totalOrders: 0,
    inventoryValue: 0,
  })
  const [bestSellers, setBestSellers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchReportData()
  }, [])

  async function fetchReportData() {
    setLoading(true)
    
    // ১. বিক্রয় ও লাভ-ক্ষতির তথ্য আনা (Order Items এর সাথে Products জয়েন করে)
    // আমরা order_items থেকে আইটেমগুলো নেব এবং প্রোডাক্ট টেবিল থেকে cost_price নেব
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        price,
        product_id,
        products ( cost_price, name )
      `)

    let totalSales = 0
    let totalCost = 0
    let productSales: any = {}

    if (orderItems) {
      orderItems.forEach((item: any) => {
        const salePrice = item.price * item.quantity
        const buyPrice = (item.products?.cost_price || 0) * item.quantity
        
        totalSales += salePrice
        totalCost += buyPrice

        // বেস্ট সেলিং লজিক
        if (productSales[item.product_id]) {
          productSales[item.product_id].qty += item.quantity
          productSales[item.product_id].totalPrice += salePrice
        } else {
          productSales[item.product_id] = {
            name: item.products?.name,
            qty: item.quantity,
            totalPrice: salePrice
          }
        }
      })
    }

    // ২. মোট অর্ডারের সংখ্যা
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })

    // ৩. বর্তমান ইনভেন্টরি ভ্যালু (স্টক * ক্রয়মূল্য)
    const { data: products } = await supabase.from('products').select('stock, cost_price')
    const inventoryValue = products?.reduce((acc, curr) => acc + (curr.stock * curr.cost_price), 0) || 0

    // ৪. বেস্ট সেলিং লিস্ট সাজানো (Top 5)
    const sortedBestSellers = Object.values(productSales)
      .sort((a: any, b: any) => b.qty - a.qty)
      .slice(0, 5)

    setStats({
      totalSales,
      totalCost,
      totalProfit: totalSales - totalCost,
      totalOrders: count || 0,
      inventoryValue
    })
    setBestSellers(sortedBestSellers)
    setLoading(false)
  }

  if (loading) return <div className="p-10 text-center font-bold text-red-600">রিপোর্ট জেনারেট হচ্ছে...</div>

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
          <PieChart className="text-red-600" /> বিজনেস রিপোর্ট ও অ্যানালিটিক্স
        </h1>
        <p className="text-gray-500">আপনার দোকানের আর্থিক অবস্থার বিস্তারিত বিবরণ।</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <ReportCard 
          title="মোট বিক্রয় (Lifetime)" 
          value={`৳${stats.totalSales}`} 
          icon={<DollarSign size={24}/>} 
          color="bg-blue-600"
          trend="মোট অর্জিত টাকা"
        />
        <ReportCard 
          title="নিট মুনাফা (Profit)" 
          value={`৳${stats.totalProfit}`} 
          icon={<TrendingUp size={24}/>} 
          color="bg-green-600"
          trend="সব খরচ বাদে লাভ"
        />
        <ReportCard 
          title="ইনভেন্টরি ভ্যালু" 
          value={`৳${stats.inventoryValue}`} 
          icon={<Package size={24}/>} 
          color="bg-orange-500"
          trend="দোকানে থাকা মালের দাম"
        />
        <ReportCard 
          title="মোট অর্ডার" 
          value={stats.totalOrders} 
          icon={<ShoppingCart size={24}/>} 
          color="bg-purple-600"
          trend="POS ও অনলাইন মিলিয়ে"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profit Analysis */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-red-600" /> আর্থিক সংক্ষিপ্তসার
          </h2>
          <div className="space-y-6">
            <div className="flex justify-between items-end border-b pb-4">
              <span className="text-gray-500">মোট বিক্রয়মূল্য:</span>
              <span className="text-2xl font-black text-gray-800">৳{stats.totalSales}</span>
            </div>
            <div className="flex justify-between items-end border-b pb-4">
              <span className="text-gray-500 text-sm">মোট ক্রয়মূল্য (Cost):</span>
              <span className="text-lg font-bold text-red-500">- ৳{stats.totalCost}</span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-gray-800 font-bold">মোট মুনাফা:</span>
              <div className="text-right">
                <span className="text-3xl font-black text-green-600">৳{stats.totalProfit}</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Net Profit Margin: {((stats.totalProfit / stats.totalSales) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Selling Products */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <ArrowUpRight size={20} className="text-green-600" /> সেরা বিক্রিত পণ্য (Top 5)
          </h2>
          <div className="space-y-4">
            {bestSellers.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{item.name}</p>
                    <p className="text-[10px] text-gray-400">বিক্রি হয়েছে: {item.qty} টি</p>
                  </div>
                </div>
                <div className="text-right">
                    <p className="font-black text-gray-800 text-sm">৳{item.totalPrice}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReportCard({ title, value, icon, color, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-8 ${color} opacity-5 rounded-bl-[100px] transition-all group-hover:p-10`}></div>
      <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-gray-200`}>
        {icon}
      </div>
      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-3xl font-black text-gray-800 mb-1">{value}</h3>
      <p className="text-[10px] text-gray-400 font-medium">{trend}</p>
    </div>
  )
}