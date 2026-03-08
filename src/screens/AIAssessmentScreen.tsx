import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootStackParamList } from "../types";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "AIAssessment">;
};

const { width } = Dimensions.get("window");

const STEPS = [
  {
    id: "meta",
    title: "දරුවාගේ තොරතුරු",
    subtitle: "ඔබගේ දරුවා පිළිබඳ මූලික තොරතුරු",
    icon: "👶",
    color: "#6C63FF",
    fields: [
      {
        key: "age_group",
        label: "ඔබගේ දරුවාගේ වයස කීයද?",
        icon: "🎂",
        options: [
          { label: "අවුරුදු 5 – 6", value: 0, emoji: "🌱" },
          { label: "අවුරුදු 7 – 8", value: 1, emoji: "🌿" },
          { label: "අවුරුදු 9 – 10", value: 2, emoji: "🌳" },
        ],
      },
      {
        key: "app_usage_bucket",
        label: "දිනකට ඔබගේ දරුවා යෙදුම භාවිතා කරන කාලය කොපමණද?",
        icon: "📱",
        options: [
          { label: "මිනිත්තු 10 ට අඩු", value: 0, emoji: "⚡" },
          { label: "මිනිත්තු 10 – 20", value: 1, emoji: "🕐" },
          { label: "මිනිත්තු 20 ට වැඩි", value: 2, emoji: "🕒" },
        ],
      },
    ],
  },
  {
    id: "instruction",
    title: "නියෝග අවබෝධය",
    subtitle: "ඔබගේ දරුවා නියෝග අනුගමනය කරන ආකාරය",
    icon: "👂",
    color: "#FF6B6B",
    fields: [
      {
        key: "q1_familiar_instruction_response",
        label:
          'ඔබ හුරු නියෝගයක් දෙන විට (උදා: "අත් සෝදන්න"), ඔබගේ දරුවා කෙසේ ප්‍රතිචාර දක්වයිද?',
        icon: "🔄",
        options: [
          { label: "ප්‍රතිචාර නොදක්වයි", value: 0, emoji: "😶" },
          { label: "උදව් කළ පසු ප්‍රතිචාර දක්වයි", value: 1, emoji: "🤝" },
          { label: "ස්වයංක්‍රීයව ප්‍රතිචාර දක්වයි", value: 2, emoji: "✅" },
          {
            label: "ඉක්මනින් සහ විශ්වාසයෙන් ප්‍රතිචාර දක්වයි",
            value: 3,
            emoji: "⚡",
          },
        ],
      },
      {
        key: "q2_new_instruction_response",
        label: "නව නියෝගයක් දෙන විට ඔබගේ දරුවා…",
        icon: "🆕",
        options: [
          { label: "ගැටලුවට ලක් වේ", value: 0, emoji: "😕" },
          {
            label: "නැවත නැවත පැවසීමෙන් පසු අවබෝධ කරගනී",
            value: 1,
            emoji: "🔁",
          },
          { label: "දෘශ්‍ය උදව් සමඟ අවබෝධ කරගනී", value: 2, emoji: "👁️" },
          { label: "ඉක්මනින් අවබෝධ කරගනී", value: 3, emoji: "💡" },
        ],
      },
      {
        key: "q3_response_speed_visual",
        label:
          "දෘශ්‍ය නියෝගයක් පෙන්වන විට, ඔබගේ දරුවා කෙතරම් ඉක්මනින් ප්‍රතිචාර දක්වයිද?",
        icon: "⏱️",
        options: [
          { label: "ඉතා මන්දගාමී", value: 0, emoji: "🐢" },
          { label: "මන්දගාමී", value: 1, emoji: "🚶" },
          { label: "සාමාන්‍ය", value: 2, emoji: "🏃" },
          { label: "ඉක්මන්", value: 3, emoji: "⚡" },
        ],
      },
    ],
  },
  {
    id: "communication",
    title: "සන්නිවේදනය",
    subtitle: "ඔබගේ දරුවා අවශ්‍යතා ප්‍රකාශ කරන ආකාරය",
    icon: "💬",
    color: "#4CAF50",
    fields: [
      {
        key: "q4_basic_needs_expression",
        label:
          "ඔබගේ දරුවාට මූලික අවශ්‍යතා (බඩගිනි, පිපාසය, නිදිමත) ප්‍රකාශ කළ හැකිද?",
        icon: "🗣️",
        options: [
          { label: "තවමත් නොහැක", value: 0, emoji: "😶" },
          { label: "උදව් සමඟ", value: 1, emoji: "🤝" },
          { label: "බොහෝ විට ස්වයංක්‍රීයව", value: 2, emoji: "👍" },
          { label: "සම්පූර්ණයෙන්ම ස්වයංක්‍රීයව", value: 3, emoji: "🌟" },
        ],
      },
      {
        key: "q5_initiates_communication",
        label: "ඔබගේ දරුවා තමන්ම සංවාද හෝ අන්තර්ක්‍රියා ආරම්භ කරනවාද?",
        icon: "🙋",
        options: [
          { label: "කවදාවත් නැහැ", value: 0, emoji: "😶" },
          { label: "අල්ප වශයෙන්", value: 1, emoji: "🌑" },
          { label: "බොහෝ විට", value: 2, emoji: "🌗" },
          { label: "ඉතා බොහෝ විට", value: 3, emoji: "🌕" },
        ],
      },
      {
        key: "q6_multi_sign_combination",
        label: "ඔබගේ දරුවා එකට සංකේත කිහිපයක් එකලස් කර භාවිතා කරනවාද?",
        icon: "🤲",
        options: [
          { label: "කවදාවත් නැහැ", value: 0, emoji: "❌" },
          { label: "සමහර විට", value: 1, emoji: "🌤️" },
          { label: "බොහෝ විට", value: 2, emoji: "☀️" },
          { label: "සෑම විටම", value: 3, emoji: "🌟" },
        ],
      },
    ],
  },
  {
    id: "attention",
    title: "අවධානය සහ අවධානය පවත්වා ගැනීම",
    subtitle: "කාර්යයන්ට සම්බන්ධවීම සහ අවසන් කිරීම",
    icon: "🎯",
    color: "#FF9800",
    fields: [
      {
        key: "q7_focus_duration",
        label: "ඔබගේ දරුවා එකම ක්‍රියාවකට කොපමණ කාලයක් අවධානය යොමු කරගත හැකිද?",
        icon: "⏳",
        options: [
          { label: "මිනිත්තුවකට අඩු", value: 0, emoji: "⚡" },
          { label: "මිනිත්තු 1 – 3", value: 1, emoji: "🕐" },
          { label: "මිනිත්තු 3 – 5", value: 2, emoji: "🕑" },
          { label: "මිනිත්තු 5 ට වැඩි", value: 3, emoji: "🕒" },
        ],
      },
      {
        key: "q8_task_completion",
        label: "ඔබගේ දරුවා ආරම්භ කරන ක්‍රියාවන් කොපමණ වාරයක් අවසන් කරනවාද?",
        icon: "✔️",
        options: [
          { label: "කවදාවත් නැහැ", value: 0, emoji: "❌" },
          { label: "සමහර විට", value: 1, emoji: "🌤️" },
          { label: "බොහෝ විට", value: 2, emoji: "☀️" },
          { label: "සෑම විටම වටිනවාට ආසන්නව", value: 3, emoji: "🏆" },
        ],
      },
      {
        key: "q9_reminder_dependency",
        label:
          "කාර්යය පවත්වා ගැනීමට ඔබගේ දරුවාට කොපමණ වාරයක් සිහිකරවීම් අවශ්‍යද?",
        icon: "🔔",
        options: [
          { label: "සෑම විටම සිහිකරවීම් අවශ්‍යයි", value: 0, emoji: "📢" },
          { label: "බොහෝ විට අවශ්‍යයි", value: 1, emoji: "🔔" },
          { label: "සමහර විට අවශ්‍යයි", value: 2, emoji: "🔕" },
          { label: "අල්ප වශයෙන් අවශ්‍යයි", value: 3, emoji: "🌟" },
        ],
      },
    ],
  },
  {
    id: "learning",
    title: "ඉගෙනීම සහ මතකය",
    subtitle: "නව සංකේත මතක තබාගැනීම",
    icon: "🧠",
    color: "#9C27B0",
    fields: [
      {
        key: "q10_sign_retention_next_day",
        label: "පසුගිය දින ඉගෙනගත් සංකේත ඔබගේ දරුවාට මතකද?",
        icon: "💾",
        options: [
          { label: "නැහැ", value: 0, emoji: "❌" },
          { label: "සමහර විට", value: 1, emoji: "🌤️" },
          { label: "බොහෝ විට", value: 2, emoji: "☀️" },
          { label: "සෑම විටම", value: 3, emoji: "🌟" },
        ],
      },
      {
        key: "q11_repetition_needed",
        label: "නව සංකේතයක් ඉගෙනගැනීමට ඔබගේ දරුවාට කී වතාවක් දැකිය යුතුද?",
        icon: "🔁",
        options: [
          { label: "බොහෝ වාර (5ට වැඩි)", value: 0, emoji: "😓" },
          { label: "වර කිහිපයක් (3–4)", value: 1, emoji: "🤔" },
          { label: "වර දෙකක් වැනි", value: 2, emoji: "😊" },
          { label: "වහාම ඉගෙනගනී", value: 3, emoji: "⚡" },
        ],
      },
      {
        key: "q12_real_life_application",
        label: "දෛනික ජීවිතයේදී ඔබගේ දරුවා සංකේත භාවිතා කරනවාද?",
        icon: "🌍",
        options: [
          { label: "කවදාවත් නැහැ", value: 0, emoji: "❌" },
          { label: "අල්ප වශයෙන්", value: 1, emoji: "🌑" },
          { label: "බොහෝ විට", value: 2, emoji: "🌗" },
          { label: "ඉතා බොහෝ විට", value: 3, emoji: "🌕" },
        ],
      },
    ],
  },
  {
    id: "routine",
    title: "දෛනික රටාවන්",
    subtitle: "දිනපතා රටාවන් අවබෝධ කරගැනීම",
    icon: "📅",
    color: "#00BCD4",
    fields: [
      {
        key: "q13_routine_understanding",
        label:
          "උදෑසන, ආහාර වේලාව, නිදාගැනීම වැනි දෛනික රටාවන් ඔබගේ දරුවා කොපමණ හොඳින් අවබෝධ කරගනීද?",
        icon: "🏠",
        options: [
          { label: "තවමත් නැහැ", value: 0, emoji: "😶" },
          { label: "කොටසක් ලෙස", value: 1, emoji: "🌤️" },
          { label: "බොහෝ විට", value: 2, emoji: "☀️" },
          { label: "සම්පූර්ණයෙන්ම", value: 3, emoji: "🌟" },
        ],
      },
      {
        key: "q14_routine_response_accuracy",
        label:
          'රටාවකට අදාළ නියෝගයක් දෙන විට (උදා: "කෑම වෙලාව"), ඔබගේ දරුවා නිවැරදිව ප්‍රතිචාර දක්වයිද?',
        icon: "✅",
        options: [
          { label: "නැහැ", value: 0, emoji: "❌" },
          { label: "සමහර විට", value: 1, emoji: "🌤️" },
          { label: "බොහෝ විට", value: 2, emoji: "☀️" },
          { label: "සෑම විටම", value: 3, emoji: "🌟" },
        ],
      },
    ],
  },
  {
    id: "independence",
    title: "ස්වාධීනත්වය",
    subtitle: "විශ්වාසය සහ ස්වයං-ආධාරය",
    icon: "💪",
    color: "#E91E63",
    fields: [
      {
        key: "q15_independence_attempt",
        label: "උදව් නොමැතිව තමන්ම කාර්යයන් කිරීමට ඔබගේ දරුවා උත්සාහ කරනවාද?",
        icon: "🦁",
        options: [
          { label: "කවදාවත් නැහැ", value: 0, emoji: "😔" },
          { label: "සමහර විට", value: 1, emoji: "🌤️" },
          { label: "බොහෝ විට", value: 2, emoji: "💪" },
          { label: "සෑම විටම", value: 3, emoji: "🦁" },
        ],
      },
      {
        key: "q16_confidence_in_sign_usage",
        label: "සංකේත භාවිතා කරන විට ඔබගේ දරුවා කොපමණ විශ්වාසයෙන් සිටිනවාද?",
        icon: "⭐",
        options: [
          { label: "විශ්වාස නැහැ", value: 0, emoji: "😓" },
          { label: "අල්ප විශ්වාසයක් ඇත", value: 1, emoji: "🙂" },
          { label: "විශ්වාසයෙන්", value: 2, emoji: "😊" },
          { label: "ඉතා විශ්වාසයෙන්", value: 3, emoji: "🌟" },
        ],
      },
    ],
  },
];

const AIAssessmentScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const totalSteps = STEPS.length;
  const step = STEPS[currentStep];

  const allFieldsAnswered = step.fields.every(
    (f) => answers[f.key] !== undefined,
  );

  // ─── FIX: animateTransition now uses slide instead of fade ───────
  const animateTransition = useCallback(
    (callback: () => void, direction: "forward" | "back" = "forward") => {
      const outX = direction === "forward" ? -width : width;
      const inX = direction === "forward" ? width : -width;

      Animated.timing(slideAnim, {
        toValue: outX,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        slideAnim.setValue(inX);
        callback();
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }).start();
      });
    },
    [slideAnim],
  );

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      animateTransition(() => {
        setCurrentStep((s) => s + 1);
      }, "forward");
      Animated.timing(progressAnim, {
        toValue: ((currentStep + 1) / (totalSteps - 1)) * 100,
        duration: 400,
        useNativeDriver: false,
      }).start();
    } else {
      navigation.navigate("AILoading", { answers });
    }
  }, [
    currentStep,
    totalSteps,
    answers,
    animateTransition,
    progressAnim,
    navigation,
  ]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      animateTransition(() => {
        setCurrentStep((s) => s - 1);
      }, "back");
    } else {
      navigation.goBack();
    }
  }, [currentStep, animateTransition, navigation]);

  const handleSelect = useCallback((key: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <View
      style={[
        styles.safe,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={step.color} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: step.color }]}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepCounter}>
            {currentStep + 1} of {totalSteps}
          </Text>
          <Text style={styles.headerTitle}>{step.title}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>{step.icon}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {STEPS.map((s, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              {
                backgroundColor: i <= currentStep ? step.color : "#E0E0E0",
                width: i === currentStep ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[styles.content, { transform: [{ translateX: slideAnim }] }]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.subtitle}>{step.subtitle}</Text>

          {step.fields.map((field) => (
            <View key={field.key} style={styles.fieldBlock}>
              <View style={styles.questionRow}>
                <Text style={styles.questionIcon}>{field.icon}</Text>
                <Text style={styles.questionText}>{field.label}</Text>
              </View>

              <View style={styles.optionsGrid}>
                {field.options.map((opt) => {
                  const selected = answers[field.key] === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.optionCard,
                        selected && {
                          backgroundColor: step.color,
                          borderColor: step.color,
                        },
                      ]}
                      onPress={() => handleSelect(field.key, opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                      <Text
                        style={[
                          styles.optionLabel,
                          selected && styles.optionLabelSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>
                      {selected && <View style={styles.selectedDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerProgress}>
          <Text style={styles.footerProgressText}>
            {Object.keys(answers).length} of 18 answered
          </Text>
          <View style={styles.footerBar}>
            <View
              style={[
                styles.footerBarFill,
                {
                  width: `${(Object.keys(answers).length / 18) * 100}%`,
                  backgroundColor: step.color,
                },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: step.color },
            !allFieldsAnswered && styles.nextBtnDisabled,
          ]}
          onPress={handleNext}
          disabled={!allFieldsAnswered}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {currentStep === totalSteps - 1 ? "🚀  Analyze Now" : "Next  →"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#ECECEC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 16 : 10,
    paddingBottom: 20,

    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  backText: { fontSize: 22, color: "#fff", fontWeight: "bold" },
  headerCenter: { flex: 1, alignItems: "center" },
  stepCounter: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
    letterSpacing: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#fff", marginTop: 2 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconText: { fontSize: 20 },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 6,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  content: { flex: 1, overflow: "hidden" },
  scroll: { paddingHorizontal: 20, paddingTop: 10 },
  subtitle: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  fieldBlock: {
    marginBottom: 28,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 10,
  },
  questionIcon: { fontSize: 22, marginTop: 2 },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A2E",
    lineHeight: 22,
  },
  optionsGrid: { gap: 10 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#E8E8F0",
    backgroundColor: "#FAFAFA",
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  optionEmoji: { fontSize: 22, width: 30, textAlign: "center" },
  optionLabel: { flex: 1, fontSize: 14, fontWeight: "600", color: "#444" },
  optionLabelSelected: { color: "#fff" },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  footer: {
    paddingHorizontal: 20,
    // paddingBottom: 28,
    paddingTop: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
    // height: 140,
  },
  footerProgress: { marginBottom: 14 },
  footerProgressText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
    marginBottom: 6,
  },
  footerBar: {
    height: 7,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  footerBarFill: { height: 5, borderRadius: 3 },
  nextBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 40,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
});

export default AIAssessmentScreen;
