'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import JsBarcode from 'jsbarcode'
import { Save, Printer, RefreshCw, ArrowLeft, PackagePlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ১৬টি বাংলা ক্যাটাগরি লিস্ট
const categories = [
  'চাল ও ডাল', 'তেল ও মশলা', 'শাক-সবজি', 'মাছ ও মাংস', 'ফলমূল', 
  'দুধ ও দুগ্ধজাত', 'নাস্তা ও বিস্কুট', 'পানীয়', 'প্রাতরাশ', 
  'পার্সোনাল কেয়ার', 'পরিচ্ছন্নতা সামগ্রী', 'বেবি কেয়ার', 'গৃহস্থালি', 
  'ওষুধ ও স্বাস্থ্যসেবা', 'ফ্রোজেন ফুড', 'General'
]

export default function AddProductPage() {
  const supabase = createClient()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    cost_price: '', 
    stock: '',
    barcode: '',
    category: 'General' // ডিফল্ট ক্যাটাগরি
  })

  // ১. বারকোড জেনারেটর (MS- + ৬ ডিজিট)
  const generateBarcode = () => {
    const randomCode = 'MS-' + Math.floor(100000 + Math.random() * 900000)
    setFormData(prev => ({ ...prev, barcode: randomCode }))
  }

  // ২. বারকোড রেন্ডার (যখনই formData.barcode চেঞ্জ হবে)
  useEffect(() => {
    if (formData.barcode && canvasRef.current) {
      try {
        JsBarcode(canvasRef.current, formData.barcode, {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
          margin: 10
        })
      } catch (e) {
        console.error("Barcode error", e)
      }
    }
  }, [formData.barcode])

  // পেজ লোড হলেই একটা বারকোড জেনারেট হবে
  useEffect(() => {
    generateBarcode()
  }, [])

  // ৩. ডাটাবেসে সেভ করা
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('products').insert({
      name: formData.name,
      barcode: formData.barcode,
      price: Number(formData.price),
      cost_price: formData.cost_price ? Number(formData.cost_price) : 0,
      stock: Number(formData.stock),
      category: formData.category
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('নতুন পণ্যটি সফলভাবে যোগ করা হয়েছে!')
      // ফর্ম রিসেট
      setFormData({ name: '', price: '', cost_price: '', stock: '', barcode: '', category: 'General' })
      generateBarcode() 
    }
    setLoading(false)
  }

  // ৪. প্রিন্ট ফাংশন
  const printBarcode = () => {
    const printWindow = window.open('', '', 'height=400,width=600')
    const imgData = canvasRef.current?.toDataURL('image/png')
    
    if(printWindow && imgData) {
        printWindow.document.write('<html><head><title>Print Label</title></head><body style="padding: 20px;">')
        printWindow.document.write('<div style="text-align:center; font-family: sans-serif; border: 1px dashed #ccc; padding: 10px;">')
        printWindow.document.write(`<h4 style="margin:0 0 5px 0;">${formData.name || 'Product Name'}</h4>`)
        printWindow.document.write(`<img src="${imgData}" style="max-width: 100%;" />`)
        printWindow.document.write(`<p style="margin:5px 0 0 0; font-weight:bold; font-size: 18px;">Price: ৳${formData.price || 0}</p>`)
        printWindow.document.write('</div>')
        printWindow.document.write('</body></html>')
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
        
        {/* হেডার */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
               <PackagePlus className="text-red-500" size={28} />
               <h2 className="text-xl font-black uppercase tracking-tight">নতুন পণ্য যোগ করুন</h2>
            </div>
            <Link href="/admin/products" className="flex items-center gap-1 text-sm bg-slate-800 px-4 py-2 rounded-xl hover:bg-slate-700 transition">
                <ArrowLeft size={16}/> তালিকায় ফিরে যান
            </Link>
        </div>

        <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* বাম পাশ: ফর্ম */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="label">পণ্যের নাম *</label>
                    <input required type="text" className="input-field" placeholder="উদাঃ মিনিকেট চাল (৫ কেজি)"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                {/* ক্যাটাগরি ড্রপডাউন */}
                <div>
                    <label className="label">ক্যাটাগরি সিলেক্ট করুন *</label>
                    <select 
                      className="input-field cursor-pointer"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label">বিক্রয় মূল্য (৳) *</label>
                        <input required type="number" className="input-field" placeholder="450"
                            value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div>
                        <label className="label">ক্রয় মূল্য (৳)</label>
                        <input type="number" className="input-field" placeholder="410"
                            value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="label">প্রাথমিক স্টক সংখ্যা *</label>
                    <input required type="number" className="input-field" placeholder="100"
                        value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={loading} 
                        className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-red-700 shadow-lg shadow-red-100 transition-all flex justify-center items-center gap-2 active:scale-95">
                        {loading ? 'সেভ হচ্ছে...' : <><Save size={22} /> ডাটাবেসে সেভ করুন</>}
                    </button>
                </div>
            </form>

            {/* ডান পাশ: বারকোড প্রিভিউ */}
            <div className="flex flex-col items-center justify-center bg-gray-50 p-8 rounded-3xl border-2 border-dashed border-gray-200">
                <h3 className="text-gray-400 font-bold uppercase text-xs mb-6 tracking-widest">বারকোড স্টিকার প্রিভিউ</h3>
                
                <div className="bg-white p-6 shadow-sm rounded-2xl border flex flex-col items-center mb-8">
                    <canvas ref={canvasRef} className="max-w-full"></canvas>
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <div className="flex gap-2">
                        <input readOnly type="text" className="input-field bg-gray-100 text-center font-mono text-gray-500" value={formData.barcode} />
                        <button type="button" onClick={generateBarcode} className="p-4 bg-gray-200 rounded-2xl hover:bg-gray-300 transition" title="Regenerate">
                            <RefreshCw size={24} className="text-gray-600" />
                        </button>
                    </div>

                    <button type="button" onClick={printBarcode} 
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 hover:bg-black transition shadow-xl active:scale-95">
                        <Printer size={20} /> বারকোড লেবেল প্রিন্ট করুন
                    </button>
                </div>
            </div>

        </div>
      </div>
      
      {/* স্টাইলের জন্য ছোট হ্যাক */}
      <style jsx>{`
        .label { display: block; font-size: 0.85rem; font-weight: 700; color: #4b5563; margin-bottom: 0.4rem; margin-left: 0.2rem; }
        .input-field { width: 100%; border: 2px solid #f3f4f6; padding: 0.8rem 1rem; border-radius: 1rem; outline: none; transition: all 0.2s; font-weight: 600; background: #f9fafb; }
        .input-field:focus { border-color: #dc2626; background: #fff; box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.05); }
      `}</style>
    </div>
  )
}