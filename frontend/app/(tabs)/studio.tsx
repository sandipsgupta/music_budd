import { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatBubble from "../../components/ChatBubble";
import RecordButton from "../../components/RecordButton";
import TranspositionCard from "../../components/TranspositionCard";
import { colors, spacing } from "../../constants/theme";

const initialMessages = [
  {
    id: "1",
    sender: "assistant",
    type: "text",
    text: "Welcome to ScaleMate. Paste a song link or record a riff to get started.",
  },
  {
    id: "2",
    sender: "user",
    type: "text",
    text: "I want to transpose 'Blinding Lights' to a beginner-friendly key.",
  },
  {
    id: "3",
    sender: "assistant",
    type: "text",
    text: "Great choice. I can shift it to G major and simplify the chords.",
  },
];

const mockTransposition = {
  originalKey: "Fm",
  recommendedKey: "Em",
  chordsArray: ["Fm", "Bbm", "Ab", "Eb"],
};

export default function StudioScreen() {
  const [inputValue, setInputValue] = useState("");
  const [chatItems, setChatItems] = useState(initialMessages);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);
  const canSend = inputValue.trim().length > 0;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [chatItems.length]);

  const handleSubmit = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      type: "text",
      text: trimmed,
    };
    const loadingId = `loading-${Date.now()}`;
    const loadingMessage = {
      id: loadingId,
      sender: "assistant",
      type: "loading",
    };

    setChatItems((prev) => [...prev, userMessage, loadingMessage]);
    setInputValue("");

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setChatItems((prev) => {
        const withoutLoading = prev.filter((item) => item.id !== loadingId);
        return [
          ...withoutLoading,
          {
            id: `card-${Date.now()}`,
            sender: "assistant",
            type: "card",
            data: mockTransposition,
          },
        ];
      });
    }, 2000);
  };

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
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {chatItems.map((item) => {
            if (item.type === "text") {
              return (
                <ChatBubble
                  key={item.id}
                  message={item.text}
                  sender={item.sender}
                />
              );
            }

            if (item.type === "loading") {
              return (
                <View key={item.id} style={styles.loadingWrapper}>
                  <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color={colors.electricBlue} />
                    <Text style={styles.loadingText}>Analyzing...</Text>
                  </View>
                </View>
              );
            }

            if (item.type === "card") {
              return (
                <View key={item.id} style={styles.cardWrapper}>
                  <TranspositionCard
                    originalKey={item.data.originalKey}
                    recommendedKey={item.data.recommendedKey}
                    chordsArray={item.data.chordsArray}
                  />
                </View>
              );
            }

            return null;
          })}
        </ScrollView>

        <View style={styles.composer}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Paste a song link or title"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              value={inputValue}
              onChangeText={setInputValue}
            />
            <Pressable
              onPress={handleSubmit}
              disabled={!canSend}
              style={({ pressed }) => [
                styles.sendButton,
                !canSend && styles.sendButtonDisabled,
                pressed && canSend && styles.sendButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Send song name"
            >
              <Text
                style={[styles.sendText, !canSend && styles.sendTextDisabled]}
              >
                Send
              </Text>
            </Pressable>
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
  loadingWrapper: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    marginLeft: spacing.sm,
    color: colors.textMuted,
    fontSize: 13,
  },
  cardWrapper: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: spacing.md,
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
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
  },
  sendButton: {
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: colors.electricBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  sendButtonPressed: {
    opacity: 0.9,
  },
  sendText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "600",
  },
  sendTextDisabled: {
    color: colors.textMuted,
  },
  recordWrapper: {
    marginTop: spacing.lg,
    alignItems: "center",
  },
});