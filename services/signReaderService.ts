/**
 * Sign Reader Service
 * ===================
 * Handles communication with the Flask-based SSL Reader backend.
 *
 * HOW IT WORKS:
 *  1. Captures frames from the device camera (base64 JPEG)
 *  2. Sends each frame to /predict_frame on the Flask server
 *  3. Server accumulates 60 frames, runs MediaPipe + MultiStreamFusionModel
 *  4. Returns Sinhala label + confidence when buffer is full
 *  5. History is persisted locally via AsyncStorage
 *
 * SETUP:
 *  - Start backend: python src/react_native_bridge.py --model_path <path>
 *  - Update API_BASE_URL below with your computer's local IP
 *  - Find IP: run 'ipconfig' on Windows → look for IPv4 Address
 *  - Backend runs on port 5000 by default
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  FrameResponse,
  HealthCheckResult,
  TranslationHistoryItem,
} from '@/types/sign-reader';

// ── IMPORTANT: Set this to your computer's local IP ──────────────────────────
// Example: 'http://192.168.1.105:5000'
// Run 'ipconfig' on Windows to find your IPv4 Address
// ⚠️  VIVA NETWORK: 192.168.104.88
export const SIGN_READER_API_URL = 'http://192.168.104.88:5000';
// ─────────────────────────────────────────────────────────────────────────────

const HISTORY_KEY = 'sign_reader_history_v1';

class SignReaderService {
  // ── Health & connection ───────────────────────────────────────────────────

  async checkHealth(): Promise<HealthCheckResult> {
    try {
      const response = await axios.get(`${SIGN_READER_API_URL}/health`, {
        timeout: 5000,
      });
      return {
        reachable: true,
        modelLoaded: response.data.model_loaded === true,
        numClasses: response.data.num_classes ?? 0,
      };
    } catch {
      return { reachable: false, modelLoaded: false };
    }
  }

  // ── Frame prediction ──────────────────────────────────────────────────────

  /**
   * Send a single base64-encoded JPEG frame to the server.
   * The server accumulates frames until the buffer (60) is full,
   * then runs inference and returns a prediction.
   */
  async sendFrame(frameBase64: string): Promise<FrameResponse> {
    const response = await axios.post(
      `${SIGN_READER_API_URL}/predict_frame`,
      { frame: frameBase64 },
      { timeout: 10000 }
    );
    return response.data as FrameResponse;
  }

  /** Reset the server-side frame buffer. Call before starting a new session. */
  async resetBuffer(): Promise<void> {
    try {
      await axios.post(
        `${SIGN_READER_API_URL}/reset_buffer`,
        {},
        { timeout: 5000 }
      );
    } catch {
      // Non-critical — buffer will auto-clear after prediction anyway
    }
  }

  // ── Translation history (AsyncStorage) ───────────────────────────────────

  async getHistory(): Promise<TranslationHistoryItem[]> {
    try {
      const json = await AsyncStorage.getItem(HISTORY_KEY);
      return json ? (JSON.parse(json) as TranslationHistoryItem[]) : [];
    } catch {
      return [];
    }
  }

  async saveToHistory(
    item: Omit<TranslationHistoryItem, 'id' | 'dateCategory'>
  ): Promise<void> {
    try {
      const history = await this.getHistory();
      const newItem: TranslationHistoryItem = {
        ...item,
        id: Date.now().toString(),
        dateCategory: this.classifyDate(item.timestamp),
      };
      const updated = [newItem, ...history].slice(0, 100);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[SignReaderService] saveToHistory failed:', e);
    }
  }

  async clearHistory(): Promise<void> {
    await AsyncStorage.removeItem(HISTORY_KEY);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private classifyDate(
    isoTimestamp: string
  ): TranslationHistoryItem['dateCategory'] {
    const d = new Date(isoTimestamp);
    const today = this.startOfDay(new Date());
    const yesterday = this.startOfDay(new Date(today));
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = this.startOfDay(new Date(today));
    weekAgo.setDate(weekAgo.getDate() - 7);
    const itemDay = this.startOfDay(d);

    if (itemDay.getTime() === today.getTime()) return 'today';
    if (itemDay.getTime() === yesterday.getTime()) return 'yesterday';
    if (itemDay >= weekAgo) return 'thisWeek';
    return 'older';
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  formatTimestamp(isoTimestamp: string): string {
    const d = new Date(isoTimestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

export default new SignReaderService();
