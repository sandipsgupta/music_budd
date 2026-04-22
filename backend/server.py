import json
import logging
import os
import re
import tempfile
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, File, HTTPException, UploadFile
from groq import Groq
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB connection (reserved for future persistence)
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")

SHARP_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
FLAT_TO_SHARP = {
    "Db": "C#",
    "Eb": "D#",
    "Gb": "F#",
    "Ab": "G#",
    "Bb": "A#",
}
OPEN_CHORD_ROOTS = {"G", "C", "D"}
OPEN_MINOR_ROOTS = {"E", "A"}


class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StatusCheckCreate(BaseModel):
    client_name: str


class TranscriptionRequest(BaseModel):
    song_name: str
    instrument: str = "Guitar"


class TranscriptionResponse(BaseModel):
    original_key: str
    recommended_key: str
    transposed_chords_array: List[str]


class AudioAnalysisResponse(BaseModel):
    vocal_floor: str
    vocal_ceiling: str


def normalize_note(note: str) -> str:
    return FLAT_TO_SHARP.get(note, note)


def parse_chord(chord: str) -> Tuple[str, str]:
    match = re.match(r"^([A-G](?:#|b)?)(.*)$", chord)
    if not match:
        return chord, ""
    root = normalize_note(match.group(1))
    suffix = match.group(2) or ""
    return root, suffix


def transpose_note(note: str, offset: int) -> str:
    normalized = normalize_note(note)
    if normalized not in SHARP_SCALE:
        return normalized
    index = SHARP_SCALE.index(normalized)
    return SHARP_SCALE[(index + offset) % len(SHARP_SCALE)]


def transpose_chord(chord: str, offset: int) -> str:
    if "/" in chord:
        base, bass = chord.split("/", 1)
        transposed_base = transpose_chord(base, offset)
        transposed_bass = transpose_chord(bass, offset)
        return f"{transposed_base}/{transposed_bass}"

    root, suffix = parse_chord(chord)
    transposed_root = transpose_note(root, offset)
    return f"{transposed_root}{suffix}"


def transpose_key(key: str, offset: int) -> str:
    root, suffix = parse_chord(key)
    return f"{transpose_note(root, offset)}{suffix}"


def is_open_chord(chord: str) -> bool:
    root, suffix = parse_chord(chord)
    if root in OPEN_CHORD_ROOTS:
        return not suffix.startswith("m") or suffix.startswith("maj")
    if root in OPEN_MINOR_ROOTS:
        return suffix.startswith("m") and not suffix.startswith("maj")
    return False


def select_best_offset(chords: List[str]) -> int:
    best_offset = 0
    best_score = -1
    for offset in range(12):
        transposed = [transpose_chord(chord, offset) for chord in chords]
        score = sum(1 for chord in transposed if is_open_chord(chord))
        if score > best_score:
            best_score = score
            best_offset = offset
    return best_offset


def parse_groq_json(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


async def get_song_data(song_name: str, vocal_range: str = "E2-C5") -> dict:
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is not configured")

    system_prompt = (
        "You are the ScaleMate Music Intelligence Engine. Your task is to find the "
        "original key and standard chord progression for a song."
        "Search: Identify the song’s native key and main chord sequence."
        "Transpose: Compare the song’s melody range to the user’s vocal range (provided in the request)."
        "Optimize for Guitar: Calculate the semitone shift that maximizes the use of open chords (G, C, D, Em, Am)."
        "Output: Return a strict JSON object with: original_key, recommended_key, "
        "semitone_offset, and a chord_map array containing original and simplified chord names."
    )

    client_groq = Groq(api_key=groq_key)
    response = client_groq.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": f"Song: {song_name}. Vocal range: {vocal_range}.",
            },
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content or "{}"
    try:
        payload = parse_groq_json(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Groq response was not valid JSON")

    original_key = payload.get("original_key")
    chord_map = payload.get("chord_map") or payload.get("chords")
    chord_progression = payload.get("chord_progression") or payload.get("chords_array")

    if isinstance(chord_map, list):
        if chord_map and isinstance(chord_map[0], dict):
            chords = [
                chord.get("original")
                or chord.get("original_chord")
                or chord.get("chord")
                for chord in chord_map
                if isinstance(chord, dict)
            ]
            chords = [chord for chord in chords if chord]
        else:
            chords = [chord for chord in chord_map if isinstance(chord, str)]
    elif isinstance(chord_progression, list):
        chords = chord_progression
    else:
        chords = []

    if not original_key or not chords:
        raise HTTPException(status_code=502, detail="Groq response missing key data")

    return {"original_key": original_key, "chords": chords}


@api_router.get("/")
async def root():
    return {"message": "ScaleMate backend is running"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


@api_router.post("/process", response_model=TranscriptionResponse)
async def process_transcription(request: TranscriptionRequest):
    song_data = await get_song_data(request.song_name)
    chords = song_data["chords"]
    original_key = song_data["original_key"]

    offset = 0
    if request.instrument.lower() == "guitar":
        offset = select_best_offset(chords)

    transposed_chords = [transpose_chord(chord, offset) for chord in chords]
    recommended_key = transpose_key(original_key, offset)

    return TranscriptionResponse(
        original_key=original_key,
        recommended_key=recommended_key,
        transposed_chords_array=transposed_chords,
    )


@api_router.post("/analyze-audio", response_model=AudioAnalysisResponse)
async def analyze_audio(file: UploadFile = File(...)):
    if file.content_type not in {"audio/wav", "audio/x-wav", "audio/m4a", "audio/mp4"}:
        raise HTTPException(status_code=400, detail="Only .wav or .m4a files are supported")

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio file exceeds 10MB limit")

    gemini_key = os.getenv("GOOGLE_API_KEY")
    if not gemini_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY is not configured")

    genai.configure(api_key=gemini_key)
    model = genai.GenerativeModel("gemini-1.5-pro")

    suffix = ".wav" if file.filename and file.filename.endswith(".wav") else ".m4a"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        temp_file.write(content)
        temp_file.flush()
        temp_file.close()

        uploaded = genai.upload_file(temp_file.name, mime_type=file.content_type)
        prompt = (
            "Analyze the audio and return the singer's vocal floor and ceiling in "
            "scientific pitch notation. Respond with strict JSON: "
            '{"vocal_floor": "E2", "vocal_ceiling": "C5"}.'
        )
        response = model.generate_content([prompt, uploaded])
        payload = parse_groq_json(response.text or "{}")

        vocal_floor = payload.get("vocal_floor")
        vocal_ceiling = payload.get("vocal_ceiling")
        if not vocal_floor or not vocal_ceiling:
            raise HTTPException(status_code=502, detail="Gemini response missing vocal range")

        return AudioAnalysisResponse(vocal_floor=vocal_floor, vocal_ceiling=vocal_ceiling)
    finally:
        try:
            os.unlink(temp_file.name)
        except Exception:
            pass


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
