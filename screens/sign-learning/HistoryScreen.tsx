/**
 * HistoryScreen - Learning History & Performance Dashboard
 * =========================================================
 * Fetches real performance data from the backend:
 * - Overall summary stats  (POST /all-level-summaries)
 * - Per-level breakdown     (from all-level-summaries response)
 * - Per-letter performance  (sign stats within each level)
 * - Next-sign recommendation per level (POST /suggest-next-letter)
 */

import { SignLearningHeader } from "@/components/common/SignLearningHeader";
import performanceService, {
    type AllLevelSummariesResponse,
    type FrontendLevelProgress,
    type NextLetterSuggestion,
    type PracticeSuggestion,
    type SignStats,
    computeFrontendLevelProgress,
} from "@/services/sign-learning/performance-history.service";
import React, { useCallback, useEffect, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Mastery badge ─────────────────────────────────────────
const masteryBadge = (level: number | string) => {
  // Backend sends numeric mastery_level (0–4)
  const n = typeof level === "number" ? level : -1;
  if (n >= 4 || level === "mastered")
    return { label: "Mastered", icon: "🔥", color: "#0D9488" };
  if (n >= 3 || level === "proficient")
    return { label: "Proficient", icon: "💪", color: "#0D9488" };
  if (n >= 2 || level === "learning")
    return { label: "Learning", icon: "📚", color: "#D97706" };
  if (n >= 1 || level === "beginner")
    return { label: "Beginner", icon: "🌱", color: "#DC2626" };
  return { label: "Not Started", icon: "⬜", color: "#9CA3AF" };
};

// ── Difficulty from accuracy ──────────────────────────────
const getDifficulty = (accuracy: number) => {
  if (accuracy >= 80) return { label: "Easy", color: "#0D9488", bg: "#F0FDFA" };
  if (accuracy >= 50)
    return { label: "Medium", color: "#D97706", bg: "#FFFBEB" };
  return { label: "Hard", color: "#DC2626", bg: "#FEF2F2" };
};

// ── Score badge helper ───────────────────────────────────
const getScoreBadge = (score: number) => {
  if (score >= 80)
    return { label: "Excellent", icon: "🔥", color: "#0D9488", bg: "#F0FDFA" };
  if (score >= 60)
    return { label: "Good", icon: "💪", color: "#0D9488", bg: "#F0FDFA" };
  if (score >= 40)
    return { label: "Fair", icon: "📚", color: "#D97706", bg: "#FFFBEB" };
  if (score > 0)
    return { label: "Needs Work", icon: "🌱", color: "#DC2626", bg: "#FEF2F2" };
  return { label: "Not Started", icon: "⬜", color: "#9CA3AF", bg: "#F3F4F6" };
};

// ── Confidence category colors ────────────────────────────
const getConfCatStyle = (cat: string) => {
  if (cat === "good") return { bg: "#F0FDFA", color: "#0D9488", icon: "✅" };
  if (cat === "moderate")
    return { bg: "#FFFBEB", color: "#D97706", icon: "⚠️" };
  return { bg: "#FEF2F2", color: "#DC2626", icon: "🔄" };
};

// ── Curriculum levels (mirrors HomeScreen) ────────────────
const CURRICULUM_LEVELS = [
  {
    id: "level_1_starter",
    title: "Level 1 – Starter",
    signs: ["අ", "ඇ", "ඉ", "එ", "ක"],
    signType: "static" as const,
    color: "#0D9488",
  },
  {
    id: "level_2_basic",
    title: "Level 2 – Basic",
    signs: ["උ", "ග", "ආ", "ට", "ද"],
    signType: "static" as const,
    color: "#0D9488",
  },
  {
    id: "level_3_mid",
    title: "Level 3 – Intermediate",
    signs: ["ත", "ඩ", "න", "ප", "බ"],
    signType: "static" as const,
    color: "#0D9488",
  },
  {
    id: "level_4_common",
    title: "Level 4 – Advanced",
    signs: ["ම", "ය", "ර", "ල", "ව"],
    signType: "static" as const,
    color: "#0D9488",
  },
  {
    id: "level_5_final",
    title: "Level 5 – Final Set",
    signs: ["ස", "හ", "ං", "ච", "ෆ"],
    signType: "static" as const,
    color: "#0D9488",
  },
  {
    id: "expert_challenge",
    title: "Expert Challenge",
    signs: [
      "අ",
      "ඇ",
      "ඉ",
      "එ",
      "ක",
      "උ",
      "ග",
      "ආ",
      "ට",
      "ද",
      "ත",
      "ඩ",
      "න",
      "ප",
      "බ",
      "ම",
      "ය",
      "ර",
      "ල",
      "ව",
      "ස",
      "හ",
      "ං",
      "ච",
      "ෆ",
    ],
    signType: "static" as const,
    color: "#0D9488",
  },
  {
    id: "dynamic_basics",
    title: "📹 Dynamic Signs I",
    signs: ["ඈ", "ඊ", "ඌ", "ඒ", "ඔ", "ඕ"],
    signType: "dynamic" as const,
    color: "#7C3AED",
  },
  {
    id: "dynamic_intermediate",
    title: "📹 Dynamic Signs II",
    signs: ["ජ", "ණ", "ළ", "ඟ", "ඦ", "ඳ", "ඹ"],
    signType: "dynamic" as const,
    color: "#7C3AED",
  },
  {
    id: "dynamic_advanced",
    title: "📹 Dynamic Signs III",
    signs: ["ඛ", "ඬ", "ඵ", "ධ", "ඨ", "ඡ", "ක්\u200dය", "භ", "ථ"],
    signType: "dynamic" as const,
    color: "#7C3AED",
  },
];

const HistoryScreen = ({ navigation }: any) => {
  const [data, setData] = useState<AllLevelSummariesResponse | null>(null);
  const [levelProgressMap, setLevelProgressMap] = useState<
    Record<string, FrontendLevelProgress>
  >({});
  const [suggestions, setSuggestions] = useState<
    Record<string, NextLetterSuggestion>
  >({});
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [practiceSuggestions, setPracticeSuggestions] = useState<
    PracticeSuggestion[]
  >([]);

  const fetchData = useCallback(async () => {
    try {
      const summaries = await performanceService.getAllLevelSummaries();
      setData(summaries);

      // Compute per-frontend-level progress
      if (summaries) {
        const progressMap: Record<string, FrontendLevelProgress> = {};
        for (const level of CURRICULUM_LEVELS) {
          progressMap[level.id] = computeFrontendLevelProgress(
            level.id,
            level.signs,
            summaries,
          );
        }
        setLevelProgressMap(progressMap);

        // Use backend practice_suggestions if available
        if (
          summaries.practice_suggestions &&
          summaries.practice_suggestions.length > 0
        ) {
          setPracticeSuggestions(summaries.practice_suggestions);
        } else {
          // Fallback: fetch from dedicated endpoint
          const suggestions = await performanceService.getPracticeSuggestions();
          setPracticeSuggestions(suggestions);
        }
      }

      // Get next-letter suggestions for each backend level
      // and build a sign→backendLevel lookup so we can match to frontend levels
      if (summaries?.levels) {
        const signToBackendLevel: Record<string, string> = {};
        for (const [levelName, levelData] of Object.entries(summaries.levels)) {
          for (const stat of levelData.sign_stats || []) {
            signToBackendLevel[stat.sign] = levelName;
          }
        }

        const reqs = Object.keys(summaries.levels).map(async (levelName) => {
          const sug = await performanceService.suggestNextLetter(levelName);
          return { levelName, sug };
        });
        const results = await Promise.all(reqs);
        const backendSugs: Record<string, NextLetterSuggestion> = {};
        for (const { levelName, sug } of results) {
          if (sug) backendSugs[levelName] = sug;
        }

        // Map suggestions to frontend level IDs by checking which backend
        // level contains the first sign of each curriculum level
        const newSugs: Record<string, NextLetterSuggestion> = {};
        for (const cl of CURRICULUM_LEVELS) {
          const backendLevel = signToBackendLevel[cl.signs[0]];
          if (backendLevel && backendSugs[backendLevel]) {
            newSugs[cl.id] = backendSugs[backendLevel];
          }
        }
        setSuggestions(newSugs);
      }
    } catch (_e) {
      // fetch failed silently
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

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const overall = data?.overall;
  const levels = data?.levels;
  // Check if we have any data: either overall stats or any level with attempts
  const hasData =
    (overall && overall.total_attempts > 0) ||
    (levels &&
      Object.values(levels).some(
        (l) =>
          l.sign_stats?.some((s: SignStats) => s.total_attempts > 0) ?? false,
      ));

  // Group curriculum levels by category for the overview section
  const staticLevels = CURRICULUM_LEVELS.filter(
    (l) => l.signType === "static" && l.id !== "expert_challenge",
  );
  const dynamicLevels = CURRICULUM_LEVELS.filter(
    (l) => l.signType === "dynamic",
  );

  const getCategoryStats = (levelIds: string[]) => {
    let totalAttempts = 0;
    let totalCorrect = 0;
    let totalCompleted = 0;
    let totalSigns = 0;
    let confSum = 0;
    let confCount = 0;
    for (const id of levelIds) {
      const prog = levelProgressMap[id];
      if (prog) {
        totalAttempts += prog.totalAttempts;
        totalCorrect += prog.totalCorrect;
        totalCompleted += prog.completedCount;
        totalSigns += prog.totalSigns;
        if (prog.avgConfidence > 0 && prog.totalAttempts > 0) {
          confSum += prog.avgConfidence * prog.totalAttempts;
          confCount += prog.totalAttempts;
        }
      }
    }
    const accuracy =
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const avgConf = confCount > 0 ? Math.round(confSum / confCount) : 0;
    const score =
      totalAttempts > 0 ? Math.round(accuracy * 0.6 + avgConf * 0.4) : 0;
    return {
      totalAttempts,
      totalCorrect,
      accuracy,
      avgConf,
      score,
      totalCompleted,
      totalSigns,
    };
  };

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
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>📊 Learning History</Text>
          <Text style={styles.headerSub}>
            Adaptive performance tracking & insights
          </Text>
        </View>

        {hasData && levels ? (
          <>
            {/* ── Overall Summary ──────────────────────────── */}
            {overall && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🧠 Performance Summary</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Success Rate</Text>
                    <Text style={[styles.statValue, { color: "#0D9488" }]}>
                      {Math.round(overall.overall_accuracy)}%
                    </Text>
                    <Text style={styles.statSub}>
                      {overall.total_correct}/{overall.total_attempts} correct
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Avg Confidence</Text>
                    <Text style={[styles.statValue, { color: "#0D9488" }]}>
                      {Math.round(overall.avg_confidence)}%
                    </Text>
                    <Text style={styles.statSub}>Across all signs</Text>
                  </View>
                </View>
                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total Attempts</Text>
                    <Text style={[styles.statValue, { color: "#7C3AED" }]}>
                      {overall.total_attempts}
                    </Text>
                    <Text style={styles.statSub}>
                      {overall.total_attempts - overall.total_correct} failures
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Signs Practiced</Text>
                    <Text style={[styles.statValue, { color: "#7C3AED" }]}>
                      {overall.total_signs_practiced}
                    </Text>
                    <Text style={styles.statSub}>Unique signs</Text>
                  </View>
                </View>
              </View>
            )}

            {/* ── Category Overview Cards (Static / Dynamic) ─ */}
            {[
              {
                label: "📝 Static Signs (Levels 1-5)",
                ids: staticLevels.map((l) => l.id),
                color: "#0D9488",
              },
              {
                label: "📹 Dynamic Signs",
                ids: dynamicLevels.map((l) => l.id),
                color: "#7C3AED",
              },
            ].map((cat) => {
              const stats = getCategoryStats(cat.ids);
              if (stats.totalAttempts === 0) return null;
              const badge = getScoreBadge(stats.score);
              return (
                <View key={cat.label} style={styles.section}>
                  <Text style={styles.sectionTitle}>{cat.label}</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Score</Text>
                      <Text style={[styles.statValue, { color: badge.color }]}>
                        {badge.icon} {stats.score}
                      </Text>
                      <Text style={styles.statSub}>{badge.label}</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Accuracy</Text>
                      <Text style={[styles.statValue, { color: cat.color }]}>
                        {stats.accuracy}%
                      </Text>
                      <Text style={styles.statSub}>
                        {stats.totalCorrect}/{stats.totalAttempts}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Completed</Text>
                      <Text style={[styles.statValue, { color: cat.color }]}>
                        {stats.totalCompleted}/{stats.totalSigns}
                      </Text>
                      <Text style={styles.statSub}>signs</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statLabel}>Avg Confidence</Text>
                      <Text style={[styles.statValue, { color: cat.color }]}>
                        {stats.avgConf}%
                      </Text>
                      <Text style={styles.statSub}>across attempts</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* ── Per-Curriculum-Level Breakdown ──────────── */}
            {CURRICULUM_LEVELS.map((level) => {
              const progress = levelProgressMap[level.id];
              if (!progress || progress.totalAttempts === 0) return null;

              const isExpanded = expandedLevel === level.id;
              const sug = suggestions[level.id];
              const isDynamic = level.signType === "dynamic";
              const accentColor = isDynamic ? "#7C3AED" : "#0D9488";
              const badge = getScoreBadge(progress.score);

              // Get sign stats sorted by accuracy (weakest first)
              const signsList = progress.signStats
                .filter((s) => s.total_attempts > 0)
                .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));

              return (
                <View key={level.id} style={styles.section}>
                  {/* Level header */}
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedLevel(isExpanded ? null : level.id)
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.levelHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>{level.title}</Text>
                        <Text style={styles.levelMeta}>
                          {progress.totalAttempts} attempts ·{" "}
                          {progress.accuracy}% accuracy ·{" "}
                          {progress.practicedCount}/{progress.totalSigns} signs
                          practiced
                        </Text>
                      </View>
                      <Text style={styles.expandIcon}>
                        {isExpanded ? "▲" : "▼"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Score + Progress bar */}
                  <View style={styles.levelScoreRow}>
                    <View
                      style={[
                        styles.levelScoreBadge,
                        { backgroundColor: badge.bg },
                      ]}
                    >
                      <Text
                        style={[styles.levelScoreText, { color: badge.color }]}
                      >
                        {badge.icon} {progress.score}/100 — {badge.label}
                      </Text>
                    </View>
                    <Text style={styles.levelConfText}>
                      🎯 {progress.avgConfidence}% conf.
                    </Text>
                  </View>

                  <View style={styles.levelBarBg}>
                    <View
                      style={[
                        styles.levelBarFill,
                        {
                          width: `${progress.progressPct}%`,
                          backgroundColor: accentColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.levelProgressLabel}>
                    {progress.completedCount}/{progress.totalSigns} completed (
                    {progress.progressPct}%)
                  </Text>

                  {/* Per-sign dot indicators */}
                  <View style={styles.signDotsRow}>
                    {level.signs.map((sign) => {
                      const signStat = progress.signStats.find(
                        (s) => s.sign === sign,
                      );
                      const attempted = signStat && signStat.total_attempts > 0;
                      // Use backend completed flag, OR correct_attempts > 0, OR avg_confidence >= 50%
                      const signCompleted =
                        attempted &&
                        (signStat?.completed === true ||
                          (signStat?.correct_attempts || 0) > 0 ||
                          (signStat?.avg_confidence || 0) >= 50);
                      let dotStyle: any = styles.signDotEmpty;
                      if (signCompleted)
                        dotStyle = {
                          backgroundColor: accentColor,
                          borderColor: accentColor,
                        };
                      else if (attempted) dotStyle = styles.signDotAttempted;
                      return (
                        <View key={sign} style={[styles.signDot, dotStyle]}>
                          <Text
                            style={[
                              styles.signDotText,
                              signCompleted && { color: "#FFFFFF" },
                              attempted &&
                                !signCompleted && { color: "#D97706" },
                            ]}
                          >
                            {sign}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Next sign recommendation */}
                  {sug && (
                    <View
                      style={[styles.recCard, { borderLeftColor: accentColor }]}
                    >
                      <Text style={[styles.recLabel, { color: accentColor }]}>
                        🎯 Next Recommended Sign
                      </Text>
                      <View style={styles.recRow}>
                        <Text style={styles.recSign}>
                          {sug.recommended_sign}
                        </Text>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.recReason}>
                            {sug.recommendation_reason}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Expanded: per-sign breakdown */}
                  {isExpanded &&
                    signsList.map((s: SignStats) => {
                      const diff = getDifficulty(s.accuracy ?? 0);
                      const sBadge = masteryBadge(s.mastery_level ?? 0);

                      return (
                        <View key={s.sign} style={styles.letterCard}>
                          <View style={styles.letterRow}>
                            <View style={styles.letterLeft}>
                              <Text style={styles.letterSign}>{s.sign}</Text>
                              <View
                                style={[
                                  styles.diffBadge,
                                  { backgroundColor: diff.bg },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.diffText,
                                    { color: diff.color },
                                  ]}
                                >
                                  {diff.label}
                                </Text>
                              </View>
                            </View>
                            <View style={styles.letterRight}>
                              <Text
                                style={[
                                  styles.masteryBadgeText,
                                  { color: sBadge.color },
                                ]}
                              >
                                {sBadge.icon} {sBadge.label}
                              </Text>
                              {/* Confidence category badge from backend */}
                              {s.confidence_category &&
                                (() => {
                                  const cc = getConfCatStyle(
                                    s.confidence_category,
                                  );
                                  return (
                                    <View
                                      style={[
                                        styles.confCatBadge,
                                        { backgroundColor: cc.bg },
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.confCatText,
                                          { color: cc.color },
                                        ]}
                                      >
                                        {cc.icon} {s.confidence_category}
                                      </Text>
                                    </View>
                                  );
                                })()}
                            </View>
                          </View>

                          <View style={styles.letterStatsRow}>
                            <View style={styles.letterStat}>
                              <Text style={styles.letterStatLabel}>
                                Accuracy
                              </Text>
                              <Text style={styles.letterStatValue}>
                                {Math.round(s.accuracy ?? 0)}%
                              </Text>
                              <View style={styles.miniBarBg}>
                                <View
                                  style={[
                                    styles.miniBarFill,
                                    {
                                      width: `${Math.round(s.accuracy ?? 0)}%`,
                                    },
                                  ]}
                                />
                              </View>
                            </View>
                            <View style={styles.letterStat}>
                              <Text style={styles.letterStatLabel}>
                                Attempts
                              </Text>
                              <Text style={styles.letterStatValue}>
                                {s.total_attempts}
                              </Text>
                            </View>
                            <View style={styles.letterStat}>
                              <Text style={styles.letterStatLabel}>
                                Correct
                              </Text>
                              <Text
                                style={[
                                  styles.letterStatValue,
                                  { color: "#0D9488" },
                                ]}
                              >
                                {s.correct_attempts}
                              </Text>
                            </View>
                            <View style={styles.letterStat}>
                              <Text style={styles.letterStatLabel}>
                                Avg Conf.
                              </Text>
                              <Text style={styles.letterStatValue}>
                                {Math.round(s.avg_confidence)}%
                              </Text>
                            </View>
                          </View>

                          {/* Last practiced */}
                          {s.last_attempt && (
                            <Text style={styles.lastPracticed}>
                              Last: {formatDate(s.last_attempt)}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                </View>
              );
            })}

            {/* ── Practice Suggestions (Poor Signs) ──────── */}
            {practiceSuggestions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  🔄 Signs Needing Practice
                </Text>
                <Text style={styles.practiceSugDesc}>
                  These signs have low confidence and need more practice:
                </Text>
                {practiceSuggestions.map((ps) => {
                  const confStyle = getConfCatStyle(
                    ps.confidence_category ?? "",
                  );
                  return (
                    <View
                      key={`${ps.level}-${ps.sign}`}
                      style={styles.practiceItem}
                    >
                      <View style={styles.practiceItemLeft}>
                        <Text style={styles.practiceSign}>{ps.sign}</Text>
                        <View>
                          <Text style={styles.practiceLevel}>{ps.level}</Text>
                          <Text style={styles.practiceAttempts}>
                            {ps.correct_attempts ?? 0}/{ps.total_attempts ?? 0}{" "}
                            correct · {Math.round(ps.accuracy ?? 0)}% acc.
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.practiceConfBadge,
                          { backgroundColor: confStyle.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.practiceConfText,
                            { color: confStyle.color },
                          ]}
                        >
                          {Math.round(ps.avg_confidence ?? 0)}% conf.
                        </Text>
                        <Text
                          style={[
                            styles.practiceConfCat,
                            { color: confStyle.color },
                          ]}
                        >
                          {ps.confidence_category as string}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🧠</Text>
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start practicing signs to track your performance and get
              personalized recommendations!
            </Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
      <SignLearningHeader activeTab="history" />
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  headerRow: { paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  headerSub: {
    fontSize: 13,
    color: "#0D9488",
    marginTop: 2,
    fontWeight: "500",
  },

  // Empty state
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },

  // Level header
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  levelMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    marginBottom: 6,
  },
  expandIcon: {
    fontSize: 14,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  levelBarBg: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 12,
  },
  levelBarFill: {
    height: 6,
    backgroundColor: "#0D9488",
    borderRadius: 3,
  },

  // Recommendation card
  recCard: {
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#0D9488",
  },
  recLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0D9488",
    marginBottom: 8,
  },
  recRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  recSign: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0D9488",
  },
  recReason: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },

  // Stats grid
  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 10 },
  statBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  statLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  statValue: { fontSize: 26, fontWeight: "bold" },
  statSub: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

  // Letter cards
  letterCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  letterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  letterLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  letterSign: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  diffBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  diffText: { fontSize: 12, fontWeight: "600" },
  letterRight: {},
  masteryBadgeText: { fontSize: 14, fontWeight: "600" },

  letterStatsRow: { flexDirection: "row", justifyContent: "space-between" },
  letterStat: { alignItems: "center", flex: 1 },
  letterStatLabel: { fontSize: 11, color: "#6B7280", marginBottom: 2 },
  letterStatValue: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  miniBarBg: {
    width: "80%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    marginTop: 4,
  },
  miniBarFill: { height: 4, backgroundColor: "#0D9488", borderRadius: 2 },

  lastPracticed: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "right",
  },

  // Level score row
  levelScoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 6,
  },
  levelScoreBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  levelScoreText: {
    fontSize: 13,
    fontWeight: "700",
  },
  levelConfText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  levelProgressLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },

  // Per-sign dot indicators
  signDotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
    marginBottom: 10,
  },
  signDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  signDotAttempted: {
    backgroundColor: "#FFFBEB",
    borderColor: "#D97706",
  },
  signDotEmpty: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  signDotText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9CA3AF",
  },

  // Confidence category badge (per sign in expanded view)
  confCatBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  confCatText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  // Practice suggestions
  practiceSugDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },
  practiceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  practiceItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  practiceSign: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#DC2626",
  },
  practiceLevel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  practiceAttempts: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  practiceConfBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  practiceConfText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  practiceConfCat: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
    marginTop: 2,
  },
});

export default HistoryScreen;
