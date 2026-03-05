import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BASEURL } from "../CONFIG/config";
import { RootStackParamList } from "../types";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AILoading">;
  route: RouteProp<RootStackParamList, "AILoading">;
};

const { width, height } = Dimensions.get("window");

const BACKEND_URL = BASEURL + "/child-predict";

const ANALYSIS_STEPS = [
  { label: "දත්ත කියවමින් සිටී…", icon: "📋", color: "#6C63FF" },
  { label: "සන්නිවේදනය විශ්ලේෂණය කරමින්…", icon: "💬", color: "#FF6B6B" },
  { label: "අවධානය ඇගයීම කරමින්…", icon: "🎯", color: "#FF9800" },
  { label: "ඉගෙනීමේ රටාවන් පරීක්ෂා කරමින්…", icon: "🧠", color: "#9C27B0" },
  { label: "ස්වාධීනත්වය ඇගයීම කරමින්…", icon: "💪", color: "#E91E63" },
];

const AILoadingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { answers } = route.params;
  const [currentMsg, setCurrentMsg] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const msgFade = useRef(new Animated.Value(1)).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;
  const orb3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Spinner rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Pulse core
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Floating orbs
    const floatOrb = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();

    floatOrb(orb1, 0);
    floatOrb(orb2, 700);
    floatOrb(orb3, 1400);

    // Cycle loading messages
    const interval = setInterval(() => {
      Animated.timing(msgFade, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentMsg((prev) => (prev + 1) % ANALYSIS_STEPS.length);
        Animated.timing(msgFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 1800);

    // API call
    callBackend();

    return () => clearInterval(interval);
  }, []);

  const callBackend = async () => {
    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      navigation.replace("AIResult", { result: data });
    } catch (err: any) {
      setError(err.message || "Could not connect to server");
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const orb1Y = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const orb2Y = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  const orb3Y = orb3.interpolate({ inputRange: [0, 1], outputRange: [0, -22] });

  const step = ANALYSIS_STEPS[currentMsg];

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <Text style={styles.errorHint}>
          Make sure your backend is running at{"\n"}
          {BACKEND_URL}
        </Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D2B" />

      {/* Background orbs */}
      <Animated.View
        style={[
          styles.bgOrb,
          styles.bgOrb1,
          { transform: [{ translateY: orb1Y }] },
        ]}
      />
      <Animated.View
        style={[
          styles.bgOrb,
          styles.bgOrb2,
          { transform: [{ translateY: orb2Y }] },
        ]}
      />
      <Animated.View
        style={[
          styles.bgOrb,
          styles.bgOrb3,
          { transform: [{ translateY: orb3Y }] },
        ]}
      />

      {/* Center spinner */}
      <View style={styles.spinnerWrapper}>
        <Animated.View
          style={[
            styles.spinnerRing,
            styles.ring1,
            { transform: [{ rotate: spin }] },
          ]}
        />
        <Animated.View
          style={[
            styles.spinnerRing,
            styles.ring2,
            { transform: [{ rotate: spin }, { scaleX: -1 }] },
          ]}
        />
        <Animated.View
          style={[styles.core, { transform: [{ scale: pulseAnim }] }]}
        >
          <Text style={styles.coreIcon}>🤖</Text>
        </Animated.View>
      </View>

      <Text style={styles.title}>AI විශ්ලේෂණය</Text>
      <Text style={styles.sub}>
        ඔබගේ දරුවාගේ ප්‍රගතිය අප විසින් පරීක්ෂා කරමින් සිටී
      </Text>

      {/* Animated step */}
      <Animated.View style={[styles.stepCard, { opacity: msgFade }]}>
        <Text style={styles.stepIcon}>{step.icon}</Text>
        <Text style={styles.stepLabel}>{step.label}</Text>
      </Animated.View>

      {/* Step dots */}
      <View style={styles.dots}>
        {ANALYSIS_STEPS.map((s, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === currentMsg ? "#6C63FF" : "rgba(255,255,255,0.2)",
                width: i === currentMsg ? 20 : 7,
              },
            ]}
          />
        ))}
      </View>

      <Text style={styles.footer}>මෙය සාමාන්‍යයෙන් තත්පර කිහිපයක් ගතවේ</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D2B",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  bgOrb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.12,
  },
  bgOrb1: {
    width: 340,
    height: 340,
    backgroundColor: "#6C63FF",
    top: -80,
    left: -80,
  },
  bgOrb2: {
    width: 260,
    height: 260,
    backgroundColor: "#FF6B6B",
    bottom: 60,
    right: -60,
  },
  bgOrb3: {
    width: 200,
    height: 200,
    backgroundColor: "#4CAF50",
    bottom: 200,
    left: -40,
  },
  spinnerWrapper: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  spinnerRing: {
    position: "absolute",
    borderRadius: 999,
    borderWidth: 3,
  },
  ring1: {
    width: 160,
    height: 160,
    borderColor: "#6C63FF",
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
  },
  ring2: {
    width: 126,
    height: 126,
    borderColor: "#FF6B6B",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  core: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(108,99,255,0.18)",
    borderWidth: 2,
    borderColor: "rgba(108,99,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  coreIcon: { fontSize: 40 },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 40,
  },
  sub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
    marginBottom: 40,
    letterSpacing: 0.3,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 12,
    marginBottom: 28,
    minWidth: 240,
  },
  stepIcon: { fontSize: 24 },
  stepLabel: { fontSize: 15, color: "#fff", fontWeight: "600" },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginBottom: 30,
  },
  dot: { height: 7, borderRadius: 4 },
  footer: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#0D0D2B",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  errorIcon: { fontSize: 56, marginBottom: 16 },
  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },
  errorMsg: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
    marginBottom: 16,
  },
  errorHint: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    lineHeight: 20,
  },
});

export default AILoadingScreen;
