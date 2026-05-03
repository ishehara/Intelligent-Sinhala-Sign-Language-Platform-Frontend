export interface SignPrediction {
  predicted_label: string;
  sinhala_label: string;
  confidence: number;
  top5_predictions: Array<{
    label: string;
    sinhala: string;
    confidence: number;
  }>;
}

export interface FrameResponse {
  success: boolean;
  buffer_full: boolean;
  buffer_count?: number;
  buffer_max?: number;
  // Present when buffer_full === true
  predicted_label?: string;
  sinhala_label?: string;
  confidence?: number;
  top5_predictions?: Array<{
    label: string;
    sinhala: string;
    confidence: number;
  }>;
}

export interface HealthCheckResult {
  reachable: boolean;
  modelLoaded: boolean;
  numClasses?: number;
}

export interface TranslationHistoryItem {
  id: string;
  sinhalaText: string;
  englishLabel: string;
  confidence: number;
  timestamp: string;
  dateCategory: 'today' | 'yesterday' | 'thisWeek' | 'older';
}
