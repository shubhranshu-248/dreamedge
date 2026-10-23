// razorpay-webhook — called by Razorpay's servers on payment events.
// Authenticated by HMAC over the raw request body (X-Razorpay-Signature),
// no JWT (`verify_jwt = false` in config.toml).
//
// For payment.captured / order.paid: delegate the actual order
// completion to the complete_paid_order RPC, which takes a row lock on
// the orders row so this function cannot race with verify-razorpay-payment.
//
// For payment.failed: mark the order failed if still pending.
//
// LIVE SCHEMA BINDING (confirmed via supabase db query --linked, 2026-10-22)
// orders: id (uuid NOT NULL), status (order_status NOT NULL), final_amount (numeric NOT NULL),
//         razorpay_order_id (text NULL), razorpay_payment_id (text NULL)
// RPC: complete_paid_order(uuid, text, text, bigint) → see migration 20261022100000

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')!

async function hmacSha256Hex(key: string, message: string): Promise<string> {
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

// Constant-time string compare — see verify function for notes.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
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

    const expectedSignature = await hmacSha256Hex(RAZORPAY_WEBHOOK_SECRET, rawBody)
    if (!timingSafeEqual(expectedSignature, webhookSignature)) {
      console.error('[webhook] signature mismatch')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const eventType: string = event.event

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = event.payload.payment?.entity
      const razorpayOrderId = payment?.order_id ?? event.payload.order?.entity?.id
      const razorpayPaymentId: string | undefined = payment?.id
      const capturedAmount: number | undefined =
        typeof payment?.amount === 'number' ? payment.amount : undefined
      const currency: string | undefined = payment?.currency

      if (!razorpayOrderId || !razorpayPaymentId) {
        console.error('[webhook] missing order_id/payment_id in payload')
        return new Response(JSON.stringify({ status: 'skipped' }), { status: 200 })
      }

      if (currency && currency !== 'INR') {
        console.error('[webhook] unexpected currency', currency)
        return new Response(JSON.stringify({ status: 'skipped_currency' }), { status: 200 })
      }

      const { data: order } = await serviceClient
        .from('orders')
        .select('id')
        .eq('razorpay_order_id', razorpayOrderId)
        .maybeSingle()

      if (!order) {
        console.error('[webhook] order not found for razorpay_order_id:', razorpayOrderId)
        // 200 so Razorpay doesn't retry forever for an unknown order
        return new Response(JSON.stringify({ status: 'order_not_found' }), { status: 200 })
      }

      const { data: completion, error: rpcError } = await serviceClient.rpc(
        'complete_paid_order',
        {
          p_order_id: order.id,
          p_razorpay_payment_id: razorpayPaymentId,
          p_razorpay_signature: webhookSignature,
          p_captured_paise: capturedAmount ?? null,
        }
      )
      if (rpcError) {
        console.error('[webhook] complete_paid_order error:', rpcError)
        // 500 → Razorpay retries this event
        return new Response(JSON.stringify({ error: 'RPC failed' }), { status: 500 })
      }

      const result = completion as { ok: boolean; reason?: string; already_completed?: boolean }
      if (!result.ok) {
        console.error('[webhook] completion rejected:', result.reason)
        // amount_mismatch is a real anomaly — alert via logs, but 200 so Razorpay
        // doesn't retry (the state won't change on retry anyway)
        return new Response(JSON.stringify({ status: 'rejected', reason: result.reason }), {
          status: 200,
        })
      }

      return new Response(
        JSON.stringify({ status: result.already_completed ? 'already_completed' : 'completed' }),
        { status: 200 }
      )
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
    console.error('[webhook] processing error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
})
