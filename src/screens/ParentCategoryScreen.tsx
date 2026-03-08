import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Audio, ResizeMode, Video } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";
import { getCategoryItems } from "../constants/data";
import { CategoryItem, RootStackParamList } from "../types";

type ParentCategoryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ParentCategory">;
  route: RouteProp<RootStackParamList, "ParentCategory">;
};

const { width, height } = Dimensions.get("window");

const ParentCategoryScreen: React.FC<ParentCategoryScreenProps> = ({
  navigation,
  route,
}) => {
  const { categoryName } = route.params;
  const items = getCategoryItems(categoryName);

  const [selectedItem, setSelectedItem] = useState<CategoryItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const videoRef = useRef<Video>(null);
  const [videoStatus, setVideoStatus] = useState<any>({});
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);

  /* ---------------- AUDIO ---------------- */

  const playAudio = async (audioSource: any) => {
    try {
      if (sound) await sound.unloadAsync();
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

  /* ---------------- VIDEO ---------------- */

  const openItem = async (item: CategoryItem) => {
    setSelectedItem(item);
    setModalVisible(true);
    await playAudio(item.audio);

    setTimeout(async () => {
      if (videoRef.current) {
        await videoRef.current.stopAsync();
        await videoRef.current.setPositionAsync(0);
        await videoRef.current.playAsync();
      }
    }, 300);
  };

  const closeModal = async () => {
    setModalVisible(false);
    setSelectedItem(null);
    setPlaybackRate(1.0);
    setIsLooping(false);

    if (videoRef.current) {
      await videoRef.current.stopAsync();
      await videoRef.current.setPositionAsync(0);
    }
  };

  const togglePlay = async () => {
    if (!videoRef.current) return;

    if (videoStatus.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.setPositionAsync(0);
      await videoRef.current.playAsync();
    }
  };

  const stopVideo = async () => {
    if (!videoRef.current) return;
    await videoRef.current.stopAsync();
    await videoRef.current.setPositionAsync(0);
  };

  const changeSpeed = async () => {
    const speeds = [0.5, 1.0, 1.5, 2.0];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);

    if (videoRef.current) {
      await videoRef.current.setRateAsync(next, true);
    }
  };

  const toggleLoop = async () => {
    const next = !isLooping;
    setIsLooping(next);

    if (videoRef.current) {
      await videoRef.current.setIsLoopingAsync(next);
    }
  };

  /* ---- STOP EVERYTHING WHEN LEAVING SCREEN ---- */
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", async () => {
      if (videoRef.current) {
        await videoRef.current.stopAsync();
        await videoRef.current.setPositionAsync(0);
      }
      if (sound) {
        await sound.unloadAsync();
      }
    });

    return unsubscribe;
  }, [navigation, sound]);

  /* ---------------- UI ---------------- */

  const renderItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity style={styles.itemCard} onPress={() => openItem(item)}>
      <View style={styles.itemIconContainer}>
        <Image
          source={item.icon}
          style={styles.itemImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.videoIcon}>🎥</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#2c3e50", "#4ca1af"]} style={styles.container}>
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

        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(i) => i.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Video Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
                <TouchableOpacity onPress={closeModal}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.videoContainer}>
                <Video
                  ref={videoRef}
                  style={styles.video}
                  source={selectedItem?.video}
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping={isLooping}
                  rate={playbackRate}
                  shouldPlay={false}
                  onPlaybackStatusUpdate={(s) =>
                    s.isLoaded && setVideoStatus(s)
                  }
                />
              </View>

              <View style={styles.controls}>
                <TouchableOpacity onPress={togglePlay}>
                  <Text style={styles.controlIcon}>
                    {videoStatus.isPlaying ? "⏸️" : "▶️"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={stopVideo}>
                  <Text style={styles.controlIcon}>⏹️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleLoop}>
                  <Text style={styles.controlIcon}>
                    {isLooping ? "🔁" : "➡️"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={changeSpeed}>
                  <Text style={styles.controlIcon}>⚡ {playbackRate}x</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

/* ---------------- STYLES ---------------- */

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
    color: COLORS.white,
    marginTop: 50,
  },

  listContainer: {
    padding: 10,
  },

  row: {
    justifyContent: "space-between",
  },

  itemCard: {
    width: (width - 60) / 2,
    height: 180,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  itemIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  itemImage: {
    width: 70,
    height: 70,
  },

  itemName: {
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.text,
  },

  videoIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    fontSize: 18,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "95%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 15,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },

  closeButton: {
    fontSize: 26,
  },

  videoContainer: {
    width: "100%",
    height: height * 0.4,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15,
  },

  controlIcon: {
    fontSize: 26,
  },
});

export default ParentCategoryScreen;
