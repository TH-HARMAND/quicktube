import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { PRICING } from '@/lib/stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const { userId, tier } = await req.json()

    if (!userId || !tier) {
      return NextResponse.json(
        { error: 'userId et tier requis' },
        { status: 400 }
      )
    }

    // Vérifier que le tier est valide
    if (tier !== 'pro' && tier !== 'business') {
      return NextResponse.json(
        { error: 'Tier invalide' },
        { status: 400 }
      )
    }

    // Récupérer ou créer le customer Stripe
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()

    let customerId = user?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: { userId },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Créer session de paiement
    const pricingTier = PRICING[tier as 'pro' | 'business']
    const priceId = pricingTier.priceId
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}?success=true`,
      cancel_url: `${appUrl}?canceled=true`,
      metadata: {
        userId,
        tier,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Erreur création session:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}