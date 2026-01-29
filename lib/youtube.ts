import { YoutubeTranscript } from 'youtube-transcript'

export async function getVideoId(url: string): Promise<string | null> {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export async function getTranscript(videoId: string): Promise<string> {
  try {
    console.log('🔍 Récupération transcript:', videoId)
    const transcript = await YoutubeTranscript.fetchTranscript(videoId)
    const text = transcript.map(item => item.text).join(' ')
    console.log('✅ Transcript récupéré, longueur:', text.length)
    return text
  } catch (error: any) {
    console.error('❌ Erreur transcript:', error)
    throw new Error('Impossible de récupérer la transcription. La vidéo doit avoir des sous-titres.')
  }
}

export async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    
    if (!response.ok) throw new Error('Vidéo non trouvée')
    const data = await response.json()
    return data.title || 'Titre inconnu'
  } catch (error) {
    console.error('❌ Erreur titre:', error)
    return 'Titre inconnu'
  }
}