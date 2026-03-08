/**
 * HomeScreen - Curriculum Levels with lock/unlock progression
 * =============================================================
 * Matches the "Levels" UI design with progress bars, lock states,
 * and curriculum-based progression.
 */

import { SignLearningHeader } from "@/components/common/SignLearningHeader";
import performanceService, {
  type FrontendLevelProgress,
  type NextLetterSuggestion,
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

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

interface CurriculumLevel {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  signs: string[];
  requiredMastery: number;
  color: string;
  signType: "static" | "dynamic";
}

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    addListener: (event: string, callback: () => void) => () => void;
  };
}

// ══════════════════════════════════════════════════════════════
// Curriculum Levels Definition
// ══════════════════════════════════════════════════════════════

const CURRICULUM_LEVELS: CurriculumLevel[] = [
  {
    id: "level_1_starter",
    title: "Level 1 – Starter",
    subtitle: "අ ඇ ඉ එ ක (5 letters)",
    description: "Master the foundation",
    signs: ["අ", "ඇ", "ඉ", "එ", "ක"],
    requiredMastery: 0, // First level - always unlocked
    color: "#0D9488",
    signType: "static",
  },
  {
    id: "level_2_basic",
    title: "Level 2 – Basic",
    subtitle: "උ ග ආ ට ද (5 letters)",
    description: "Build on the basics",
    signs: ["උ", "ග", "ආ", "ට", "ද"],
    requiredMastery: 1,
    color: "#0D9488",
    signType: "static",
  },
  {
    id: "level_3_mid",
    title: "Level 3 – Intermediate",
    subtitle: "ත ඩ න ප බ (5 letters)",
    description: "Expand your vocabulary",
    signs: ["ත", "ඩ", "න", "ප", "බ"],
    requiredMastery: 1,
    color: "#0D9488",
    signType: "static",
  },
  {
    id: "level_4_common",
    title: "Level 4 – Advanced",
    subtitle: "ම ය ර ල ව (5 letters)",
    description: "Common high-frequency letters",
    signs: ["ම", "ය", "ර", "ල", "ව"],
    requiredMastery: 1,
    color: "#0D9488",
    signType: "static",
  },
  {
    id: "level_5_final",
    title: "Level 5 – Final Set",
    subtitle: "ස හ ං ච ෆ (5 letters)",
    description: "Complete the full alphabet",
    signs: ["ස", "හ", "ං", "ච", "ෆ"],
    requiredMastery: 1,
    color: "#0D9488",
    signType: "static",
  },
  {
    id: "expert_challenge",
    title: "Expert Challenge",
    subtitle: "All 25 letters combined",
    description: "Ultimate mastery test",
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
    requiredMastery: 1,
    color: "#0D9488",
    signType: "static",
  },
  // ── Dynamic (Video/Motion) Sign Levels ──────────────────
  {
    id: "dynamic_basics",
    title: "📹 Dynamic Signs I",
    subtitle: "Motion signs ඈ-ඕ (6 letters)",
    description: "Learn motion-based signs",
    signs: ["ඈ", "ඊ", "ඌ", "ඒ", "ඔ", "ඕ"],
    requiredMastery: 0, // Always unlocked
    color: "#7C3AED",
    signType: "dynamic",
  },
  {
    id: "dynamic_intermediate",
    title: "📹 Dynamic Signs II",
    subtitle: "Motion signs ජ-ඹ (7 letters)",
    description: "Intermediate motion patterns",
    signs: ["ජ", "ණ", "ළ", "ඟ", "ඦ", "ඳ", "ඹ"],
    requiredMastery: 1,
    color: "#7C3AED",
    signType: "dynamic",
  },
  {
    id: "dynamic_advanced",
    title: "📹 Dynamic Signs III",
    subtitle: "Motion signs ඛ-ථ (9 letters)",
    description: "Advanced motion mastery",
    signs: ["ඛ", "ඬ", "ඵ", "ධ", "ඨ", "ඡ", "ක්\u200dය", "භ", "ථ"],
    requiredMastery: 1,
    color: "#7C3AED",
    signType: "dynamic",
  },
];

// ── Score badge helper ─────────────────────────────────────
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

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [levelProgressMap, setLevelProgressMap] = useState<
    Record<string, FrontendLevelProgress>
  >({});
  const [unlockedLevels, setUnlockedLevels] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [recommendations, setRecommendations] = useState<
    Record<string, NextLetterSuggestion>
  >({});
  // Map frontend level's first sign → actual backend level name
  const [signToBackendLevel, setSignToBackendLevel] = useState<
    Record<string, string>
  >({});

  // ── Fetch next-sign recommendations per level ───────────
  const fetchRecommendations = useCallback(async () => {
    try {
      // We need backend level names; fetch summaries if signToBackendLevel is empty
      let sbl = signToBackendLevel;
      if (Object.keys(sbl).length === 0) {
        const summaries = await performanceService.getAllLevelSummaries();
        if (summaries?.levels) {
          const newSbl: Record<string, string> = {};
          for (const [levelName, levelData] of Object.entries(
            summaries.levels,
          )) {
            for (const stat of levelData.sign_stats || []) {
              newSbl[stat.sign] = levelName;
            }
          }
          sbl = newSbl;
        }
      }

      const recs: Record<string, NextLetterSuggestion> = {};
      const seen = new Set<string>();
      const results = await Promise.all(
        CURRICULUM_LEVELS.map(async (level) => {
          const backendLevel = sbl[level.signs[0]] || level.id;
          if (seen.has(backendLevel)) return { id: level.id, sug: null };
          seen.add(backendLevel);
          const sug = await performanceService.suggestNextLetter(backendLevel);
          return { id: level.id, sug };
        }),
      );
      for (const { id, sug } of results) {
        if (sug) {
          // Only show if the recommended sign is in this frontend level's sign list
          const frontendLevel = CURRICULUM_LEVELS.find((l) => l.id === id);
          if (frontendLevel?.signs.includes(sug.recommended_sign)) {
            recs[id] = sug;
          } else if (sug.all_signs) {
            // Find the highest-priority sign that IS in this frontend level
            const match = sug.all_signs.find((s) =>
              frontendLevel?.signs.includes(s.sign),
            );
            if (match) {
              recs[id] = {
                ...sug,
                recommended_sign: match.sign,
                recommendation_reason:
                  match.reasons?.[0] || sug.recommendation_reason,
              };
            }
          }
        }
      }
      setRecommendations(recs);
    } catch (e) {
      console.log("Recommendations fetch failed:", e);
    }
  }, [signToBackendLevel]);

  // ── Fetch real per-level progress from backend ──────────
  const fetchProgress = useCallback(async () => {
    try {
      const summaries = await performanceService.getAllLevelSummaries();

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

        // Build sign → backend level name map
        if (summaries.levels) {
          const newSbl: Record<string, string> = {};
          for (const [levelName, levelData] of Object.entries(
            summaries.levels,
          )) {
            for (const stat of levelData.sign_stats || []) {
              newSbl[stat.sign] = levelName;
            }
          }
          setSignToBackendLevel(newSbl);
        }

        // Store backend-driven unlocked levels
        if (summaries.unlocked_levels) {
          setUnlockedLevels(summaries.unlocked_levels);
        }
      }
    } catch (e) {
      console.log("Progress fetch failed:", e);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
    fetchRecommendations();
  }, []);

  // Refresh when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchProgress();
      fetchRecommendations();
    });
    return unsubscribe;
  }, [navigation, fetchProgress, fetchRecommendations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProgress(), fetchRecommendations()]);
    setRefreshing(false);
  }, []);

  // ── Determine which levels are unlocked ─────────────────
  const isLevelUnlocked = (levelIndex: number): boolean => {
    const level = CURRICULUM_LEVELS[levelIndex];
    if (level.requiredMastery === 0) return true; // First levels always unlocked

    // Use backend-driven unlocked_levels if available
    if (unlockedLevels.length > 0) {
      // Try to find which backend level contains this frontend level's signs
      const backendLevel = signToBackendLevel[level.signs[0]];
      return backendLevel ? unlockedLevels.includes(backendLevel) : false;
    }

    // Fallback: check if previous level has enough completed signs
    const prevLevel = CURRICULUM_LEVELS[levelIndex - 1];
    if (!prevLevel) return true;
    const prevProgress = levelProgressMap[prevLevel.id];
    if (!prevProgress) return false;

    return prevProgress.completedCount >= level.requiredMastery;
  };

  const getLevelProgress = (level: CurriculumLevel): FrontendLevelProgress => {
    return (
      levelProgressMap[level.id] || {
        completedCount: 0,
        masteredCount: 0,
        practicedCount: 0,
        totalSigns: level.signs.length,
        progressPct: 0,
        avgConfidence: 0,
        score: 0,
        signStats: [],
        totalAttempts: 0,
        totalCorrect: 0,
        accuracy: 0,
      }
    );
  };

  // ── Navigate to learning ────────────────────────────────
  const startLevel = (level: CurriculumLevel, levelIndex: number) => {
    if (!isLevelUnlocked(levelIndex)) return;
    navigation.navigate("SignLearning", {
      levelId: level.id,
      levelTitle: level.title,
      signs: level.signs,
      levelIndex: levelIndex + 1,
      totalLevels: CURRICULUM_LEVELS.length,
      signType: level.signType || "static",
    });
  };

  // ══════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
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
          <TouchableOpacity style={styles.backBtn} onPress={() => {}}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📚 Levels</Text>
        </View>

        {/* Level Cards */}
        {CURRICULUM_LEVELS.map((level, index) => {
          const unlocked = isLevelUnlocked(index);
          const progress = getLevelProgress(level);
          const completed = unlocked ? progress.completedCount : 0;
          const practiced = unlocked ? progress.practicedCount : 0;
          const progressPct = unlocked ? progress.progressPct : 0;
          const inProgress =
            unlocked && practiced > 0 && completed < level.signs.length;
          const isDynamic = level.signType === "dynamic";
          const rec = recommendations[level.id];
          const scoreBadge = getScoreBadge(progress.score);

          return (
            <View
              key={level.id}
              style={[
                styles.levelCard,
                unlocked ? styles.levelCardUnlocked : styles.levelCardLocked,
                index === 0 && styles.levelCardFirst,
                isDynamic &&
                  unlocked && {
                    borderLeftColor: "#7C3AED",
                    borderLeftWidth: 4,
                  },
              ]}
            >
              {/* Star badge for first level */}
              {index === 0 && unlocked && (
                <Text style={styles.starBadge}>⭐</Text>
              )}

              <View style={styles.levelHeader}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.levelTitle, !unlocked && styles.textLocked]}
                  >
                    {level.title}
                  </Text>
                  <Text
                    style={[
                      styles.levelSubtitle,
                      !unlocked && styles.textLocked,
                    ]}
                  >
                    {level.subtitle}
                  </Text>
                  <Text
                    style={[styles.levelDesc, !unlocked && styles.textLocked]}
                  >
                    {level.description}
                  </Text>
                  {isDynamic && unlocked && (
                    <View style={styles.dynamicBadge}>
                      <Text style={styles.dynamicBadgeText}>
                        📹 Motion Sign
                      </Text>
                    </View>
                  )}
                </View>
                {!unlocked && <Text style={styles.lockIcon}>🔒</Text>}
              </View>

              {/* Progress bar */}
              <View style={styles.progressRow}>
                <Text
                  style={[styles.progressLabel, !unlocked && styles.textLocked]}
                >
                  📊 {completed}/{level.signs.length} completed · {practiced}/
                  {level.signs.length} practiced
                </Text>
              </View>

              {unlocked && (
                <>
                  <View style={styles.progressBarContainer}>
                    <Text style={styles.progressText}>Progress</Text>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${progressPct}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressPct}>{progressPct}%</Text>
                  </View>

                  {/* Score & Confidence */}
                  {progress.totalAttempts > 0 && (
                    <View style={styles.scoreRow}>
                      <View
                        style={[
                          styles.scoreBadge,
                          { backgroundColor: scoreBadge.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.scoreBadgeText,
                            { color: scoreBadge.color },
                          ]}
                        >
                          {scoreBadge.icon} Score: {progress.score}/100 —{" "}
                          {scoreBadge.label}
                        </Text>
                      </View>
                      <View style={styles.confBadge}>
                        <Text style={styles.confBadgeText}>
                          🎯 {progress.avgConfidence}% confidence
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Per-sign mini progress */}
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
                      let dotStyle = styles.signDotEmpty;
                      if (signCompleted) dotStyle = styles.signDotMastered;
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

                  {(() => {
                    let statusLabel = "○ Not Started";
                    if (completed === level.signs.length)
                      statusLabel = "✓ Completed";
                    else if (inProgress) statusLabel = "✓ In Progress";
                    return <Text style={styles.statusText}>{statusLabel}</Text>;
                  })()}

                  {/* Next sign recommendation */}
                  {rec && unlocked && (
                    <View style={styles.recBanner}>
                      <Text style={styles.recBannerLabel}>🎯 Next: </Text>
                      <Text style={styles.recBannerSign}>
                        {rec.recommended_sign}
                      </Text>
                      <Text style={styles.recBannerReason}>
                        {" "}
                        — {rec.recommendation_reason}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.continueBtn,
                      isDynamic && { backgroundColor: "#7C3AED" },
                    ]}
                    onPress={() => startLevel(level, index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.continueBtnText}>
                      {isDynamic ? "📹" : "▶"}{" "}
                      {completed > 0 ? "Continue" : "Start"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {!unlocked && (
                <View style={styles.lockedBtnContainer}>
                  <Text style={styles.lockedStatus}>🔒 Locked</Text>
                  <View style={styles.lockedBtn}>
                    <Text style={styles.lockedBtnText}>🔒 Locked</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
      <SignLearningHeader activeTab="home" />
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════
// Styles
// ══════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backIcon: {
    fontSize: 22,
    color: "#374151",
    fontWeight: "bold",
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },

  // Level Cards
  levelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
    overflow: "hidden",
  },
  levelCardFirst: {
    borderWidth: 2,
    borderColor: "#0D9488",
  },
  levelCardUnlocked: {
    opacity: 1,
  },
  levelCardLocked: {
    opacity: 0.65,
  },
  starBadge: {
    position: "absolute",
    top: 10,
    right: 12,
    fontSize: 24,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  levelSubtitle: {
    fontSize: 13,
    color: "#0D9488",
    marginTop: 2,
  },
  levelDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    fontStyle: "italic",
  },
  dynamicBadge: {
    backgroundColor: "#F5F3FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  dynamicBadgeText: {
    fontSize: 11,
    color: "#7C3AED",
    fontWeight: "700",
  },
  textLocked: {
    color: "#9CA3AF",
  },
  lockIcon: {
    fontSize: 22,
    marginLeft: 8,
    marginTop: 4,
  },

  // Progress
  progressRow: {
    marginTop: 10,
  },
  progressLabel: {
    fontSize: 13,
    color: "#0D9488",
    fontWeight: "600",
  },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#0D9488",
    borderRadius: 4,
  },
  progressPct: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
    marginLeft: 8,
    minWidth: 32,
    textAlign: "right",
  },
  statusText: {
    fontSize: 13,
    color: "#0D9488",
    marginTop: 8,
    fontWeight: "500",
  },

  // Buttons
  continueBtn: {
    backgroundColor: "#0D9488",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  lockedBtnContainer: {
    marginTop: 10,
  },
  lockedStatus: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  lockedBtn: {
    backgroundColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  lockedBtnText: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "600",
  },

  // Recommendation banner
  recBanner: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#0D9488",
  },
  recBannerLabel: {
    fontSize: 13,
    color: "#0D9488",
    fontWeight: "700",
  },
  recBannerSign: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D9488",
  },
  recBannerReason: {
    fontSize: 12,
    color: "#6B7280",
  },

  // Score & Confidence row
  scoreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  scoreBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  confBadge: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  confBadgeText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },

  // Per-sign dot indicators
  signDotsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
    marginBottom: 4,
  },
  signDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  signDotMastered: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
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
    fontSize: 14,
    fontWeight: "700",
    color: "#9CA3AF",
  },
});

export default HomeScreen;
