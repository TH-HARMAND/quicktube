import { Innertube } from 'youtubei.js'

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

function parseVtt(vtt: string): string {
  const lines: string[] = []
  
  for (const rawLine of vtt.split('\n')) {
    const line = rawLine.trim()
    
    // Skip empty lines, WEBVTT header, timestamps, and line numbers
    if (!line) continue
    if (line.toUpperCase().startsWith('WEBVTT')) continue
    if (line.includes('-->')) continue
    if (/^\d+$/.test(line)) continue
    
    // Remove HTML tags
    const cleaned = line.replace(/<[^>]+>/g, '').trim()
    if (cleaned) lines.push(cleaned)
  }
  
  // Remove duplicates (consecutive identical lines)
  const deduped: string[] = []
  let prev: string | null = null
  
  for (const line of lines) {
    if (line !== prev) {
      deduped.push(line)
    }
    prev = line
  }
  
  return deduped.join(' ').trim()
}

export async function getTranscript(videoId: string): Promise<string> {
  try {
    console.log('🔍 Récupération des infos vidéo avec youtubei.js:', videoId)
    
    const youtube = await Innertube.create()
    const info = await youtube.getInfo(videoId)
    
    // Get available captions
    const captionTracks = info.captions?.caption_tracks || []
    
    console.log('📝 Sous-titres disponibles:', captionTracks.map((t: any) => t.language_code))
    
    if (captionTracks.length === 0) {
      throw new Error('Aucun sous-titre trouvé pour cette vidéo')
    }
    
    // Try to find French captions, then English, then first available
    let selectedTrack = captionTracks.find((t: any) => 
      t.language_code === 'fr' || t.language_code === 'fr-FR'
    )
    
    if (!selectedTrack) {
      selectedTrack = captionTracks.find((t: any) => 
        t.language_code === 'en' || t.language_code === 'en-US'
      )
    }
    
    if (!selectedTrack) {
      selectedTrack = captionTracks[0]
    }
    
    console.log('✅ Utilisation des sous-titres:', selectedTrack.language_code)
    
    // Get caption URL (VTT format)
    const captionUrl = selectedTrack.base_url
    
    if (!captionUrl) {
      throw new Error('URL des sous-titres non disponible')
    }
    
    console.log('📥 Téléchargement des sous-titres...')
    
    // Fetch VTT content
    const response = await fetch(captionUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      }
    })
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }
    
    const vttContent = await response.text()
    const transcript = parseVtt(vttContent)
    
    if (!transcript) {
      throw new Error('Sous-titre récupéré mais vide/non exploitable')
    }
    
    console.log('✅ Transcript récupéré, longueur:', transcript.length)
    
    return transcript
    
  } catch (error: any) {
    console.error('❌ Erreur youtubei.js:', error)
    throw new Error(`Impossible de récupérer la transcription: ${error.message}`)
  }
}

export async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const youtube = await Innertube.create()
    const info = await youtube.getInfo(videoId)
    return info.basic_info.title || 'Titre inconnu'
  } catch (error) {
    console.error('❌ Erreur titre:', error)
    return 'Titre inconnu'
  }
}