import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";
import { getCategoryItems } from "../constants/data";
import { CategoryItem, RootStackParamList } from "../types";

type ChildCategoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ChildCategory">;
  route: RouteProp<RootStackParamList, "ChildCategory">;
};

const { width } = Dimensions.get("window");

const ChildCategoryScreen: React.FC<ChildCategoryScreenProps> = ({
  navigation,
  route,
}) => {
  const { categoryName } = route.params;
  const items = getCategoryItems(categoryName);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const playAudio = async (audioSource: any) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(audioSource);
      setSound(newSound);
      await newSound.playAsync();
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const renderItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => playAudio(item.audio)}
      activeOpacity={0.8}
    >
      <View style={styles.itemIconContainer}>
        <Image
          source={item.icon}
          style={styles.itemImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.itemName}>{item.name}</Text>

      <Text style={styles.speaker}>🔊</Text>
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

          <Text style={styles.headerTitle}>{categoryName}</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.instruction}>තෝරන්න (Tap to hear)</Text>

          <FlatList
            data={items}
            renderItem={renderItem}
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
    backgroundColor: "rgba(226, 14, 14, 0.98)",
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

  contentContainer: {
    flex: 1,
    paddingTop: 10,
  },

  instruction: {
    fontSize: 18,
    color: COLORS.white,
    textAlign: "center",
    marginBottom: 15,
    fontStyle: "italic",
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

  itemCard: {
    width: (width - 60) / 2,
    height: 180,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  itemIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  itemImage: {
    width: 70,
    height: 70,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },

  speaker: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 20,
  },
});

export default ChildCategoryScreen;
