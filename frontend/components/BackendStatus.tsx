import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  BackendStatus,
  checkBackendHealth,
  getApiBaseUrl,
  getDeviceApiHint,
} from "../lib/api";
import { colors, spacing } from "../constants/theme";

export default function BackendStatusBanner() {
  const [status, setStatus] = useState<BackendStatus>("checking");
  const deviceHint = getDeviceApiHint();

  useEffect(() => {
    let active = true;

    const runCheck = async () => {
      setStatus("checking");
      const online = await checkBackendHealth();
      if (active) {
        setStatus(online ? "online" : "offline");
      }
    };

    runCheck();
    const interval = setInterval(runCheck, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (status === "checking") {
    return (
      <View style={[styles.banner, styles.checking]}>
        <Text style={styles.text}>Checking backend…</Text>
      </View>
    );
  }

  if (status === "online") {
    return (
      <View style={[styles.banner, styles.online]}>
        <Text style={styles.text}>Backend connected · AI transpose ready</Text>
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.offline]}>
      <Text style={styles.title}>Backend offline</Text>
      <Text style={styles.text}>
        Groq will not run until the API is reachable at {getApiBaseUrl()}
      </Text>
      {deviceHint ? <Text style={styles.hint}>{deviceHint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: 12,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  checking: {
    backgroundColor: "rgba(148, 163, 184, 0.12)",
    borderColor: colors.border,
  },
  online: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: "rgba(34, 197, 94, 0.35)",
  },
  offline: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.35)",
  },
  title: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 4,
  },
  text: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  hint: {
    marginTop: 6,
    color: colors.amber,
    fontSize: 12,
    lineHeight: 17,
  },
});
