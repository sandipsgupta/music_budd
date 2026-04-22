import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "../../constants/theme";

const entries = [
  "Blinding Lights - Transposed to G Major",
  "Yesterday - Capo 3rd Fret",
  "Someone Like You - Simplified to C Major",
];

export default function SongbookScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Songbook</Text>
          <Text style={styles.subtitle}>Recent transpositions</Text>
        </View>

        {entries.map((entry, index) => (
          <View key={`entry-${index}`} style={styles.card}>
            <Text style={styles.entryText}>{entry}</Text>
            <Text style={styles.entryMeta}>Saved moments ago</Text>
          </View>
        ))}
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
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  entryText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  entryMeta: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
  },
});