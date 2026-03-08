import axios, { AxiosInstance } from "axios";
import { API_CONFIG } from "../../config/Sign-Learning/api.config";

/**
 * API Service for Sign Language Learning App
 * Handles all communication with the backend server
 */

class SignLanguageAPI {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Check if backend server is healthy
   * @returns {Promise} Server health status
   */
  async checkHealth() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.HEALTH);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Get all available sign labels
   * @returns {Promise} List of labels
   */
  async getLabels() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.LABELS);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Predict sign from image
   * @param {string} base64Image - Base64 encoded image
   * @param {string} expectedLabel - Expected sign label (optional)
   * @returns {Promise} Prediction result
   */
  async predictSign(base64Image: string, expectedLabel: string | null = null) {
    try {
      const payload: { image: string; expected_label?: string } = {
        image: base64Image,
      };

      if (expectedLabel) {
        payload.expected_label = expectedLabel;
      }

      const response = await this.client.post(
        API_CONFIG.ENDPOINTS.PREDICT,
        payload,
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Send a video frame for dynamic sign prediction
   * @param {string} base64Image - Base64 encoded frame
   * @param {string} sessionId - Video session identifier
   * @param {string} expectedLabel - Expected sign label (optional)
   * @param {boolean} isFrontCamera - Whether front camera is used
   * @returns {Promise} Video prediction result
   */
  async predictVideoSign(
    base64Image: string,
    sessionId: string,
    expectedLabel: string | null = null,
    isFrontCamera = false,
  ) {
    try {
      const payload: {
        image: string;
        session_id: string;
        is_front_camera: boolean;
        expected_label?: string;
      } = {
        image: base64Image,
        session_id: sessionId,
        is_front_camera: isFrontCamera,
      };

      if (expectedLabel) {
        payload.expected_label = expectedLabel;
      }

      const response = await this.client.post(
        API_CONFIG.ENDPOINTS.PREDICT_VIDEO,
        payload,
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Clear the video frame buffer on the server
   * @param {string} sessionId - Video session identifier
   */
  async clearVideoBuffer(sessionId: string) {
    try {
      const response = await this.client.post(
        API_CONFIG.ENDPOINTS.CLEAR_VIDEO_BUFFER,
        { session_id: sessionId },
      );
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  /**
   * Get video sign labels
   */
  async getVideoLabels() {
    try {
      const response = await this.client.get(API_CONFIG.ENDPOINTS.VIDEO_LABELS);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: this.handleError(error) };
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {object} Formatted error
   */
  handleError(error: any) {
    if (error.response) {
      // Server responded with error
      return {
        message:
          error.response.data.message ||
          error.response.data.error ||
          "Server error",
        status: error.response.status,
        details: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        message: "No response from server. Please check if backend is running.",
        status: 0,
        details: error.message,
      };
    } else {
      // Error setting up request
      return {
        message: error.message || "Unknown error occurred",
        status: -1,
        details: error,
      };
    }
  }
}

// Export singleton instance
const apiService = new SignLanguageAPI();
export default apiService;
