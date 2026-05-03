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
// ⚠️ VIVA NETWORK: 192.168.104.88
export const API_BASE_URL = "http://192.168.104.88:5003";
// ─────────────────────────────────────────────────────────────────────────────

// ── Hot-reload safety ────────────────────────────────────────────────────────
// `global` persists across Expo Fast Refresh module re-evaluations.
// Incrementing this token on every module load tells any orphaned loop from a
// previous module instance to exit, releasing the native audio session.
declare const global: Record<string, any>;
global.__soundAlertToken = (global.__soundAlertToken ?? 0) + 1;
const _moduleToken: number = global.__soundAlertToken;
// ─────────────────────────────────────────────────────────────────────────────

export const BACKGROUND_TASK_NAME = "SOUND_ALERT_BACKGROUND_TASK";
export const CONFIDENCE_THRESHOLD = 0.92; // Minimum confidence to trigger alert (increased from 0.85 to reduce false positives)

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
  private isRecording = false;
  private loopToken = 0; // token for the currently active loop
  private onDetectionCallback: ((prediction: SoundPrediction) => void) | null =
    null;

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
    // Always stop first — handles hot-reload where old async loop is still running
    // but the singleton was re-created with isDetecting=false.
    await this.stopDetection();

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
    // Stamp the new loop with the current module token so any loop from a
    // previous module instance (hot-reload) that is still running will exit
    // as soon as it checks its token.
    this.loopToken = _moduleToken;
    this._runLoop(onDetection, threshold, _moduleToken);
  }

  /** Stop continuous monitoring */
  async stopDetection(): Promise<void> {
    this.isDetecting = false;
    this.onDetectionCallback = null;
    const rec = this.recording;
    this.recording = null;
    if (rec) {
      try {
        await rec.stopAndUnloadAsync();
      } catch {
        // ignore
      }
    }
    // Wait briefly for the native audio session to fully release on Android
    await new Promise((r) => setTimeout(r, 300));
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
    token: number,
  ): Promise<void> {
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;

    // Exit immediately if this loop is already stale (another startContinuousDetection
    // was called, or the module was hot-reloaded and a new token was issued).
    while (
      this.isDetecting &&
      token === this.loopToken &&
      token === global.__soundAlertToken
    ) {
      try {
        const result = await this._recordAndPredict(threshold);
        if (result) {
          onDetection(result);
        }
        consecutiveErrors = 0; // Reset error counter on success
      } catch (error: any) {
        consecutiveErrors++;
        if (
          error?.code === "ECONNABORTED" ||
          error?.code === "ENOTFOUND" ||
          error?.code === "ERR_NETWORK" ||
          error?.message === "Network Error"
        ) {
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

    // Prevent two concurrent createAsync calls (race condition guard)
    if (this.isRecording) {
      console.log("⚠️ Recording already in progress — skipping this cycle");
      return null;
    }
    this.isRecording = true;

    let rec: Audio.Recording | null = null;
    let meteringTimer: ReturnType<typeof setInterval> | null = null;
    let audioUri: string | null = null;

    try {
      // Retry createAsync — the native Android session sometimes takes a moment
      // to fully release after the previous stopAndUnloadAsync.
      for (let attempt = 0; attempt < 8; attempt++) {
        try {
          const { recording } = await Audio.Recording.createAsync({
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
            isMeteringEnabled: true,
          });
          rec = recording;
          break;
        } catch (e: any) {
          if (attempt < 7 && e?.message?.includes("Only one Recording")) {
            console.warn(
              `⚠️ Audio session busy, retrying (${attempt + 1}/7)...`,
            );
            await new Promise((r) => setTimeout(r, 500));
          } else {
            throw e;
          }
        }
      }

      if (!rec) throw new Error("Failed to create recording after retries");
      this.recording = rec;

      // Poll metering to detect real sound energy
      let maxLevel = -160; // dBFS; silence ≈ -160, loud sounds ≈ -10
      meteringTimer = setInterval(async () => {
        if (rec) {
          try {
            const status = await rec.getStatusAsync();
            if (status.isRecording && status.metering !== undefined) {
              maxLevel = Math.max(maxLevel, status.metering);
            }
          } catch {
            // ignore
          }
        }
      }, 200);

      await new Promise((r) => setTimeout(r, 2500));
      clearInterval(meteringTimer);
      meteringTimer = null;

      // Guard: stopDetection() may have already unloaded this recording
      if (!this.recording) {
        rec = null; // externally cleaned up — don't double-stop in finally
        return null;
      }

      // Stop and release the native session before any async network work
      await rec.stopAndUnloadAsync();
      audioUri = rec.getURI() ?? null;
      rec = null; // session released — finally won't double-stop
      this.recording = null;

      // Skip inference if audio was silent
      const MIN_SOUND_LEVEL_DB = -35;
      if (maxLevel < MIN_SOUND_LEVEL_DB) {
        console.log(
          `🔇 Audio too quiet (${maxLevel.toFixed(1)} dBFS < ${MIN_SOUND_LEVEL_DB}) — skipping`,
        );
        if (audioUri)
          await FileSystem.deleteAsync(audioUri, { idempotent: true });
        return null;
      }

      console.log("✅ Recording complete");
      if (!audioUri) {
        console.log("❌ No recording URI");
        return null;
      }

      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      console.log(`📁 File URI: ${audioUri}`);
      console.log(
        `📏 File size: ${fileInfo.exists ? (fileInfo as any).size : "unknown"} bytes`,
      );

      const formData = new FormData();
      const filename = audioUri.split("/").pop() || "recording.m4a";
      // @ts-ignore — FormData accepts file objects in React Native
      formData.append("audio", {
        uri: audioUri,
        type: "audio/mp4",
        name: filename,
      });
      console.log(`📦 Sending audio: ${filename}`);

      console.log(`🌐 Sending to ${API_BASE_URL}/predict...`);
      const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
        timeout: 15000,
        headers: { "Content-Type": "multipart/form-data" },
      });

      await FileSystem.deleteAsync(audioUri, { idempotent: true });
      audioUri = null;

      const data = response.data;
      console.log("📥 Backend response:", data);

      const confidencePercent: number = data.confidence ?? 0;
      const thresholdPercent = threshold * 100;
      const isDetected = data.detected === true;
      console.log(
        `🔍 Detection: detected=${isDetected}, confidence=${confidencePercent}%, threshold=${thresholdPercent}%`,
      );

      if (!isDetected || confidencePercent < thresholdPercent) {
        console.log(
          `⏭️ Skipping: ${
            !isDetected
              ? "not detected"
              : `confidence ${confidencePercent}% < ${thresholdPercent}%`
          }`,
        );
        return null;
      }

      const predicted_class = data.type?.replace("-horn", " horns") ?? "horn";
      const mapped = CLASS_MAP[predicted_class] ?? {
        vehicleType: data.title?.replace(" Horn Detected", "") || "Vehicle",
        emoji: data.icon || "🔊",
        alertType: data.type || "car-horn",
      };

      return {
        predicted_class,
        confidence: confidencePercent / 100,
        all_probabilities: data.all_probabilities ?? {},
        ...mapped,
      };
    } catch (error: any) {
      console.error("🔴 Error status:", error?.response?.status);
      console.error("🔴 Error data:", JSON.stringify(error?.response?.data));
      console.error("🔴 Request URL:", error?.config?.url ?? API_BASE_URL);
      if (audioUri) {
        await FileSystem.deleteAsync(audioUri, { idempotent: true }).catch(
          () => {},
        );
      }
      throw error;
    } finally {
      // Always release the native audio session
      this.isRecording = false;
      if (meteringTimer !== null) clearInterval(meteringTimer);
      if (rec !== null) {
        try {
          await rec.stopAndUnloadAsync();
        } catch {
          // ignore — may already be stopped
        }
        this.recording = null;
        const uri = rec.getURI();
        if (uri)
          await FileSystem.deleteAsync(uri, { idempotent: true }).catch(
            () => {},
          );
      }
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
