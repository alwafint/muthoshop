'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * submitOrder: অর্ডার তৈরি করা, স্টক কমানো এবং ডাটাবেস কার্ট খালি করার প্রধান ফাংশন।
 */
export async function submitOrder(
  cartItems: any[], 
  total: number, 
  type: 'online' | 'pos', 
  customerInfo: { name?: string; phone?: string; address?: string; area?: string }
) {
  // ১. সুপাবেজ সার্ভার ক্লায়েন্ট তৈরি
  const supabase = await createClient()

  // ২. বর্তমানে লগইন করা ইউজারের সেশন দেখা
  const { data: { user } } = await supabase.auth.getUser()

  // ৩. 'orders' টেবিলে নতুন অর্ডার ইনসার্ট করা
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      total_amount: total,
      order_type: type,
      customer_name: customerInfo.name || (type === 'pos' ? 'Walk-in Customer' : 'Unknown User'),
      customer_phone: customerInfo.phone || null,
      customer_address: customerInfo.address || null,
      status: type === 'pos' ? 'completed' : 'pending',
      user_id: user?.id || null // কাস্টমার লগইন করা থাকলে তার আইডি সেভ হবে
    })
    .select()
    .single()

  if (orderError) {
    console.error('Order Insertion Error:', orderError)
    return { success: false, error: orderError.message }
  }

  // ৪. 'order_items' টেবিলে পণ্যের তালিকা ইনসার্ট করা
  // নোট: কার্ট পেজ থেকে আসলে ডাটা স্ট্রাকচার একটু আলাদা হতে পারে (item.products.id)
  const orderItemsData = cartItems.map((item) => {
    const p_id = item.product_id || item.id || item.products?.id
    const p_name = item.product_name || item.name || item.products?.name
    const p_price = item.price || item.products?.price
    const p_qty = item.quantity || item.cartQuantity

    return {
      order_id: order.id,
      product_id: p_id,
      quantity: p_qty,
      price: p_price,
      product_name: p_name
    }
  })

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData)

  if (itemsError) {
    console.error('Order Items Insertion Error:', itemsError)
    return { success: false, error: itemsError.message }
  }

  // ৫. *** ডাটাবেস কার্ট খালি করা (Cart Clearance) ***
  // অর্ডার সফল হলে ওই ইউজারের 'cart_items' টেবিল থেকে সব পণ্য মুছে ফেলা হবে
  if (user) {
    const { error: cartClearError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
    
    if (cartClearError) {
      console.error('Database Cart Clear Failed:', cartClearError)
    }
  }

  // ৬. ইনভেন্টরি স্টক আপডেট করা (Stock Decrement)
  try {
    for (const item of cartItems) {
      const p_id = item.product_id || item.id || item.products?.id
      const q_to_dec = item.quantity || item.cartQuantity

      // বর্তমান স্টক কত আছে তা দেখা
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', p_id)
        .single()

      if (product) {
        // নতুন স্টক ক্যালকুলেট করা (০ এর নিচে যেন না যায়)
        const newStock = Math.max(0, product.stock - q_to_dec)
        
        // ডাটাবেসে স্টক আপডেট করা
        await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', p_id)
      }
    }
  } catch (stockError) {
    console.error('Inventory Sync Error:', stockError)
  }

  // ৭. পেজগুলো রিভ্যালিডেট করা (যাতে নতুন ডাটা সাথে সাথে দেখায়)
  revalidatePath('/cart')
  revalidatePath('/profile')
  revalidatePath('/admin')
  revalidatePath('/admin/orders')
  revalidatePath('/admin/products')
  revalidatePath('/')

  // ৮. সফল রেসপন্স রিটার্ন করা
  return { 
    success: true, 
    orderId: order.order_number, 
    message: type === 'online' ? 'আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে!' : 'বিক্রয় সম্পন্ন হয়েছে!'
  }
}