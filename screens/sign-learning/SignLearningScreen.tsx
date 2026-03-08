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
// Adaptive Context — inline tracking for Thompson agent
// ══════════════════════════════════════════════════════════════

let _consecutiveFailures = 0;
let _recentResults: boolean[] = [];

function getConsecutiveFailures(): number {
  return _consecutiveFailures;
}
function getSuccessRateLast5(): number {
  if (_recentResults.length === 0) return 0.5;
  return _recentResults.filter(Boolean).length / _recentResults.length;
}
function updateStreak(isCorrect: boolean): void {
  if (isCorrect) {
    _consecutiveFailures = 0;
  } else {
    _consecutiveFailures++;
  }
  _recentResults.push(isCorrect);
  if (_recentResults.length > 5) _recentResults.shift();
}
function resetSignContext(): void {
  _consecutiveFailures = 0;
  _recentResults = [];
}

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

interface PredictionResult {
  predicted_label?: string;
  confidence: number;
  status?: string;
  session_id?: string;
  hand_detected?: boolean;
  feedback_level?: string;
  feedback?: string;
  tip?: string;
  correction_tip?: string;
  rl_action?: string;
  rl_context?: string;
  sign_feedback_status?: string;
  buffer_size?: number;
  sign_completed?: boolean;
  confidence_category?: string;
  level_complete?: boolean;
  level_completed_count?: number;
  level_total_signs?: number;
  [key: string]: unknown;
}

interface FeedbackTheme {
  icon: string;
  color: string;
  label: string;
  bg: string;
}

interface RouteParams {
  levelId?: string;
  levelTitle?: string;
  signs?: string[];
  levelIndex?: number;
  signType?: "static" | "dynamic";
}

interface SignLearningScreenProps {
  route?: {
    params?: RouteParams;
  };
  navigation?: {
    goBack?: () => void;
  };
}

// ══════════════════════════════════════════════════════════════
// Configuration (preserved from original)
// ══════════════════════════════════════════════════════════════

const CAPTURE_INTERVAL = 800;
const VIDEO_FRAME_INTERVAL = 300; // faster for video/motion detection

// Feedback-level themes — driven by Thompson agent's feedback_level
const feedbackTheme: Record<string, FeedbackTheme> = {
  excellent: {
    icon: "🎉",
    color: "#4CAF50",
    label: "Excellent",
    bg: "#E8F5E9",
  },
  good: { icon: "⭐", color: "#2196F3", label: "Good", bg: "#E3F2FD" },
  fair: { icon: "⚠️", color: "#FFC107", label: "Fair", bg: "#FFF8E1" },
  poor: {
    icon: "📖",
    color: "#FF5722",
    label: "Needs Practice",
    bg: "#FBE9E7",
  },
  incorrect: {
    icon: "❌",
    color: "#F44336",
    label: "Incorrect",
    bg: "#FFEBEE",
  },
};

// ══════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════

const SignLearningScreen: React.FC<SignLearningScreenProps> = ({
  route,
  navigation,
}) => {
  // ── Route params from HomeScreen ────────────────────────
  const levelId = route?.params?.levelId || "level_1_starter";
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
  const videoSessionRef = useRef<string>(`vid_${Date.now()}`);

  // Camera (preserved)
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [cameraFacing, setCameraFacing] = useState<"back" | "front">("back");

  // State (preserved)
  const [isCapturing, setIsCapturing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "connected" | "error" | "disconnected"
  >("checking");
  const [attemptCount, setAttemptCount] = useState(1);

  // Track previous prediction for reward signals (preserved)
  const prevPredictionRef = useRef<PredictionResult | null>(null);

  // Track whether the current sign has been completed this session
  const [signCompletedBanner, setSignCompletedBanner] = useState(false);
  const [levelCompleteBanner, setLevelCompleteBanner] = useState(false);

  // Stable feedback: only update displayed prediction after 2 consecutive
  // frames with the same predicted_label + status (prevents per-second flicker)
  const stableCountRef = useRef(0);
  const lastLabelRef = useRef<string | null>(null);
  const [stablePrediction, setStablePrediction] =
    useState<PredictionResult | null>(null);

  // Interval ref (preserved)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Guard: skip interval tick if previous request is still in-flight
  const isBusyRef = useRef(false);

  // Refs to break stale closures in setInterval callbacks.
  // Without these, the interval captures the initial render's values
  // and never sees sign changes or camera toggles.
  const currentSignRef = useRef(currentSign);
  currentSignRef.current = currentSign;
  const attemptCountRef = useRef(attemptCount);
  attemptCountRef.current = attemptCount;
  const cameraFacingRef = useRef(cameraFacing);
  cameraFacingRef.current = cameraFacing;

  // ── Server Health Check (preserved) ───────────────────────
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
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

  // ── Send RL Reward (preserved) ──────────────────────────────
  const sendReward = useCallback(
    async (
      sessionId: string,
      rewardType: string,
      newConf: number | null,
      newCorrect: boolean,
      sign?: string,
      level?: string,
    ) => {
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
            user_id: "default_user",
            sign: sign || currentSignRef.current,
            level: levelId,
          }),
        });
      } catch (_err) {
        // reward delivery is best-effort; failures don't affect UX
      }
    },
    [levelId],
  );

  // ── Capture & Predict (supports static + dynamic) ──────
  const captureAndPredict = async () => {
    if (!cameraRef.current || isBusyRef.current) return;
    isBusyRef.current = true;

    try {
      setIsProcessing(true);

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: isDynamic ? 0.5 : 0.7, // lower = fewer artifacts, closer to webcam training data
        skipProcessing: true, // skip Expo's extra processing pipeline
        width: 640, // constrain to 640px wide — matches webcam training resolution
        shutterSound: false, // disable shutter click sound
      });

      let url: string;
      let body: string;

      // Read from refs to avoid stale closure values in setInterval
      const signNow = currentSignRef.current;
      const attemptNow = attemptCountRef.current;
      const facingNow = cameraFacingRef.current;

      if (isDynamic) {
        // Dynamic mode: send frame to video endpoint
        url = `${API_BASE_URL}/predict-video-sign`;
        body = JSON.stringify({
          image: photo.base64,
          session_id: videoSessionRef.current,
          expected_label: signNow,
          level: levelId,
          user_id: "default_user",
          is_front_camera: facingNow === "front",
          consecutive_failures: getConsecutiveFailures(),
          success_rate_last5: getSuccessRateLast5(),
        });
      } else {
        // Static mode: send single image (original logic)
        url = `${API_BASE_URL}/predict-sign`;
        body = JSON.stringify({
          image: photo.base64,
          expected_label: signNow,
          attempt_count: attemptNow,
          level: levelId,
          user_id: "default_user",
          is_front_camera: facingNow === "front",
          consecutive_failures: getConsecutiveFailures(),
          success_rate_last5: getSuccessRateLast5(),
        });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        let errMsg = `Server error (${response.status})`;
        try {
          const errBody = await response.json();
          errMsg = errBody.message || errBody.error || errMsg;
        } catch (_) {
          /* response was not JSON */
        }
        throw new Error(errMsg);
      }

      const result: PredictionResult = await response.json();

      // ── Frontend-side sign match correction ──
      // The backend comparison may fail due to Unicode normalization or
      // whitespace differences in Sinhala characters. If the predicted
      // label matches the expected sign after trimming + NFC normalization,
      // always override both status AND sign_feedback_status to correct.
      const expectedNorm = signNow?.normalize("NFC").trim();
      const predictedNorm = result.predicted_label?.normalize("NFC").trim();
      if (expectedNorm && predictedNorm && expectedNorm === predictedNorm) {
        result.status = "correct";
        result.sign_feedback_status = "correct_sign";
      }

      // ── Send RL reward for PREVIOUS prediction ──
      // Reward types per integration guide:
      //   "correct" (+2.0) | "improved" (+1.0) | "retry" (+0.3)
      //   "give_up" (-1.5) | "no_change" (0.0) | "mastered" (+3.0)
      {
        const prev = prevPredictionRef.current;
        const sid = prev?.session_id;
        if (sid) {
          const prevConf = prev?.confidence ?? 0;
          const newConf = result.confidence;
          const nowCorrect = result.status === "correct";

          let rewardType: string;
          if (nowCorrect && result.sign_completed) rewardType = "mastered";
          else if (nowCorrect) rewardType = "correct";
          else if (newConf > prevConf) rewardType = "improved";
          else rewardType = "retry";

          sendReward(sid, rewardType, newConf, nowCorrect, signNow, levelId);
        }
      }

      prevPredictionRef.current = result;
      setAttemptCount((c) => c + 1);
      setPrediction(result);

      // Update adaptive context tracking
      if (!isDynamic || result.predicted_label) {
        updateStreak(result.status === "correct");
      }

      // Stable-feedback logic: require 2 consecutive matching frames to update,
      // EXCEPT for 'correct' status which is accepted immediately — this prevents
      // the correct sign from showing the wrong ❌ icon when the model momentarily
      // oscillates between correct and incorrect predictions on the same letter.
      const frameKey = `${result.predicted_label}|${result.status}`;
      if (frameKey === lastLabelRef.current) {
        stableCountRef.current += 1;
      } else {
        stableCountRef.current = 1;
        lastLabelRef.current = frameKey;
      }
      if (stableCountRef.current >= 2 || result.status === "correct") {
        setStablePrediction(result);
      }

      // Show sign_completed and level_complete banners from backend
      if (result.sign_completed) {
        setSignCompletedBanner(true);
      }
      if (result.level_complete) {
        setLevelCompleteBanner(true);
      }

      setError(null);
    } catch (err: any) {
      const isNetworkError =
        err.message === "Network request failed" ||
        err.message === "Failed to fetch" ||
        err.message?.includes("ECONNREFUSED") ||
        err.message?.includes("timeout");
      setError(
        isNetworkError
          ? "Cannot reach server. Check your Wi-Fi and that the backend is running."
          : `Error: ${err.message}`,
      );
    } finally {
      setIsProcessing(false);
      isBusyRef.current = false;
    }
  };

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
    if (prev?.session_id && prev.status !== "correct") {
      sendReward(prev.session_id, "give_up", null, false);
    }
    prevPredictionRef.current = null;
    stableCountRef.current = 0;
    lastLabelRef.current = null;
    setAttemptCount(1);
    setIsCapturing(false);
    resetSignContext();

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

  // ── Navigate between signs ────────────────────────────────
  const goNextSign = () => {
    if (currentSignIdx < signs.length - 1) {
      stopCapturing();
      resetSignContext();
      setPrediction(null);
      setStablePrediction(null);
      setSignCompletedBanner(false);
      setLevelCompleteBanner(false);
      setCurrentSignIdx((i) => i + 1);
    }
  };
  const goPrevSign = () => {
    if (currentSignIdx > 0) {
      stopCapturing();
      resetSignContext();
      setPrediction(null);
      setStablePrediction(null);
      setSignCompletedBanner(false);
      setLevelCompleteBanner(false);
      setCurrentSignIdx((i) => i - 1);
    }
  };

  // ── Derived UI State ──────────────────────────────────────
  // Use stablePrediction for all displayed feedback (prevents per-frame flicker).
  // Use live prediction only for hand-detected badge and confidence overlay.
  const handDetected = prediction?.hand_detected;
  const confidencePct = prediction
    ? (prediction.confidence * 100).toFixed(1)
    : null;
  const isCorrect = stablePrediction?.status === "correct";
  const feedbackLevel = stablePrediction?.feedback_level;
  const theme = feedbackTheme[feedbackLevel || ""] || feedbackTheme.fair;

  // Hand position status message
  const getStatusMessage = (): string => {
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

    const sfs = stablePrediction?.sign_feedback_status;
    if (sfs === "correct_sign") return "✅ Correct Sign";
    if (sfs === "incorrect_sign") return "❌ Incorrect Sign";

    if (isCorrect) return "✅ Correct Sign";
    return "❌ Incorrect Sign";
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

            {/* Hand positioning guide box — helps user fill the frame like training data */}
            <View style={styles.handGuideBox} pointerEvents="none">
              <View style={styles.handGuideCornerTL} />
              <View style={styles.handGuideCornerTR} />
              <View style={styles.handGuideCornerBL} />
              <View style={styles.handGuideCornerBR} />
              <Text style={styles.handGuideText}>Place hand here</Text>
            </View>

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
        {stablePrediction && handDetected && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>Detected Sign</Text>
              <Text
                style={[
                  styles.resultLetter,
                  {
                    color:
                      stablePrediction.sign_feedback_status === "correct_sign"
                        ? "#0D9488"
                        : "#DC2626",
                  },
                ]}
              >
                {stablePrediction.predicted_label}
              </Text>
              <Text style={[styles.resultConf, { color: theme.color }]}>
                {(stablePrediction.confidence * 100).toFixed(1)}% confidence
              </Text>
            </View>

            {/* Agent Feedback */}
            {stablePrediction.feedback && (
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
                <Text style={styles.feedbackText}>
                  {stablePrediction.feedback}
                </Text>
                {stablePrediction.tip ? (
                  <View style={styles.tipRow}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipText}>{stablePrediction.tip}</Text>
                  </View>
                ) : null}
                {stablePrediction.correction_tip ? (
                  <Text style={styles.correctionText}>
                    {stablePrediction.correction_tip}
                  </Text>
                ) : null}
              </View>
            )}
          </View>
        )}

        {/* ── Sign Completed Banner ────────────────────── */}
        {signCompletedBanner && (
          <View style={styles.signCompletedBanner}>
            <Text style={styles.signCompletedText}>
              🎉 Sign "{currentSign}" Completed!
              {stablePrediction?.confidence_category && (
                <Text> ({stablePrediction.confidence_category})</Text>
              )}
            </Text>
            {stablePrediction?.level_completed_count != null &&
              stablePrediction?.level_total_signs != null && (
                <Text style={styles.signCompletedSub}>
                  {stablePrediction.level_completed_count}/
                  {stablePrediction.level_total_signs} signs in this level
                </Text>
              )}
          </View>
        )}

        {/* ── Level Complete Celebration ──────────────────── */}
        {levelCompleteBanner && (
          <View style={styles.levelCompleteBanner}>
            <Text style={styles.levelCompleteText}>
              🏆 Level Complete! All signs mastered!
            </Text>
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

  // Hand guide overlay — shows user where to place their hand
  handGuideBox: {
    position: "absolute",
    top: "8%",
    left: "15%",
    right: "15%",
    bottom: "8%",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  handGuideCornerTL: {
    position: "absolute",
    top: -2,
    left: -2,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#0D9488",
    borderRadius: 2,
  },
  handGuideCornerTR: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: "#0D9488",
    borderRadius: 2,
  },
  handGuideCornerBL: {
    position: "absolute",
    bottom: -2,
    left: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#0D9488",
    borderRadius: 2,
  },
  handGuideCornerBR: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: "#0D9488",
    borderRadius: 2,
  },
  handGuideText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.5,
  },

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
  resultLetter: { fontSize: 48, fontWeight: "bold" },
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
  correctionText: {
    fontSize: 13,
    color: "#D32F2F",
    marginTop: 6,
    fontStyle: "italic",
  },

  // Correctness
  correctnessRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 2,
  },
  correctnessLabel: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },
  correctnessValue: {
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 4,
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

  // Sign completed / level complete banners
  signCompletedBanner: {
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#0D9488",
    alignItems: "center",
  },
  signCompletedText: {
    color: "#0D9488",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  signCompletedSub: {
    color: "#0D9488",
    fontSize: 13,
    marginTop: 4,
  },
  levelCompleteBanner: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#D97706",
    alignItems: "center",
  },
  levelCompleteText: {
    color: "#D97706",
    fontSize: 17,
    fontWeight: "bold",
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
