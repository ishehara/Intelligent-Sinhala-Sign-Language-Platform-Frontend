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

/* ===================== SINHALA MAPS ===================== */

const DOMAIN_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; bg: string }
> = {
  communication_level: {
    label: "සන්නිවේදනය",
    icon: "💬",
    color: "#FF6B6B",
    bg: "#FFF0F0",
  },
  instruction_understanding_level: {
    label: "උපදෙස් අවබෝධය",
    icon: "👂",
    color: "#6C63FF",
    bg: "#F0EEFF",
  },
  learning_retention_level: {
    label: "ඉගෙනීම සහ මතකය",
    icon: "🧠",
    color: "#9C27B0",
    bg: "#F8EEFF",
  },
  attention_engagement_level: {
    label: "අවධානය සහ අවධානය පවත්වා ගැනීම",
    icon: "🎯",
    color: "#FF9800",
    bg: "#FFF8E1",
  },
  independence_confidence_level: {
    label: "ස්වාධීනත්වය",
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

/* ===================== DOMAIN CARD ===================== */

const DomainCard: React.FC<{
  domain: string;
  result: any;
  index: number;
}> = ({ domain, result, index }) => {
  const config = DOMAIN_CONFIG[domain];
  const rawPrediction = result?.prediction ?? "—";
  const prediction = PREDICTION_SI[rawPrediction] ?? rawPrediction;
  const confidence = result?.confidence ?? 0;
  const levelColor = LEVEL_COLORS[rawPrediction] ?? "#888";
  const progress = LEVEL_PROGRESS[rawPrediction] ?? 0;

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

      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            { width: barWidth, backgroundColor: levelColor },
          ]}
        />
      </View>

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

/* ===================== MAIN SCREEN ===================== */

const AIResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { result } = route.params;
  const predictions = result?.predictions ?? {};
  const profile = result?.child_profile ?? {};
  const aiSuggestions = result?.ai_suggestions ?? {};
  const modelTag = result?.model ?? "AI";
  const [tab, setTab] = useState<"results" | "insights">("results");
const getCleanSummary = () => {
  if (!aiSuggestions?.raw_response) return "";

  const raw = aiSuggestions.raw_response;

  const match = raw.match(/"overall_summary"\s*:\s*"([^"]+)/);

  if (match && match[1]) {
    return match[1];
  }

  return raw;
};

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D2B" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ඇගයීම් ප්‍රතිඵල</Text>
          <Text style={styles.modelText}>AI මඟින් බලගන්වා ඇත • {modelTag}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(["results", "insights"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "results" ? "📊 ප්‍රතිඵල" : "💡 අදහස්"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {tab === "results" &&
          Object.entries(predictions).map(([domain, res], i) => (
            <DomainCard key={domain} domain={domain} result={res} index={i} />
          ))}

        {tab === "insights" && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>🤖 AI සාරාංශය</Text>
            <Text style={styles.summaryCardText}>
              {getCleanSummary()}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AIResultScreen;

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F9FF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
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
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  modelText: { fontSize: 11, color: "#A89FFF", fontWeight: "700" },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 3, borderBottomColor: "#6C63FF" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#888" },
  tabTextActive: { color: "#6C63FF", fontWeight: "800" },
  scroll: { padding: 16 },
  domainCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  domainHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  domainIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  domainIcon: { fontSize: 24 },
  domainInfo: { flex: 1 },
  domainLabel: { fontSize: 14, fontWeight: "800" },
  levelBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    marginTop: 4,
  },
  levelText: { fontSize: 12, fontWeight: "800" },
  confidenceText: { fontSize: 18, fontWeight: "900" },
  barTrack: {
    height: 7,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 4,
    marginVertical: 12,
  },
  barFill: { height: 7, borderRadius: 4 },
  probRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  probChip: {
    flexDirection: "row",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  probLabel: { fontSize: 11 },
  probVal: { fontSize: 11, fontWeight: "800" },
  summaryCard: {
    backgroundColor: "#F0EEFF",
    borderRadius: 16,
    padding: 18,
  },
  summaryCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },
  summaryCardText: { fontSize: 14, lineHeight: 22 },
});
