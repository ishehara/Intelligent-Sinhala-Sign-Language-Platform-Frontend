import { SignReaderBottomNav } from "@/components/sign-reader/SignReaderBottomNav";
import signReaderService from "@/services/signReaderService";
import { SignPrediction } from "@/types/sign-reader";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";

type ConnectionStatus = "checking" | "connected" | "disconnected";
type CaptureStatus = "idle" | "capturing";

export default function SignLanguageReaderScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  // Server connection
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("checking");
  const [numClasses, setNumClasses] = useState(0);

  // Capture state
  const [captureStatus, setCaptureStatus] = useState<CaptureStatus>("idle");
  const [bufferCount, setBufferCount] = useState(0);
  const [bufferMax, setBufferMax] = useState(60);

  // Result
  const [prediction, setPrediction] = useState<SignPrediction | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Refs
  const cameraRef = useRef<CameraView>(null);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const isCapturingRef = useRef(false);
  const isSendingRef = useRef(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // ── Health check ────────────────────────────────────────────────────────
  useEffect(() => {
    checkConnection();
    return () => stopCapture();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: bufferMax > 0 ? bufferCount / bufferMax : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [bufferCount, bufferMax]);

  const checkConnection = async () => {
    setConnectionStatus("checking");
    const health = await signReaderService.checkHealth();
    if (health.reachable && health.modelLoaded) {
      setConnectionStatus("connected");
      setNumClasses(health.numClasses ?? 0);
    } else {
      setConnectionStatus("disconnected");
    }
  };

  // ── Capture loop ────────────────────────────────────────────────────────
  const startCapture = useCallback(async () => {
    if (!cameraRef.current || connectionStatus !== "connected") return;

    await signReaderService.resetBuffer();
    setBufferCount(0);
    setBufferMax(60);
    setPrediction(null);
    setIsSaved(false);
    setCaptureStatus("capturing");
    isCapturingRef.current = true;

    captureIntervalRef.current = setInterval(async () => {
      if (!isCapturingRef.current || !cameraRef.current || isSendingRef.current)
        return;

      isSendingRef.current = true;
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.3,
          skipProcessing: true,
          exif: false,
        } as any);

        if (!photo?.base64 || !isCapturingRef.current) return;

        const result = await signReaderService.sendFrame(photo.base64);

        if (!isCapturingRef.current) return;

        if (result.buffer_full && result.predicted_label) {
          stopCapture();
          setCaptureStatus("idle");
          setBufferCount(result.buffer_max ?? 60);
          setPrediction({
            predicted_label: result.predicted_label!,
            sinhala_label: result.sinhala_label!,
            confidence: result.confidence!,
            top5_predictions: result.top5_predictions ?? [],
          });
        } else if (!result.buffer_full && result.buffer_count !== undefined) {
          setBufferCount(result.buffer_count);
          if (result.buffer_max) setBufferMax(result.buffer_max);
        }
      } catch {
        stopCapture();
        setCaptureStatus("idle");
        Alert.alert(
          "Connection Error",
          "Could not reach the sign reader server. Make sure the backend is running and the IP address is correct.",
        );
      } finally {
        isSendingRef.current = false;
      }
    }, 250); // ~4 fps — balance speed vs. network cost
  }, [connectionStatus]);

  const stopCapture = () => {
    isCapturingRef.current = false;
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  const handleReset = () => {
    stopCapture();
    setCaptureStatus("idle");
    setBufferCount(0);
    setPrediction(null);
    setIsSaved(false);
    signReaderService.resetBuffer();
  };

  const handleSpeak = () => {
    if (!prediction) return;
    Speech.speak(prediction.sinhala_label, { language: "si-LK" });
  };

  const handleCopy = async () => {
    if (!prediction) return;
    await Clipboard.setStringAsync(prediction.sinhala_label);
    if (Platform.OS === "android") {
      ToastAndroid.show("Copied to clipboard", ToastAndroid.SHORT);
    }
  };

  const handleSave = async () => {
    if (!prediction || isSaved) return;
    await signReaderService.saveToHistory({
      sinhalaText: prediction.sinhala_label,
      englishLabel: prediction.predicted_label,
      confidence: prediction.confidence,
      timestamp: new Date().toISOString(),
    });
    setIsSaved(true);
    if (Platform.OS === "android") {
      ToastAndroid.show("Saved to history", ToastAndroid.SHORT);
    }
  };

  // ── Permission screens ──────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00BCD4" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#00BCD4" />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          Camera access is required to recognise sign language in real-time.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <SignReaderBottomNav activeTab="home" />
      </View>
    );
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* ── Connection status bar ─────────────────────────────────────── */}
      <View
        style={[
          styles.statusBar,
          connectionStatus === "connected" && styles.statusConnected,
          connectionStatus === "disconnected" && styles.statusDisconnected,
          connectionStatus === "checking" && styles.statusChecking,
        ]}
      >
        <View style={styles.statusRow}>
          {connectionStatus === "checking" ? (
            <ActivityIndicator
              size="small"
              color="white"
              style={{ marginRight: 6 }}
            />
          ) : (
            <Ionicons
              name={connectionStatus === "connected" ? "wifi" : "wifi-outline"}
              size={14}
              color="white"
              style={{ marginRight: 6 }}
            />
          )}
          <Text style={styles.statusText}>
            {connectionStatus === "connected"
              ? "Model ready"
              : connectionStatus === "disconnected"
                ? "Server offline — start the backend"
                : "Connecting to server…"}
          </Text>
          {connectionStatus !== "connected" && (
            <TouchableOpacity onPress={checkConnection} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Camera ────────────────────────────────────────────────────── */}
      <View style={styles.cameraWrapper}>
        <CameraView ref={cameraRef} style={styles.camera} facing="front">
          {/* Corner guides */}
          <View style={styles.guideOverlay}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            <Text style={styles.guideHint}>Position hands in frame</Text>
          </View>

          {/* Recording badge */}
          {captureStatus === "capturing" && (
            <View style={styles.recordingBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Analysing…</Text>
            </View>
          )}
        </CameraView>
      </View>

      {/* ── Buffer progress ────────────────────────────────────────────── */}
      <View style={styles.progressContainer}>
        <View style={styles.progressMeta}>
          <Text style={styles.progressLabel}>
            {captureStatus === "capturing"
              ? `Capturing: ${bufferCount} / ${bufferMax} frames`
              : prediction
                ? "Analysis complete ✓"
                : "Press Start to recognise a sign"}
          </Text>
          <Text style={styles.progressPct}>
            {Math.round((bufferCount / bufferMax) * 100)}%
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: progressWidth as any },
              prediction && styles.progressFillDone,
            ]}
          />
        </View>
      </View>

      {/* ── Scrollable lower area ─────────────────────────────────────── */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Result card */}
        {prediction ? (
          <View style={styles.resultCard}>
            {/* Card header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.cardHeaderText}>Sign Detected</Text>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
                  <Ionicons name="copy-outline" size={18} color="#00BCD4" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, isSaved && styles.actionBtnActive]}
                  onPress={handleSave}
                >
                  <Ionicons
                    name={isSaved ? "bookmark" : "bookmark-outline"}
                    size={18}
                    color={isSaved ? "#FF9800" : "#00BCD4"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Primary result */}
            <Text style={styles.sinhalaText}>{prediction.sinhala_label}</Text>
            <Text style={styles.englishText}>{prediction.predicted_label}</Text>

            {/* Confidence bar */}
            <View style={styles.confRow}>
              <Text style={styles.confLabel}>Confidence</Text>
              <View style={styles.confTrack}>
                <View
                  style={[
                    styles.confFill,
                    {
                      width:
                        `${Math.round(prediction.confidence * 100)}%` as any,
                    },
                    prediction.confidence >= 0.75
                      ? styles.confHigh
                      : prediction.confidence >= 0.5
                        ? styles.confMed
                        : styles.confLow,
                  ]}
                />
              </View>
              <Text style={styles.confValue}>
                {Math.round(prediction.confidence * 100)}%
              </Text>
            </View>

            {/* Top-5 predictions */}
            {prediction.top5_predictions.length > 1 && (
              <View style={styles.top5}>
                <Text style={styles.top5Title}>Top Predictions</Text>
                {prediction.top5_predictions.map((item, idx) => (
                  <View key={idx} style={styles.top5Row}>
                    <Text style={styles.top5Rank}>#{idx + 1}</Text>
                    <Text style={styles.top5Sinhala}>{item.sinhala}</Text>
                    <Text style={styles.top5English} numberOfLines={1}>
                      {item.label}
                    </Text>
                    <Text style={styles.top5Pct}>
                      {Math.round(item.confidence * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="hand-left-outline" size={44} color="#B0BEC5" />
            <Text style={styles.placeholderText}>
              {captureStatus === "capturing"
                ? "Hold your sign steady in the frame…"
                : "Perform a sign in front of the\ncamera, then press Start"}
            </Text>
          </View>
        )}

        {/* ── Action buttons ─────────────────────────────────────────── */}
        <View style={styles.btnRow}>
          {captureStatus === "idle" ? (
            <TouchableOpacity
              style={[
                styles.startBtn,
                connectionStatus !== "connected" && styles.btnDisabled,
              ]}
              onPress={startCapture}
              disabled={connectionStatus !== "connected"}
            >
              <Ionicons name="play" size={22} color="white" />
              <Text style={styles.startBtnText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={handleReset}>
              <Ionicons name="stop" size={22} color="white" />
              <Text style={styles.startBtnText}>Stop</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.roundBtn, !prediction && styles.roundBtnDisabled]}
            onPress={handleSpeak}
            disabled={!prediction}
          >
            <Ionicons
              name="volume-high-outline"
              size={22}
              color={prediction ? "#00BCD4" : "#CCC"}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.roundBtn} onPress={handleReset}>
            <Ionicons name="refresh-outline" size={22} color="#607D8B" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Bottom nav ────────────────────────────────────────────────── */}
      <SignReaderBottomNav activeTab="home" />
    </View>
  );
}

const CYAN = "#00BCD4";
const DARK = "#2C3E50";
const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
} as const;

const styles = StyleSheet.create({
  // ── Layout ────────────────────────────────────────────────────────────────
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  // ── Permission ────────────────────────────────────────────────────────────
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "#F0F4F8",
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: DARK,
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 14,
    color: "#607D8B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionButton: {
    backgroundColor: CYAN,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: { color: "white", fontWeight: "700", fontSize: 16 },

  // ── Status bar ────────────────────────────────────────────────────────────
  statusBar: { paddingVertical: 7, paddingHorizontal: 14 },
  statusConnected: { backgroundColor: "#43A047" },
  statusDisconnected: { backgroundColor: "#E53935" },
  statusChecking: { backgroundColor: "#FB8C00" },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusText: { color: "white", fontSize: 12, fontWeight: "600", flex: 1 },
  retryBtn: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  retryText: { color: "white", fontSize: 12, fontWeight: "700" },

  // ── Camera ────────────────────────────────────────────────────────────────
  cameraWrapper: {
    margin: 14,
    marginBottom: 0,
    borderRadius: 16,
    overflow: "hidden",
    height: 260,
    ...CARD_SHADOW,
  },
  camera: { flex: 1 },
  guideOverlay: {
    flex: 1,
    margin: 20,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: "rgba(0,188,212,0.9)",
    borderWidth: 3,
  },
  tl: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
  },
  tr: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 4,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 4,
  },
  br: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 4,
  },
  guideHint: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  recordingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(229,57,53,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  recordingText: { color: "white", fontSize: 12, fontWeight: "700" },

  // ── Progress ─────────────────────────────────────────────────────────────
  progressContainer: {
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 2,
  },
  progressMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  progressLabel: { fontSize: 12, color: "#607D8B", fontWeight: "600" },
  progressPct: { fontSize: 12, color: CYAN, fontWeight: "700" },
  progressTrack: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: CYAN,
    borderRadius: 3,
  },
  progressFillDone: { backgroundColor: "#43A047" },

  // ── Scrollable area ───────────────────────────────────────────────────────
  scrollArea: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 8 },

  // ── Result card ───────────────────────────────────────────────────────────
  resultCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...CARD_SHADOW,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 7 },
  cardHeaderText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#43A047",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardActions: { flexDirection: "row", gap: 6 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnActive: { backgroundColor: "#FFF3E0" },
  sinhalaText: {
    fontSize: 34,
    fontWeight: "800",
    color: DARK,
    textAlign: "center",
    marginBottom: 4,
  },
  englishText: {
    fontSize: 14,
    color: "#90A4AE",
    textAlign: "center",
    marginBottom: 14,
    fontStyle: "italic",
  },

  // ── Confidence ────────────────────────────────────────────────────────────
  confRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  confLabel: { fontSize: 12, color: "#90A4AE", width: 72 },
  confTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#ECEFF1",
    borderRadius: 4,
    overflow: "hidden",
  },
  confFill: { height: "100%", borderRadius: 4 },
  confHigh: { backgroundColor: "#43A047" },
  confMed: { backgroundColor: "#FB8C00" },
  confLow: { backgroundColor: "#E53935" },
  confValue: {
    fontSize: 13,
    fontWeight: "700",
    color: DARK,
    width: 36,
    textAlign: "right",
  },

  // ── Top-5 ─────────────────────────────────────────────────────────────────
  top5: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  top5Title: {
    fontSize: 11,
    fontWeight: "700",
    color: "#90A4AE",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  top5Row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 8,
  },
  top5Rank: { fontSize: 12, color: "#B0BEC5", width: 22 },
  top5Sinhala: { fontSize: 15, fontWeight: "700", color: DARK, width: 70 },
  top5English: { flex: 1, fontSize: 12, color: "#607D8B" },
  top5Pct: {
    fontSize: 12,
    fontWeight: "700",
    color: CYAN,
    width: 36,
    textAlign: "right",
  },

  // ── Placeholder ───────────────────────────────────────────────────────────
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 12,
  },
  placeholderText: {
    color: "#90A4AE",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Action buttons ────────────────────────────────────────────────────────
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
    marginBottom: 4,
    alignItems: "center",
  },
  startBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: CYAN,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...CARD_SHADOW,
  },
  stopBtn: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#E53935",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...CARD_SHADOW,
  },
  btnDisabled: { backgroundColor: "#B0BEC5" },
  startBtnText: { color: "white", fontWeight: "700", fontSize: 16 },
  roundBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  roundBtnDisabled: { backgroundColor: "#F5F5F5" },
});
