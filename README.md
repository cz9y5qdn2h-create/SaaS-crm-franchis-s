# Essaimo

CRM franchisés de l'écosystème iralink Agency — voir [`docs/cadrage-produit.md`](docs/cadrage-produit.md) pour le contexte produit complet.

## Stack

Next.js (App Router, TypeScript) + Supabase (Postgres, Auth, RLS).

## Démarrer en local

1. Créer un projet Supabase et copier `.env.example` vers `.env.local` avec l'URL et la clé anonyme du projet.
2. Appliquer la migration `supabase/migrations/0001_init.sql` sur ce projet Supabase (schéma multi-tenant : organisations, franchisés, contrats, abonnements — avec Row Level Security).
3. Installer les dépendances et lancer le serveur de dev :

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) — tu seras redirigé vers `/signup` la première fois pour créer ton compte franchiseur.

## Périmètre actuel (Phase 1)

- Auth Supabase (email/mot de passe) + création d'organisation à l'inscription.
- Isolation multi-tenant par organisation (RLS Postgres).
- CRUD franchisés : liste, création, fiche détail avec suivi de statut (pipeline) et notes.

Ce qui reste à faire est décrit dans la roadmap du document de cadrage (signature électronique, facturation Stripe, intégration DIPpro).

## Générer des visuels de marque (logo, landing page)

Script réutilisable qui appelle directement l'API Claude (Claude Opus 5) pour générer des concepts de logo (SVG) et une maquette de landing page (HTML) pour Essaimo.

1. Définir la clé API : `export ANTHROPIC_API_KEY=sk-ant-...` (ou `node --env-file=.env.local scripts/generate-visuals.mjs` si elle est dans `.env.local`).
2. Lancer :

```bash
npm run visuals          # génère logos + landing page
npm run visuals logo     # logos uniquement
npm run visuals landing  # landing page uniquement
```

Les fichiers sont écrits dans `design-output/` (`logo-concept-*.svg`, `logos-raw.md`, `landing-page.html`). Le brief de marque (positionnement, ton, palette) est modifiable directement dans `scripts/generate-visuals.mjs`.
