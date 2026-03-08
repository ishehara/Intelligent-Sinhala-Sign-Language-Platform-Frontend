/**
 * ProfileScreen - User profile & overall learning statistics
 * ===========================================================
 * 3-layer safety net ensures counts are never wrong:
 *
 * Layer 1 (Backend):  POST /profile-data — returns everything in one call
 * Layer 2 (Fallback): /user-progress + /sign-details + /enhanced-rl-stats
 * Layer 3 (Safety):   useMemo computeFromSigns() — always recomputes from
 *                     the signs array and takes Math.max() with backend values
 */

import { SignLearningHeader } from "@/components/common/SignLearningHeader";
import { API_BASE_URL } from "@/config/Sign-Learning/api.config";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ══════════════════════════════════════════════════════════════
// Types — mirrors POST /profile-data response
// ══════════════════════════════════════════════════════════════

interface SignDetail {
  sign: string;
  accuracy: number;
  avg_confidence: number;
  total_attempts: number;
  correct_attempts: number;
  mastery_level: string; // "novice" | "familiar" | "proficient" | "mastered"
  streak: number;
  due_for_review: boolean;
  last_attempt?: string;
}

interface LevelProgress {
  level_name: string;
  completed_signs: number;
  total_signs: number;
  accuracy: number;
  unlocked: boolean;
}

interface HighlightSign {
  sign: string;
  accuracy: number;
  avg_confidence: number;
}

interface PracticeSuggestion {
  sign: string;
  reason: string;
}

interface ThompsonPolicy {
  context: string;
  recommended_action: string;
  confidence: number;
}

interface RLData {
  total_episodes: number;
  epsilon: number;
  avg_reward_last_100: number;
  num_actions: number;
  policy_summary: string;
  thompson_policies: ThompsonPolicy[];
}

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface ProfileData {
  mastered: number;
  familiar: number;
  practiced: number;
  total_signs: number;
  current_level: string;
  overall_accuracy: number;
  avg_confidence: number;
  sign_details: SignDetail[];
  level_progress: LevelProgress[];
  best_sign: HighlightSign | null;
  weakest_sign: HighlightSign | null;
  practice_suggestions: PracticeSuggestion[];
  due_for_review: string[];
  rl: RLData;
  achievements: Achievement[];
}

// ── Mastery badge helper ───────────────────────────────────
const masteryBadge = (level: string) => {
  switch (level) {
    case "mastered":
      return { label: "Mastered", icon: "🏆", color: "#0D9488", bg: "#F0FDFA" };
    case "proficient":
      return {
        label: "Proficient",
        icon: "💪",
        color: "#2563EB",
        bg: "#EFF6FF",
      };
    case "familiar":
      return { label: "Familiar", icon: "📘", color: "#D97706", bg: "#FFFBEB" };
    default:
      return { label: "Novice", icon: "🌱", color: "#9CA3AF", bg: "#F3F4F6" };
  }
};

// ══════════════════════════════════════════════════════════════
// Layer 3 — computeFromSigns: always-correct recomputation
// ══════════════════════════════════════════════════════════════

function computeFromSigns(signs: SignDetail[]) {
  let mastered = 0;
  let familiar = 0;
  let practiced = 0;
  let totalAttempts = 0;
  let totalCorrect = 0;
  let confidenceSum = 0;
  let confidenceCount = 0;

  for (const s of signs) {
    const attempted = s.total_attempts > 0;
    if (attempted) practiced++;

    const ml = (s.mastery_level || "").toLowerCase();
    if (ml === "mastered" || ml === "proficient") mastered++;
    else if (ml === "familiar") familiar++;
    // Also promote signs that the backend flagged as completed / high-confidence
    else if (attempted && (s.correct_attempts > 0 || s.avg_confidence >= 50)) {
      familiar++;
    }

    totalAttempts += s.total_attempts || 0;
    totalCorrect += s.correct_attempts || 0;
    if (attempted) {
      confidenceSum += s.avg_confidence || 0;
      confidenceCount++;
    }
  }

  const accuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const avgConfidence =
    confidenceCount > 0 ? Math.round(confidenceSum / confidenceCount) : 0;

  return { mastered, familiar, practiced, accuracy, avgConfidence };
}

// ── Normalise a single sign stat from any backend shape ────
function normaliseSignStat(raw: any): SignDetail {
  const ta = raw.total_attempts ?? 0;
  const ca = raw.correct_attempts ?? 0;

  // Derive mastery string from number or string
  let ml = "novice";
  if (typeof raw.mastery_level === "number") {
    if (raw.mastery_level >= 4) ml = "mastered";
    else if (raw.mastery_level >= 3) ml = "proficient";
    else if (raw.mastery_level >= 2) ml = "familiar";
  } else if (typeof raw.mastery_level === "string" && raw.mastery_level) {
    ml = raw.mastery_level;
  } else if (raw.completed || ca > 0 || (raw.avg_confidence ?? 0) >= 50) {
    ml = "familiar";
  }

  return {
    sign: raw.sign ?? "",
    accuracy: ta > 0 ? Math.round((ca / ta) * 100) : 0,
    avg_confidence: Math.round(raw.avg_confidence ?? 0),
    total_attempts: ta,
    correct_attempts: ca,
    mastery_level: ml,
    streak: raw.streak ?? 0,
    due_for_review: raw.due_for_review ?? false,
    last_attempt: raw.last_attempt,
  };
}

// ── Normalise sign_details from any backend format ─────────
function normaliseSignDetails(raw: unknown): SignDetail[] {
  if (!raw) return [];
  // Array of sign objects
  if (Array.isArray(raw)) return raw.map(normaliseSignStat);
  // Object keyed by sign letter { "අ": {...}, "ක": {...} }
  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, any>).map(([sign, data]) =>
      normaliseSignStat({ sign, ...data }),
    );
  }
  return [];
}

// ── Build 6 data-driven achievements ───────────────────────
function buildAchievements(
  c: ReturnType<typeof computeFromSigns>,
  totalSigns: number,
): Achievement[] {
  return [
    {
      id: "first_sign",
      icon: "⭐",
      title: "First Sign Mastered",
      description: "You mastered your first Sinhala sign letter!",
      unlocked: c.mastered >= 1,
    },
    {
      id: "practice_10",
      icon: "🔥",
      title: "Practice Streak",
      description: "Practiced 10+ different signs",
      unlocked: c.practiced >= 10,
    },
    {
      id: "explorer_5",
      icon: "🎓",
      title: "Alphabet Explorer",
      description: "Mastered 5 signs — you're on your way!",
      unlocked: c.mastered >= 5,
    },
    {
      id: "half_way",
      icon: "🚀",
      title: "Halfway There",
      description: "Practiced more than half of all signs",
      unlocked: totalSigns > 0 && c.practiced >= Math.ceil(totalSigns / 2),
    },
    {
      id: "high_accuracy",
      icon: "🎯",
      title: "Sharpshooter",
      description: "Reached 80%+ overall accuracy",
      unlocked: c.accuracy >= 80,
    },
    {
      id: "all_mastered",
      icon: "👑",
      title: "Grand Master",
      description: "Mastered every sign in the curriculum!",
      unlocked: totalSigns > 0 && c.mastered >= totalSigns,
    },
  ];
}

// ══════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ────────────────────────────────────────────────────────
  // fetchData — Layer 1 primary, Layer 2 fallback
  // ────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    // ── Layer 1: POST /profile-data ─────────────────────
    try {
      const res = await fetch(`${API_BASE_URL}/profile-data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "default_user" }),
      });
      if (res.ok) {
        const raw = await res.json();
        const signs = normaliseSignDetails(
          raw.sign_details ?? raw.signs ?? raw.sign_stats,
        );
        const c = computeFromSigns(signs);

        // Take max() of backend vs computed — backend already does max()
        // internally, but we double-check on the frontend.
        setProfile({
          mastered: Math.max(raw.mastered ?? 0, c.mastered),
          familiar: Math.max(raw.familiar ?? 0, c.familiar),
          practiced: Math.max(raw.practiced ?? raw.attempted ?? 0, c.practiced),
          total_signs: raw.total_signs || signs.length || 25,
          current_level: raw.current_level ?? "beginner",
          overall_accuracy: Math.max(raw.overall_accuracy ?? 0, c.accuracy),
          avg_confidence: Math.max(raw.avg_confidence ?? 0, c.avgConfidence),
          sign_details: signs,
          level_progress: Array.isArray(raw.level_progress)
            ? raw.level_progress
            : [],
          best_sign: raw.best_sign ?? null,
          weakest_sign: raw.weakest_sign ?? null,
          practice_suggestions: Array.isArray(raw.practice_suggestions)
            ? raw.practice_suggestions
            : [],
          due_for_review: Array.isArray(raw.due_for_review)
            ? raw.due_for_review
            : signs.filter((s) => s.due_for_review).map((s) => s.sign),
          rl: raw.rl ?? {
            total_episodes: 0,
            epsilon: 0.25,
            avg_reward_last_100: 0,
            num_actions: 36,
            policy_summary: "",
            thompson_policies: [],
          },
          achievements: Array.isArray(raw.achievements)
            ? raw.achievements
            : buildAchievements(c, raw.total_signs || signs.length || 25),
        });
        return; // success — done
      }
    } catch (e) {
      console.log("/profile-data unavailable, falling back:", e);
    }

    // ── Layer 2: /user-progress + /sign-details + /enhanced-rl-stats ──
    try {
      const [progRes, signsRes, rlRes] = await Promise.all([
        fetch(`${API_BASE_URL}/user-progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: "default_user" }),
        }),
        fetch(`${API_BASE_URL}/sign-details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: "default_user" }),
        }),
        fetch(`${API_BASE_URL}/enhanced-rl-stats`),
      ]);

      // Parse user-progress
      let backendMastered = 0;
      let backendFamiliar = 0;
      let backendAttempted = 0;
      let backendTotal = 25;
      let currentLevel = "beginner";
      if (progRes.ok) {
        const p = await progRes.json();
        backendMastered = p.mastered ?? 0;
        backendFamiliar = p.familiar ?? 0;
        backendAttempted = p.attempted ?? p.practiced ?? 0;
        backendTotal = p.total_signs ?? 25;
        currentLevel = p.current_level ?? "beginner";
      }

      // Parse sign-details
      let signs: SignDetail[] = [];
      if (signsRes.ok) {
        const sd = await signsRes.json();
        signs = normaliseSignDetails(
          sd.sign_details ?? sd.signs ?? sd.sign_stats ?? sd,
        );
      }

      const c = computeFromSigns(signs);

      // Best & weakest
      const attempted = signs.filter((s) => s.total_attempts > 0);
      let bestSign: HighlightSign | null = null;
      let weakestSign: HighlightSign | null = null;
      if (attempted.length > 0) {
        const sorted = [...attempted].sort((a, b) => b.accuracy - a.accuracy);
        bestSign = {
          sign: sorted[0].sign,
          accuracy: sorted[0].accuracy,
          avg_confidence: sorted[0].avg_confidence,
        };
        if (sorted.length > 1) {
          const w = sorted.at(-1)!;
          weakestSign = {
            sign: w.sign,
            accuracy: w.accuracy,
            avg_confidence: w.avg_confidence,
          };
        }
      }

      // Parse RL
      let rl: RLData = {
        total_episodes: 0,
        epsilon: 0.25,
        avg_reward_last_100: 0,
        num_actions: 36,
        policy_summary: "",
        thompson_policies: [],
      };
      if (rlRes.ok) {
        const r = await rlRes.json();
        rl = { ...rl, ...r };
      }

      const totalSigns = backendTotal || signs.length || 25;

      setProfile({
        mastered: Math.max(backendMastered, c.mastered),
        familiar: Math.max(backendFamiliar, c.familiar),
        practiced: Math.max(backendAttempted, c.practiced),
        total_signs: totalSigns,
        current_level: currentLevel,
        overall_accuracy: c.accuracy,
        avg_confidence: c.avgConfidence,
        sign_details: signs,
        level_progress: [],
        best_sign: bestSign,
        weakest_sign: weakestSign,
        practice_suggestions: [],
        due_for_review: signs
          .filter((s) => s.due_for_review)
          .map((s) => s.sign),
        rl,
        achievements: buildAchievements(
          { ...c, mastered: Math.max(backendMastered, c.mastered) },
          totalSigns,
        ),
      });
    } catch (e) {
      console.log("Fallback fetch also failed:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    if (navigation?.addListener) {
      const unsub = navigation.addListener("focus", fetchData);
      return unsub;
    }
  }, [navigation, fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // ────────────────────────────────────────────────────────
  // Layer 3 — useMemo safety net: always recompute from
  // profile.sign_details and take Math.max() with stored values
  // ────────────────────────────────────────────────────────
  const signs = profile?.sign_details ?? [];

  const safe = useMemo(() => {
    const c = computeFromSigns(signs);
    const bm = profile?.mastered ?? 0;
    const bf = profile?.familiar ?? 0;
    const bp = profile?.practiced ?? 0;
    const ba = profile?.overall_accuracy ?? 0;
    const bc = profile?.avg_confidence ?? 0;

    return {
      mastered: Math.max(bm, c.mastered),
      familiar: Math.max(bf, c.familiar),
      practiced: Math.max(bp, c.practiced),
      accuracy: Math.max(ba, c.accuracy),
      confidence: Math.max(bc, c.avgConfidence),
    };
  }, [signs, profile]);

  const total = profile?.total_signs || signs.length || 25;
  const level = profile?.current_level ?? "beginner";
  const levels = profile?.level_progress ?? [];
  const bestSign = profile?.best_sign ?? null;
  const weakestSign = profile?.weakest_sign ?? null;
  const suggestions = profile?.practice_suggestions ?? [];
  const reviewDue = profile?.due_for_review ?? [];
  const rl = profile?.rl ?? null;

  // Achievements: use backend if present, otherwise build from safe counts
  const achievements = useMemo(() => {
    if (profile?.achievements && profile.achievements.length > 0) {
      return profile.achievements;
    }
    return buildAchievements(
      { ...safe, avgConfidence: safe.confidence },
      total,
    );
  }, [profile?.achievements, safe, total]);

  // ══════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0D9488"
          />
        }
      >
        <Text style={styles.headerTitle}>👤 Profile</Text>

        {/* ── Avatar & Name ──────────────────────────────── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>Silva</Text>
          <Text style={styles.userSub}>
            {level.charAt(0).toUpperCase() + level.slice(1)} Level
          </Text>
        </View>

        {/* ── Stats Cards (4 cards) ──────────────────────── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{safe.mastered}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{safe.familiar}</Text>
            <Text style={styles.statLabel}>Familiar</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{safe.practiced}</Text>
            <Text style={styles.statLabel}>Practiced</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* ── Overall Progress (with accuracy & confidence) ─ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Overall Progress</Text>
          <View style={styles.bigProgressRow}>
            <View style={styles.bigProgressCircle}>
              <Text style={styles.bigProgressPct}>
                {total > 0 ? Math.round((safe.mastered / total) * 100) : 0}%
              </Text>
            </View>
            <View style={styles.bigProgressInfo}>
              <Text style={styles.bigProgressLabel}>Signs Mastered</Text>
              <Text style={styles.bigProgressDetail}>
                {safe.mastered} of {total}
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${
                        total > 0 ? (safe.mastered / total) * 100 : 0
                      }%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
          {/* Accuracy & Confidence */}
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{safe.accuracy}%</Text>
              <Text style={styles.metricLabel}>Overall Accuracy</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{safe.confidence}%</Text>
              <Text style={styles.metricLabel}>Avg Confidence</Text>
            </View>
          </View>
        </View>

        {/* ── Best / Weakest Sign Highlights ─────────────── */}
        {(bestSign || weakestSign) && (
          <View style={styles.highlightRow}>
            {bestSign && (
              <View style={[styles.highlightCard, styles.highlightBest]}>
                <Text style={styles.highlightIcon}>🌟</Text>
                <Text style={styles.highlightSign}>{bestSign.sign}</Text>
                <Text style={styles.highlightTitle}>Best Sign</Text>
                <Text style={styles.highlightSub}>
                  {bestSign.accuracy}% acc · {bestSign.avg_confidence}% conf
                </Text>
              </View>
            )}
            {weakestSign && (
              <View style={[styles.highlightCard, styles.highlightWeak]}>
                <Text style={styles.highlightIcon}>💡</Text>
                <Text style={styles.highlightSign}>{weakestSign.sign}</Text>
                <Text style={styles.highlightTitle}>Needs Work</Text>
                <Text style={styles.highlightSub}>
                  {weakestSign.accuracy}% acc · {weakestSign.avg_confidence}%
                  conf
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Level Progress ─────────────────────────────── */}
        {levels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗂️ Level Progress</Text>
            {levels.map((lv) => {
              const pct =
                lv.total_signs > 0
                  ? Math.round((lv.completed_signs / lv.total_signs) * 100)
                  : 0;
              return (
                <View key={lv.level_name} style={styles.levelRow}>
                  <View style={styles.levelHeader}>
                    <Text
                      style={[
                        styles.levelName,
                        !lv.unlocked && styles.textLocked,
                      ]}
                    >
                      {lv.unlocked ? "📖" : "🔒"} {lv.level_name}
                    </Text>
                    <Text
                      style={[
                        styles.levelMeta,
                        !lv.unlocked && styles.textLocked,
                      ]}
                    >
                      {lv.completed_signs}/{lv.total_signs} · {lv.accuracy}%
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${pct}%` },
                        !lv.unlocked && { backgroundColor: "#D1D5DB" },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Per-Sign Breakdown ─────────────────────────── */}
        {signs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔤 Sign Breakdown</Text>
            {signs.map((s) => {
              const badge = masteryBadge(s.mastery_level);
              return (
                <View key={s.sign} style={styles.signRow}>
                  <Text style={styles.signLetter}>{s.sign}</Text>
                  <View style={styles.signInfo}>
                    <View style={styles.signTopRow}>
                      <View
                        style={[
                          styles.masteryChip,
                          { backgroundColor: badge.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.masteryChipText,
                            { color: badge.color },
                          ]}
                        >
                          {badge.icon} {badge.label}
                        </Text>
                      </View>
                      {s.streak > 0 && (
                        <Text style={styles.streakText}>🔥 {s.streak}</Text>
                      )}
                      {s.due_for_review && (
                        <View style={styles.reviewChip}>
                          <Text style={styles.reviewChipText}>📅 Review</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.signMeta}>
                      {s.accuracy}% accuracy · {s.avg_confidence}% confidence ·{" "}
                      {s.total_attempts} attempts
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Due for Review (SM-2 Spaced Repetition) ───── */}
        {reviewDue.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Due for Review</Text>
            <Text style={styles.reviewDesc}>
              Based on SM-2 spaced repetition — review these signs to maintain
              mastery.
            </Text>
            <View style={styles.chipWrap}>
              {reviewDue.map((sign) => (
                <View key={sign} style={styles.reviewDueChip}>
                  <Text style={styles.reviewDueText}>{sign}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Practice Suggestions ───────────────────────── */}
        {suggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Practice Suggestions</Text>
            {suggestions.map((s, i) => (
              <View key={`${s.sign}-${i}`} style={styles.suggRow}>
                <Text style={styles.suggSign}>{s.sign}</Text>
                <Text style={styles.suggReason}>{s.reason}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── RL Agent + Thompson Policy ─────────────────── */}
        {rl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧠 AI Learning Agent</Text>
            <View style={styles.agentRow}>
              <Text style={styles.agentLabel}>Total Learning Episodes</Text>
              <Text style={styles.agentValue}>{rl.total_episodes}</Text>
            </View>
            <View style={styles.agentRow}>
              <Text style={styles.agentLabel}>Exploration Rate (ε)</Text>
              <Text style={styles.agentValue}>
                {rl.epsilon?.toFixed(4) ?? "0.25"}
              </Text>
            </View>
            <View style={styles.agentRow}>
              <Text style={styles.agentLabel}>Avg Reward (last 100)</Text>
              <Text style={styles.agentValue}>
                {rl.avg_reward_last_100?.toFixed(3) ?? "0"}
              </Text>
            </View>
            <View style={styles.agentRow}>
              <Text style={styles.agentLabel}>Actions Available</Text>
              <Text style={styles.agentValue}>{rl.num_actions ?? 36}</Text>
            </View>
            {rl.policy_summary ? (
              <View style={styles.policySummary}>
                <Text style={styles.policySummaryText}>
                  📋 {rl.policy_summary}
                </Text>
              </View>
            ) : null}

            {rl.thompson_policies && rl.thompson_policies.length > 0 && (
              <View style={styles.thompsonSection}>
                <Text style={styles.thompsonTitle}>
                  🎲 Thompson Sampling Policy
                </Text>
                {rl.thompson_policies.map((tp) => (
                  <View key={`tp-${tp.context}`} style={styles.thompsonRow}>
                    <Text style={styles.thompsonContext}>{tp.context}</Text>
                    <Text style={styles.thompsonAction}>
                      → {tp.recommended_action}
                    </Text>
                    <View style={styles.thompsonBarBg}>
                      <View
                        style={[
                          styles.thompsonBarFill,
                          { width: `${Math.round(tp.confidence * 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.thompsonConf}>
                      {Math.round(tp.confidence * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Achievements (6 data-driven) ───────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          {achievements.length > 0 ? (
            achievements.map((a) => (
              <View
                key={a.id}
                style={[styles.achvRow, !a.unlocked && styles.achvRowLocked]}
              >
                <Text
                  style={[styles.achvIcon, !a.unlocked && { opacity: 0.3 }]}
                >
                  {a.icon}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.achvTitle, !a.unlocked && styles.textLocked]}
                  >
                    {a.title}
                  </Text>
                  <Text
                    style={[styles.achvDesc, !a.unlocked && styles.textLocked]}
                  >
                    {a.description}
                  </Text>
                </View>
                {a.unlocked && <Text style={styles.achvUnlocked}>✓</Text>}
              </View>
            ))
          ) : (
            <Text style={styles.achvEmpty}>
              Start practicing to earn achievements!
            </Text>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
      <SignLearningHeader activeTab="profile" />
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════
// Styles
// ══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    paddingVertical: 16,
  },

  // Avatar
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "#0D9488",
  },
  avatarText: { fontSize: 36 },
  userName: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  userSub: { fontSize: 14, color: "#6B7280", marginTop: 2 },

  // Stats (4-column)
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#0D9488" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 4 },

  // Section
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 14,
  },

  // Big progress
  bigProgressRow: { flexDirection: "row", alignItems: "center" },
  bigProgressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FDFA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#0D9488",
    marginRight: 16,
  },
  bigProgressPct: { fontSize: 22, fontWeight: "bold", color: "#0D9488" },
  bigProgressInfo: { flex: 1 },
  bigProgressLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  bigProgressDetail: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: { height: 8, backgroundColor: "#0D9488", borderRadius: 4 },

  // Accuracy & Confidence metrics
  metricRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  metricCard: {
    flex: 1,
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  metricValue: { fontSize: 20, fontWeight: "bold", color: "#0D9488" },
  metricLabel: { fontSize: 11, color: "#6B7280", marginTop: 4 },

  // Highlight cards (best / weakest)
  highlightRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  highlightCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightBest: {
    backgroundColor: "#F0FDFA",
    borderColor: "#0D9488",
    borderWidth: 1,
  },
  highlightWeak: {
    backgroundColor: "#FFFBEB",
    borderColor: "#D97706",
    borderWidth: 1,
  },
  highlightIcon: { fontSize: 24, marginBottom: 4 },
  highlightSign: { fontSize: 32, fontWeight: "bold", color: "#111827" },
  highlightTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 4,
  },
  highlightSub: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
    textAlign: "center",
  },

  // Level progress
  levelRow: { marginBottom: 14 },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  levelName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  levelMeta: { fontSize: 12, color: "#6B7280" },
  textLocked: { color: "#D1D5DB" },

  // Sign breakdown
  signRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  signLetter: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    width: 44,
    textAlign: "center",
  },
  signInfo: { flex: 1, marginLeft: 10 },
  signTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  masteryChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  masteryChipText: { fontSize: 11, fontWeight: "600" },
  streakText: { fontSize: 12, color: "#EA580C" },
  reviewChip: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reviewChipText: { fontSize: 10, color: "#92400E", fontWeight: "600" },
  signMeta: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },

  // Due for review
  reviewDesc: { fontSize: 13, color: "#6B7280", marginBottom: 10 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  reviewDueChip: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  reviewDueText: { fontSize: 18, fontWeight: "bold", color: "#92400E" },

  // Practice suggestions
  suggRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 10,
  },
  suggSign: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0D9488",
    width: 36,
    textAlign: "center",
  },
  suggReason: { fontSize: 13, color: "#6B7280", flex: 1 },

  // Agent info
  agentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  agentLabel: { fontSize: 14, color: "#6B7280" },
  agentValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  policySummary: {
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  policySummaryText: { fontSize: 13, color: "#0D9488", lineHeight: 18 },

  // Thompson policy
  thompsonSection: { marginTop: 14 },
  thompsonTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 10,
  },
  thompsonRow: { marginBottom: 12 },
  thompsonContext: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  thompsonAction: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  thompsonBarBg: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  thompsonBarFill: { height: 6, backgroundColor: "#7C3AED", borderRadius: 3 },
  thompsonConf: { fontSize: 11, color: "#7C3AED", marginTop: 2 },

  // Achievements
  achvRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  achvRowLocked: { opacity: 0.5 },
  achvIcon: { fontSize: 28 },
  achvTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  achvDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  achvUnlocked: { fontSize: 16, color: "#0D9488", fontWeight: "bold" },
  achvEmpty: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 20,
  },
});

export default ProfileScreen;
