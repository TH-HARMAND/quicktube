import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICING } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { userId, tier } = await req.json()

    if (!userId || !tier || (tier !== 'pro' && tier !== 'business')) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    let customerId = user.stripe_customer_id

    // Créer customer Stripe si nécessaire
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId }
      })
      customerId = customer.id

      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Créer session de paiement
    const priceId = PRICING[tier].priceId
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}?success=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: { userId, tier }
    })

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}