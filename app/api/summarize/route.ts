import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getVideoId, getTranscript, getVideoTitle } from '@/lib/youtube'
import { generateSummary } from '@/lib/openai'

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl, userId } = await req.json()

    if (!youtubeUrl) {
      return NextResponse.json({ error: 'URL YouTube requise' }, { status: 400 })
    }

    const videoId = await getVideoId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json({ error: 'URL YouTube invalide' }, { status: 400 })
    }

    // Déterminer le tier et les limites
    let userTier: 'free' | 'pro' | 'business' = 'free'
    let summariesUsed = 0
    let summariesLimit = 3

    if (userId) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (user) {
        userTier = user.subscription_tier
        summariesUsed = user.summaries_used || 0
        summariesLimit = user.summaries_limit || 3

        // Vérifier la limite
        if (summariesLimit !== -1 && summariesUsed >= summariesLimit) {
          return NextResponse.json(
            { error: 'Limite de résumés atteinte. Passez à Pro !' },
            { status: 403 }
          )
        }
      }
    }

    // Récupérer titre et transcription
    const [videoTitle, transcript] = await Promise.all([
      getVideoTitle(videoId),
      getTranscript(videoId)
    ])

    // Générer résumé
    const tier = userTier === 'free' ? 'basic' : 'detailed'
    const { summary, timestamps } = await generateSummary(transcript, videoTitle, tier)

    // Sauvegarder en base
    if (userId) {
      await supabaseAdmin.from('summaries').insert({
        user_id: userId,
        youtube_url: youtubeUrl,
        video_title: videoTitle,
        summary,
        timestamps,
        tier
      })

      // Incrémenter compteur
      await supabaseAdmin
        .from('users')
        .update({ summaries_used: summariesUsed + 1 })
        .eq('id', userId)
    }

    return NextResponse.json({
      success: true,
      data: {
        videoTitle,
        summary,
        timestamps,
        tier,
        remaining: summariesLimit === -1 ? -1 : summariesLimit - summariesUsed - 1
      }
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la génération' },
      { status: 500 }
    )
  }
}