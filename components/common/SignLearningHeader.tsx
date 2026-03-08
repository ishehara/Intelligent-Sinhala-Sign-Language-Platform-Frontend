import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/colors";

type TabName = "home" | "rl-analysis" | "history" | "settings" | "profile";

interface SignLearningHeaderProps {
  activeTab?: TabName;
  onTabChange?: (tab: TabName) => void;
}

export const SignLearningHeader = ({
  activeTab = "home",
  onTabChange,
}: SignLearningHeaderProps) => {
  const router = useRouter();

  const handleTabPress = (tab: TabName) => {
    onTabChange?.(tab);

    // Navigation routes — use replace to avoid stacking screens
    switch (tab) {
      case "home":
        router.replace("/sign-learning" as any);
        break;
      case "rl-analysis":
        router.replace("/sign-learning/rl-analysis" as any);
        break;
      case "history":
        router.replace("/sign-learning/history" as any);
        break;
      case "settings":
        router.replace("/sign-learning/settings" as any);
        break;
      case "profile":
        router.replace("/sign-learning/profile" as any);
        break;
    }
  };

  const NavItem = ({
    tab,
    iconName,
    label,
  }: {
    tab: TabName;
    iconName: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
  }) => {
    const isActive = activeTab === tab;
    return (
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handleTabPress(tab)}
      >
        <Ionicons
          name={iconName}
          size={24}
          color={isActive ? COLORS.PRIMARY : "#999"}
        />
        <Text style={[styles.navText, !isActive && styles.navTextInactive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bottomNav}>
      <NavItem tab="home" iconName="home" label="Home" />
      <NavItem tab="rl-analysis" iconName="analytics" label="Analysis" />
      <NavItem tab="history" iconName="time" label="History" />
      <NavItem tab="settings" iconName="settings" label="Settings" />
      <NavItem tab="profile" iconName="person" label="Profile" />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 10,
    color: COLORS.PRIMARY,
    marginTop: 4,
    fontWeight: "500",
  },
  navTextInactive: {
    color: "#999",
    fontWeight: "500",
  },
});
