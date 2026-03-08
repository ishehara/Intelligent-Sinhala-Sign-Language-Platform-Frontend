import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";
import { CATEGORIES } from "../constants/data";
import { RootStackParamList } from "../types";

type ParentHomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ParentHome">;
};

const { width } = Dimensions.get("window");

const ParentHomeScreen: React.FC<ParentHomeScreenProps> = ({ navigation }) => {
  const handleCategoryPress = (categoryName: string) => {
    navigation.navigate("ParentCategory", { categoryName });
  };

  const renderCategory = ({ item }: { item: (typeof CATEGORIES)[0] }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => handleCategoryPress(item.name)}
      activeOpacity={0.85}
    >
      <View style={styles.categoryIconContainer}>
        <Text style={styles.categoryIcon}>
          {item.name === "කෑම" && "🍽️"}
          {item.name === "බීම" && "🥤"}
          {item.name === "ලෙඩ" && "🤒"}
          {item.name === "වැසිකිලිය" && "🚽"}
          {item.name === "ක්‍රියා පද" && "🏃"}
        </Text>
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#2c3e50", "#4ca1af"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>දෙමාපියන්</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* AI Assessment Banner */}
        <TouchableOpacity
          style={styles.aiBanner}
          onPress={() => navigation.navigate("AIAssessment")}
          activeOpacity={0.9}
        >
          <View style={styles.aiBannerLeft}>
            <View style={styles.aiIconWrap}>
              <Text style={styles.aiIcon}>🤖</Text>
            </View>
            <View style={styles.aiBannerText}>
              <Text style={styles.aiBannerTitle}>AI හැසිරීම් ඇගයීම</Text>
              <Text style={styles.aiBannerSub}>
                ඔබගේ දරුවා සඳහා පුද්ගලික විශ්ලේෂණ ලබාගන්න
              </Text>
            </View>
          </View>
          <View style={styles.aiBannerArrow}>
            <Text style={styles.aiBannerArrowText}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerIcon}>ℹ️</Text>
          <Text style={styles.infoBannerText}>
            සංකේත භාෂා වීඩියෝ බැලීමට කොටස් මත තට්ටු කරන්න
          </Text>
        </View>

        {/* Categories */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>වර්ග තෝරන්න</Text>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.parentMode,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },

  backIcon: {
    fontSize: 22,
    color: COLORS.white,
    fontWeight: "bold",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "rgb(219, 215, 215, 0.9)",
    marginTop: 50,
    borderBlockColor: COLORS.white,
  },

  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#0D0D2B",
    elevation: 8,
  },

  aiBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },

  aiIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(108,99,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  aiIcon: {
    fontSize: 26,
  },

  aiBannerText: {
    flex: 1,
  },

  aiBannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 3,
  },

  aiBannerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "500",
  },

  aiBannerArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(108,99,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  aiBannerArrowText: {
    fontSize: 18,
    color: "#A89FFF",
    fontWeight: "bold",
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
  },

  infoBannerIcon: {
    fontSize: 24,
    marginRight: 10,
  },

  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: "#1976D2",
    fontWeight: "500",
  },

  contentContainer: {
    flex: 1,
    paddingTop: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 15,
    paddingHorizontal: 20,
  },

  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },

  row: {
    justifyContent: "space-between",
    marginBottom: 15,
    paddingHorizontal: 10,
  },

  categoryCard: {
    width: (width - 60) / 2,
    height: 160,
    borderRadius: 20,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  categoryIcon: {
    fontSize: 50,
  },

  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
});

export default ParentHomeScreen;
