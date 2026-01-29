const { YoutubeTranscript } = require('youtube-transcript');

async function testMultiple() {
  const videos = [
    { id: 'dQw4w9WgXcQ', name: 'Rick Astley' },
    { id: '9bZkp7q19f0', name: 'Gangnam Style' },
    { id: 'kJQP7kiw5Fk', name: 'Luis Fonsi - Despacito' },
    { id: 'Tn6-PIqc4UM', name: 'React Tutorial' },
  ];

  for (const video of videos) {
    try {
      console.log(`\n🔍 Test: ${video.name} (${video.id})`);
      const transcript = await YoutubeTranscript.fetchTranscript(video.id);
      console.log(`✅ Succès! ${transcript.length} segments`);
      console.log(`Première phrase: "${transcript[0].text}"`);
    } catch (error) {
      console.error(`❌ Erreur: ${error.message}`);
    }
  }
}

testMultiple();