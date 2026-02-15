'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * ১. ডাটাবেজ কার্টে পণ্য যোগ করা
 */
export async function addToDbCart(productId: string, quantity: number = 1): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('cart_items')
      .insert({ 
        user_id: user.id, 
        product_id: productId, 
        quantity: quantity 
      })
  }

  revalidatePath('/cart')
  revalidatePath('/')
}

/**
 * ২. কার্ট থেকে পণ্য মুছে ফেলা (ডিলিট বাটন)
 */
export async function removeFromDbCart(cartItemId: string): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
  
  revalidatePath('/cart')
}

/**
 * ৩. কার্টের কোয়ান্টিটি কমানো বা বাড়ানো (প্লাস/মাইনাস বাটন)
 */
export async function updateDbCartQuantity(cartItemId: string, newQty: number): Promise<void> {
  const supabase = await createClient()
  
  // যদি কোয়ান্টিটি ১ এর নিচে চলে যায়, তবে আইটেমটি ডিলিট করে দিন
  if (newQty < 1) {
    await removeFromDbCart(cartItemId)
    return
  }

  await supabase
    .from('cart_items')
    .update({ quantity: newQty })
    .eq('id', cartItemId)

  revalidatePath('/cart')
}