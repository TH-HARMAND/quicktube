# 🚀 Guide de démarrage rapide - QuickTube

## Installation en 5 minutes

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration minimale pour tester

Créer `.env.local` avec ces valeurs de test :

```bash
# Supabase (créer compte gratuit sur supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=VOTRE_SERVICE_ROLE_KEY

# OpenAI (obligatoire - créer compte sur platform.openai.com)
OPENAI_API_KEY=sk-VOTRE_CLE

# Stripe (mode test - créer compte gratuit sur stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialiser Supabase

1. Aller sur https://supabase.com
2. Créer un projet (gratuit)
3. SQL Editor → coller contenu de `supabase-schema.sql`
4. Exécuter
5. Settings > API → copier les clés

### 4. Configurer Stripe (test)

1. Aller sur https://stripe.com
2. Dashboard > Developers > API keys (mode test)
3. Copier les clés
4. Products > Add product :
   - **Pro** : 9€/mois → copier price_id
   - **Business** : 29€/mois → copier price_id
5. Modifier `lib/stripe.ts` avec vos price_ids

### 5. Lancer l'app

```bash
npm run dev
```

Ouvrir http://localhost:3000

### 6. Tester

1. **Sans compte** : Coller une URL YouTube → Résumé basique
2. **Avec paiement** : 
   - Créer compte
   - Aller sur /pricing
   - Carte test : `4242 4242 4242 4242`
   - Résumé détaillé avec timestamps

---

## URLs de test YouTube

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://www.youtube.com/watch?v=jNQXAC9IVRw
https://www.youtube.com/watch?v=9bZkp7q19f0
```

---

## Problèmes courants

**"Module not found"**
→ `rm -rf node_modules && npm install`

**"Supabase error"**
→ Vérifier que le schema SQL a été exécuté

**"OpenAI error"**
→ Vérifier que la clé API est valide et a du crédit

**"Transcript error"**
→ Utiliser une vidéo avec sous-titres activés

---

## Mode démo sans base de données

Pour tester juste le frontend sans setup complet, commenter les appels DB dans :
- `app/api/summarize/route.ts` (lignes de sauvegarde)
- Utiliser un userId fictif

---

Besoin d'aide ? Consulter le README.md complet !