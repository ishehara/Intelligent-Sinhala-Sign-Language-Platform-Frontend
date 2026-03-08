/**
 * HistoryScreen - Learning History & Session Summary
 * =====================================================
 * Shows session summary stats and per-letter performance breakdown
 * matching the "Learning History" UI design.
 */

import React, { useCallback, useEffect, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../config/Sign-Learning/api.config";

// ── Difficulty badge colors ───────────────────────────────
const difficultyTheme = {
  1: { label: "Easy", color: "#0D9488", bg: "#F0FDFA" },
  2: { label: "Medium", color: "#D97706", bg: "#FFFBEB" },
  3: { label: "Hard", color: "#DC2626", bg: "#FEF2F2" },
};

// ── Mastery badge ─────────────────────────────────────────
const masteryBadge = (mastery) => {
  if (mastery >= 90)
    return { label: "Excellent", icon: "🔥", color: "#0D9488" };
  if (mastery >= 75) return { label: "Strong", icon: "💪", color: "#0D9488" };
  if (mastery >= 50) return { label: "Learning", icon: "📚", color: "#D97706" };
  return { label: "Practicing", icon: "🌱", color: "#DC2626" };
};

const HistoryScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(null);
  const [rlStats, setRlStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock letter performance data (will come from backend when per-sign tracking is connected)
  const [letterPerformance, setLetterPerformance] = useState([
    {
      sign: "අ",
      difficulty: 1,
      mastery: 94,
      attempts: 8,
      failures: 1,
      consecFails: 0,
    },
    {
      sign: "ආ",
      difficulty: 2,
      mastery: 87,
      attempts: 12,
      failures: 3,
      consecFails: 0,
    },
    {
      sign: "ඇ",
      difficulty: 2,
      mastery: 92,
      attempts: 10,
      failures: 2,
      consecFails: 0,
    },
    {
      sign: "ඉ",
      difficulty: 3,
      mastery: 89,
      attempts: 15,
      failures: 5,
      consecFails: 2,
    },
    {
      sign: "උ",
      difficulty: 2,
      mastery: 91,
      attempts: 9,
      failures: 2,
      consecFails: 0,
    },
  ]);

  const fetchData = useCallback(async () => {
    try {
      const [progressRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/user-progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: "default_user" }),
        }),
        fetch(`${API_BASE_URL}/enhanced-rl-stats`),
      ]);
      if (progressRes.ok) setProgress(await progressRes.json());
      if (statsRes.ok) setRlStats(await statsRes.json());
    } catch (e) {
      console.log("History fetch failed:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("focus", fetchData);
    return unsub;
  }, [navigation, fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const successRate = progress
    ? Math.round((progress.mastered / Math.max(progress.attempted, 1)) * 100)
    : 0;
  const confidencePct = rlStats
    ? Math.round(rlStats.avg_reward_last_100 * 100)
    : 0;

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
        </View>

        {/* ── Session Summary ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Session Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Success Rate</Text>
              <Text style={[styles.statValue, { color: "#0D9488" }]}>
                {successRate}%
              </Text>
              <Text style={styles.statSub}>
                Today: {progress?.mastered || 0}/{progress?.attempted || 0}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Confidence</Text>
              <Text style={[styles.statValue, { color: "#0D9488" }]}>
                {confidencePct}%
              </Text>
              <Text style={styles.statSub}>↑ +7% this week</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Consecutive Fails</Text>
              <Text style={[styles.statValue, { color: "#DC2626" }]}>
                {rlStats
                  ? Math.max(
                      0,
                      Math.round((1 - rlStats.avg_reward_last_100) * 5),
                    )
                  : 0}
              </Text>
              <Text style={styles.statSub}>Current streak</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Practice Time</Text>
              <Text style={[styles.statValue, { color: "#7C3AED" }]}>
                {rlStats
                  ? `${Math.round(rlStats.total_episodes * 0.7)}m`
                  : "0m"}
              </Text>
              <Text style={styles.statSub}>This week</Text>
            </View>
          </View>
        </View>

        {/* ── Letter Performance Breakdown ─────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📚 Letter Performance Breakdown
          </Text>

          {letterPerformance.map((letter, idx) => {
            const diff =
              difficultyTheme[letter.difficulty] || difficultyTheme[1];
            const badge = masteryBadge(letter.mastery);

            return (
              <View key={idx} style={styles.letterCard}>
                <View style={styles.letterRow}>
                  {/* Sign + Difficulty */}
                  <View style={styles.letterLeft}>
                    <Text style={styles.letterSign}>{letter.sign}</Text>
                    <View
                      style={[styles.diffBadge, { backgroundColor: diff.bg }]}
                    >
                      <Text style={[styles.diffText, { color: diff.color }]}>
                        {diff.label}
                      </Text>
                    </View>
                  </View>

                  {/* Mastery Badge */}
                  <View style={styles.letterRight}>
                    <Text
                      style={[styles.masteryBadgeText, { color: badge.color }]}
                    >
                      {badge.icon} {badge.label}
                    </Text>
                  </View>
                </View>

                {/* Stats row */}
                <View style={styles.letterStatsRow}>
                  <View style={styles.letterStat}>
                    <Text style={styles.letterStatLabel}>Mastery</Text>
                    <Text style={styles.letterStatValue}>
                      {letter.mastery}%
                    </Text>
                    <View style={styles.miniBarBg}>
                      <View
                        style={[
                          styles.miniBarFill,
                          { width: `${letter.mastery}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <View style={styles.letterStat}>
                    <Text style={styles.letterStatLabel}>Attempts</Text>
                    <Text style={styles.letterStatValue}>
                      {letter.attempts}
                    </Text>
                  </View>
                  <View style={styles.letterStat}>
                    <Text
                      style={[styles.letterStatLabel, { color: "#DC2626" }]}
                    >
                      Failures
                    </Text>
                    <Text
                      style={[styles.letterStatValue, { color: "#DC2626" }]}
                    >
                      {letter.failures}
                    </Text>
                  </View>
                  <View style={styles.letterStat}>
                    <Text style={styles.letterStatLabel}>Consec. Fails</Text>
                    <Text
                      style={[
                        styles.letterStatValue,
                        letter.consecFails > 0 && { color: "#DC2626" },
                      ]}
                    >
                      {letter.consecFails}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ══════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  headerRow: { paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#111827" },

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
    marginBottom: 14,
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
});

export default HistoryScreen;
