import { StatusBar } from "expo-status-bar";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatBubble from "../../components/ChatBubble";
import RecordButton from "../../components/RecordButton";
import { colors, spacing } from "../../constants/theme";

const messages = [
  {
    id: "1",
    sender: "assistant",
    text: "Welcome to ScaleMate. Paste a song link or record a riff to get started.",
  },
  {
    id: "2",
    sender: "user",
    text: "I want to transpose 'Blinding Lights' to a beginner-friendly key.",
  },
  {
    id: "3",
    sender: "assistant",
    text: "Great choice. I can shift it to G major and simplify the chords.",
  },
];

export default function StudioScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Studio</Text>
          <Text style={styles.subtitle}>Your AI music companion</Text>
        </View>

        <ScrollView
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              message={message.text}
              sender={message.sender}
            />
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Paste a song link or title"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.recordWrapper}>
            <RecordButton />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
  chat: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: spacing.lg,
  },
  composer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  inputContainer: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 15,
  },
  recordWrapper: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
});