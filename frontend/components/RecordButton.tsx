import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export default function RecordButton() {
  const [active, setActive] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));
  const animationRef = useRef(null);

  useEffect(() => {
    if (active) {
      pulse.setValue(0);
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      animationRef.current.start();
    } else {
      animationRef.current?.stop();
      pulse.setValue(0);
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [active, animationRef, pulse]);

  const scale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  const opacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 0],
  });

  return (
    <View style={styles.wrapper}>
      {active ? (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        />
      ) : null}
      <Pressable
        onPressIn={() => setActive(true)}
        onPressOut={() => setActive(false)}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel="Hold to record"
      >
        <View style={styles.inner}>
          <Text style={styles.label}>Hold to Record</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.amber,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.electricBlue,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.electricBlue,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  inner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
});