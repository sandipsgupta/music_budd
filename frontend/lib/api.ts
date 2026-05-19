import { Platform } from "react-native";
import Constants from "expo-constants";

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type ProcessSongResponse = {
  original_key: string;
  recommended_key: string;
  original_chords_array: string[];
  transposed_chords_array: string[];
};

export type BackendStatus = "checking" | "online" | "offline";

export function getApiBaseUrl(): string {
  return API_BASE;
}

export function isLocalhostApiUrl(): boolean {
  return /localhost|127\.0\.0\.1/.test(API_BASE);
}

/** Phones cannot reach your Mac via localhost — need LAN IP in .env */
export function getDeviceApiHint(): string | null {
  const onPhysicalDevice = Constants.isDevice;
  if (Platform.OS === "web" || !onPhysicalDevice) {
    return null;
  }
  if (!isLocalhostApiUrl()) {
    return null;
  }
  return (
    "This phone cannot use localhost. In frontend/.env set " +
    "EXPO_PUBLIC_API_URL=http://YOUR_MAC_IP:8000/api (same Wi‑Fi), then restart Expo."
  );
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${API_BASE}/`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

export function formatApiError(error: unknown): string {
  const deviceHint = getDeviceApiHint();
  const message = error instanceof Error ? error.message : String(error);

  if (
    message === "Network request failed" ||
    message.includes("Failed to fetch") ||
    message.includes("abort")
  ) {
    const parts = [
      "Cannot reach the ScaleMate backend.",
      "1) Start it: uvicorn backend.server:app --reload --port 8000",
      "2) Phone and Mac on the same Wi‑Fi",
    ];
    if (deviceHint) {
      parts.push(deviceHint);
    } else if (isLocalhostApiUrl()) {
      parts.push(`API URL: ${API_BASE}`);
    } else {
      parts.push(`Check API URL: ${API_BASE}`);
    }
    return parts.join("\n");
  }

  return message;
}

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
        message = body.detail
          .map((item: { msg?: string }) => item.msg)
          .join(", ");
      }
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  return response.json();
}
