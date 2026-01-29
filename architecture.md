# 🏗️ Architecture Technique - QuickTube

## Vue d'ensemble

QuickTube est construit sur une architecture serverless moderne utilisant Next.js 14 avec le App Router.

---

## 📐 Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                     │
│                    Next.js Frontend                      │
│              React Components + Tailwind CSS             │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │
┌────────────────────▼────────────────────────────────────┐
│                  NEXT.JS API ROUTES                      │
│                   (Vercel Serverless)                    │
├─────────────────────────────────────────────────────────┤
│  /api/summarize     │ Génération de résumés             │
│  /api/subscription  │ Création d'abonnements            │
│  /api/webhook       │ Événements Stripe                 │
└────┬────────┬───────┬────────┬───────────────────────────┘
     │        │       │        │
     │        │       │        └──────────────┐
     │        │       │                       │
     ▼        ▼       ▼                       ▼
┌─────────┐ ┌──────┐ ┌──────────┐    ┌──────────────┐
│YouTube  │ │OpenAI│ │ Supabase │    │    Stripe    │
│Transcript│ │ API │ │PostgreSQL│    │   Payment    │
│  API    │ │GPT-4 │ │  + Auth  │    │   Platform   │
└─────────┘ └──────┘ └──────────┘    └──────────────┘
```

---

## 🔧 Stack technique détaillée

### Frontend

**Framework** : Next.js 14 (App Router)
- **Avantages** :
  - SSR/SSG pour SEO optimal
  - Route handlers pour API
  - Image optimization automatique
  - Code splitting automatique

**UI Library** : React 18
- Hooks modernes (useState, useEffect)
- Composants fonctionnels uniquement
- Props drilling minimal

**Styling** : Tailwind CSS 3
- Utility-first
- Responsive par défaut
- Thème customisable
- PurgeCSS intégré

**Icons** : Lucide React
- Légers et optimisés
- Tree-shaking automatique

### Backend

**Runtime** : Node.js 18+ (Vercel Serverless)
- Edge runtime possible pour certaines routes
- Cold start ~200ms
- Auto-scaling illimité

**API Routes** : Next.js API Routes
- RESTful endpoints
- Middleware support
- Type-safe avec TypeScript

**Validation** : Zod
- Runtime type checking
- Schema validation
- Error messages clairs

### Base de données

**Provider** : Supabase (PostgreSQL 15)

**Schéma** :
```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  subscription_tier TEXT,
  summaries_used INTEGER,
  summaries_limit INTEGER,
  stripe_customer_id TEXT,
  created_at TIMESTAMP
)

summaries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  youtube_url TEXT,
  video_title TEXT,
  summary TEXT,
  timestamps JSONB,
  tier TEXT,
  created_at TIMESTAMP
)
```

**Indexes** :
- `idx_summaries_user_id` : Accès rapide aux résumés par user
- `idx_summaries_created_at` : Tri chronologique
- `idx_users_email` : Lookup par email
- `idx_users_stripe_customer_id` : Réconciliation Stripe

**Row Level Security (RLS)** :
- Users peuvent seulement voir leurs données
- Policies automatiques
- Service role pour admin

### APIs externes

#### YouTube Transcript API
```typescript
// Bibliothèque : youtube-transcript
const transcript = await YoutubeTranscript.fetchTranscript(videoId)
// Retourne : [{ text, offset, duration }]
```

**Limitations** :
- Gratuit et illimité
- Nécessite sous-titres activés
- Rate limit : ~100 req/min

#### OpenAI API (GPT-4 Turbo)
```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [...],
  temperature: 0.7,
  max_tokens: 1500
})
```

**Coûts** :
- Input : $10/1M tokens (~0.01€/résumé)
- Output : $30/1M tokens (~0.04€/résumé)
- **Total** : ~0.05€/résumé

**Optimisations** :
- Truncate transcript à 12K chars
- Cache résumés identiques (TODO)
- Batch requests si possible (TODO)

#### Stripe API
```typescript
// Checkout Session
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  mode: 'subscription',
  line_items: [{ price: priceId, quantity: 1 }]
})

// Webhooks
stripe.webhooks.constructEvent(body, signature, secret)
```

**Événements gérés** :
- `checkout.session.completed` : Nouvel abonnement
- `customer.subscription.updated` : Changement de plan
- `customer.subscription.deleted` : Annulation

### Authentification

**Provider** : Supabase Auth

**Flow** :
1. User s'inscrit/connecte via Supabase UI
2. JWT token stocké dans cookies
3. RLS policies vérifient auth.uid()
4. Refresh token automatique

**Providers supportés** :
- Email/Password
- Google OAuth (TODO)
- GitHub OAuth (TODO)

---

## 🔄 Flow de données

### Génération de résumé

```
1. User colle URL YouTube
   ↓
2. Frontend → POST /api/summarize { youtubeUrl, userId }
   ↓
3. Backend :
   a. Extract videoId de l'URL
   b. Fetch transcript depuis YouTube
   c. Fetch video title
   d. Check user limits (DB)
   e. Generate summary avec OpenAI
   f. Save to DB
   g. Increment counter
   ↓
4. Retourne { summary, timestamps, remaining }
   ↓
5. Frontend affiche le résumé
```

**Temps moyen** : 10-20 secondes

### Processus de paiement

```
1. User clique "Passer à Pro"
   ↓
2. Frontend → POST /api/subscription { userId, tier }
   ↓
3. Backend :
   a. Fetch/Create Stripe customer
   b. Create checkout session
   c. Return session URL
   ↓
4. Redirect vers Stripe Checkout
   ↓
5. User paie avec carte
   ↓
6. Stripe → Webhook /api/webhook
   ↓
7. Backend update user en DB :
   - subscription_tier = 'pro'
   - summaries_limit = 50
   - summaries_used = 0
   ↓
8. Redirect vers /dashboard?success=true
```

---

## 🚀 Performance

### Métriques cibles

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Time to First Byte | <200ms | ~150ms |
| First Contentful Paint | <1s | ~800ms |
| Largest Contentful Paint | <2.5s | ~1.5s |
| Time to Interactive | <3s | ~2s |
| Résumé généré | <30s | ~15s |

### Optimisations

**Frontend** :
- ✅ Code splitting automatique (Next.js)
- ✅ Image optimization (next/image)
- ✅ Font optimization (next/font)
- ⏳ Route prefetching (TODO)

**Backend** :
- ✅ Serverless (scaling automatique)
- ⏳ Response caching (TODO)
- ⏳ Database connection pooling (TODO)
- ⏳ Rate limiting (TODO)

**API Externes** :
- ⏳ Transcript caching (TODO)
- ⏳ Summary caching pour URLs identiques (TODO)

---

## 🔒 Sécurité

### Mesures implémentées

1. **HTTPS obligatoire** (Vercel)
2. **Environment variables** (secrets)
3. **Row Level Security** (Supabase)
4. **Input validation** (Zod)
5. **CORS configured** (Next.js)
6. **Webhook signature verification** (Stripe)

### À implémenter

- [ ] Rate limiting (par IP/user)
- [ ] CAPTCHA sur signup
- [ ] Content Security Policy headers
- [ ] Audit logs
- [ ] 2FA optionnel

---

## 📊 Monitoring & Observabilité

### Logging

**Vercel** : Logs automatiques
- Runtime logs
- Build logs
- Edge logs

**Supabase** : Query logs
- Slow queries
- Error logs

**Stripe** : Event logs
- Payment events
- Webhook deliveries

### Métriques à tracker

**Performance** :
- API response times
- Database query times
- OpenAI generation times

**Business** :
- Résumés générés/jour
- Conversions Free → Pro
- Churn rate
- MRR

### Outils recommandés

- **Sentry** : Error tracking
- **PostHog** : Product analytics
- **Vercel Analytics** : Web vitals
- **Stripe Dashboard** : Revenue metrics

---

## 🧪 Testing

### Tests à implémenter

**Unit tests** :
- [ ] Utils functions (getVideoId, etc.)
- [ ] API route handlers
- [ ] React components

**Integration tests** :
- [ ] End-to-end user flows
- [ ] Payment flows
- [ ] Webhook handling

**Load tests** :
- [ ] 100 concurrent users
- [ ] 1000 résumés/minute

### Outils

- **Jest** : Unit tests
- **React Testing Library** : Component tests
- **Playwright** : E2E tests
- **k6** : Load testing

---

## 🔧 DevOps

### CI/CD

**Vercel** :
- Git push → Auto deploy
- Preview deploys pour branches
- Production deploy sur merge main

### Environments

| Env | URL | DB | Stripe |
|-----|-----|----|----|
| Dev | localhost:3000 | Local/Dev | Test mode |
| Preview | vercel.app | Staging | Test mode |
| Prod | quicktube.com | Production | Live mode |

### Backup & Recovery

**Supabase** :
- Daily automated backups
- Point-in-time recovery
- Export SQL

**Stripe** :
- No backup needed (SaaS)
- Export data via API

---

## 📈 Scalabilité

### Goulots d'étranglement potentiels

1. **OpenAI rate limits**
   - Solution : Queue system (BullMQ)
   
2. **Database connections**
   - Solution : PgBouncer (connection pooling)
   
3. **Transcript fetching**
   - Solution : Cache + CDN

### Architecture cible (>10K users)

```
┌──────────────┐
│   Vercel     │
│  (Frontend)  │
└──────┬───────┘
       │
┌──────▼───────┐
│   Vercel     │
│ (API Routes) │
└──────┬───────┘
       │
┌──────▼───────┐      ┌─────────────┐
│   Redis      │◄─────┤   BullMQ    │
│   (Cache)    │      │   (Queue)   │
└──────────────┘      └─────────────┘
       │
┌──────▼───────┐
│  Supabase    │
│  PostgreSQL  │
└──────────────┘
```

---

## 🛠️ Maintenance

### Tâches régulières

**Quotidien** :
- Check error logs
- Monitor API quotas
- Check Stripe webhooks

**Hebdomadaire** :
- Review performance metrics
- Check DB slow queries
- Update dependencies

**Mensuel** :
- Security audit
- Cost optimization
- Feature planning

---

## 💰 Coûts infrastructure

### Projection (1000 résumés/mois)

| Service | Coût/mois |
|---------|-----------|
| Vercel (Hobby) | 0€ |
| Supabase (Free) | 0€ |
| OpenAI | ~50€ |
| Stripe (fees) | ~5€ |
| **TOTAL** | **~55€** |

### Projection (10K résumés/mois)

| Service | Coût/mois |
|---------|-----------|
| Vercel (Pro) | 20€ |
| Supabase (Pro) | 25€ |
| OpenAI | ~500€ |
| Stripe (fees) | ~50€ |
| **TOTAL** | **~595€** |

**Marge** : Si 10K résumés = 200 Pro users = 1800€ MRR
→ Profit = 1200€/mois (67%)

---

## 🔮 Évolutions futures

### Court terme (3 mois)

- [ ] Dashboard utilisateur
- [ ] Historique résumés
- [ ] Export PDF
- [ ] Search dans historique

### Moyen terme (6 mois)

- [ ] Extension Chrome
- [ ] API publique
- [ ] Webhooks pour intégrations
- [ ] Support Vimeo/Twitch

### Long terme (12 mois)

- [ ] Application mobile
- [ ] Résumés audio (TTS)
- [ ] Collaboration équipe
- [ ] White-label pour entreprises

---

**Architecture évolutive, scalable et maintenable. 🚀**