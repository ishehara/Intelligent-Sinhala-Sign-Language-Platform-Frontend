/**
 * Performance History Service
 * Handles fetching and computing learning progress from the backend.
 */

import { API_BASE_URL } from "../../config/Sign-Learning/api.config";

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

export interface SignStats {
  sign: string;
  total_attempts: number;
  correct_attempts: number;
  avg_confidence: number;
  mastery_level?: number | string;
  completed?: boolean;
  accuracy?: number;
  confidence_category?: string;
  last_attempt?: string;
  [key: string]: unknown;
}

export interface LevelSummary {
  total_signs: number;
  completed_signs: number;
  practiced_signs: number;
  avg_confidence: number;
  sign_stats: SignStats[];
  unlocked?: boolean;
  [key: string]: unknown;
}

export interface PracticeSuggestion {
  sign: string;
  reason: string;
  priority?: number;
  level?: string;
  accuracy?: number;
  total_attempts?: number;
  correct_attempts?: number;
  avg_confidence?: number;
  confidence_category?: string;
  [key: string]: unknown;
}

export interface OverallSummary {
  total_attempts: number;
  total_correct: number;
  overall_accuracy: number;
  avg_confidence: number;
  total_signs_practiced: number;
  [key: string]: unknown;
}

export interface AllLevelSummariesResponse {
  levels: Record<string, LevelSummary>;
  unlocked_levels?: string[];
  practice_suggestions?: PracticeSuggestion[];
  overall?: OverallSummary;
  [key: string]: unknown;
}

export interface NextLetterSuggestion {
  recommended_sign: string;
  recommendation_reason: string;
  all_signs?: Array<{
    sign: string;
    reasons?: string[];
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface FrontendLevelProgress {
  completedCount: number;
  masteredCount: number;
  practicedCount: number;
  totalSigns: number;
  progressPct: number;
  avgConfidence: number;
  score: number;
  signStats: SignStats[];
  totalAttempts: number;
  totalCorrect: number;
  accuracy: number;
}

// ══════════════════════════════════════════════════════════════
// Frontend → Backend level ID mapping
// ══════════════════════════════════════════════════════════════

export const FRONTEND_TO_BACKEND_LEVEL: Record<string, string> = {
  level_1_starter: "level_1",
  level_2_basic: "level_2",
  level_3_mid: "level_3",
  level_4_common: "level_4",
  level_5_final: "level_5",
  expert_challenge: "expert",
  dynamic_basics: "dynamic_1",
  dynamic_intermediate: "dynamic_2",
  dynamic_advanced: "dynamic_3",
};

// ══════════════════════════════════════════════════════════════
// Compute frontend-level progress from backend summaries
// ══════════════════════════════════════════════════════════════

/**
 * Collect sign stats for the given signs from ALL backend levels.
 * The backend groups signs differently (beginner/intermediate/advanced)
 * than the frontend curriculum, so we search across every level.
 */
export function computeFrontendLevelProgress(
  _frontendLevelId: string,
  signs: string[],
  summaries: AllLevelSummariesResponse,
): FrontendLevelProgress {
  // Build a map of sign → stats by scanning ALL backend levels
  const signMap = new Map<string, SignStats>();
  if (summaries.levels) {
    for (const level of Object.values(summaries.levels)) {
      for (const stat of level.sign_stats || []) {
        if (signs.includes(stat.sign)) {
          // If the same sign appears in multiple levels, keep the one with more attempts
          const existing = signMap.get(stat.sign);
          if (
            !existing ||
            (stat.total_attempts || 0) > (existing.total_attempts || 0)
          ) {
            signMap.set(stat.sign, stat);
          }
        }
      }
    }
  }

  const relevantStats = Array.from(signMap.values());

  let completedCount = 0;
  let masteredCount = 0;
  let practicedCount = 0;
  let totalAttempts = 0;
  let totalCorrect = 0;
  let confidenceSum = 0;
  let confidenceCount = 0;

  for (const stat of relevantStats) {
    const attempted = stat.total_attempts > 0;
    const completed =
      stat.completed === true ||
      (stat.correct_attempts || 0) > 0 ||
      (stat.avg_confidence || 0) >= 50;
    const mastered =
      typeof stat.mastery_level === "number"
        ? stat.mastery_level >= 4
        : stat.mastery_level === "mastered";

    if (attempted) practicedCount++;
    if (completed) completedCount++;
    if (mastered) masteredCount++;

    totalAttempts += stat.total_attempts || 0;
    totalCorrect += stat.correct_attempts || 0;

    if (attempted) {
      confidenceSum += stat.avg_confidence || 0;
      confidenceCount++;
    }
  }

  const avgConfidence =
    confidenceCount > 0 ? Math.round(confidenceSum / confidenceCount) : 0;
  const progressPct =
    signs.length > 0 ? Math.round((completedCount / signs.length) * 100) : 0;
  const accuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Score: weighted combination of progress, confidence, and accuracy
  const score = Math.round(
    progressPct * 0.4 + avgConfidence * 0.3 + accuracy * 0.3,
  );

  return {
    completedCount,
    masteredCount,
    practicedCount,
    totalSigns: signs.length,
    progressPct,
    avgConfidence,
    score,
    signStats: relevantStats,
    totalAttempts,
    totalCorrect,
    accuracy,
  };
}

// ══════════════════════════════════════════════════════════════
// Service Class
// ══════════════════════════════════════════════════════════════

class PerformanceHistoryService {
  /**
   * Fetch all level summaries from the backend
   */
  async getAllLevelSummaries(): Promise<AllLevelSummariesResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/all-level-summaries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "default_user" }),
      });
      if (!response.ok) return null;
      const data = await response.json();

      // Transform backend response: convert signs object → sign_stats array
      if (data.levels) {
        for (const levelKey of Object.keys(data.levels)) {
          const level = data.levels[levelKey];

          // Backend returns `signs` as object { "අ": {...}, "ක": {...} }
          // Frontend expects `sign_stats` as array [{ sign: "අ", ... }, ...]
          if (
            level.signs &&
            typeof level.signs === "object" &&
            !Array.isArray(level.signs)
          ) {
            const statsArray: SignStats[] = Object.values(level.signs);
            level.sign_stats = statsArray;

            // Compute summary fields from sign data
            let practiced = 0;
            let completed = 0;
            for (const s of statsArray) {
              if (s.total_attempts > 0) practiced++;
              if (s.correct_attempts > 0 || (s.avg_confidence || 0) >= 50)
                completed++;
            }
            level.total_signs = statsArray.length;
            level.practiced_signs = practiced;
            level.completed_signs = completed;
          }

          // If sign_stats is already an array, keep it as-is
        }
      }

      // Compute overall if not provided
      if (!data.overall && data.levels) {
        data.overall = this.computeOverallFromLevels(data.levels);
      }

      return data;
    } catch (e) {
      console.error("Failed to fetch level summaries:", e);
      return null;
    }
  }

  private computeOverallFromLevels(
    levels: Record<string, LevelSummary>,
  ): OverallSummary {
    let totalAttempts = 0;
    let totalCorrect = 0;
    let confidenceSum = 0;
    let confidenceCount = 0;
    const practicedSigns = new Set<string>();

    for (const level of Object.values(levels)) {
      for (const stat of level.sign_stats || []) {
        totalAttempts += stat.total_attempts || 0;
        totalCorrect += stat.correct_attempts || 0;
        if (stat.total_attempts > 0) {
          practicedSigns.add(stat.sign);
          confidenceSum += stat.avg_confidence || 0;
          confidenceCount++;
        }
      }
    }

    return {
      total_attempts: totalAttempts,
      total_correct: totalCorrect,
      overall_accuracy:
        totalAttempts > 0
          ? Math.round((totalCorrect / totalAttempts) * 100)
          : 0,
      avg_confidence:
        confidenceCount > 0 ? Math.round(confidenceSum / confidenceCount) : 0,
      total_signs_practiced: practicedSigns.size,
    };
  }

  /**
   * Suggest the next letter for a given level
   */
  async suggestNextLetter(
    levelName: string,
  ): Promise<NextLetterSuggestion | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/suggest-next-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: levelName }),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error("Failed to fetch next letter suggestion:", e);
      return null;
    }
  }

  /**
   * Get practice suggestions
   */
  async getPracticeSuggestions(): Promise<PracticeSuggestion[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/practice-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "default_user" }),
      });
      if (!response.ok) return [];
      const data = await response.json();
      return data.suggestions || data || [];
    } catch (e) {
      console.error("Failed to fetch practice suggestions:", e);
      return [];
    }
  }

  /**
   * Fetch performance history for a specific sign
   */
  async getPerformanceHistory(sign: string): Promise<unknown> {
    try {
      const response = await fetch(`${API_BASE_URL}/performance-history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sign }),
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.error("Failed to fetch performance history:", e);
      return null;
    }
  }
}

const performanceService = new PerformanceHistoryService();
export default performanceService;
