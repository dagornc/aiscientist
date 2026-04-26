# Plan Frontend - AI Scientist

## Stack requise
- React 19 + TypeScript strict
- Vite (dev/build)
- Tailwind CSS + Shadcn/UI
- React Router 7
- React Query v5
- Recharts
- React Hot Toast
- Lucide React (icônes)
- React Flow (visualisation pipeline)
- Framer Motion (animations)
- Axios (client HTTP)
- i18next (localisation)

## Packages à installer
```bash
npm install react react-dom typescript @types/react @types/react-dom
npm install @vitejs/plugin-react vite
npm install tailwindcss autoprefixer postcss
npm install react-router-dom @tanstack/react-query
npm install recharts lucide-react react-hot-toast
npm install react-flow-renderer # ou reactflow
npm install framer-motion
npm install axios
npm install i18next react-i18next
npm install -D @types/node
```

## Architecture du projet
```
Code/Frontend/
├── public/
│   ├── vite.svg
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── react.svg
│   │   ├── icons/ # Icons custom si nécessaires
│   │   └── images/ # Images statiques
│   ├── components/
│   │   ├── ui/ # Composants Shadcn
│   │   └── custom/ # Composants spécifiques app
│   ├── hooks/ # Hooks custom
│   │   ├── useTheme.tsx
│   │   ├── useLocale.tsx
│   │   └── CRUD hooks pour chaque entité
│   ├── pages/ # Pages de niveau supérieur
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── api.ts
│   │   └── validations.ts
│   ├── locales/
│   │   ├── en.json
│   │   └── fr.json
│   ├── services/ # Services API
│   ├── types/ # Types TypeScript
│   ├── store/ # Zustand ou état global si nécessaire
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ThemeToggle.tsx
│   │   └── views/ # Composants complexes par section
│   ├── App.tsx # Point d'entrée principal
│   ├── main.tsx # Point d'entrée DOM
│   └── i18n.ts # Configuration i18next
├── index.html
├── vite.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── postcss.config.js
```

## Design System
- Couleurs principales : violet-500 (primaire), emerald-500 (secondaire)
- Dark theme : fond slate-900, textes blancs/gris
- Light theme : fond blanc/slate-50, textes noirs/gris
- Ombres légères, bordures subtiles
- Espacement cohérent (classes Tailwind)

## Pages à implémenter

### Structure générale
- Header : nom app, icône thème, notification, profil utilisateur
- Sidebar : navigation principale
- Main Content : contenu dynamique selon route
- Footer : crédits

### Page Dashboard
- Stats cards : nb idées, expériences, papers, reviews
- Graphiques : évolution temps, répartition par statut
- Pipeline actif : si disponible, progression en temps réel
- Dernières activités avec timestamps

### Page Ideas (Génération)
- Filters : par statut, domaine, date création
- Actions : generer idée(s), exporter liste
- Grid/List view des idées
- Chaque carte : titre, description, statut, novellé, date création, score originalité
- Modale "Generate Ideas" : nombre, domaine, options avancées

### Page Experiments
- Filtres par statut, idée associée
- Créer nouvelle expérience : sélection idée, timeout
- Affichage Logs temps réel via WebSockets
- Bouton "run" pour expériences manuellement démarrées

### Page Papers
- Liste papers avec filtres (statut, auteur, date)
- Création papers automatique ou manuelle
- Vue détaillée PDF-like inline
- Export PDF

### Page Reviews
- Liste des reviews avec scores
- Vue détaillée : scores détaillés, commentaires
- Graphiques radar pour scores catégories
- Bouton rejeter / valider

### Page Pipeline
- Visualisation React Flow du workflow :
  - Idée -> Expérimentation -> Rédaction -> Revue -> Acceptation/Rejet->Boucle avec amélioration
- États visuels différents selon progrès
- Panel contrôles lancement : domaine, nombre idées,itérations

### Page Settings
- Configuration LLM
- Clés API (affichées partiellement)
- Préférences : locale, thème, notifications

## API à utiliser
Backend FastAPI sur http://localhost:8000
### Endpoints
- POST /api/ideas/generate (créer idées)
- GET /api/ideas/ (lister idées)
- POST /api/experiments/run (démarrer expérience)
- GET /api/experiments/{id}
- POST /api/papers/write
- GET /api/papers/{id}
- POST /api/reviews/review
- GET /api/reviews/{id}
- GET /api/models/
- POST /api/pipeline/run
- GET /api/pipeline/{run_id}/status

## Internationalisation
- i18n avec modules séparés EN/FR
- Labels traduits partout
- Dates/times adaptés format local

## Responsive Design
- Mobile-first
- Sidebar se transforme menu Hamburger sur écrans mobiles
- Grilles adaptatives selon taille écran
- Tests de rendu 320px (mobile) à 1440px (desktop large)

## Fonctionnalités WebSocket
- Écouter changements pipeline
- Mise à jour temps-réel des logs expérimentaux
- Notifications d'événements critiques

## Tests à implémenter (postérieur)
- Composants unitaires (React Testing Library)
- Intégration API (MSW pour mocks)
- E2E (Cypress ou Playwright)

## Optimisations prévues
- Code splitting par routes
- Caching TanStack Query avec durées personnalisées
- Lazy loading composants lourds
- Skeleton screens lors chargement

## Qualité
- TypeSafety strict : pas de "any" ou objets sans type
- Validation inputs avec Zod
- Bon contraste pour accessibilité
- Navigation clavier complète
- Labels aria pour accessibilité écran lecture

## Sécurité
- Injection XSS prévenue par React
- Stockage sécurisé jetons authentification
- Validation serveur côté frontend pour user feedback