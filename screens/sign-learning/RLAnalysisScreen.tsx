/**
 * RLAnalysisScreen - RL Agent Analysis & Personalized Recommendations
 * =====================================================================
 * Matches the "RL Agent Analysis" UI design with performance metrics,
 * learning path, RL strategy display, difficulty adjustments,
 * and next lesson recommendations.
 */

import { SignLearningHeader } from "@/components/common/SignLearningHeader";
import { API_BASE_URL } from "@/config/Sign-Learning/api.config";
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

// ── Strategy chip colors ──────────────────────────────────
const strategyColors = {
  active: { bg: "#0D9488", text: "#FFFFFF" },
  inactive: { bg: "#F3F4F6", text: "#6B7280" },
};

const RLAnalysisScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(null);
  const [rlStats, setRlStats] = useState(null);
  const [nextSign, setNextSign] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [difficultyOffset, setDifficultyOffset] = useState(0);
  const [language, setLanguage] = useState("EN");

  // ── Active RL strategies (from backend actions) ─────────
  const [activeStrategies, setActiveStrategies] = useState([
    "More Visual Hints",
  ]);

  const fetchAll = useCallback(async () => {
    try {
      const [progressRes, statsRes, nextRes] = await Promise.all([
        fetch(`${API_BASE_URL}/user-progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: "default_user" }),
        }),
        fetch(`${API_BASE_URL}/enhanced-rl-stats`),
        fetch(`${API_BASE_URL}/next-sign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: "default_user" }),
        }),
      ]);
      if (progressRes.ok) setProgress(await progressRes.json());
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setRlStats(stats);
        // Derive strategy from RL actions
        if (stats.total_episodes > 0) {
          setActiveStrategies(["More Visual Hints"]);
        }
      }
      if (nextRes.ok) setNextSign(await nextRes.json());
    } catch (e) {
      console.log("RL Analysis fetch failed:", e);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, []);
  useEffect(() => {
    const unsub = navigation.addListener("focus", fetchAll);
    return unsub;
  }, [navigation, fetchAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  // Derived values
  const successRate = progress
    ? Math.round((progress.mastered / Math.max(progress.attempted, 1)) * 100)
    : 0;
  const attempts = rlStats?.total_episodes || 0;
  const confidencePct = rlStats
    ? Math.round(Math.abs(rlStats.avg_reward_last_100) * 100)
    : 0;
  const trend =
    rlStats?.avg_reward_last_100 > 0
      ? `+${Math.round(rlStats.avg_reward_last_100 * 100)}%`
      : "0%";
  const currentLevel = progress?.current_level || "beginner";

  // Learning path info
  const pathLevel =
    currentLevel === "advanced"
      ? "Advanced"
      : currentLevel === "intermediate"
        ? "Intermediate"
        : "Learning";
  const pathDifficulty =
    currentLevel === "advanced"
      ? "Hard"
      : currentLevel === "intermediate"
        ? "Medium"
        : "Medium";
  const pathColor = currentLevel === "advanced" ? "#DC2626" : "#D97706";

  // Next lesson
  const nextRec = nextSign?.recommended;
  const nextSignLabel = nextRec?.sign || "?";
  const nextDifficulty =
    nextRec?.difficulty === 3
      ? "Hard"
      : nextRec?.difficulty === 2
        ? "Medium"
        : "Easy";

  // RL strategies
  const strategies = [
    "More Visual Hints",
    "Slower Level Progress",
    "Repeat Same Letter",
  ];

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
        {/* ── Header ───────────────────────────────────────── */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Text style={{ fontSize: 20 }}>🧠</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>RL Agent Analysis</Text>
              <Text style={styles.headerSub}>
                Personalized Learning Recommendations
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.langBtn}
            onPress={() => setLanguage((l) => (l === "EN" ? "SI" : "EN"))}
          >
            <Text style={styles.langText}>{language}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Feedback Banner ──────────────────────────────── */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerBorder} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>👆 Keep Learning</Text>
            <Text style={styles.bannerMsg}>
              Working on {nextSignLabel}! You're at {successRate}% success rate.
              {"\n"}
              Practice makes perfect!
            </Text>
            <Text style={styles.bannerHint}>
              Focus on the hand position. Your confidence level is growing
              steadily.
            </Text>
          </View>
        </View>

        {/* ── Performance ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Performance</Text>
          <View style={styles.perfGrid}>
            <View style={styles.perfItem}>
              <Text style={styles.perfLabel}>Success Rate</Text>
              <Text style={[styles.perfValue, { color: "#0D9488" }]}>
                {successRate}%
              </Text>
            </View>
            <View style={styles.perfItem}>
              <Text style={styles.perfLabel}>Attempts</Text>
              <Text style={[styles.perfValue, { color: "#111827" }]}>
                {attempts}
              </Text>
            </View>
            <View style={styles.perfItem}>
              <Text style={styles.perfLabel}>Confidence</Text>
              <Text style={[styles.perfValue, { color: "#0D9488" }]}>
                {confidencePct}%
              </Text>
            </View>
            <View style={styles.perfItem}>
              <Text style={styles.perfLabel}>Trend</Text>
              <Text style={[styles.perfValue, { color: "#0D9488" }]}>
                {trend}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Learning Path ────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎓 Learning Path</Text>
          <View style={styles.pathCard}>
            <View style={styles.pathRow}>
              <View>
                <Text style={styles.pathLevel}>{pathLevel}</Text>
                <Text style={styles.pathDesc}>
                  You're learning well! Keep practicing.
                </Text>
                <Text style={styles.pathTag}>🎯 Core technique</Text>
              </View>
              <View
                style={[styles.diffChip, { backgroundColor: pathColor + "20" }]}
              >
                <Text style={[styles.diffChipText, { color: pathColor }]}>
                  {pathDifficulty}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── RL Strategy ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 RL Strategy</Text>
          <View style={styles.chipRow}>
            {strategies.map((s) => {
              const isActive = activeStrategies.includes(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isActive
                        ? strategyColors.active.bg
                        : strategyColors.inactive.bg,
                    },
                  ]}
                  onPress={() => {
                    if (isActive) {
                      setActiveStrategies((prev) =>
                        prev.filter((x) => x !== s),
                      );
                    } else {
                      setActiveStrategies((prev) => [...prev, s]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isActive
                          ? strategyColors.active.text
                          : strategyColors.inactive.text,
                      },
                    ]}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.recommendedTag}>✓ Recommended by RL Agent</Text>
        </View>

        {/* ── Adjustments ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Adjustments</Text>
          <Text style={styles.adjustLabel}>Difficulty Level</Text>
          <View style={styles.adjustRow}>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => setDifficultyOffset((v) => Math.max(-3, v - 1))}
            >
              <Text style={styles.adjustBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.sliderTrack}>
              <View
                style={[
                  styles.sliderFill,
                  {
                    width: `${Math.min(100, Math.max(0, ((difficultyOffset + 3) / 6) * 100))}%`,
                  },
                ]}
              />
            </View>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => setDifficultyOffset((v) => Math.min(3, v + 1))}
            >
              <Text style={styles.adjustBtnText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.adjustValue}>{difficultyOffset}</Text>
          </View>
          <View style={styles.adjustLabelsRow}>
            <Text style={styles.adjustHint}>Easier</Text>
            <Text style={styles.adjustHint}>Harder</Text>
          </View>
        </View>

        {/* ── Next Lesson ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Next Lesson</Text>
          <View style={styles.nextCard}>
            <View style={styles.nextHeader}>
              <View style={styles.nextIconCircle}>
                <Text style={{ fontSize: 20 }}>😊</Text>
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.nextTitle}>Balanced Track</Text>
                <Text style={styles.nextDuration}>⏱ 8-10 minutes</Text>
              </View>
            </View>
            <Text style={styles.nextDesc}>
              Good progress! Next is {nextSignLabel} ({nextDifficulty}{" "}
              difficulty).
            </Text>
            <View style={styles.nextTip}>
              <Text style={styles.nextTipIcon}>💡</Text>
              <Text style={styles.nextTipText}>
                Continue steady practice, then move to next letter when ready
              </Text>
            </View>

            {/* How to Prepare */}
            <View style={styles.prepBox}>
              <Text style={styles.prepTitle}>📋 How to Prepare:</Text>
              <Text style={styles.prepItem}>
                ✓ Reach 80%+ success rate before advancing
              </Text>
              <Text style={styles.prepItem}>
                🧠 Study the similarities between letters
              </Text>
              <Text style={styles.prepItem}>
                🎯 Practice 2-3 times per session for best results
              </Text>
            </View>

            <View style={styles.intensityRow}>
              <Text style={styles.intensityLabel}>Recommended Intensity:</Text>
              <View style={styles.intensityBadge}>
                <Text style={styles.intensityText}>Medium</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Bottom tip ───────────────────────────────────── */}
        <View style={styles.bottomTip}>
          <Text style={styles.bottomTipIcon}>💡</Text>
          <Text style={styles.bottomTipText}>
            Try using more visual examples to understand the gesture better.
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
      <SignLearningHeader activeTab="home" />
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  // Header
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0D9488",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    marginBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  langBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  langText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },

  // Banner
  bannerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerBorder: { width: 5, backgroundColor: "#0D9488" },
  bannerContent: { flex: 1, padding: 16 },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 6,
  },
  bannerMsg: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
    fontWeight: "600",
  },
  bannerHint: { fontSize: 13, color: "#6B7280", marginTop: 6, lineHeight: 18 },

  // Sections
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

  // Performance
  perfGrid: { flexDirection: "row", justifyContent: "space-between" },
  perfItem: { alignItems: "center", flex: 1 },
  perfLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  perfValue: { fontSize: 22, fontWeight: "bold" },

  // Learning path
  pathCard: {
    backgroundColor: "#F0FDFA",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#0D9488",
  },
  pathRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pathLevel: { fontSize: 16, fontWeight: "bold", color: "#0D9488" },
  pathDesc: { fontSize: 13, color: "#374151", marginTop: 4 },
  pathTag: { fontSize: 12, color: "#0D9488", marginTop: 6 },
  diffChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  diffChipText: { fontSize: 12, fontWeight: "600" },

  // RL Strategy
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  chipText: { fontSize: 13, fontWeight: "600" },
  recommendedTag: {
    fontSize: 12,
    color: "#0D9488",
    marginTop: 12,
    fontWeight: "500",
  },

  // Adjustments
  adjustLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  adjustRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  adjustBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  adjustBtnText: { fontSize: 22, fontWeight: "bold", color: "#DC2626" },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  sliderFill: { height: 8, backgroundColor: "#0D9488", borderRadius: 4 },
  adjustValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0D9488",
    width: 30,
    textAlign: "center",
  },
  adjustLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 50,
    marginTop: 6,
  },
  adjustHint: { fontSize: 11, color: "#9CA3AF" },

  // Next lesson
  nextCard: {
    backgroundColor: "#F0FDFA",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#0D9488",
  },
  nextHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  nextIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#CCFBF1",
    alignItems: "center",
    justifyContent: "center",
  },
  nextTitle: { fontSize: 16, fontWeight: "bold", color: "#111827" },
  nextDuration: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  nextDesc: { fontSize: 14, color: "#374151", lineHeight: 20 },
  nextTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  nextTipIcon: { fontSize: 14, marginRight: 8, marginTop: 1 },
  nextTipText: { flex: 1, fontSize: 13, color: "#065F46", lineHeight: 18 },
  prepBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },
  prepTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  prepItem: { fontSize: 12, color: "#6B7280", lineHeight: 20 },
  intensityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  intensityLabel: { fontSize: 13, color: "#6B7280" },
  intensityBadge: {
    borderWidth: 1.5,
    borderColor: "#0D9488",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  intensityText: { fontSize: 13, fontWeight: "600", color: "#0D9488" },

  // Bottom tip
  bottomTip: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F0FDFA",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#99F6E4",
    marginBottom: 10,
  },
  bottomTipIcon: { fontSize: 16, marginRight: 10 },
  bottomTipText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 18 },
});

export default RLAnalysisScreen;
