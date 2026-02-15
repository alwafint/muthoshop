'use client'
import { useState, useRef } from 'react'
import { useCartStore } from '@/store/cartStore'
import { submitOrder } from '@/app/actions'
import { 
  ShoppingCart, Trash2, Search, PauseCircle, 
  PlayCircle, Printer, Tag, Calculator 
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function AdvancedPOS() {
  const { 
    cart, addToCart, removeFromCart, updateQuantity, 
    total, subtotal, discount, setDiscount, 
    holdCart, heldCarts, resumeCart, clearCart 
  } = useCartStore()
  
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<any[]>([])
  const [showHeld, setShowHeld] = useState(false)
  const supabase = createClient()

  // ১. ইনভয়েস প্রিন্ট ফাংশন
  const printInvoice = (orderId: number) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const content = `
      <html>
        <head>
          <title>Muthoshop Invoice</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 80mm; padding: 5px; }
            .center { text-align: center; }
            .line { border-bottom: 1px dashed #000; margin: 5px 0; }
            table { width: 100%; font-size: 12px; }
            .total { font-weight: bold; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="center">
            <h2 style="margin:0">মুঠোশপ</h2>
            <p style="font-size:10px">মিরপুর, ঢাকা | ০১৭XXXXXXXX</p>
            <p style="font-size:10px">অর্ডার: #${orderId}</p>
          </div>
          <div class="line"></div>
          <table>
            ${cart.map(item => `
              <tr>
                <td>${item.name} x ${item.cartQuantity}</td>
                <td align="right">৳${item.price * item.cartQuantity}</td>
              </tr>
            `).join('')}
          </table>
          <div class="line"></div>
          <table>
            <tr><td>Subtotal:</td><td align="right">৳${subtotal()}</td></tr>
            <tr><td>Discount:</td><td align="right">-৳${discount}</td></tr>
            <tr class="total"><td>TOTAL:</td><td align="right">৳${total()}</td></tr>
          </table>
          <div class="line"></div>
          <p class="center" style="font-size:10px">ধন্যবাদ, আবার আসবেন!</p>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleCheckout = async () => {
    const res = await submitOrder(cart, total(), 'pos', { name: 'Walk-in' })
    if (res.success) {
      printInvoice(res.orderId)
      clearCart()
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left: Product Selection */}
      <div className="flex-1 p-6 flex flex-col overflow-hidden">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 text-gray-400" />
            <input 
              type="text" placeholder="পণ্যের নাম বা বারকোড..."
              className="w-full p-4 pl-12 rounded-2xl bg-white shadow-sm outline-none ring-red-500 focus:ring-2"
              value={query}
              onChange={async (e) => {
                setQuery(e.target.value)
                const { data } = await supabase.from('products').select('*').or(`name.ilike.%${e.target.value}%,barcode.eq.${e.target.value}`).limit(8)
                setProducts(data || [])
              }}
            />
          </div>
          
          <button 
            onClick={() => setShowHeld(!showHeld)}
            className="bg-slate-800 text-white px-6 rounded-2xl flex items-center gap-2 relative"
          >
            <PauseCircle size={20} /> হোল্ড {heldCarts.length > 0 && <span className="absolute -top-2 -right-2 bg-red-600 w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">{heldCarts.length}</span>}
          </button>
        </div>

        {showHeld ? (
          <div className="grid grid-cols-2 gap-4">
            {heldCarts.map(hc => (
              <div key={hc.id} className="bg-white p-4 rounded-2xl shadow-sm border border-orange-200">
                <p className="font-bold">সময়: {hc.time}</p>
                <p className="text-sm text-gray-500">{hc.items.length} টি আইটেম</p>
                <button onClick={() => { resumeCart(hc.id); setShowHeld(false); }} className="mt-2 text-orange-600 font-bold flex items-center gap-1 hover:underline">
                  <PlayCircle size={16} /> চালু করুন
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto">
            {products.map(p => (
              <div key={p.id} onClick={() => addToCart(p)} className="bg-white p-4 rounded-2xl shadow-sm cursor-pointer hover:border-red-500 border-2 border-transparent transition-all group">
                <div className="h-20 bg-gray-50 rounded-xl mb-2 flex items-center justify-center text-gray-300">Image</div>
                <h4 className="font-bold text-sm truncate">{p.name}</h4>
                <p className="text-red-600 font-black">৳{p.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Cart & Billing */}
      <div className="w-[400px] bg-white border-l shadow-2xl flex flex-col">
        <div className="p-6 bg-red-600 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> কার্ট লিস্ট</h2>
          <button onClick={holdCart} className="text-xs bg-red-500 px-3 py-1 rounded-full hover:bg-red-400">হোল্ড করুন</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.map(item => (
            <div key={item.id} className="bg-gray-50 p-3 rounded-xl flex justify-between items-center group">
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs">
                    <button onClick={() => updateQuantity(item.id, item.cartQuantity - 1)} className="w-6 h-6 bg-white rounded-md border">-</button>
                    <span className="font-bold">{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.cartQuantity + 1)} className="w-6 h-6 bg-white rounded-md border">+</button>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-red-600 text-sm">৳{item.price * item.cartQuantity}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-600"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-100 space-y-4 border-t">
          <div className="flex justify-between text-sm text-gray-500">
            <span>সাবটোটাল:</span>
            <span>৳{subtotal()}</span>
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200">
            <Tag size={18} className="text-gray-400" />
            <input 
              type="number" placeholder="ডিসকাউন্ট (৳)" 
              className="bg-transparent outline-none flex-1 text-sm font-bold"
              onChange={(e) => setDiscount(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-between text-2xl font-black text-red-600">
            <span>টোটাল বিল:</span>
            <span>৳{total()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button 
              onClick={handleCheckout} 
              disabled={cart.length === 0}
              className="col-span-2 bg-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Printer size={20} /> পে করুন ও রসিদ দিন
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}