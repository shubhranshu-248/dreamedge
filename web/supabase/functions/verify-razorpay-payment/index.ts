import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<{ enrolled: boolean; order_id: string; enrollment_id?: string; error?: string }> {
  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('id, student_id, course_id, status')
    .eq('id', orderId)
    .single()

  if (orderError || !order) {
    return { enrolled: false, order_id: orderId, error: 'Order not found' }
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

  const validityDays = course?.validity_days ?? 365
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

  await serviceClient.rpc('increment_total_students', { p_course_id: order.course_id }).catch(
    (err: unknown) => console.error('increment_total_students error:', err)
  )

  return { enrolled: true, order_id: orderId, enrollment_id: enrollment?.id }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: { user }, error: authError } = await serviceClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await completeOrder(serviceClient, order_id, razorpay_payment_id, razorpay_signature)

    return new Response(JSON.stringify(result), {
      status: result.enrolled ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

export { completeOrder, hmacSha256 }
