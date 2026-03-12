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
