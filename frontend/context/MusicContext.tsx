import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const DEFAULT_VOCAL_RANGE = "E2-C5";

const MusicContext = createContext({
  vocalRange: DEFAULT_VOCAL_RANGE,
  hasRecordedVocalRange: false,
  selectedInstrument: "Guitar",
  setVocalRange: (_range: string, _fromRecording?: boolean) => {},
  setSelectedInstrument: (_instrument: string) => {},
});

export function MusicProvider({ children }: { children: ReactNode }) {
  const [vocalRange, setVocalRangeState] = useState(DEFAULT_VOCAL_RANGE);
  const [hasRecordedVocalRange, setHasRecordedVocalRange] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState("Guitar");

  const setVocalRange = (range: string, fromRecording = false) => {
    setVocalRangeState(range);
    if (fromRecording) {
      setHasRecordedVocalRange(true);
    }
  };

  const value = useMemo(
    () => ({
      vocalRange,
      hasRecordedVocalRange,
      selectedInstrument,
      setVocalRange,
      setSelectedInstrument,
    }),
    [vocalRange, hasRecordedVocalRange, selectedInstrument]
  );

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
