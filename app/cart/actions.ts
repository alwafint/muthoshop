'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * ১. ডাটাবেজ কার্টে পণ্য যোগ করা (এটি ProductCard এ ব্যবহার করা হয়েছে)
 */
export async function addToDbCart(productId: string, quantity: number = 1) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ইউজার লগইন না থাকলে এরর রিটার্ন করবে
  if (!user) return { error: 'Please login' }

  // চেক করুন পণ্যটি ওই ইউজারের কার্টে অলরেডি আছে কিনা
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    // যদি থাকে, তবে কোয়ান্টিটি বাড়িয়ে দিন
    await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
  } else {
    // না থাকলে নতুন করে ইনসার্ট করুন
    await supabase
      .from('cart_items')
      .insert({ 
        user_id: user.id, 
        product_id: productId, 
        quantity: quantity 
      })
  }

  // কার্ট পেজ এবং হোমপেজ রিফ্রেশ করা
  revalidatePath('/cart')
  revalidatePath('/')
  return { success: true }
}

/**
 * ২. কার্ট থেকে পণ্য মুছে ফেলা (ডিলিট বাটন)
 */
export async function removeFromDbCart(cartItemId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
  
  if (error) return { error: error.message }
  
  revalidatePath('/cart')
  return { success: true }
}

/**
 * ৩. কার্টের কোয়ান্টিটি কমানো বা বাড়ানো (প্লাস/মাইনাস বাটন)
 */
export async function updateDbCartQuantity(cartItemId: string, newQty: number) {
  const supabase = await createClient()
  
  // যদি কোয়ান্টিটি ১ এর নিচে চলে যায়, তবে আইটেমটি ডিলিট করে দিন
  if (newQty < 1) return removeFromDbCart(cartItemId)

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity: newQty })
    .eq('id', cartItemId)

  if (error) return { error: error.message }

  revalidatePath('/cart')
  return { success: true }
}