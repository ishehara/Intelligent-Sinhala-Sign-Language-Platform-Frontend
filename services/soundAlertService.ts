/**
 * Sound Alert Service
 * ===================
 * Handles continuous audio recording + backend ML inference.
 *
 * HOW IT WORKS:
 *  1. Records 2.5 seconds of audio via the device microphone
 *  2. Sends base64 audio to Flask backend (sound_alert_api.py)
 *  3. Backend runs MFCC extraction + CNN inference
 *  4. Returns predicted class + confidence
 *  5. If confidence >= threshold → triggers alert callback
 *  6. Loops continuously while monitoring is active
 *
 * SETUP:
 *  - Start backend: python src/sound_alert_api.py  (in your backend repo)
 *  - Update API_BASE_URL below with your computer's local IP
 *  - Find IP: run 'ipconfig' on Windows → look for IPv4 Address
 */

import axios from "axios";
import { Audio } from "expo-av";
import * as BackgroundFetch from "expo-background-fetch";
import * as FileSystem from "expo-file-system/legacy";
import * as TaskManager from "expo-task-manager";

// ── IMPORTANT: Set this to your computer's local IP ──────────────────────────
// Example: 'http://192.168.1.105:5003'
// Run 'ipconfig' on Windows to find your IPv4 address
// ⚠️ VIVA NETWORK: 192.168.104.107
export const API_BASE_URL = "http://192.168.104.107:5003";
// ─────────────────────────────────────────────────────────────────────────────

export const BACKGROUND_TASK_NAME = "SOUND_ALERT_BACKGROUND_TASK";
export const CONFIDENCE_THRESHOLD = 0.95; // Minimum confidence to trigger alert (95% - very strict + requires consecutive detection)

// Maps backend class names to app-friendly format
const CLASS_MAP: Record<
  string,
  { vehicleType: string; emoji: string; alertType: string }
> = {
  "car horns": { vehicleType: "Car", emoji: "🚗", alertType: "car-horn" },
  "bus horns": { vehicleType: "Bus", emoji: "🚌", alertType: "bus-horn" },
  "train horns": { vehicleType: "Train", emoji: "🚂", alertType: "train-horn" },
  "truck horns": { vehicleType: "Truck", emoji: "🚛", alertType: "truck-horn" },
  "motorcycle horns": {
    vehicleType: "Motorcycle",
    emoji: "🏍️",
    alertType: "motorcycle-horn",
  },
  horn: { vehicleType: "Vehicle", emoji: "📯", alertType: "car-horn" },
  siren: {
    vehicleType: "Emergency",
    emoji: "🚨",
    alertType: "ambulance-siren",
  },
  "ambulance-siren": {
    vehicleType: "Ambulance",
    emoji: "🚑",
    alertType: "ambulance-siren",
  },
  "fire-alarm": {
    vehicleType: "Firetruck",
    emoji: "🚒",
    alertType: "fire-alarm",
  },
  ambulance: {
    vehicleType: "Ambulance",
    emoji: "🚑",
    alertType: "ambulance-siren",
  },
  firetruck: { vehicleType: "Firetruck", emoji: "🚒", alertType: "fire-alarm" },
  police: { vehicleType: "Police", emoji: "🚓", alertType: "ambulance-siren" },
};

export type SoundPrediction = {
  predicted_class: string;
  confidence: number;
  all_probabilities: Record<string, number>;
  vehicleType: string;
  emoji: string;
  alertType: string;
};

class SoundAlertService {
  private recording: Audio.Recording | null = null;
  private isDetecting = false;
  private onDetectionCallback: ((prediction: SoundPrediction) => void) | null =
    null;
  private lastDetection: SoundPrediction | null = null; // Track last detection for consecutive confirmation

  /** Request microphone permission */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync();
    return status === "granted";
  }

  /** Check if backend server is reachable */
  async checkBackendHealth(): Promise<{
    reachable: boolean;
    modelLoaded: boolean;
  }> {
    try {
      const res = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      return {
        reachable: true,
        modelLoaded: res.data.model_loaded === true,
      };
    } catch {
      return { reachable: false, modelLoaded: false };
    }
  }

  /**
   * Start continuous sound monitoring.
   * Records → sends to backend → triggers callback on detection.
   */
  async startContinuousDetection(
    onDetection: (prediction: SoundPrediction) => void,
    threshold = CONFIDENCE_THRESHOLD,
  ): Promise<void> {
    if (this.isDetecting) return; // already running, don't start a second loop

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error("Microphone permission denied");
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    this.isDetecting = true;
    this.onDetectionCallback = onDetection;
    this._runLoop(onDetection, threshold);
  }

  /** Stop continuous monitoring */
  async stopDetection(): Promise<void> {
    this.isDetecting = false;
    this.onDetectionCallback = null;
    this.lastDetection = null; // Clear last detection
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch {
        // ignore
      }
      this.recording = null;
    }
  }

  /** One recording + inference cycle */
  async detectOnce(
    threshold = CONFIDENCE_THRESHOLD,
  ): Promise<SoundPrediction | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) throw new Error("Microphone permission denied");

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    return this._recordAndPredict(threshold);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private async _runLoop(
    onDetection: (prediction: SoundPrediction) => void,
    threshold: number,
  ): Promise<void> {
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;

    while (this.isDetecting) {
      try {
        const result = await this._recordAndPredict(threshold);
        if (result) {
          onDetection(result);
        }
        consecutiveErrors = 0; // Reset error counter on success
      } catch (error: any) {
        consecutiveErrors++;
        if (error?.code === "ECONNABORTED" || error?.code === "ENOTFOUND") {
          console.warn(
            `⚠️  Network error (attempt ${consecutiveErrors}/${maxConsecutiveErrors}):`,
            error.message,
          );
          if (consecutiveErrors >= maxConsecutiveErrors) {
            console.error(
              "❌ Too many network errors. Stopping detection. Check backend connection.",
            );
            this.isDetecting = false;
            break;
          }
        } else {
          console.error("❌ Error in detection loop:", error);
        }
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delayMs = Math.min(
          1000 * Math.pow(2, consecutiveErrors - 1),
          10000,
        );
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  private async _recordAndPredict(
    threshold: number,
  ): Promise<SoundPrediction | null> {
    console.log("🎤 Starting recording...");
    // Record as M4A/AAC (what Android actually supports natively)
    // ffmpeg on the backend will decode it via librosa/audioread
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    this.recording = recording;

    await new Promise((r) => setTimeout(r, 2500));

    // Guard: if stopDetection() already unloaded this recording, bail out
    if (!this.recording) return null;

    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // Already unloaded by stopDetection() — nothing to do
      return null;
    }
    this.recording = null;
    console.log("✅ Recording complete");

    const uri = recording.getURI();
    if (!uri) {
      console.log("❌ No recording URI");
      return null;
    }

    // Check file size to confirm audio was captured
    const fileInfo = await FileSystem.getInfoAsync(uri);
    console.log(`📁 File URI: ${uri}`);
    console.log(
      `📏 File size: ${fileInfo.exists ? (fileInfo as any).size : "unknown"} bytes`,
    );

    // 2. Create FormData with audio file
    const formData = new FormData();
    const filename = uri.split("/").pop() || "recording.wav";

    // @ts-ignore - FormData accepts file objects
    formData.append("audio", {
      uri: uri,
      type: "audio/mp4",
      name: "recording.m4a",
    });

    console.log(`📦 Sending audio file: ${filename}`);

    try {
      // 3. Send to backend for inference
      console.log(`🌐 Sending to ${API_BASE_URL}/predict...`);
      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        timeout: 15000,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Clean up temp file
      await FileSystem.deleteAsync(uri, { idempotent: true });

      const data = response.data;
      console.log("📥 Backend response:", data);

      // Check if detected with strict validation
      const confidencePercent = data.confidence || 0;
      const thresholdPercent = threshold * 100;
      const isDetected = data.detected === true; // Explicit true check

      console.log(
        `🔍 Detection check: detected=${isDetected}, confidence=${confidencePercent}%, threshold=${thresholdPercent}%`,
      );

      if (!isDetected || confidencePercent < thresholdPercent) {
        console.log(
          `⏭️ Skipping: ${!isDetected ? "not detected" : `confidence ${confidencePercent}% < ${thresholdPercent}%`}`,
        );
        return null;
      }

      // Additional validation: ensure confidence is reasonable
      if (confidencePercent > 100) {
        console.warn(
          `⚠️  Invalid confidence ${confidencePercent}% > 100%. Normalizing...`,
        );
        data.confidence = Math.min(confidencePercent, 100);
      }

      // 4. Map backend response to app format
      const predicted_class = data.type?.replace("-horn", " horns") || "horn";
      const mapped = CLASS_MAP[predicted_class] ?? {
        vehicleType: data.title?.replace(" Horn Detected", "") || "Vehicle",
        emoji: data.icon || "🔊",
        alertType: data.type || "car-horn",
      };

      const result: SoundPrediction = {
        predicted_class: predicted_class,
        confidence: data.confidence / 100, // Backend sends 0-100, we use 0-1
        all_probabilities: {},
        ...mapped,
      };

      // ⭐ CONSECUTIVE DETECTION FILTER: require 2 detections of same type to confirm
      // This prevents random noise spikes from triggering false alerts
      if (
        this.lastDetection &&
        this.lastDetection.predicted_class === result.predicted_class &&
        this.lastDetection.confidence > thresholdPercent / 100
      ) {
        console.log(
          `✅ CONFIRMED: ${result.vehicleType} detected (consecutive match, ${confidencePercent.toFixed(0)}%)`,
        );
        this.lastDetection = null; // Reset for next confirmation cycle
        return result; // Return the alert
      }

      // Store this detection and wait for confirmation
      console.log(
        `⏳ Detection pending confirmation: ${result.vehicleType} (${confidencePercent.toFixed(0)}%). Next detection must match.`,
      );
      this.lastDetection = result;
      return null; // Wait for next detection to confirm
    } catch (error: any) {
      // Log all available error info
      console.error("🔴 Axios error status:", error?.response?.status);
      console.error(
        "🔴 Axios error data:",
        JSON.stringify(error?.response?.data),
      );
      console.error(
        "🔴 Axios error headers:",
        JSON.stringify(error?.response?.headers),
      );
      console.error("🔴 Axios request URL:", error?.config?.url);
      // Clean up temp file on error
      await FileSystem.deleteAsync(uri, { idempotent: true });
      throw error;
    }
  }
}

// Singleton instance
export const soundAlertService = new SoundAlertService();

// ── Background Task Definition ─────────────────────────────────────────────
// This runs once every ~15 minutes when the app is in the background.
// For real-time background detection, the app needs to be open (foreground service).

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  try {
    const result = await soundAlertService.detectOnce(CONFIDENCE_THRESHOLD);
    if (result) {
      // Background detections are stored; UI updates when app is foregrounded
      console.log(
        `[Background] Detected: ${result.vehicleType} (${(result.confidence * 100).toFixed(0)}%)`,
      );
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/** Register the background fetch task (call this once at app startup) */
export async function registerBackgroundTask(): Promise<void> {
  const status = await BackgroundFetch.getStatusAsync();
  if (
    status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
    status === BackgroundFetch.BackgroundFetchStatus.Denied
  ) {
    console.warn("Background fetch is not available on this device.");
    return;
  }

  const isRegistered =
    await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60 * 15, // 15 minutes (OS may delay longer)
      stopOnTerminate: false, // Continue after app is closed (Android)
      startOnBoot: true, // Start on device reboot (Android)
    });
    console.log("[SoundAlert] Background task registered");
  }
}
