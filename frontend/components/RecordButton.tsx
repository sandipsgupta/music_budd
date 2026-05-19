import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../constants/theme";

/** Voice recording + Gemini analysis — Phase 2 */
export default function RecordButton() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.button}>
        <Text style={styles.label}>Hold to Record</Text>
      </View>
      <Text style={styles.caption}>Voice scan — coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },
  label: {
    color: colors.textMuted,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  caption: {
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
});
