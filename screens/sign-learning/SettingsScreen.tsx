/**
 * SettingsScreen - App settings & configuration
 */

import { SignLearningHeader } from "@/components/common/SignLearningHeader";
import { API_BASE_URL } from "@/config/Sign-Learning/api.config";
import React, { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SettingsScreen = () => {
  const [autoCapture, setAutoCapture] = useState(true);
  const [captureInterval, setCaptureInterval] = useState("800");
  const [useEnhancedPreprocessing, setUseEnhancedPreprocessing] =
    useState(true);
  const [useFrontCamera, setUseFrontCamera] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [serverUrl, setServerUrl] = useState(API_BASE_URL);

  const resetRLAgent = async () => {
    Alert.alert(
      "Reset RL Agent",
      "This will reset the learning agent. Your progress data will be kept, but the AI will restart learning your preferences.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            Alert.alert("Done", "RL Agent has been reset.");
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>

        {/* Camera Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Camera Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Auto Capture</Text>
              <Text style={styles.settingDesc}>
                Automatically capture frames for prediction
              </Text>
            </View>
            <Switch
              value={autoCapture}
              onValueChange={setAutoCapture}
              trackColor={{ false: "#D1D5DB", true: "#99F6E4" }}
              thumbColor={autoCapture ? "#0D9488" : "#9CA3AF"}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Default Front Camera</Text>
              <Text style={styles.settingDesc}>
                Start with front-facing camera
              </Text>
            </View>
            <Switch
              value={useFrontCamera}
              onValueChange={setUseFrontCamera}
              trackColor={{ false: "#D1D5DB", true: "#99F6E4" }}
              thumbColor={useFrontCamera ? "#0D9488" : "#9CA3AF"}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Capture Interval (ms)</Text>
              <Text style={styles.settingDesc}>Time between auto-captures</Text>
            </View>
            <TextInput
              style={styles.numInput}
              value={captureInterval}
              onChangeText={setCaptureInterval}
              keyboardType="numeric"
              placeholder="800"
            />
          </View>
        </View>

        {/* AI Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧠 AI Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Enhanced Preprocessing</Text>
              <Text style={styles.settingDesc}>
                CLAHE + white balance for better accuracy
              </Text>
            </View>
            <Switch
              value={useEnhancedPreprocessing}
              onValueChange={setUseEnhancedPreprocessing}
              trackColor={{ false: "#D1D5DB", true: "#99F6E4" }}
              thumbColor={useEnhancedPreprocessing ? "#0D9488" : "#9CA3AF"}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Show Debug Info</Text>
              <Text style={styles.settingDesc}>
                Display prediction details and confidence scores
              </Text>
            </View>
            <Switch
              value={showDebugInfo}
              onValueChange={setShowDebugInfo}
              trackColor={{ false: "#D1D5DB", true: "#99F6E4" }}
              thumbColor={showDebugInfo ? "#0D9488" : "#9CA3AF"}
            />
          </View>

          <TouchableOpacity style={styles.dangerBtn} onPress={resetRLAgent}>
            <Text style={styles.dangerBtnText}>🔄 Reset RL Agent</Text>
          </TouchableOpacity>
        </View>

        {/* Server */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Server Configuration</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingLabel}>Backend URL</Text>
              <Text style={styles.settingDesc}>API server address</Text>
            </View>
          </View>
          <TextInput
            style={styles.urlInput}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://192.168.1.100:5000"
            autoCapitalize="none"
          />
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <Text style={styles.aboutText}>
            Adaptive Sinhala Sign Language Learning System{"\n"}
            Using Reinforcement Learning & AI-based Sign Recognition
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
      <SignLearningHeader activeTab="settings" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 20 },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    paddingVertical: 16,
  },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 14,
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingLeft: { flex: 1, marginRight: 12 },
  settingLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  settingDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  numInput: {
    width: 70,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    textAlign: "center",
    fontSize: 15,
    color: "#111827",
  },
  urlInput: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#111827",
    marginTop: 4,
  },

  dangerBtn: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  dangerBtnText: { fontSize: 15, fontWeight: "600", color: "#DC2626" },

  aboutText: { fontSize: 13, color: "#6B7280", lineHeight: 20 },
  versionText: { fontSize: 12, color: "#9CA3AF", marginTop: 8 },
});

export default SettingsScreen;
