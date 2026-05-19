import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../constants/theme";
import { DEFAULT_VOCAL_RANGE, useMusic } from "../../context/MusicContext";

export default function MyVoiceScreen() {
  const { vocalRange, hasRecordedVocalRange } = useMusic();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Voice</Text>
          <Text style={styles.subtitle}>Used to personalize keys in Studio</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vocal range</Text>
          {hasRecordedVocalRange ? (
            <>
              <Text style={styles.rangeText}>{vocalRange}</Text>
              <Text style={styles.badge}>Recorded</Text>
            </>
          ) : (
            <>
              <Text style={styles.placeholderRange}>Not recorded yet</Text>
              <Text style={styles.helper}>
                Studio uses a default range ({DEFAULT_VOCAL_RANGE}) until you
                record your voice. Voice scan is coming in the next update.
              </Text>
            </>
          )}
        </View>

        <View style={[styles.card, styles.mutedCard]}>
          <Text style={styles.cardTitle}>How it will work</Text>
          <Text style={styles.tipText}>
            1. Hold to Record in Studio{"\n"}
            2. We analyze your range with AI{"\n"}
            3. Song suggestions fit your voice better
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  mutedCard: {
    opacity: 0.95,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  rangeText: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "700",
    color: colors.electricBlue,
  },
  placeholderRange: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "600",
    color: colors.textMuted,
  },
  badge: {
    marginTop: 8,
    alignSelf: "flex-start",
    fontSize: 11,
    fontWeight: "700",
    color: colors.amber,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  helper: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  tipText: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    lineHeight: 22,
    fontSize: 14,
  },
});
