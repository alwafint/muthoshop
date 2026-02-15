import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // ১. প্রাথমিক রেসপন্স তৈরি
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // ২. সুপাবেজ ক্লায়েন্ট সেটআপ (মিডলওয়্যারের জন্য বিশেষ কনফিগারেশন)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // ৩. সেশন রিফ্রেশ এবং ইউজার চেক
  // getUser() ব্যবহার করা সবচেয়ে নিরাপদ কারণ এটি সরাসরি সার্ভার থেকে ডেটা আনে
  const { data: { user } } = await supabase.auth.getUser()

  // ৪. যদি ইউজার এডমিন প্যানেলে (/admin) ঢোকার চেষ্টা করে
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // ক. লগইন না করা থাকলে সরাসরি /login পেজে পাঠাও
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // খ. লগইন করা থাকলে ডাটাবেস (profiles table) থেকে রোল চেক করো
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // গ. রোল যদি admin বা cashier না হয়, তবে হোমপেজে রিডাইরেক্ট করো
    if (profile?.role !== 'admin' && profile?.role !== 'cashier') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // ৫. যদি লগইন করা ইউজার আবার /login পেজে যেতে চায়, তাকে সরাসরি এডমিন প্যানেলে পাঠিয়ে দাও
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/admin/pos', request.url))
  }

  return response
}

// ৬. কনফিগ: কোন কোন পাথে এই মিডলওয়্যার চলবে
export const config = {
  matcher: [
    /*
     * নিচের পাথগুলো বাদে সব জায়গায় মিডলওয়্যার চলবে:
     * - _next/static (স্ট্যাটিক ফাইল)
     * - _next/image (ইমেজ অপ্টিমাইজেশন)
     * - favicon.ico (ফেভিকন)
     * - সব পাবলিক ফাইল (public ফোল্ডারের ফাইল যেমন লোগো, রোবটস ডট টেক্সট)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}