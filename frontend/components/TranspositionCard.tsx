import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../constants/theme";
import { useMusic } from "../context/MusicContext";

const openChordMap = {
  Fm: "Em",
  Bbm: "Am",
  Ab: "G",
  Eb: "D",
};

export default function TranspositionCard({
  originalKey,
  recommendedKey,
  chordsArray,
}) {
  const { selectedInstrument } = useMusic();
  const [simplified, setSimplified] = useState(true);

  const displayChords = useMemo(() => {
    if (selectedInstrument !== "Guitar") {
      return chordsArray;
    }

    if (!simplified) {
      return chordsArray;
    }

    return chordsArray.map((chord) => openChordMap[chord] || chord);
  }, [chordsArray, selectedInstrument, simplified]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.glassCard}>
        <View style={styles.header}>
          <Text style={styles.title}>Transposition</Text>
          <View style={styles.keysRow}>
            <View style={styles.keyPill}>
              <Text style={styles.keyLabel}>Original</Text>
              <Text style={styles.keyValue}>{originalKey}</Text>
            </View>
            <View style={styles.keyDivider} />
            <View style={styles.keyPill}>
              <Text style={styles.keyLabel}>Recommended</Text>
              <Text style={styles.keyValue}>{recommendedKey}</Text>
            </View>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Simplified</Text>
          <Pressable
            onPress={() => setSimplified((prev) => !prev)}
            style={[styles.toggle, simplified && styles.toggleActive]}
            accessibilityRole="button"
            accessibilityLabel="Toggle simplified chords"
          >
            <View
              style={[
                styles.toggleKnob,
                simplified && styles.toggleKnobActive,
              ]}
            />
          </Pressable>
        </View>

        <View style={styles.chordsSection}>
          <Text style={styles.sectionLabel}>Chord Map</Text>
          <View style={styles.chordsRow}>
            {displayChords.map((chord, index) => (
              <View key={`${chord}-${index}`} style={styles.chordChip}>
                <Text style={styles.chordText}>{chord}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.helperText}>
            {simplified
              ? "Open-chord friendly voicings for guitar."
              : "Standard barre positions for the full voicing."}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "flex-start",
  },
  glassCard: {
    width: "100%",
    borderRadius: 22,
    padding: spacing.lg,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.25)",
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  keysRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  keyPill: {
    flex: 1,
    backgroundColor: "rgba(0, 123, 255, 0.12)",
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  keyLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  keyValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  keyDivider: {
    width: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  toggleLabel: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  toggle: {
    width: 74,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(148, 163, 184, 0.25)",
    padding: 4,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "rgba(255, 191, 0, 0.25)",
  },
  toggleKnob: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.textPrimary,
    transform: [{ translateX: 0 }],
  },
  toggleKnobActive: {
    backgroundColor: colors.amber,
    transform: [{ translateX: 30 }],
  },
  chordsSection: {
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.15)",
    paddingTop: spacing.md,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  chordsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: spacing.sm,
  },
  chordChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  chordText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  helperText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 12,
  },
});