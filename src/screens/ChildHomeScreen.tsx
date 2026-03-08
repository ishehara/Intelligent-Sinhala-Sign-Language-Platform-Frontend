import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";
import { CATEGORIES } from "../constants/data";
import { RootStackParamList } from "../types";

type ChildHomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ChildHome">;
};

const { width, height } = Dimensions.get("window");

const ChildHomeScreen: React.FC<ChildHomeScreenProps> = ({ navigation }) => {
  const videoRef = useRef<Video>(null);

  const handleCategoryPress = (categoryName: string) => {
    if (videoRef.current) {
      videoRef.current.stopAsync();
    }
    navigation.navigate("ChildCategory", { categoryName });
  };

  const renderCategory = ({ item }: { item: (typeof CATEGORIES)[0] }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.color }]}
      onPress={() => handleCategoryPress(item.name)}
      activeOpacity={0.8}
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
    <LinearGradient
      colors={["#87CEEB", "#00CED1", "#48D1CC"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>දරුවා</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Video Banner */}
        <View style={styles.videoBanner}>
          <Video
            ref={videoRef}
            style={styles.video}
            source={require("../../assets/videos/category-instruction.mp4")}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            useNativeControls
          />
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
    backgroundColor: "rgba(230, 54, 54, 0.96)",
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
    color: COLORS.white,
    marginTop: 50,
  },

  placeholder: {
    width: 40,
  },

  videoBanner: {
    width: width,
    height: height * 0.25,
    backgroundColor: "#000",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  contentContainer: {
    flex: 1,
    paddingTop: 15,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(223, 222, 222, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  categoryIcon: {
    fontSize: 48,
  },

  categoryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },
});

export default ChildHomeScreen;
