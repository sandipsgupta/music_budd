# ScaleMate PRD

## Problem Statement
Build a mobile-first AI music assistant that analyzes user audio or song links to suggest intelligent transpositions and simplified chords for beginners, with a professional studio dark-mode experience.

## Architecture
- Frontend: Expo (React Native) + TypeScript with expo-router navigation
- Backend: FastAPI (planned for audio processing and transposition services)
- Database: MongoDB (planned for saved songbook history)

## What's Implemented
- Bottom tab navigation with Studio, My Voice, and Songbook screens
- Global MusicContext storing vocal range and selected instrument
- Studio chat flow with loading bubble, TranspositionCard results, and animated Hold to Record button
- My Voice screen now reads vocal range from global state
- Songbook screen with realistic placeholder entries
- Consistent dark-mode theme using slate grey, electric blue, and amber accents

## Backlog
### P0
- Implement audio recording flow and backend upload endpoint
- Build transposition and chord simplification API responses
- Persist songbook entries to MongoDB

### P1
- Link parsing and metadata extraction for shared songs
- Voice range analysis results from recorded audio
- Chat interaction with AI assistant responses

### P2
- User profiles and saved presets
- Advanced visualizations for vocal range trends
- Favorites and folders for songbook organization