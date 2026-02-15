'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Package, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  Barcode as BarcodeIcon,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function AdminProductList() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  // ডাটা ফেচ করার ফাংশন
  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching products:', error)
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // পণ্য মুছে ফেলার ফাংশন
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${name}" পণ্যটি মুছে ফেলতে চান?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) {
        alert('মুছে ফেলতে সমস্যা হয়েছে: ' + error.message)
      } else {
        setProducts(products.filter(p => p.id !== id))
      }
    }
  }

  // সার্চ ফিল্টার
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
            <Package className="text-red-600" /> পণ্য ব্যবস্থাপনা
          </h1>
          <p className="text-gray-500">আপনার দোকানের সব পণ্যের তালিকা ও স্টক এখানে ম্যানেজ করুন।</p>
        </div>
        <Link 
          href="/admin/products/add" 
          className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95"
        >
          <Plus size={20} /> নতুন পণ্য যোগ করুন
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-4 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="পণ্যের নাম বা বারকোড দিয়ে খুঁজুন..." 
          className="w-full p-4 pl-12 rounded-2xl border-none shadow-sm focus:ring-2 ring-red-500 outline-none text-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-5">পণ্যের তথ্য</th>
                <th className="p-5">ক্যাটাগরি</th>
                <th className="p-5">মূল্য (৳)</th>
                <th className="p-5 text-center">স্টক</th>
                <th className="p-5 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400">
                    <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-400 font-medium">
                    কোনো পণ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-gray-800">{product.name}</div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400 mt-1 uppercase">
                        <BarcodeIcon size={12} /> {product.barcode}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                        {product.category || 'General'}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="font-black text-gray-900">৳{product.price}</div>
                      <div className="text-[10px] text-green-600 font-bold">ক্রয়: ৳{product.cost_price}</div>
                    </td>
                    <td className="p-5 text-center">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-black ${
                        product.stock <= 5 
                          ? 'bg-red-100 text-red-600 animate-pulse' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {product.stock <= 5 && <AlertTriangle size={12} />}
                        {product.stock} টি
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center items-center gap-2">
                        {/* Edit Button (Placeholder) */}
                        <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors">
                          <Edit3 size={18} />
                        </button>
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      {!loading && (
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500 font-medium bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p>মোট পণ্য: <span className="text-red-600 font-bold">{filteredProducts.length} টি</span></p>
          <p className="hidden md:block">স্টক শেষ হওয়ার পথে: <span className="text-red-600 font-bold">{products.filter(p => p.stock <= 5).length} টি</span></p>
        </div>
      )}
    </div>
  )
}