import { Stack } from "expo-router";
import { MusicProvider } from "../context/MusicContext";

export default function RootLayout() {
  return (
    <MusicProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </MusicProvider>
  );
}