// LIVE SCHEMA BINDING (confirmed via supabase db query --linked, 2026-10-22)
// orders: id (uuid), student_id (uuid), course_id (uuid), status (order_status enum),
//         razorpay_order_id (text?), razorpay_payment_id (text?), razorpay_signature (text?)
// courses: validity_days (int, default 365)
// students: id (uuid), user_id (uuid)
// enrollments: student_id (uuid), course_id (uuid), payment_id (uuid?),
//              status (enrollment_status enum), purchased_at (timestamptz), valid_until (timestamptz)
// RPC: increment_student_count(p_course_id uuid) → courses.student_count (int)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const DEFAULT_VALIDITY_DAYS = 365

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? 'https://dreamedge.online,https://dream-edge-olive.vercel.app').split(',')

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin')
  const headers: Record<string, string> = {
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function completeOrder(
  serviceClient: ReturnType<typeof createClient>,
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<{ enrolled: boolean; order_id: string; enrollment_id?: string; error?: string }> {
  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('id, student_id, course_id, status, razorpay_order_id')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { enrolled: false, order_id: orderId, error: 'Order not found' }
  }

  if (order.razorpay_order_id !== razorpayOrderId) {
    return { enrolled: false, order_id: orderId, error: 'razorpay_order_id does not match this order' }
  }

  if (order.status === 'completed') {
    const { data: enrollment } = await serviceClient
      .from('enrollments')
      .select('id')
      .eq('student_id', order.student_id)
      .eq('course_id', order.course_id)
      .maybeSingle()

    return { enrolled: true, order_id: orderId, enrollment_id: enrollment?.id }
  }

  const { error: updateError } = await serviceClient
    .from('orders')
    .update({
      status: 'completed',
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    })
    .eq('id', orderId)
    .neq('status', 'completed')

  if (updateError) {
    console.error('Order update error:', updateError)
    return { enrolled: false, order_id: orderId, error: 'Failed to update order' }
  }

  const { data: course } = await serviceClient
    .from('courses')
    .select('validity_days')
    .eq('id', order.course_id)
    .single()

  const validityDays = course?.validity_days ?? DEFAULT_VALIDITY_DAYS
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + validityDays)

  const { data: enrollment, error: enrollError } = await serviceClient
    .from('enrollments')
    .upsert(
      {
        student_id: order.student_id,
        course_id: order.course_id,
        payment_id: orderId,
        status: 'active',
        purchased_at: new Date().toISOString(),
        valid_until: validUntil.toISOString(),
      },
      { onConflict: 'student_id,course_id' }
    )
    .select('id')
    .single()

  if (enrollError) {
    console.error('Enrollment upsert error:', enrollError)
    return { enrolled: false, order_id: orderId, error: 'Enrollment failed, webhook will retry' }
  }

  await serviceClient.rpc('increment_student_count', { p_course_id: order.course_id }).catch(
    (err: unknown) => console.error('increment_student_count error:', err)
  )

  return { enrolled: true, order_id: orderId, enrollment_id: enrollment?.id }
}

serve(async (req) => {
  const cors = corsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: { user }, error: authError } = await serviceClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    // SECURITY: verify the authenticated user owns this order
    const { data: order } = await serviceClient
      .from('orders')
      .select('student_id')
      .eq('id', order_id)
      .single()

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { data: student } = await serviceClient
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!student || student.id !== order.student_id) {
      return new Response(JSON.stringify({ error: 'Not your order' }), {
        status: 403,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const expectedSignature = await hmacSha256(
      RAZORPAY_KEY_SECRET,
      `${razorpay_order_id}|${razorpay_payment_id}`
    )

    if (expectedSignature !== razorpay_signature) {
      await serviceClient
        .from('orders')
        .update({ status: 'failed' })
        .eq('id', order_id)
        .neq('status', 'completed')

      return new Response(JSON.stringify({ error: 'Invalid payment signature' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const result = await completeOrder(serviceClient, order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature)

    if (result.error === 'razorpay_order_id does not match this order') {
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify(result), {
      status: result.enrolled ? 200 : 500,
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

export { completeOrder, hmacSha256 }
