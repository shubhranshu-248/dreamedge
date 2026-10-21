// Binds to LIVE courses DDL (hybrid of initial + courses_table migrations)
// Courses columns used: validity_days (int, default 365)
// No CORS — direct POST from Razorpay servers
// No JWT — verify_jwt = false in config.toml; authenticates via X-Razorpay-Signature HMAC
// RPC: increment_student_count (targets student_count column)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!

const DEFAULT_VALIDITY_DAYS = 365

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

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const rawBody = await req.text()
    const webhookSignature = req.headers.get('X-Razorpay-Signature')

    if (!webhookSignature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 400 })
    }

    const expectedSignature = await hmacSha256(RAZORPAY_WEBHOOK_SECRET, rawBody)
    if (expectedSignature !== webhookSignature) {
      console.error('Webhook signature mismatch')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const eventType: string = event.event

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = event.payload.payment?.entity
      const razorpayOrderId = payment?.order_id ?? event.payload.order?.entity?.id
      const razorpayPaymentId = payment?.id

      if (!razorpayOrderId) {
        console.error('No razorpay_order_id in webhook payload')
        return new Response(JSON.stringify({ status: 'skipped' }), { status: 200 })
      }

      const { data: order } = await serviceClient
        .from('orders')
        .select('id, student_id, course_id, status')
        .eq('razorpay_order_id', razorpayOrderId)
        .maybeSingle()

      if (!order) {
        console.error('Order not found for razorpay_order_id:', razorpayOrderId)
        return new Response(JSON.stringify({ status: 'order_not_found' }), { status: 200 })
      }

      if (order.status === 'completed') {
        return new Response(JSON.stringify({ status: 'already_completed' }), { status: 200 })
      }

      await serviceClient
        .from('orders')
        .update({
          status: 'completed',
          razorpay_payment_id: razorpayPaymentId,
        })
        .eq('id', order.id)
        .neq('status', 'completed')

      const { data: course } = await serviceClient
        .from('courses')
        .select('validity_days')
        .eq('id', order.course_id)
        .single()

      const validityDays = course?.validity_days ?? DEFAULT_VALIDITY_DAYS
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + validityDays)

      await serviceClient
        .from('enrollments')
        .upsert(
          {
            student_id: order.student_id,
            course_id: order.course_id,
            payment_id: order.id,
            status: 'active',
            purchased_at: new Date().toISOString(),
            valid_until: validUntil.toISOString(),
          },
          { onConflict: 'student_id,course_id' }
        )

      await serviceClient
        .rpc('increment_student_count', { p_course_id: order.course_id })
        .catch((err: unknown) => console.error('increment_student_count error:', err))

      return new Response(JSON.stringify({ status: 'completed' }), { status: 200 })
    }

    if (eventType === 'payment.failed') {
      const payment = event.payload.payment?.entity
      const razorpayOrderId = payment?.order_id

      if (razorpayOrderId) {
        await serviceClient
          .from('orders')
          .update({ status: 'failed' })
          .eq('razorpay_order_id', razorpayOrderId)
          .eq('status', 'pending')
      }

      return new Response(JSON.stringify({ status: 'marked_failed' }), { status: 200 })
    }

    return new Response(JSON.stringify({ status: 'ignored', event: eventType }), { status: 200 })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
})
