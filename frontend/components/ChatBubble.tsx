import { View, Text, StyleSheet } from "react-native";
import { colors, spacing } from "../constants/theme";

export default function ChatBubble({ message, sender }) {
  const isUser = sender === "user";

  return (
    <View style={[styles.container, isUser ? styles.user : styles.assistant]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: spacing.sm,
  },
  user: {
    alignItems: "flex-end",
  },
  assistant: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: colors.electricBlue,
  },
  assistantBubble: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 20,
  },
});