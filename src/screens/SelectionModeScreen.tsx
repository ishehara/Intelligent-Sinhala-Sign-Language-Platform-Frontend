import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";
import { RootStackParamList } from "../types";

type SelectionModeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "SelectionMode">;
};

const { width, height } = Dimensions.get("window");

const SelectionModeScreen: React.FC<SelectionModeScreenProps> = ({
  navigation,
}) => {
  const handleChildMode = () => {
    navigation.navigate("ChildHome");
  };

  const handleParentMode = () => {
    navigation.navigate("ParentHome");
  };

  return (
    <LinearGradient
      colors={["#87CEEB", "#9BAD7D", "#76B5B9"]}
      style={styles.container}
    >
      <Text style={styles.title}>දරුවා සහ දෙමවුපියන් </Text>
      <Text style={styles.subtitle}>තේරීම් ආකාර</Text>

      <View style={styles.optionsContainer}>
        {/* Child Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleChildMode}
          activeOpacity={0.8}
        >
          <View
            style={[styles.avatarCircle, { backgroundColor: COLORS.white }]}
          >
            <Text style={styles.avatar}>😊</Text>
          </View>
          <View style={styles.optionButton}>
            <Text style={styles.optionText}>දරුවා</Text>
          </View>
        </TouchableOpacity>

        {/* Parent Option */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={handleParentMode}
          activeOpacity={0.8}
        >
          <View
            style={[styles.avatarCircle, { backgroundColor: COLORS.white }]}
          >
            <Text style={styles.avatar}>👨‍👩‍👦</Text>
          </View>
          <View style={[styles.optionButton, { backgroundColor: "#6495ED" }]}>
            <Text style={styles.optionText}>දෙමාපියන්</Text>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginTop: 50,
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.white,
    textAlign: "center",
    marginTop: -50,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
    marginBottom: 50,
  },
  optionCard: {
    alignItems: "center",
    gap: 20,
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    fontSize: 70,
  },
  optionButton: {
    backgroundColor: COLORS.childMode,
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  optionText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default SelectionModeScreen;
