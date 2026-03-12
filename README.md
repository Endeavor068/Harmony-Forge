# HarmonyForge: Bilingual Digital Hymnal & Song Manager

HarmonyForge is a modern, contemplative digital space designed for organizing and managing a collection of musical hymns in both English and French. It prioritizes clarity, performance, and accessibility for worship leaders, musicians, and community members.

## Project Resume (The "Perfect Prompt")

"Build a modern bilingual (English/French) digital hymnal application called HarmonyForge using Next.js 15 (App Router), Tailwind CSS, and ShadCN UI. The app manages a collection of songs with language-specific metadata (number, title, author, year) and structured content (multiple verses and an optional single chorus per language). 

Integrate Firebase Firestore for real-time synchronization and Firebase Authentication for anonymous access. The user interface features a searchable song list and a dedicated viewing mode with a tabbed interface to switch between Lyrics, Partitions (sheet music images via URL or upload), and Audio recordings (via URL or upload). Use a slide-out Sheet component (sidebar) for all creation and editing workflows to ensure a non-disruptive user experience. Additionally, implement robust bulk data management tools including JSON and CSV import/export functionality."

## Key Features
- **Bilingual Support:** Full localization for song titles, numbers, authors, and lyrics in English and French.
- **Real-time Sync:** All changes are persisted instantly to Firestore.
- **Structured Lyrics:** Dedicated fields for an optional chorus and dynamic verse management for each language.
- **Media Support:** Handle sheet music via image URLs or device uploads, and audio tracks with a built-in player.
- **Data Management:** Export and Import your entire collection via JSON or CSV metadata files.
- **Responsive Design:** A clean dashboard that works on mobile and desktop.
- **Authentication:** Automatic anonymous sign-in to satisfy security rules while maintaining low friction.

## Tech Stack
- **Framework:** Next.js 15
- **Styling:** Tailwind CSS & ShadCN UI
- **Backend:** Firebase (Firestore & Auth)
- **Icons:** Lucide-React
