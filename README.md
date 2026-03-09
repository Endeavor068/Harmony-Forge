# HarmonyForge: Digital Hymnal & Song Manager

HarmonyForge is a modern, contemplative digital space designed for organizing and managing a collection of musical hymns. It prioritizes clarity, performance, and accessibility for worship leaders, musicians, and community members.

## Project Resume (The "Perfect Prompt")

"Build a modern digital hymnal application called HarmonyForge using Next.js 15 (App Router), Tailwind CSS, and ShadCN UI. The app manages a collection of songs with metadata (number, title, author, year) and structured content (multiple verses and an optional single chorus). 

Integrate Firebase Firestore for real-time synchronization and Firebase Authentication for anonymous access. The user interface features a searchable song list and a dedicated viewing mode with a tabbed interface to switch between Lyrics, Partitions (sheet music images), and Audio recordings. Use a slide-out Sheet component (sidebar) for all creation and editing workflows to ensure a non-disruptive user experience."

## Key Features
- **Real-time Sync:** All changes are persisted instantly to Firestore.
- **Structured Lyrics:** Dedicated fields for a chorus and dynamic verse management.
- **Media Support:** Handle sheet music via image URLs or uploads, and audio tracks with a built-in player.
- **Responsive Design:** A clean dashboard that works on mobile and desktop.
- **Authentication:** Automatic anonymous sign-in to satisfy security rules while maintaining low friction.

## Tech Stack
- **Framework:** Next.js 15
- **Styling:** Tailwind CSS & ShadCN UI
- **Backend:** Firebase (Firestore & Auth)
- **Icons:** Lucide-React
