import { createContext, useContext, useMemo, useState } from "react";

const MusicContext = createContext({
  vocalRange: "E2-C5",
  selectedInstrument: "Guitar",
  setVocalRange: () => {},
  setSelectedInstrument: () => {},
});

export function MusicProvider({ children }) {
  const [vocalRange, setVocalRange] = useState("E2-C5");
  const [selectedInstrument, setSelectedInstrument] = useState("Guitar");

  const value = useMemo(
    () => ({
      vocalRange,
      selectedInstrument,
      setVocalRange,
      setSelectedInstrument,
    }),
    [vocalRange, selectedInstrument]
  );

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}