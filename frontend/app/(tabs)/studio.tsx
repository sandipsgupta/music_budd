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
import BackendStatusBanner from "../../components/BackendStatus";
import ChatBubble from "../../components/ChatBubble";
import RecordButton from "../../components/RecordButton";
import TranspositionCard from "../../components/TranspositionCard";
import { colors, spacing } from "../../constants/theme";
import { useMusic } from "../../context/MusicContext";
import { formatApiError, processSong } from "../../lib/api";

const initialMessages = [
  {
    id: "welcome",
    sender: "assistant",
    type: "text",
    text:
      "Type a real song title (e.g. Blinding Lights or Yesterday). " +
      "I will look up the chords with AI and suggest an easier key for guitar.",
  },
];

export default function StudioScreen() {
  const { vocalRange, selectedInstrument } = useMusic();
  const [inputValue, setInputValue] = useState("");
  const [chatItems, setChatItems] = useState(initialMessages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const canSend = inputValue.trim().length > 0 && !isSubmitting;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [chatItems.length]);

  const handleSubmit = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSubmitting) {
      return;
    }

    if (trimmed.length < 2) {
      setChatItems((prev) => [
        ...prev,
        {
          id: `hint-${Date.now()}`,
          sender: "assistant",
          type: "text",
          text: "Please enter a song title (at least 2 characters), e.g. Blinding Lights.",
        },
      ]);
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
    setIsSubmitting(true);

    try {
      const result = await processSong(
        trimmed,
        selectedInstrument,
        vocalRange
      );

      setChatItems((prev) => {
        const withoutLoading = prev.filter((item) => item.id !== loadingId);
        return [
          ...withoutLoading,
          {
            id: `card-${Date.now()}`,
            sender: "assistant",
            type: "card",
            data: {
              originalKey: result.original_key,
              recommendedKey: result.recommended_key,
              chordsArray: result.transposed_chords_array,
              originalChordsArray: result.original_chords_array,
            },
          },
        ];
      });
    } catch (error) {
      const message = formatApiError(error);

      setChatItems((prev) => {
        const withoutLoading = prev.filter((item) => item.id !== loadingId);
        return [
          ...withoutLoading,
          {
            id: `error-${Date.now()}`,
            sender: "assistant",
            type: "text",
            text: message,
          },
        ];
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <Text style={styles.subtitle}>AI transpose for beginners</Text>
          <BackendStatusBanner />
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
                    originalChordsArray={item.data.originalChordsArray}
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
              placeholder="Song title, e.g. Blinding Lights"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              value={inputValue}
              onChangeText={setInputValue}
              editable={!isSubmitting}
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
