# ScaleMate (music_budd)

ScaleMate is a mobile-first AI music companion that helps beginners pick a better key and simplified chords by:
- analyzing a song title/link (backend: Groq) to infer key + chord progression
- optionally analyzing a recorded vocal clip (backend: Gemini) to estimate vocal range

The UI is an Expo (React Native) app with a dark “studio” feel and bottom tabs.

## Repo layout

- `music_budd/frontend/` — Expo + TypeScript app (tabs: Studio / My Voice / Songbook)
- `music_budd/backend/` — FastAPI server (transposition + audio analysis endpoints)
- `music_budd/backend_test.py` — simple backend smoke tests (currently targets a deployed URL)
- `music_budd/memory/PRD.md` — product brief / backlog
- `music_budd/test_result.md` — test log & agent protocol notes

## Prerequisites

- Node.js (for Expo)
- Python 3.10+ recommended (for FastAPI backend)
- MongoDB connection string (local or hosted) for backend startup
- API keys:
  - `GROQ_API_KEY` for `/api/process`
  - `GOOGLE_API_KEY` for `/api/analyze-audio`

## Quick start (frontend)

```bash
cd music_budd/frontend
npm install
npx expo start
```

Key screens:
- `music_budd/frontend/app/(tabs)/studio.tsx`
- `music_budd/frontend/app/(tabs)/my-voice.tsx`
- `music_budd/frontend/app/(tabs)/songbook.tsx`

## Quick start (backend)

1. Create `music_budd/backend/.env`:

   ```env
   # required (server will crash if missing)
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=scalemate

   # required for /api/process
   GROQ_API_KEY=...

   # required for /api/analyze-audio
   GOOGLE_API_KEY=...
   ```

2. Install and run:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   cd music_budd
   pip install -r backend/requirements.txt
   uvicorn backend.server:app --reload --port 8000
   ```

3. Sanity check:

   ```bash
   curl -s http://localhost:8000/api/ | jq
   ```

## API endpoints

Base path: `/api`

- `GET /` — health check (`{"message":"ScaleMate backend is running"}`)
- `POST /process` — body: `{ "song_name": string, "instrument": "Guitar" | ... }`
  - returns `{ original_key, recommended_key, transposed_chords_array }`
  - uses Groq (LLM) to infer song key + chords, then chooses a semitone shift that maximizes guitar-friendly open chords
- `POST /analyze-audio` — multipart form: `file` (`.wav` or `.m4a`, max 10MB)
  - returns `{ vocal_floor, vocal_ceiling }`
  - uses Gemini to estimate vocal range

Implementation: `music_budd/backend/server.py`.

## Testing

Backend smoke tests (remote by default):

```bash
python3 music_budd/backend_test.py
```

To point it at your local backend, change `BACKEND_URL` in `music_budd/backend_test.py` to `http://localhost:8000/api`.

## API keys (when to add which)

| Key | Where | Needed for | Add now? |
|-----|--------|------------|----------|
| `GROQ_API_KEY` | `backend/.env` | Studio song lookup + chord analysis (`POST /api/process`) | **Yes** — required to test transposition |
| `GOOGLE_API_KEY` | `backend/.env` | Voice recording analysis (`POST /api/analyze-audio`, Gemini) | **Later** — when My Voice recording is wired |
| `MONGO_URL` / `DB_NAME` | `backend/.env` | Server startup (Songbook persistence coming later) | **Yes** — use local Mongo or a free Atlas cluster |

Copy examples:

```bash
cp music_budd/backend/.env.example music_budd/backend/.env
cp music_budd/frontend/.env.example music_budd/frontend/.env
```

Get keys:

- Groq: [console.groq.com](https://console.groq.com) → API Keys
- Google AI (Gemini): [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → use when implementing voice analysis

## Frontend ↔ backend wiring

Studio calls `POST /api/process` via `music_budd/frontend/lib/api.ts`.

1. Start backend on port 8000 (see above).
2. Set `EXPO_PUBLIC_API_URL` in `music_budd/frontend/.env` (defaults to `http://localhost:8000/api` for web).
3. Restart Expo after changing `.env`: `npx expo start`
4. On a **physical phone**, set `EXPO_PUBLIC_API_URL` to your computer’s LAN IP, e.g. `http://192.168.1.10:8000/api`.

## Developer notes

- The backend requires `MONGO_URL` and `DB_NAME` at import time (it will raise if unset).
- Studio is wired to `/api/process`; Hold to Record is UI-only until Phase 2 (needs `GOOGLE_API_KEY`).

## More

- See `music_budd/SKILLS.md` for common workflows and “where to implement X”.
