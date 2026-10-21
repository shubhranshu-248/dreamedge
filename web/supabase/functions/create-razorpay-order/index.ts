// Binds to LIVE courses DDL (hybrid of initial + courses_table migrations)
// Columns used: id, title, price, original_price, validity_days, status (content_status enum)
// Column: student_count (int, not total_students)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? 'https://dreamedge.online,https://dream-edge-olive.vercel.app').split(',')

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  return {
    'Access-Control-Allow-Origin': origin === '' || ALLOWED_ORIGINS.includes(origin) ? (origin || ALLOWED_ORIGINS[0]) : ALLOWED_ORIGINS[0],
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

serve(async (req) => {
  const cors = corsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: student, error: studentError } = await serviceClient
      .from('students')
      .select('id, full_name, phone, email')
      .eq('user_id', user.id)
      .single()

    if (studentError || !student) {
      return new Response(JSON.stringify({ error: 'Student profile not found' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { course_id } = await req.json()
    if (!course_id) {
      return new Response(JSON.stringify({ error: 'course_id is required' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { data: course, error: courseError } = await serviceClient
      .from('courses')
      .select('id, title, price, original_price, validity_days, status')
      .eq('id', course_id)
      .single()

    if (courseError || !course) {
      return new Response(JSON.stringify({ error: 'Course not found' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    if (course.status !== 'published') {
      return new Response(JSON.stringify({ error: 'Course is not available for purchase' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { data: existingEnrollment } = await serviceClient
      .from('enrollments')
      .select('id')
      .eq('student_id', student.id)
      .eq('course_id', course_id)
      .eq('status', 'active')
      .maybeSingle()

    if (existingEnrollment) {
      return new Response(JSON.stringify({ error: 'Already enrolled in this course' }), {
        status: 409,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const finalAmount: number = course.price
    const discountAmount: number = (course.original_price ?? course.price) - finalAmount

    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
    const { data: pendingOrder } = await serviceClient
      .from('orders')
      .select('id, razorpay_order_id')
      .eq('student_id', student.id)
      .eq('course_id', course_id)
      .eq('status', 'pending')
      .gte('created_at', fifteenMinAgo)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (pendingOrder?.razorpay_order_id) {
      return new Response(JSON.stringify({
        order_id: pendingOrder.id,
        razorpay_order_id: pendingOrder.razorpay_order_id,
        amount: finalAmount,
        currency: 'INR',
        key_id: RAZORPAY_KEY_ID,
        prefill: {
          name: student.full_name,
          email: student.email ?? user.email ?? '',
          contact: student.phone ?? '',
        },
      }), {
        status: 200,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const orderId = crypto.randomUUID()
    const receiptPrefix = orderId.substring(0, 8)

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        amount: Math.round(finalAmount * 100),
        currency: 'INR',
        receipt: `de_${receiptPrefix}`,
        notes: {
          course_id,
          student_id: student.id,
        },
      }),
    })

    if (!razorpayRes.ok) {
      const errBody = await razorpayRes.text()
      console.error('Razorpay order creation failed:', errBody)
      return new Response(JSON.stringify({ error: 'Failed to create payment order' }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const razorpayOrder = await razorpayRes.json()

    const { error: insertError } = await serviceClient
      .from('orders')
      .insert({
        id: orderId,
        student_id: student.id,
        course_id,
        amount: course.price,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        payment_method: 'razorpay',
        razorpay_order_id: razorpayOrder.id,
        status: 'pending',
      })

    if (insertError) {
      console.error('Order insert error:', insertError)
      return new Response(JSON.stringify({ error: 'Failed to create order record' }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({
      order_id: orderId,
      razorpay_order_id: razorpayOrder.id,
      amount: finalAmount,
      currency: 'INR',
      key_id: RAZORPAY_KEY_ID,
      prefill: {
        name: student.full_name,
        email: student.email ?? user.email ?? '',
        contact: student.phone ?? '',
      },
    }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})
