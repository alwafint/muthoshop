'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Edit, Trash2, Package, Search, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function ProductListPage() {
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  async function deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) fetchProducts()
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  )

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Package className="text-blue-600" /> Inventory Management
        </h1>
        <Link href="/admin/products/add" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          + Add New Product
        </Link>
      </div>

      {/* সার্চ এবং ফিল্টার */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or barcode..." 
          className="w-full pl-10 p-3 border rounded-xl outline-none focus:ring-2 ring-blue-500 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* প্রোডাক্ট টেবিল */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b text-gray-600 uppercase text-xs font-bold">
              <th className="p-4">Product Info</th>
              <th className="p-4 text-center">Price</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center p-10 text-gray-400">Loading products...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-10 text-gray-400">No products found.</td></tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{product.name}</div>
                    <div className="text-sm text-gray-500 font-mono">{product.barcode}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="font-semibold">৳{product.price}</div>
                    <div className="text-xs text-green-600">Cost: ৳{product.cost_price}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                      product.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {product.stock <= 5 && <AlertTriangle size={14} />}
                      {product.stock}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete"
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
  )
}