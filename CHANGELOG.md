# Changelog

All notable changes to **HarmonyForge** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Partition and audio fields in the edit form: when a file or URL is already set, URL entry and upload are hidden until the user removes the existing media (one partition and one audio per song).

## [0.1.0] - 2026-04-21

### Added

- Bilingual hymn manager (English / French): per-language title, number, author, year, optional musical key, verses, and optional chorus.
- Firebase backend: Firestore for songs, anonymous authentication, Firebase Storage for uploaded partition and audio files.
- Song list with search, including search by hymn number with or without `#`.
- Selected song highlighting in the list.
- Song detail view with tabs for lyrics, partition (PDF or image), and audio player when URLs exist; language toggle for lyrics.
- Create and edit songs in a slide-out Sheet (sidebar).
- Partition support via URL or upload (PDF and common image types); audio via URL or upload (MP3-focused).
- Export collection metadata as JSON or CSV; import from JSON or CSV.
- Media indicators for partition and audio on the song form and detail views.
- Remove partition or audio: delete Storage object when applicable and clear `partitionUrl` / `audioUrl` in Firestore.
- WYSIWYG lyric editing (TipTap) for chorus and each verse: bold, italic, underline, strikethrough; legacy plain text normalized for editing.
- Sanitized HTML rendering for lyrics on the detail view; plain text still supported with line breaks.
- Lyric helpers for empty/legacy content detection across HTML and plain text.
- `.env.example` and documentation for Firebase configuration and deployment.
- Deployment notes for Vercel and Netlify; Firebase `Authorized domains` guidance for anonymous auth.
- Firebase Storage rules in-repo and README instructions to deploy them (`firebase deploy --only storage`).
- `next.config` remote patterns for Firebase Storage and other media hosts as needed.
- Node.js engine requirement (`>=20`) in `package.json`.

### Changed

- Data layer moved from an initial “GitHub JSON” prototype concept to Firebase (Firestore + Storage + Auth).
- Firestore and Storage security rules refactored for clearer access control.
- README expanded with deployment, environment variables, and Storage workflow.
- Firebase client initialization and configuration centralized (`config`, providers, hooks).

### Fixed

- Firebase Storage errors (bucket, permissions, rules) and upload failures addressed in iterations.
- Firestore permission errors for anonymous clients aligned with updated rules.
- App startup and runtime issues (including hydration-related warnings) addressed where reported.
- TypeScript/runtime issues in song management (undefined access, etc.).
- Storage delete-by-URL: use `ref(storage, path)` with parsed download URL when `refFromURL` typings are unavailable.
- Import flow when “nothing happened” after import.
- Detail panel scrolling and sticky layout so the hymn view remains fully scrollable and usable.
- Search behavior for hymn numbers without `#`.

### Security

- DOMPurify (or equivalent) sanitization for rendered lyric HTML on the detail view; restricted tag allowlist.

---

## Earlier development (pre-0.1.0)

Initial prototype, Firebase wiring, sheet music and audio fields, bilingual verses/chorus, import/export, UI polish around sticky layout, language switching, and Firebase error fixes—see `git log` for per-commit detail.
