import PricingCards from '@/components/PricingCards'
import Link from 'next/link'

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-red-600">QuickTube</Link>
        </nav>
      </header>

      <PricingCards />
    </div>
  )
}