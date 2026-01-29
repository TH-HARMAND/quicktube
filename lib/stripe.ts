import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PRICING = {
  pro: {
    name: 'Pro',
    price: 9,
    priceId: 'prod_TsQXheBv4Ej3rz',
    summaries: 50,
  },
  business: {
    name: 'Business',
    price: 29,
    priceId: 'prod_TsQX5a9sSk4rsK',
    summaries: -1,
  }
}