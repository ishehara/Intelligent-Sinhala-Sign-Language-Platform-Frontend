import { SoundAlertBottomNav } from "@/components/sound-alert/SoundAlertBottomNav";
import {
    DEFAULT_SETTINGS,
    loadSettings,
    saveSettings,
    SoundAlertSettings,
} from "@/utils/sound-alert-settings";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function SoundAlertSettingsScreen() {
  const [settings, setSettings] =
    useState<SoundAlertSettings>(DEFAULT_SETTINGS);

  // Load persisted settings on mount
  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  // Helper: update a top-level boolean field and persist
  const toggle = (field: keyof Omit<SoundAlertSettings, "alertTypes">) => {
    setSettings((prev) => {
      const next = { ...prev, [field]: !prev[field] };
      saveSettings(next);
      return next;
    });
  };

  // Helper: update an alertTypes boolean field and persist
  const toggleType = (field: keyof SoundAlertSettings["alertTypes"]) => {
    setSettings((prev) => {
      const next = {
        ...prev,
        alertTypes: { ...prev.alertTypes, [field]: !prev.alertTypes[field] },
      };
      saveSettings(next);
      return next;
    });
  };

  const sw = (value: boolean, onToggle: () => void) => (
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: "#D1D1D6", true: "#00A8B5" }}
      thumbColor="#fff"
    />
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Monitoring */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Monitoring</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Sound Detection</Text>
            {sw(settings.soundDetection, () => toggle("soundDetection"))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Alert Types */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Alert Types</Text>
          <Text style={styles.sectionNote}>
            Emergency sirens are always active for your safety.
          </Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🚗 Car Horns</Text>
            {sw(settings.alertTypes.carHorns, () => toggleType("carHorns"))}
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🚌 Bus Horns</Text>
            {sw(settings.alertTypes.busHorns, () => toggleType("busHorns"))}
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🚛 Truck Horns</Text>
            {sw(settings.alertTypes.truckHorns, () => toggleType("truckHorns"))}
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🚂 Train Horns</Text>
            {sw(settings.alertTypes.trainHorns, () => toggleType("trainHorns"))}
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🏍️ Motorcycle Horns</Text>
            {sw(settings.alertTypes.motorcycleHorns, () =>
              toggleType("motorcycleHorns"),
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Alert Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Alert Notifications</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>📳 Vibration Alerts</Text>
            {sw(settings.vibration, () => toggle("vibration"))}
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>💡 Screen Flash</Text>
            {sw(settings.screenFlash, () => toggle("screenFlash"))}
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🔔 Show Banners</Text>
            {sw(settings.showBanners, () => toggle("showBanners"))}
          </View>
        </View>
      </ScrollView>

      <SoundAlertBottomNav activeTab="settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  section: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    marginTop: 4,
  },
  sectionNote: {
    fontSize: 12,
    color: "#95A5A6",
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
  },
});
