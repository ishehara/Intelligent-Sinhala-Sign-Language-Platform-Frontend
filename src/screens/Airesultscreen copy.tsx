import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RootStackParamList } from "../types";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AIResult">;
  route: RouteProp<RootStackParamList, "AIResult">;
};

const { width } = Dimensions.get("window");

const DOMAIN_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; bg: string }
> = {
  communication_level: {
    label: "Communication",
    icon: "💬",
    color: "#FF6B6B",
    bg: "#FFF0F0",
  },
  instruction_understanding_level: {
    label: "Instruction",
    icon: "👂",
    color: "#6C63FF",
    bg: "#F0EEFF",
  },
  learning_retention_level: {
    label: "Learning & Memory",
    icon: "🧠",
    color: "#9C27B0",
    bg: "#F8EEFF",
  },
  attention_engagement_level: {
    label: "Attention & Focus",
    icon: "🎯",
    color: "#FF9800",
    bg: "#FFF8E1",
  },
  independence_confidence_level: {
    label: "Independence",
    icon: "💪",
    color: "#E91E63",
    bg: "#FCE4EC",
  },
};
const PREDICTION_SI: Record<string, string> = {
  Emerging: "මතුවෙමින් පවතී",
  Developing: "සංවර්ධනය වෙමින් පවතී",
  Functional: "ක්‍රියාකාරී",
  Strong: "ශක්තිමත්",
  Limited: "සීමා සහිතයි",
  Improving: "වැඩිදියුණු වෙමින් පවතී",
  Consistent: "ස්ථාවරයි",
  Advanced: "උසස්",
  Low: "අඩුයි",
  Moderate: "මධ්‍යස්ථ",
  Good: "හොඳයි",
  "Very Short": "ඉතා කෙටි",
  Short: "කෙටි",
  Stable: "ස්ථාවරයි",
  Sustained: "තිරසාර",
  Dependent: "යැපෙන",
  Assisted: "ආධාර කළා",
  "Semi-Independent": "අර්ධ ස්වාධීන",
  Independent: "ස්වාධීන",
};
const LEVEL_COLORS: Record<string, string> = {
  Emerging: "#FF9800",
  Developing: "#2196F3",
  Functional: "#4CAF50",
  Strong: "#4CAF50",
  Limited: "#FF5722",
  Improving: "#2196F3",
  Consistent: "#4CAF50",
  Advanced: "#4CAF50",
  Low: "#FF5722",
  Moderate: "#FF9800",
  Good: "#4CAF50",
  "Very Short": "#FF5722",
  Short: "#FF9800",
  Stable: "#4CAF50",
  Sustained: "#4CAF50",
  Dependent: "#FF5722",
  Assisted: "#FF9800",
  "Semi-Independent": "#4CAF50",
  Independent: "#4CAF50",
};

const LEVEL_PROGRESS: Record<string, number> = {
  Emerging: 0.2,
  Developing: 0.45,
  Functional: 0.7,
  Strong: 0.95,
  Limited: 0.15,
  Improving: 0.4,
  Consistent: 0.7,
  Advanced: 0.95,
  Low: 0.15,
  Moderate: 0.45,
  Good: 0.72,
  "Very Short": 0.15,
  Short: 0.4,
  Stable: 0.7,
  Sustained: 0.95,
  Dependent: 0.15,
  Assisted: 0.4,
  "Semi-Independent": 0.7,
  Independent: 0.95,
};

const DomainCard: React.FC<{
  domain: string;
  result: any;
  index: number;
}> = ({ domain, result, index }) => {
  const config = DOMAIN_CONFIG[domain];
  const prediction = result?.prediction ?? "—";
  const confidence = result?.confidence ?? 0;
  const levelColor = LEVEL_COLORS[prediction] ?? "#888";
  const progress = LEVEL_PROGRESS[prediction] ?? 0;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 120;
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(barAnim, {
        toValue: progress,
        duration: 800,
        delay: delay + 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View
      style={[
        styles.domainCard,
        {
          backgroundColor: config.bg,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.domainHeader}>
        <View
          style={[
            styles.domainIconWrap,
            { backgroundColor: config.color + "22" },
          ]}
        >
          <Text style={styles.domainIcon}>{config.icon}</Text>
        </View>
        <View style={styles.domainInfo}>
          <Text style={styles.domainLabel}>{config.label}</Text>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: levelColor + "22", borderColor: levelColor },
            ]}
          >
            <Text style={[styles.levelText, { color: levelColor }]}>
              {prediction}
            </Text>
          </View>
        </View>
        <Text style={styles.confidenceText}>
          {(confidence * 100).toFixed(0)}%
        </Text>
      </View>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            { width: barWidth, backgroundColor: levelColor },
          ]}
        />
      </View>

      {/* Probabilities */}
      <View style={styles.probRow}>
        {Object.entries(result?.probabilities ?? {}).map(
          ([label, prob]: [string, any]) => (
            <View key={label} style={styles.probChip}>
              <Text style={styles.probLabel}>{label}</Text>
              <Text style={styles.probVal}>{(prob * 100).toFixed(0)}%</Text>
            </View>
          ),
        )}
      </View>
    </Animated.View>
  );
};

const AIResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { result } = route.params;
  const predictions = result?.predictions ?? {};
  const profile = result?.child_profile ?? {};
  const aiSuggestions = result?.ai_suggestions ?? {};
  const modelTag = result?.model ?? "RF";
  const [tab, setTab] = useState<"results" | "insights" | "plan">("results");

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const strengths = profile?.strengths ?? [];
  const needsSupport = profile?.areas_for_support ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D2B" />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Assessment Results</Text>
          <View style={styles.modelBadge}>
            <Text style={styles.modelText}>Powered by {modelTag}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </Animated.View>

      {/* Summary banner */}
      <View style={styles.summaryBanner}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{strengths.length}</Text>
          <Text style={styles.summaryLbl}>Strengths</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: "#FF9800" }]}>
            {needsSupport.length}
          </Text>
          <Text style={styles.summaryLbl}>Needs Support</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: "#6C63FF" }]}>5</Text>
          <Text style={styles.summaryLbl}>Domains</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(["results", "insights", "plan"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "results"
                ? "📊 Results"
                : t === "insights"
                  ? "💡 Insights"
                  : "📅 Plan"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── RESULTS TAB ── */}
        {tab === "results" && (
          <>
            {Object.entries(predictions).map(([domain, res], i) => (
              <DomainCard key={domain} domain={domain} result={res} index={i} />
            ))}

            {/* Strengths & Support */}
            {strengths.length > 0 && (
              <View
                style={[styles.profileCard, { borderLeftColor: "#4CAF50" }]}
              >
                <Text style={styles.profileTitle}>🌟 Strengths</Text>
                {strengths.map((s: string, i: number) => (
                  <Text
                    key={i}
                    style={[styles.profileItem, { color: "#2E7D32" }]}
                  >
                    ✔ {s}
                  </Text>
                ))}
              </View>
            )}
            {needsSupport.length > 0 && (
              <View
                style={[styles.profileCard, { borderLeftColor: "#FF9800" }]}
              >
                <Text style={styles.profileTitle}>🤝 Needs Support</Text>
                {needsSupport.map((s: string, i: number) => (
                  <Text
                    key={i}
                    style={[styles.profileItem, { color: "#E65100" }]}
                  >
                    ◎ {s}
                  </Text>
                ))}
              </View>
            )}
          </>
        )}

        {/* ── INSIGHTS TAB ── */}
        {tab === "insights" && (
          <>
            {aiSuggestions?.overall_summary && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardTitle}>🤖 AI Summary</Text>
                <Text style={styles.summaryCardText}>
                  {aiSuggestions.overall_summary}
                </Text>
              </View>
            )}

            {aiSuggestions?.priority_focus && (
              <View
                style={[
                  styles.summaryCard,
                  { borderLeftColor: "#FF6B6B", backgroundColor: "#FFF5F5" },
                ]}
              >
                <Text style={styles.summaryCardTitle}>🎯 Priority Focus</Text>
                <Text style={styles.summaryCardText}>
                  {aiSuggestions.priority_focus}
                </Text>
              </View>
            )}

            {aiSuggestions?.domain_suggestions &&
              Object.entries(aiSuggestions.domain_suggestions).map(
                ([domain, content]: [string, any]) => {
                  const cfg = DOMAIN_CONFIG[domain];
                  if (!cfg) return null;
                  return (
                    <View
                      key={domain}
                      style={[
                        styles.insightCard,
                        { borderTopColor: cfg.color },
                      ]}
                    >
                      <View style={styles.insightHeader}>
                        <Text style={styles.insightIcon}>{cfg.icon}</Text>
                        <Text
                          style={[styles.insightTitle, { color: cfg.color }]}
                        >
                          {cfg.label}
                        </Text>
                      </View>
                      <View style={styles.insightRow}>
                        <Text style={styles.insightBadge}>💡 Tip</Text>
                        <Text style={styles.insightText}>{content.tip}</Text>
                      </View>
                      <View style={styles.insightRow}>
                        <Text style={styles.insightBadge}>🏠 Activity</Text>
                        <Text style={styles.insightText}>
                          {content.activity}
                        </Text>
                      </View>
                    </View>
                  );
                },
              )}

            {aiSuggestions?.encouragement && (
              <View style={styles.encourageCard}>
                <Text style={styles.encourageIcon}>💛</Text>
                <Text style={styles.encourageText}>
                  {aiSuggestions.encouragement}
                </Text>
              </View>
            )}
          </>
        )}

        {/* ── PLAN TAB ── */}
        {tab === "plan" && (
          <>
            <View style={styles.planHeader}>
              <Text style={styles.planHeaderTitle}>📅 Your Weekly Plan</Text>
              <Text style={styles.planHeaderSub}>
                Personalized by AI based on your child's assessment
              </Text>
            </View>

            {aiSuggestions?.weekly_plan?.map((day: string, i: number) => (
              <View key={i} style={styles.planCard}>
                <View
                  style={[
                    styles.planDot,
                    {
                      backgroundColor: ["#6C63FF", "#FF9800", "#4CAF50"][i % 3],
                    },
                  ]}
                />
                <Text style={styles.planText}>{day}</Text>
              </View>
            ))}

            {(!aiSuggestions?.weekly_plan ||
              aiSuggestions.weekly_plan.length === 0) && (
              <View style={styles.noPlan}>
                <Text style={styles.noPlanIcon}>🤖</Text>
                <Text style={styles.noPlanText}>
                  AI suggestions unavailable.{"\n"}Check your Gemini API key.
                </Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate("AIAssessment")}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaBtnText}>🔄 New Assessment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctaHome}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.ctaHomeText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F9FF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#0D0D2B",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: { fontSize: 22, color: "#fff", fontWeight: "bold" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginTop: 40,
  },
  modelBadge: {
    marginTop: 4,
    backgroundColor: "rgba(108,99,255,0.3)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  modelText: {
    fontSize: 11,
    color: "#A89FFF",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  summaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#0D0D2B",
    paddingBottom: 18,
    paddingTop: 4,
  },
  summaryItem: { alignItems: "center" },
  summaryNum: { fontSize: 26, fontWeight: "900", color: "#4CAF50" },
  summaryLbl: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "600",
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F8",
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#6C63FF" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#888" },
  tabTextActive: { color: "#6C63FF", fontWeight: "800" },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  domainCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  domainHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  domainIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  domainIcon: { fontSize: 24 },
  domainInfo: { flex: 1, gap: 4 },
  domainLabel: { fontSize: 14, fontWeight: "800", color: "#1A1A2E" },
  levelBadge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1.5,
  },
  levelText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },
  confidenceText: { fontSize: 18, fontWeight: "900", color: "#333" },
  barTrack: {
    height: 7,
    backgroundColor: "rgba(0,0,0,0.07)",
    borderRadius: 4,
    marginBottom: 12,
    overflow: "hidden",
  },
  barFill: { height: 7, borderRadius: 4 },
  probRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  probChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  probLabel: { fontSize: 11, color: "#666", fontWeight: "600" },
  probVal: { fontSize: 11, fontWeight: "800", color: "#333" },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  profileTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 10,
  },
  profileItem: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: "#F0EEFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#6C63FF",
  },
  summaryCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  summaryCardText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 22,
    fontWeight: "500",
  },
  insightCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderTopWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  insightIcon: { fontSize: 20 },
  insightTitle: { fontSize: 15, fontWeight: "800" },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  insightBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6C63FF",
    backgroundColor: "#F0EEFF",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 72,
    textAlign: "center",
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    fontWeight: "500",
  },
  encourageCard: {
    backgroundColor: "#FFFDE7",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFD54F",
  },
  encourageIcon: { fontSize: 32, marginBottom: 10 },
  encourageText: {
    fontSize: 14,
    color: "#5D4037",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },
  planHeader: {
    backgroundColor: "#0D0D2B",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  planHeaderTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 6,
  },
  planHeaderSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    fontWeight: "500",
    textAlign: "center",
  },
  planCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  planDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    flexShrink: 0,
  },
  planText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 22,
    fontWeight: "500",
  },
  noPlan: { alignItems: "center", paddingVertical: 40 },
  noPlanIcon: { fontSize: 48, marginBottom: 14 },
  noPlanText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 22,
  },
  cta: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 28,
    paddingTop: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F8F3B0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 30,
  },
  ctaBtn: {
    flex: 1,
    backgroundColor: "#6C63FF",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaBtnText: { fontSize: 14, fontWeight: "800", color: "#fff" },
  ctaHome: {
    backgroundColor: "#F0EEFF",
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  ctaHomeText: { fontSize: 14, fontWeight: "800", color: "#6C63FF" },
});

export default AIResultScreen;
