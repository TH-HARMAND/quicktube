-- Table des utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business')),
  summaries_used INTEGER DEFAULT 0,
  summaries_limit INTEGER DEFAULT 3,
  stripe_customer_id TEXT UNIQUE
);

-- Table des résumés
CREATE TABLE summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  video_title TEXT NOT NULL,
  summary TEXT NOT NULL,
  timestamps JSONB,
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'detailed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_summaries_user_id ON summaries(user_id);
CREATE INDEX idx_summaries_created_at ON summaries(created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
```

**Rôle :** Schéma de base de données à exécuter dans Supabase
