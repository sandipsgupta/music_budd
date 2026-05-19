import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing } from "../../constants/theme";

export default function SongbookScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Songbook</Text>
          <Text style={styles.subtitle}>Saved transpositions</Text>
        </View>

        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No songs saved yet</Text>
          <Text style={styles.emptyText}>
            When you transpose a song in Studio, it will appear here. Nothing is
            stored until we connect saving (coming soon).
          </Text>
          <Pressable
            style={styles.cta}
            onPress={() => router.push("/(tabs)/studio")}
            accessibilityRole="button"
            accessibilityLabel="Go to Studio"
          >
            <Text style={styles.ctaText}>Go to Studio</Text>
          </Pressable>
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
    flexGrow: 1,
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
  emptyCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  cta: {
    marginTop: spacing.lg,
    alignSelf: "flex-start",
    backgroundColor: colors.electricBlue,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  ctaText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
  },
});
