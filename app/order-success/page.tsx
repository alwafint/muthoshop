'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import confetti from 'canvas-confetti'
// সব আইকন একটি ইম্পোর্ট লাইনে নিয়ে আসা হয়েছে
import { 
  CheckCircle, 
  ShoppingBag, 
  ArrowRight, 
  Home, 
  Download, 
  Loader2 
} from 'lucide-react'

import Navbar from '@/components/Navbar'
import { createClient } from '@/utils/supabase/client'
import { generateInvoice } from '@/utils/generateInvoice'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const [downloading, setDownloading] = useState(false)
  const supabase = createClient()

  // কনফেটি এনিমেশন
  useEffect(() => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) return clearInterval(interval)

      const particleCount = 50 * (timeLeft / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  // ইনভয়েস ডাউনলোড ফাংশন
  const handleDownload = async () => {
    if (!orderId) return
    setDownloading(true)
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderId)
        .single()

      if (order) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id)

        if (items) {
          generateInvoice(order, items)
        }
      }
    } catch (err) {
      console.error(err)
      alert("ইনভয়েস তৈরি করতে সমস্যা হয়েছে।")
    }
    setDownloading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 md:py-24 text-center">
      <div className="relative inline-block mb-8">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
        <div className="relative bg-green-500 text-white p-6 rounded-full shadow-2xl">
          <CheckCircle size={64} strokeWidth={3} />
        </div>
      </div>

      <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4">অর্ডার সফল হয়েছে!</h1>
      <p className="text-lg text-gray-500 mb-8">মুঠোশপ থেকে কেনাকাটা করার জন্য ধন্যবাদ।</p>

      <div className="bg-white p-8 rounded-[40px] shadow-xl border border-gray-50 mb-10 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
        <p className="text-gray-400 font-bold uppercase text-xs mb-2 tracking-widest">অর্ডার নাম্বার</p>
        <h2 className="text-4xl font-black text-gray-900 mb-6">#{orderId || '0000'}</h2>
        
        <button 
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 mx-auto text-red-600 font-bold hover:bg-red-50 px-6 py-3 rounded-2xl transition"
        >
          {downloading ? <Loader2 className="animate-spin" /> : <Download size={20} />}
          ইনভয়েস ডাউনলোড করুন
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <Link href="/profile" className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
          <ShoppingBag size={20} /> অর্ডার লিস্ট
        </Link>
        <Link href="/" className="w-full md:w-auto bg-white text-red-600 border-2 border-red-50 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
          <Home size={20} /> হোমপেজে ফিরুন <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<div className="text-center py-20 font-bold">অপেক্ষা করুন...</div>}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  )
}