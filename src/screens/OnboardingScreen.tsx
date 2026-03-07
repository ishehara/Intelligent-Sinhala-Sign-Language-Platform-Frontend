import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";
import { RootStackParamList } from "../types";

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Onboarding">;
};

const { width, height } = Dimensions.get("window");

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    {
      title: "Welcome!",
      subtitle: "සාදරයෙන් පිළිගනිමු!",
      description: "A communication app for deaf children and parents",
      emoji: "👋",
    },
    {
      title: "Easy Communication",
      subtitle: "පහසු සන්නිවේදනය",
      description: "Use visual signs and simple sentences to communicate",
      emoji: "🤝",
    },
    {
      title: "Sign Language Support",
      subtitle: "සංඥා භාෂා සහාය",
      description: "Learn and practice sign language together",
      emoji: "👐",
    },
    {
      title: "Child-Parent Communication Mode",
      subtitle: "දරු-මාපිය සන්නිවේදන ප්‍රකාරය",
      description: "Communicate easily using visual signs and simple sentences",
      features: [
        "Sinhala based",
        "Parent-Child",
        "Sign-text Communication",
        "Daily words",
      ],
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigation.navigate("SelectionMode");
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSkip = () => {
    navigation.navigate("SelectionMode");
  };

  const currentPageData = pages[currentPage];

  return (
    <LinearGradient
      colors={["#00CED1", "#87CEEB", "#B0E0E6"]}
      style={styles.container}
    >
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{currentPageData.emoji}</Text>
        </View>

        {currentPage < 3 ? (
          <>
            <Text style={styles.title}>{currentPageData.title}</Text>
            <Text style={styles.subtitle}>{currentPageData.subtitle}</Text>
            <Text style={styles.description}>
              {currentPageData.description}
            </Text>
          </>
        ) : (
          <>
            <View style={styles.familyImageContainer}>
              <View style={styles.familyPlaceholder}>
                <Text style={styles.familyEmoji}>👨‍👩‍👦</Text>
              </View>
            </View>

            <Text style={styles.finalTitle}>
              Child-Parent{"\n"}Communication Mode
            </Text>
            <Text style={styles.finalSubtitle}>
              Communicate easily using visual{"\n"}signs and simple sentences
            </Text>

            <View style={styles.tagsContainer}>
              {currentPageData.features?.map((feature, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{feature}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentPage && styles.activeDot]}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {currentPage > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            currentPage === 0 && styles.nextButtonFull,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentPage === pages.length - 1 ? "Get Started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 5,
    paddingBottom: 50,
    paddingHorizontal: 10,
  },
  skipButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 50,
  },
  skipText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  emoji: {
    fontSize: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  familyImageContainer: {
    marginBottom: 30,
  },
  familyPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  familyEmoji: {
    fontSize: 80,
  },
  finalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 15,
  },
  finalSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "500",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: COLORS.white,
    width: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "600",
  },
  nextButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default OnboardingScreen;
