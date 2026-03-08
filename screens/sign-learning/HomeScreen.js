/**
 * HomeScreen - Curriculum Levels with lock/unlock progression
 * =============================================================
 * Matches the "Levels" UI design with progress bars, lock states,
 * and curriculum-based progression.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../config/Sign-Learning/api.config";

// ══════════════════════════════════════════════════════════════
// Curriculum Levels Definition
// ══════════════════════════════════════════════════════════════

const CURRICULUM_LEVELS = [
  {
    id: "alphabet_basics",
    title: "Alphabet Basics",
    subtitle: "Letters අ-ඇ (5 letters)",
    description: "Master the foundation",
    signs: ["අ", "ආ", "ඇ", "ඉ", "උ"],
    requiredMastery: 0, // First level - always unlocked
    color: "#0D9488",
    signType: "static",
  },
  {
    id: "consonant_quest",
    title: "Consonant Quest",
    subtitle: "Letters ක-ඩ (6 letters)",
    description: "Challenge yourself",
    signs: ["ක", "ග", "ට", "ද", "ත", "ඩ"],
    requiredMastery: 3, // Need 3 from prev level
    color: "#0D9488",
    signType: "static",
  },
  {
    id: "vowel_mastery",
    title: "Vowel Mastery",
    subtitle: "Special vowels (4 letters)",
    description: "Learn unique sounds",
    signs: ["එ", "ං", "ච", "ෆ"],
    requiredMastery: 4,
    color: "#0D9488",
    signType: "static",
  },
  {
    id: "intermediate_fusion",
    title: "Intermediate Fusion",
    subtitle: "Complex combinations (7 letters)",
    description: "Advanced letter patterns",
    signs: ["න", "ප", "බ", "ම", "ය", "ර", "ල"],
    requiredMastery: 3,
    color: "#0D9488",
    signType: "static",
  },
  {
    id: "advanced_patterns",
    title: "Advanced Patterns",
    subtitle: "Rapid sequences (8 letters)",
    description: "Speed & accuracy drills",
    signs: ["ව", "ස", "හ", "ක", "ග", "ට", "ද", "ත"],
    requiredMastery: 5,
    color: "#0D9488",
    signType: "static",
  },
  {
    id: "expert_challenge",
    title: "Expert Challenge",
    subtitle: "All letters combined (25 letters)",
    description: "Ultimate mastery test",
    signs: [
      "අ",
      "ආ",
      "ඇ",
      "ඉ",
      "උ",
      "එ",
      "ක",
      "ග",
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
    requiredMastery: 6,
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
    requiredMastery: 3,
    color: "#7C3AED",
    signType: "dynamic",
  },
  {
    id: "dynamic_advanced",
    title: "📹 Dynamic Signs III",
    subtitle: "Motion signs ඛ-ថ (9 letters)",
    description: "Advanced motion mastery",
    signs: ["ඛ", "ඬ", "ඵ", "ධ", "ඨ", "ඡ", "ක්\u200dය", "භ", "ථ"],
    requiredMastery: 4,
    color: "#7C3AED",
    signType: "dynamic",
  },
];

const HomeScreen = ({ navigation }) => {
  const [userProgress, setUserProgress] = useState(null);
  const [serverStatus, setServerStatus] = useState("checking");
  const [refreshing, setRefreshing] = useState(false);
  const [levelProgress, setLevelProgress] = useState({});

  // ── Fetch user progress ─────────────────────────────────
  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user-progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "default_user" }),
      });
      if (res.ok) {
        const data = await res.json();
        setUserProgress(data);
      }
    } catch (e) {
      console.log("Progress fetch failed:", e);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      setServerStatus(res.ok ? "connected" : "error");
    } catch {
      setServerStatus("disconnected");
    }
  }, []);

  useEffect(() => {
    checkHealth();
    fetchProgress();
  }, []);

  // Refresh when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchProgress();
    });
    return unsubscribe;
  }, [navigation, fetchProgress]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([checkHealth(), fetchProgress()]);
    setRefreshing(false);
  }, []);

  // ── Determine which levels are unlocked ─────────────────
  const getMasteredCount = () => {
    return userProgress?.mastered || 0;
  };

  const isLevelUnlocked = (levelIndex) => {
    if (levelIndex === 0) return true;
    // For simplicity: unlock based on cumulative mastered signs
    const totalMastered = getMasteredCount();
    let requiredTotal = 0;
    for (let i = 0; i <= levelIndex; i++) {
      requiredTotal += CURRICULUM_LEVELS[i].requiredMastery;
    }
    return totalMastered >= CURRICULUM_LEVELS[levelIndex].requiredMastery;
  };

  const getLevelMasteredCount = (level) => {
    // Use attempted as a proxy until per-sign data is available
    return Math.min(userProgress?.familiar || 0, level.signs.length);
  };

  const isLevelInProgress = (levelIndex) => {
    if (!isLevelUnlocked(levelIndex)) return false;
    const level = CURRICULUM_LEVELS[levelIndex];
    const mastered = getLevelMasteredCount(level);
    return mastered > 0 && mastered < level.signs.length;
  };

  // ── Navigate to learning ────────────────────────────────
  const startLevel = (level, levelIndex) => {
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
          const inProgress = isLevelInProgress(index);
          const mastered = unlocked ? getLevelMasteredCount(level) : 0;
          const progressPct =
            level.signs.length > 0
              ? Math.round((mastered / level.signs.length) * 100)
              : 0;
          const isDynamic = level.signType === "dynamic";

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
                  📊 {mastered}/{level.signs.length} letters
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

                  <Text style={styles.statusText}>
                    {inProgress
                      ? "✓ In Progress"
                      : mastered === 0
                        ? "○ Not Started"
                        : "✓ Completed"}
                  </Text>

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
                      {mastered > 0 ? "Continue" : "Start"}
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
});

export default HomeScreen;
