import SummarizerForm from '@/components/SummarizerForm'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-red-600">QuickTube</Link>
          <div className="space-x-4">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
              Tarifs
            </Link>
          </div>
        </nav>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Résumez n'importe quelle<br />
          <span className="text-red-600">vidéo YouTube</span> en secondes
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Gagnez du temps avec des résumés IA structurés
        </p>
      </section>

      <SummarizerForm />
    </div>
  )
}