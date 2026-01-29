'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

const plans = [
  {
    name: 'Gratuit',
    price: 0,
    tier: 'free',
    features: ['3 résumés par mois', 'Résumé basique', 'Support email'],
    cta: 'Commencer gratuitement',
    highlighted: false
  },
  {
    name: 'Pro',
    price: 9,
    tier: 'pro',
    features: ['50 résumés par mois', 'Résumé détaillé', 'Timestamps précis', 'Support prioritaire'],
    cta: 'Passer à Pro',
    highlighted: true
  },
  {
    name: 'Business',
    price: 29,
    tier: 'business',
    features: ['Résumés illimités', 'Résumé détaillé', 'Timestamps précis', 'Support dédié'],
    cta: 'Passer à Business',
    highlighted: false
  }
]

export default function PricingCards({ userId }: { userId?: string }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (tier: string) => {
    if (tier === 'free') {
      window.location.href = '/'
      return
    }

    if (!userId) {
      alert('Veuillez vous connecter pour souscrire')
      return
    }

    setLoading(tier)

    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tier }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url // Redirige vers Stripe
      }
    } catch (error) {
      alert('Erreur lors de la création de l\'abonnement')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Choisissez votre plan</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className={`rounded-2xl p-8 ${
              plan.highlighted
                ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-2xl scale-105'
                : 'bg-white border-2 border-gray-200'
            }`}
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            
            <div className="mb-6">
              <span className="text-5xl font-bold">{plan.price}€</span>
              <span>/mois</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.tier)}
              disabled={loading === plan.tier}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                plan.highlighted
                  ? 'bg-white text-red-600 hover:bg-red-50'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {loading === plan.tier ? 'Chargement...' : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}