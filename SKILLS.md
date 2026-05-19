# ScaleMate repo skills

This file is a quick “how to work with this repo” guide: what the project can do today, where the key code lives, and the most common developer workflows.

## Product capabilities (current)

- **Studio (frontend)**: chat-style UI with message bubbles, an input composer, and a mocked “transposition card” result.
- **My Voice (frontend)**: displays a (currently mocked) vocal range and a simple bar-chart visualization.
- **Songbook (frontend)**: placeholder list of recent “saved” transpositions.
- **Backend transposition API**: given a song name, asks Groq for song key + chords and computes an open-chord-friendly transposition for guitar.
- **Backend vocal range API**: uploads audio to Gemini and returns detected vocal floor/ceiling (scientific pitch notation).

## Key workflows

### Run the backend (FastAPI)

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

2. Install deps and run:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   cd music_budd
   pip install -r backend/requirements.txt
   uvicorn backend.server:app --reload --port 8000
   ```

3. Try endpoints:

   ```bash
   curl -s http://localhost:8000/api/ | jq
   curl -s -X POST http://localhost:8000/api/process \
     -H 'content-type: application/json' \
     -d '{"song_name":"Blinding Lights","instrument":"Guitar"}' | jq
   ```

### Run the frontend (Expo / React Native)

```bash
cd music_budd/frontend
npm install
npx expo start
```

This app uses `expo-router` with bottom tabs:
- `music_budd/frontend/app/(tabs)/studio.tsx`
- `music_budd/frontend/app/(tabs)/my-voice.tsx`
- `music_budd/frontend/app/(tabs)/songbook.tsx`

### Run the repo’s existing backend smoke test

`music_budd/backend_test.py` is a lightweight script that hits a configured backend URL and asserts clear error messages when API keys are missing.

```bash
python3 music_budd/backend_test.py
```

If you want it to test your local backend instead, change `BACKEND_URL` in `music_budd/backend_test.py` to `http://localhost:8000/api`.

## Where to implement common features

- **Call the backend from the app**: add an API client and wire it into `music_budd/frontend/app/(tabs)/studio.tsx`.
- **Tune transposition logic**: see `transpose_chord`, `select_best_offset` in `music_budd/backend/server.py`.
- **Persist Songbook history**: MongoDB client is initialized in `music_budd/backend/server.py`; extend `/api/process` to also write a record, then read it in the frontend.
- **Theme + spacing**: `music_budd/frontend/constants/theme.ts`.
- **Global app state**: `music_budd/frontend/context/MusicContext.tsx`.
