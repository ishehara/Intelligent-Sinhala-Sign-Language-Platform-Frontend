/**
 * SignLearningScreen - Teal-themed Sign Learning with Camera
 * ===========================================================
 * Supports BOTH static (image) and dynamic (video/motion) sign detection.
 * - Static mode: captures single image → /predict-sign
 * - Dynamic mode: streams frames → /predict-video-sign (LSTM model)
 *
 * ALL original capture/predict/reward logic is preserved intact.
 */

import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../config/Sign-Learning/api.config";

// ══════════════════════════════════════════════════════════════
// Configuration (preserved from original)
// ══════════════════════════════════════════════════════════════

const CAPTURE_INTERVAL = 800;
const VIDEO_FRAME_INTERVAL = 300; // faster for video/motion detection

// Feedback-level themes (updated to teal palette)
const feedbackTheme = {
  excellent: {
    icon: "✅",
    color: "#0D9488",
    label: "Excellent",
    bg: "#F0FDFA",
  },
  good: { icon: "👍", color: "#0D9488", label: "Good", bg: "#F0FDFA" },
  fair: { icon: "⚠️", color: "#D97706", label: "Fair", bg: "#FFFBEB" },
  poor: { icon: "🔄", color: "#EA580C", label: "Poor", bg: "#FFF7ED" },
  incorrect: { icon: "✗", color: "#DC2626", label: "Incorrect", bg: "#FEF2F2" },
};

// ══════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════

const SignLearningScreen = ({ route, navigation }) => {
  // ── Route params from HomeScreen ────────────────────────
  const levelTitle = route?.params?.levelTitle || "Alphabet Basics";
  const signs = route?.params?.signs || ["අ", "ආ", "ඇ", "ඉ", "උ"];
  const levelIndex = route?.params?.levelIndex || 1;
  const signType = route?.params?.signType || "static"; // 'static' or 'dynamic'

  // Current sign tracking
  const [currentSignIdx, setCurrentSignIdx] = useState(0);
  const currentSign = signs[currentSignIdx] || signs[0];

  // Detection mode derived from route param
  const isDynamic = signType === "dynamic";

  // Video session ID (unique per capture session)
  const videoSessionRef = useRef(`vid_${Date.now()}`);

  // Camera (preserved)
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [cameraFacing, setCameraFacing] = useState("back");

  // State (preserved)
  const [isCapturing, setIsCapturing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking");
  const [attemptCount, setAttemptCount] = useState(1);

  // Track previous prediction for reward signals (preserved)
  const prevPredictionRef = useRef(null);

  // Interval ref (preserved)
  const intervalRef = useRef(null);

  // ── Server Health Check (preserved) ───────────────────────
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        timeout: 5000,
      });
      setServerStatus(response.ok ? "connected" : "error");
    } catch {
      setServerStatus("disconnected");
    }
  };

  // ── Toggle Camera (preserved) ──────────────────────────────
  const toggleCamera = useCallback(() => {
    setCameraFacing((prev) => (prev === "back" ? "front" : "back"));
  }, []);

  // ── Auto-Capture Control (preserved) ──────────────────────
  const startCapturing = useCallback(() => {
    if (intervalRef.current) return;

    setIsCapturing(true);
    setError(null);

    // Generate new video session ID each time we start
    if (isDynamic) {
      videoSessionRef.current = `vid_${Date.now()}`;
    }

    captureAndPredict();
    const interval = isDynamic ? VIDEO_FRAME_INTERVAL : CAPTURE_INTERVAL;
    intervalRef.current = setInterval(captureAndPredict, interval);
  }, [isDynamic]);

  const stopCapturing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const prev = prevPredictionRef.current;
    if (prev && prev.session_id && prev.status !== "correct") {
      sendReward(prev.session_id, "give_up", null, false);
    }
    prevPredictionRef.current = null;
    setAttemptCount(1);
    setIsCapturing(false);

    // Clear video buffer on the server when stopping
    if (isDynamic) {
      fetch(`${API_BASE_URL}/clear-video-buffer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: videoSessionRef.current }),
      }).catch(() => {});
    }
  }, [sendReward, isDynamic]);

  // Cleanup on unmount (preserved)
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // ── Send RL Reward (preserved) ──────────────────────────────
  const sendReward = useCallback(
    async (sessionId, rewardType, newConf, newCorrect) => {
      if (!sessionId) return;
      try {
        await fetch(`${API_BASE_URL}/rl-reward`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            reward_type: rewardType,
            new_confidence: newConf,
            new_is_correct: newCorrect,
          }),
        });
      } catch (err) {
        console.log("RL reward send failed:", err);
      }
    },
    [],
  );

  // ── Capture & Predict (supports static + dynamic) ──────
  const captureAndPredict = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: isDynamic ? 0.6 : 0.9,
        skipProcessing: false,
      });

      let url, body;

      if (isDynamic) {
        // Dynamic mode: send frame to video endpoint
        url = `${API_BASE_URL}/predict-video-sign`;
        body = JSON.stringify({
          image: photo.base64,
          session_id: videoSessionRef.current,
          expected_label: currentSign,
          is_front_camera: cameraFacing === "front",
        });
      } else {
        // Static mode: send single image (original logic)
        url = `${API_BASE_URL}/predict-sign`;
        body = JSON.stringify({
          image: photo.base64,
          attempt_count: attemptCount,
          is_front_camera: cameraFacing === "front",
        });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const result = await response.json();

      // ── Send RL reward for PREVIOUS prediction (static only) ──
      if (!isDynamic) {
        const prev = prevPredictionRef.current;
        if (prev && prev.session_id) {
          const prevConf = prev.confidence;
          const newConf = result.confidence;
          const improved = newConf > prevConf;
          const nowCorrect = result.status === "correct";

          let rewardType = "no_change";
          if (nowCorrect) rewardType = "correct";
          else if (improved) rewardType = "improved";
          else rewardType = "retry";

          sendReward(prev.session_id, rewardType, newConf, nowCorrect);
        }
      }

      prevPredictionRef.current = result;
      setAttemptCount((c) => c + 1);
      setPrediction(result);
      setError(null);
    } catch (err) {
      setError("Connection failed");
      console.error("Predict error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Navigate between signs ────────────────────────────────
  const goNextSign = () => {
    if (currentSignIdx < signs.length - 1) {
      stopCapturing();
      setPrediction(null);
      setCurrentSignIdx((i) => i + 1);
    }
  };
  const goPrevSign = () => {
    if (currentSignIdx > 0) {
      stopCapturing();
      setPrediction(null);
      setCurrentSignIdx((i) => i - 1);
    }
  };

  // ── Derived UI State ──────────────────────────────────────
  const handDetected = prediction?.hand_detected;
  const confidencePct = prediction
    ? (prediction.confidence * 100).toFixed(1)
    : null;
  const isCorrect = prediction?.status === "correct";
  const feedbackLevel = prediction?.feedback_level;
  const theme = feedbackTheme[feedbackLevel] || feedbackTheme.fair;

  // Hand position status message
  const getStatusMessage = () => {
    if (!isCapturing)
      return isDynamic
        ? "Press Start to begin motion capture"
        : "Press Start to begin";
    if (!prediction) return isDynamic ? "Recording motion..." : "Scanning...";
    if (isDynamic && prediction.status === "buffering")
      return `📹 Collecting frames (${prediction.buffer_size || 0}/30)...`;
    if (isDynamic && prediction.status === "low_confidence")
      return "🔄 Motion unclear, keep signing...";
    if (!handDetected) return "✋ Show your hand clearly";
    if (isCorrect) return "✅ Perfect match!";
    if (feedbackLevel === "good" || feedbackLevel === "excellent")
      return "✅ Position looks good!";
    if (feedbackLevel === "fair") return "⚠️ Almost there, adjust slightly";
    return "🔄 Try adjusting your hand position";
  };

  // ── Permission Loading ────────────────────────────────────
  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0D9488" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Permission Denied ─────────────────────────────────────
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.permTitle}>📷 Camera Permission Required</Text>
          <Text style={styles.permSubtitle}>
            This app needs camera access to recognize sign language
          </Text>
          <TouchableOpacity
            style={styles.permButton}
            onPress={requestPermission}
          >
            <Text style={styles.permButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ══════════════════════════════════════════════════════════
  // Main UI - Teal Theme
  // ══════════════════════════════════════════════════════════

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation?.goBack?.()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>✍️ Sign Learning</Text>
            <Text style={styles.headerSub}>
              {levelTitle} · {isDynamic ? "📹 Dynamic" : "📷 Static"} · Letter{" "}
              {currentSignIdx + 1} of {signs.length}
            </Text>
          </View>
          <TouchableOpacity onPress={checkServerHealth}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    serverStatus === "connected" ? "#ECFDF5" : "#FEF2F2",
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      serverStatus === "connected" ? "#0D9488" : "#DC2626",
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Sign Display Card ──────────────────────────── */}
        <View style={styles.signCard}>
          <View style={styles.signCardHeader}>
            <Text style={styles.signCardLabel}>Current Sign</Text>
            <TouchableOpacity style={styles.flipCamBtn} onPress={toggleCamera}>
              <Text style={styles.flipCamText}>
                🔄 {cameraFacing === "back" ? "Front" : "Back"}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.signLetter}>{currentSign}</Text>
          <Text style={styles.signHint}>
            {isDynamic
              ? "Perform this sign motion to the camera"
              : "Show this sign to the camera"}
          </Text>

          {/* Video buffer progress (dynamic only) */}
          {isDynamic && isCapturing && prediction?.buffer_size != null && (
            <View style={styles.bufferBarContainer}>
              <View style={styles.bufferBarBg}>
                <View
                  style={[
                    styles.bufferBarFill,
                    {
                      width: `${Math.min(100, (prediction.buffer_size / 30) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.bufferBarText}>
                Frames: {prediction.buffer_size}/30
              </Text>
            </View>
          )}

          {/* Sign navigation */}
          <View style={styles.signNavRow}>
            <TouchableOpacity
              style={[
                styles.signNavBtn,
                currentSignIdx === 0 && styles.signNavBtnDisabled,
              ]}
              onPress={goPrevSign}
              disabled={currentSignIdx === 0}
            >
              <Text
                style={[
                  styles.signNavText,
                  currentSignIdx === 0 && { color: "#6B8A85" },
                ]}
              >
                ← Prev
              </Text>
            </TouchableOpacity>
            <Text style={styles.signCounter}>
              {currentSignIdx + 1} / {signs.length}
            </Text>
            <TouchableOpacity
              style={[
                styles.signNavBtn,
                currentSignIdx >= signs.length - 1 && styles.signNavBtnDisabled,
              ]}
              onPress={goNextSign}
              disabled={currentSignIdx >= signs.length - 1}
            >
              <Text
                style={[
                  styles.signNavText,
                  currentSignIdx >= signs.length - 1 && { color: "#6B8A85" },
                ]}
              >
                Next →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Camera Preview ─────────────────────────────── */}
        <View style={styles.cameraSection}>
          <Text style={styles.cameraSectionLabel}>
            {isDynamic ? "📹 Video Capture" : "📷 Camera Preview"}
          </Text>
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={cameraFacing}
              mirror={false}
            />

            {/* Processing indicator */}
            {isProcessing && (
              <View style={styles.processingBadge}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            )}

            {/* Hand detection badge */}
            {isCapturing && (
              <View
                style={[
                  styles.handBadge,
                  handDetected
                    ? styles.handBadgeDetected
                    : styles.handBadgeNone,
                ]}
              >
                <Text style={styles.handBadgeText}>
                  {handDetected ? "✋ Hand detected" : "🔍 No hand detected"}
                </Text>
              </View>
            )}

            {/* Confidence overlay */}
            {confidencePct && handDetected && (
              <View style={styles.confBadge}>
                <Text style={styles.confBadgeText}>{confidencePct}%</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Status Message ─────────────────────────────── */}
        <View
          style={[
            styles.statusCard,
            isCorrect && styles.statusCardCorrect,
            handDetected && !isCorrect && styles.statusCardActive,
          ]}
        >
          <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
        </View>

        {/* ── Prediction Result ──────────────────────────── */}
        {prediction && handDetected && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>Predicted</Text>
              <Text style={styles.resultLetter}>
                {prediction.predicted_label}
              </Text>
              <Text style={[styles.resultConf, { color: theme.color }]}>
                {confidencePct}% confidence
              </Text>
            </View>

            {/* Feedback badge (preserved RL feedback) */}
            {prediction.feedback && (
              <View
                style={[
                  styles.feedbackBox,
                  { backgroundColor: theme.bg, borderLeftColor: theme.color },
                ]}
              >
                <View style={styles.feedbackRow}>
                  <Text style={styles.feedbackIcon}>{theme.icon}</Text>
                  <Text style={[styles.feedbackLevel, { color: theme.color }]}>
                    {theme.label}
                  </Text>
                </View>
                <Text style={styles.feedbackText}>{prediction.feedback}</Text>
                {prediction.tip ? (
                  <View style={styles.tipRow}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipText}>{prediction.tip}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        )}

        {/* Error display */}
        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* ── Control Buttons ────────────────────────────── */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isCapturing ? styles.stopBtn : styles.startBtn,
              serverStatus !== "connected" && styles.disabledBtn,
            ]}
            onPress={isCapturing ? stopCapturing : startCapturing}
            disabled={serverStatus !== "connected"}
            activeOpacity={0.7}
          >
            <Text style={styles.controlButtonText}>
              {isCapturing
                ? "⏹ STOP"
                : isDynamic
                  ? "📹 START MOTION"
                  : "▶ START"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════
// Styles - Teal Theme
// ══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  // Permission
  permTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  permSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  permButton: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  backIcon: {
    fontSize: 22,
    color: "#374151",
    fontWeight: "bold",
    marginTop: -2,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  headerSub: { fontSize: 13, color: "#0D9488", marginTop: 2 },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  // Sign Display Card
  signCard: {
    backgroundColor: "#0D9488",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  signCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 12,
  },
  signCardLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  flipCamBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  flipCamText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  signLetter: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginVertical: 8,
  },
  signHint: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
  },
  bufferBarContainer: {
    width: "100%",
    marginBottom: 12,
    alignItems: "center",
  },
  bufferBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  bufferBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  bufferBarText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  signNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  signNavBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  signNavBtnDisabled: { backgroundColor: "rgba(255,255,255,0.08)" },
  signNavText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  signCounter: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
  },

  // Camera Section
  cameraSection: { marginBottom: 12 },
  cameraSectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  cameraContainer: {
    height: 260,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1F2937",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  camera: { flex: 1 },
  processingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 14,
    padding: 6,
  },
  handBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  handBadgeDetected: { backgroundColor: "rgba(13,148,136,0.85)" },
  handBadgeNone: { backgroundColor: "rgba(220,38,38,0.75)" },
  handBadgeText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
  confBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(13,148,136,0.85)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confBadgeText: { color: "#FFFFFF", fontSize: 13, fontWeight: "bold" },

  // Status
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statusCardCorrect: { borderColor: "#0D9488", backgroundColor: "#F0FDFA" },
  statusCardActive: { borderColor: "#0D9488" },
  statusMessage: { fontSize: 15, fontWeight: "600", color: "#374151" },

  // Result
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: { alignItems: "center", marginBottom: 12 },
  resultLabel: { fontSize: 13, color: "#6B7280", marginBottom: 4 },
  resultLetter: { fontSize: 48, fontWeight: "bold", color: "#0D9488" },
  resultConf: { fontSize: 14, fontWeight: "600", marginTop: 4 },

  // Feedback (preserved logic, updated styles)
  feedbackBox: {
    width: "100%",
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 12,
  },
  feedbackRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  feedbackIcon: { fontSize: 18, marginRight: 6 },
  feedbackLevel: { fontSize: 15, fontWeight: "bold" },
  feedbackText: { fontSize: 13, color: "#374151", lineHeight: 20 },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  tipIcon: { fontSize: 14, marginRight: 6, marginTop: 1 },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    lineHeight: 19,
  },

  // Error
  errorCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },

  // Control Buttons
  btnRow: { marginBottom: 10 },
  controlButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  startBtn: { backgroundColor: "#0D9488" },
  stopBtn: { backgroundColor: "#DC2626" },
  disabledBtn: { backgroundColor: "#9CA3AF" },
  controlButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default SignLearningScreen;
