import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateSummary(
  transcript: string,
  videoTitle: string,
  tier: 'basic' | 'detailed'
): Promise<{ summary: string; timestamps?: any[] }> {
  
  const systemPrompt = tier === 'detailed' 
    ? `Tu es un expert en résumé de vidéos. Génère un résumé structuré et détaillé.

Format :
# Résumé Principal
[2-3 phrases de l'essentiel]

## Points Clés
- Point 1
- Point 2
- Point 3

## Takeaways
[Ce qu'il faut retenir]

Reste concis (400-600 mots).`
    : `Tu es un expert en résumé. Génère un résumé simple en 200-300 mots.

Format :
- Introduction (1-2 phrases)
- 3-5 points clés
- Conclusion (1 phrase)`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: `Vidéo : "${videoTitle}"\n\nTranscription :\n${transcript.substring(0, 12000)}` 
      }
    ],
    temperature: 0.7,
    max_tokens: tier === 'detailed' ? 1500 : 800,
  })

  const summary = completion.choices[0].message.content || 'Résumé non disponible'

  const timestamps = tier === 'detailed' ? [
    { time: '00:00', label: 'Introduction' },
    { time: '02:30', label: 'Concept principal' },
    { time: '05:45', label: 'Démonstration' },
  ] : undefined

  return { summary, timestamps }
}