import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICING } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  // Gérer les événements Stripe
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const tier = session.metadata?.tier as 'pro' | 'business'

      if (userId && tier) {
        const summariesLimit = PRICING[tier].summaries

        await supabaseAdmin
          .from('users')
          .update({
            subscription_tier: tier,
            summaries_limit: summariesLimit,
            summaries_used: 0
          })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        await supabaseAdmin
          .from('users')
          .update({
            subscription_tier: 'free',
            summaries_limit: 3,
            summaries_used: 0
          })
          .eq('id', user.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}