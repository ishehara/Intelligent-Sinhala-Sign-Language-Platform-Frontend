/**
 * ProfileScreen - User profile & overall learning statistics
 */

import React, { useCallback, useEffect, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../config/Sign-Learning/api.config";

const ProfileScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(null);
  const [rlStats, setRlStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(`${API_BASE_URL}/user-progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: "default_user" }),
        }),
        fetch(`${API_BASE_URL}/enhanced-rl-stats`),
      ]);
      if (pRes.ok) setProgress(await pRes.json());
      if (sRes.ok) setRlStats(await sRes.json());
    } catch (e) {}
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

  const mastered = progress?.mastered || 0;
  const total = progress?.total_signs || 25;
  const attempted = progress?.attempted || 0;
  const level = progress?.current_level || "beginner";
  const episodes = rlStats?.total_episodes || 0;

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

        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>SSL Learner</Text>
          <Text style={styles.userSub}>
            {level.charAt(0).toUpperCase() + level.slice(1)} Level
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mastered}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{attempted}</Text>
            <Text style={styles.statLabel}>Practiced</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total Signs</Text>
          </View>
        </View>

        {/* Overall Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Overall Progress</Text>
          <View style={styles.bigProgressRow}>
            <View style={styles.bigProgressCircle}>
              <Text style={styles.bigProgressPct}>
                {total > 0 ? Math.round((mastered / total) * 100) : 0}%
              </Text>
            </View>
            <View style={styles.bigProgressInfo}>
              <Text style={styles.bigProgressLabel}>Signs Mastered</Text>
              <Text style={styles.bigProgressDetail}>
                {mastered} of {total}
              </Text>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${total > 0 ? (mastered / total) * 100 : 0}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* RL Agent Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 AI Learning Agent</Text>
          <View style={styles.agentRow}>
            <Text style={styles.agentLabel}>Total Learning Episodes</Text>
            <Text style={styles.agentValue}>{episodes}</Text>
          </View>
          <View style={styles.agentRow}>
            <Text style={styles.agentLabel}>Exploration Rate (ε)</Text>
            <Text style={styles.agentValue}>
              {rlStats?.epsilon?.toFixed(4) || "0.25"}
            </Text>
          </View>
          <View style={styles.agentRow}>
            <Text style={styles.agentLabel}>Avg Reward (last 100)</Text>
            <Text style={styles.agentValue}>
              {rlStats?.avg_reward_last_100?.toFixed(3) || "0"}
            </Text>
          </View>
          <View style={styles.agentRow}>
            <Text style={styles.agentLabel}>Actions Available</Text>
            <Text style={styles.agentValue}>{rlStats?.num_actions || 36}</Text>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Achievements</Text>
          {mastered >= 1 && (
            <View style={styles.achvRow}>
              <Text style={styles.achvIcon}>⭐</Text>
              <View>
                <Text style={styles.achvTitle}>First Sign Mastered</Text>
                <Text style={styles.achvDesc}>
                  You mastered your first Sinhala sign letter!
                </Text>
              </View>
            </View>
          )}
          {attempted >= 10 && (
            <View style={styles.achvRow}>
              <Text style={styles.achvIcon}>🔥</Text>
              <View>
                <Text style={styles.achvTitle}>Practice Streak</Text>
                <Text style={styles.achvDesc}>
                  10+ practice sessions completed
                </Text>
              </View>
            </View>
          )}
          {mastered >= 5 && (
            <View style={styles.achvRow}>
              <Text style={styles.achvIcon}>🎓</Text>
              <View>
                <Text style={styles.achvTitle}>Alphabet Explorer</Text>
                <Text style={styles.achvDesc}>
                  Mastered 5 signs — you're on your way!
                </Text>
              </View>
            </View>
          )}
          {mastered === 0 && attempted === 0 && (
            <Text style={styles.achvEmpty}>
              Start practicing to earn achievements!
            </Text>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

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

  // Stats
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: { fontSize: 26, fontWeight: "bold", color: "#0D9488" },
  statLabel: { fontSize: 12, color: "#6B7280", marginTop: 4 },

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

  // Achievements
  achvRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  achvIcon: { fontSize: 28 },
  achvTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  achvDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  achvEmpty: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 20,
  },
});

export default ProfileScreen;
