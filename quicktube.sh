#!/bin/bash

# QuickTube - Script utilitaire
# Usage: ./quicktube.sh [command]

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎬 QuickTube - Utilitaire${NC}\n"

case "$1" in
  install)
    echo -e "${GREEN}📦 Installation des dépendances...${NC}"
    npm install
    echo -e "${GREEN}✅ Installation terminée !${NC}"
    ;;
    
  dev)
    echo -e "${GREEN}🚀 Lancement du serveur de développement...${NC}"
    npm run dev
    ;;
    
  build)
    echo -e "${GREEN}🔨 Build de production...${NC}"
    npm run build
    ;;
    
  start)
    echo -e "${GREEN}▶️  Lancement de la version production...${NC}"
    npm start
    ;;
    
  test-db)
    echo -e "${GREEN}🔍 Test de connexion Supabase...${NC}"
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
      echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL non défini${NC}"
      exit 1
    fi
    echo -e "${GREEN}✅ Variables Supabase OK${NC}"
    ;;
    
  test-openai)
    echo -e "${GREEN}🔍 Test de connexion OpenAI...${NC}"
    if [ -z "$OPENAI_API_KEY" ]; then
      echo -e "${RED}❌ OPENAI_API_KEY non défini${NC}"
      exit 1
    fi
    echo -e "${GREEN}✅ Clé OpenAI OK${NC}"
    ;;
    
  test-stripe)
    echo -e "${GREEN}🔍 Test de connexion Stripe...${NC}"
    if [ -z "$STRIPE_SECRET_KEY" ]; then
      echo -e "${RED}❌ STRIPE_SECRET_KEY non défini${NC}"
      exit 1
    fi
    echo -e "${GREEN}✅ Clés Stripe OK${NC}"
    ;;
    
  setup)
    echo -e "${GREEN}⚙️  Configuration initiale...${NC}"
    
    if [ ! -f .env.local ]; then
      echo -e "${BLUE}Création de .env.local...${NC}"
      cp .env.example .env.local
      echo -e "${GREEN}✅ Fichier .env.local créé${NC}"
      echo -e "${BLUE}⚠️  N'oubliez pas de remplir vos clés API !${NC}"
    else
      echo -e "${BLUE}ℹ️  .env.local existe déjà${NC}"
    fi
    
    echo -e "\n${GREEN}📦 Installation des dépendances...${NC}"
    npm install
    
    echo -e "\n${GREEN}✅ Setup terminé !${NC}"
    echo -e "${BLUE}Prochaine étape : Remplir .env.local puis lancer 'npm run dev'${NC}"
    ;;
    
  clean)
    echo -e "${GREEN}🧹 Nettoyage du projet...${NC}"
    rm -rf node_modules .next
    echo -e "${GREEN}✅ Nettoyage terminé !${NC}"
    ;;
    
  deploy)
    echo -e "${GREEN}🚀 Déploiement sur Vercel...${NC}"
    vercel --prod
    ;;
    
  help|*)
    echo "Usage: ./quicktube.sh [command]"
    echo ""
    echo "Commandes disponibles :"
    echo "  setup       - Configuration initiale du projet"
    echo "  install     - Installer les dépendances"
    echo "  dev         - Lancer le serveur de développement"
    echo "  build       - Builder pour la production"
    echo "  start       - Lancer la version production"
    echo "  test-db     - Tester la connexion Supabase"
    echo "  test-openai - Tester la connexion OpenAI"
    echo "  test-stripe - Tester la connexion Stripe"
    echo "  clean       - Nettoyer le projet"
    echo "  deploy      - Déployer sur Vercel"
    echo "  help        - Afficher cette aide"
    ;;
esac