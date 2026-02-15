'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * ১. ডাটাবেজ কার্টে পণ্য যোগ করা
 */
export async function addToDbCart(productId: string, quantity: number = 1) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Please login' }

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
      .insert({ user_id: user.id, product_id: productId, quantity: quantity })
  }

  revalidatePath('/cart')
  revalidatePath('/')
  return { success: true }
}

/**
 * ২. কার্ট থেকে পণ্য মুছে ফেলা
 */
export async function removeFromDbCart(cartItemId: string) {
  const supabase = await createClient()
  await supabase.from('cart_items').delete().eq('id', cartItemId)
  revalidatePath('/cart')
}

/**
 * ৩. কার্টের পরিমাণ কমানো বা বাড়ানো
 */
export async function updateDbCartQuantity(cartItemId: string, newQty: number) {
  const supabase = await createClient()
  if (newQty < 1) {
    await removeFromDbCart(cartItemId)
    return
  }
  await supabase.from('cart_items').update({ quantity: newQty }).eq('id', cartItemId)
  revalidatePath('/cart')
}