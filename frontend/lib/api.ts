const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type ProcessSongResponse = {
  original_key: string;
  recommended_key: string;
  original_chords_array: string[];
  transposed_chords_array: string[];
};

export async function processSong(
  songName: string,
  instrument: string,
  vocalRange: string
): Promise<ProcessSongResponse> {
  const response = await fetch(`${API_BASE}/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      song_name: songName,
      instrument,
      vocal_range: vocalRange,
    }),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail)) {
        message = body.detail.map((item: { msg?: string }) => item.msg).join(", ");
      }
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return response.json();
}

export function getApiBaseUrl(): string {
  return API_BASE;
}
