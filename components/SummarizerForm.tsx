'use client'

import { useState } from 'react'
import { Youtube, Loader2, Sparkles, Clock } from 'lucide-react'

interface SummaryResult {
  videoTitle: string
  summary: string
  timestamps?: Array<{ time: string; label: string }>
  tier: 'basic' | 'detailed'
  remaining: number
}

export default function SummarizerForm({ userId }: { userId?: string }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SummaryResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: url, userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur inconnue')
      }

      setResult(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-center justify-center mb-6">
          <Youtube className="w-12 h-12 text-red-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">QuickTube</h1>
        </div>
        
        <p className="text-center text-gray-600 mb-8">
          Résumez n'importe quelle vidéo YouTube en quelques secondes
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading || !url}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Résumer la vidéo
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.videoTitle}</h2>
            <p className="text-sm text-gray-500">
              Résumés restants ce mois : {result.remaining >= 0 ? result.remaining : '∞'}
            </p>
          </div>

          {result.timestamps && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Timestamps
              </h3>
              <div className="space-y-2">
                {result.timestamps.map((ts, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <span className="font-mono text-red-600 mr-3">{ts.time}</span>
                    <span className="text-gray-700">{ts.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="prose max-w-none">
            <div 
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: result.summary.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      )}
    </div>
  )
}