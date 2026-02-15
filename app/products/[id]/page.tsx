// app/products/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/Navbar'
import ProductView from '@/components/ProductView'
import { notFound } from 'next/navigation'

// ১. params টাইপ ঠিক করা
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  
  // ২. params কে await করা (Next.js 15 এর নিয়ম)
  const { id } = await params;

  const supabase = await createClient()

  // ৩. ডাটাবেস থেকে প্রোডাক্ট ফেচ করা
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    return notFound()
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <ProductView product={product} />
    </div>
  )
}