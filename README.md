# HarmonyForge: Bilingual Digital Hymnal & Song Manager

HarmonyForge is a modern, contemplative digital space designed for organizing and managing a collection of musical hymns in both English and French. It prioritizes clarity, performance, and accessibility for worship leaders, musicians, and community members.

## Project Resume (The "Perfect Prompt" - GitHub API Version)

"Build a modern bilingual (English/French) digital hymnal application called HarmonyForge using Next.js 15 (App Router), Tailwind CSS, and ShadCN UI. The app functions as a GitHub client for a specific repository, using the GitHub API to manage songs stored as individual JSON files. Each song document includes language-specific metadata (number, title, author, year) and structured lyrics (verses and chorus). The interface features a real-time searchable song list and a viewing mode with tabs for Lyrics, Partitions (images), and Audio recordings. Use a slide-out Sheet (sidebar) for all creation and editing workflows, and include bulk data management features like JSON and CSV import/export."

## Key Features
- **Bilingual Support:** Full localization for song titles, numbers, authors, and lyrics in English and French.
- **GitHub-Ready (Target):** Designed to function as a CMS client for a repository library.
- **Structured Lyrics:** Dedicated fields for an optional chorus and dynamic verse management for each language.
- **Media Support:** Handle sheet music via image URLs or device uploads, and audio tracks with a built-in player.
- **Data Management:** Export and Import your entire collection via JSON or CSV metadata files.
- **Responsive Design:** A clean dashboard that works on mobile and desktop.

## Tech Stack (Current)
- **Framework:** Next.js 15
- **Styling:** Tailwind CSS & ShadCN UI
- **Data Layer:** Firebase Firestore (Real-time)
- **Auth:** Firebase Anonymous Authentication
- **Icons:** Lucide-React

## Déploiement du front (Vercel ou Netlify)

Le backend Firebase (Firestore, Auth, Storage, règles) reste sur Firebase. Le front est une app Next.js déployable sur n’importe quel hébergeur Node.

### Prérequis Firebase (obligatoire pour l’auth)

Après le premier déploiement, ajoutez le **domaine public** de votre site (par ex. `votre-app.vercel.app` ou `votre-site.netlify.app`) dans la console Firebase : **Authentication → Settings → Authorized domains**. Sans cela, la connexion anonyme peut échouer sur le nouveau domaine.

### Vercel (recommandé pour Next.js)

1. Installez la CLI : `npm i -g vercel` (ou utilisez `npx vercel`).
2. À la racine du dépôt : `vercel` (preview) puis `vercel --prod` pour la production.
3. Optionnel : dans le projet Vercel → **Settings → Environment Variables**, copiez les clés depuis `.env.example` si vous voulez surcharger la config Firebase sans modifier le code.

Le dépôt inclut `vercel.json` (`framework: nextjs`, `npm ci`, `npm run build`).

### Netlify

1. Liez le dépôt dans le tableau de bord Netlify ou utilisez la CLI Netlify.
2. Le fichier `netlify.toml` configure le plugin `@netlify/plugin-nextjs` et Node 20.
3. Même remarque sur les **Authorized domains** Firebase et les variables `NEXT_PUBLIC_*`.

### Variables d’environnement

Voir `.env.example`. Si les variables ne sont pas définies, les valeurs par défaut de `src/firebase/config.ts` sont utilisées (comportement actuel).

### Firebase Storage (partitions PDF / audio MP3)

Les fichiers sont envoyés vers `songs/partitions/` et `songs/audio/` avec un `contentType` explicite. Les règles du dépôt sont dans `storage.rules` (types MIME + taille max 50 Mo). Déployez-les sur votre projet :

`firebase deploy --only storage`

Sans ce déploiement, les uploads peuvent être refusés si les règles par défaut du bucket diffèrent.
