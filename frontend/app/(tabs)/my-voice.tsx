import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../constants/theme";
import { useMusic } from "../../context/MusicContext";

const chartHeights = [28, 40, 55, 70, 86, 72, 58, 44, 60, 78, 52, 36];

export default function MyVoiceScreen() {
  const { vocalRange } = useMusic();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Voice</Text>
          <Text style={styles.subtitle}>Vocal range snapshot</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detected Range</Text>
          <Text style={styles.rangeText}>{vocalRange}</Text>
          <View style={styles.chart}>
            {chartHeights.map((height, index) => (
              <View
                key={`bar-${index}`}
                style={[styles.bar, { height }]}
              />
            ))}
          </View>
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabelText}>Low</Text>
            <Text style={styles.rangeLabelText}>High</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tips</Text>
          <Text style={styles.tipText}>
            Warm up for 5 minutes before recording to get the most accurate
            range read.
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  rangeText: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
    color: colors.electricBlue,
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: spacing.lg,
    gap: 6,
    height: 100,
  },
  bar: {
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.amber,
  },
  rangeLabels: {
    marginTop: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangeLabelText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  tipText: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    lineHeight: 20,
    fontSize: 14,
  },
});