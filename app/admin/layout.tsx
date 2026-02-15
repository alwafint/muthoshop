'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X,
  ShoppingCart,
  PieChart // নতুন আইকন
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // মেনু আইটেম লিস্টে রিপোর্ট যুক্ত করা হয়েছে
  const menuItems = [
    { name: 'ড্যাশবোর্ড', icon: <LayoutDashboard size={20} />, path: '/admin' },
    { name: 'POS সিস্টেম', icon: <ShoppingCart size={20} />, path: '/admin/pos' },
    { name: 'পণ্য তালিকা', icon: <Package size={20} />, path: '/admin/products' },
    { name: 'নতুন পণ্য যোগ', icon: <PlusCircle size={20} />, path: '/admin/products/add' },
    { name: 'অনলাইন অর্ডার', icon: <ShoppingBag size={20} />, path: '/admin/orders' },
    { name: 'রিপোর্ট ও অ্যানালিটিক্স', icon: <PieChart size={20} />, path: '/admin/reports' }, // নতুন মেনু
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* মোবাইল মেনু বাটন */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-red-600 text-white rounded-xl shadow-lg"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-8 text-2xl font-black text-red-500 border-b border-slate-800 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">ম</div>
            মুঠোশপ <span className="text-[10px] bg-slate-800 text-gray-400 px-2 py-1 rounded ml-2">ADMIN</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200
                  ${pathname === item.path 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <span className={`${pathname === item.path ? 'text-white' : 'text-gray-500'}`}>
                    {item.icon}
                </span>
                <span className="font-bold text-sm tracking-wide">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-slate-800 mb-4">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 w-full text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all group"
            >
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
              <span className="font-bold text-sm">লগআউট করুন</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen relative scroll-smooth bg-gray-50">
        <div className="min-h-full">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}