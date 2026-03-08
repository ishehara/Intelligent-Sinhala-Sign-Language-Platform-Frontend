import { AlertDetailsModal } from "@/components/sound-alert/AlertDetailsModal";
import { AlertListItem } from "@/components/sound-alert/AlertListItem";
import { MonitoringStatusCard } from "@/components/sound-alert/MonitoringStatusCard";
import { SoundAlertBottomNav } from "@/components/sound-alert/SoundAlertBottomNav";
import { StatsCard } from "@/components/sound-alert/StatsCard";
import {
  soundAlertService,
  SoundPrediction,
} from "@/services/soundAlertService";
import { Alert, AlertSeverity, MonitoringStats } from "@/types/sound-alert";
import {
  DEFAULT_SETTINGS,
  isAlertTypeEnabled,
  loadSettings,
  SoundAlertSettings,
} from "@/utils/sound-alert-settings";
import { getTimeAgo } from "@/utils/sound-alert-utils";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

const ALERTS_STORAGE_KEY = "sound_alerts_history";

export default function SoundMonitoringScreen() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | AlertSeverity>(
    "all",
  );
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "unchecked" | "online" | "offline"
  >("unchecked");
  // Tier 1 — full-screen emergency overlay (must dismiss manually)
  const [emergencyAlert, setEmergencyAlert] = useState<{
    title: string;
    emoji: string;
    priority: AlertSeverity;
  } | null>(null);
  // Tier 2 — auto-dismiss banner (general sounds)
  const [bannerAlert, setBannerAlert] = useState<{
    title: string;
    emoji: string;
  } | null>(null);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Consecutive car-horn counter — require 2 back-to-back detections to avoid false positives
  const carHornCount = useRef(0);
  // Settings
  const [settings, setSettings] =
    useState<SoundAlertSettings>(DEFAULT_SETTINGS);
  // Screen flash animation
  const flashAnim = useRef(new Animated.Value(0)).current;

  // ── Load persisted alerts on mount ─────────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem(ALERTS_STORAGE_KEY).then((stored) => {
      if (stored) {
        const parsed: Alert[] = JSON.parse(stored).map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp),
        }));
        setAlerts(parsed);
      }
    });
  }, []);

  // ── Reload settings whenever the screen comes into focus ─────────────────────
  useFocusEffect(
    useCallback(() => {
      loadSettings().then(setSettings);
    }, []),
  );

  // ── Persist alerts whenever they change ──────────────────────────────────
  useEffect(() => {
    AsyncStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
  }, [alerts]);

  // ── Backend connectivity check ────────────────────────────────────────────
  useEffect(() => {
    soundAlertService
      .checkBackendHealth()
      .then(({ reachable, modelLoaded }) => {
        setBackendStatus(reachable && modelLoaded ? "online" : "offline");
      });
  }, []);

  // ── Start / stop real ML detection when monitoring or soundDetection setting changes ──
  useEffect(() => {
    if (isMonitoring && backendStatus === "online" && settings.soundDetection) {
      soundAlertService
        .startContinuousDetection(handleMLDetection)
        .catch(() => {});
    } else {
      soundAlertService.stopDetection();
    }
    return () => {
      soundAlertService.stopDetection();
    };
  }, [isMonitoring, backendStatus, settings.soundDetection]);

  const handleMLDetection = (prediction: SoundPrediction) => {
    // Respect alert type settings
    if (!isAlertTypeEnabled(prediction.predicted_class, settings)) {
      console.log(
        `⏭️ Skipping ${prediction.predicted_class} — disabled in settings`,
      );
      return;
    }

    // Car horn debounce: require 2 consecutive detections before triggering
    if (prediction.predicted_class === "car horns") {
      carHornCount.current += 1;
      if (carHornCount.current < 2) {
        console.log(
          `🚗 Car horn #${carHornCount.current} — waiting for confirmation...`,
        );
        return;
      }
      carHornCount.current = 0; // confirmed — reset and proceed
    } else {
      carHornCount.current = 0; // reset on any non-car-horn detection
    }

    // "traffic"/"loudspeaker" is frequently triggered by background noise (AC, fan, room noise).
    // Add it silently to the list as "Ambient Sound" — no banner, no vibration.
    if (
      prediction.predicted_class === "traffic" ||
      prediction.predicted_class === "loudspeaker"
    ) {
      const ambientAlert: Alert = {
        id: Date.now().toString(),
        type: "loudspeaker",
        title: "Ambient Sound",
        icon: "🔉",
        severity: "low",
        timestamp: new Date(),
      };
      setAlerts((prev) => [ambientAlert, ...prev]);
      return;
    }

    const priorityMap: Record<string, AlertSeverity> = {
      "car horns": "medium",
      "motorcycle horns": "medium",
      "truck horns": "high",
      "train horns": "high",
      "bus horns": "high",
      horn: "low",
      siren: "high",
      // Emergency classes — always high
      "ambulance-siren": "high",
      "fire-alarm": "high",
      ambulance: "high",
      firetruck: "high",
      police: "high",
      train: "high",
      truck: "high",
      bus: "high",
    };
    const priority: AlertSeverity =
      priorityMap[prediction.predicted_class] ?? "medium";
    triggerAlert(
      prediction.vehicleType,
      priority,
      prediction.emoji,
      prediction.confidence,
      prediction.predicted_class,
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const toggleMonitoring = () => {
    Vibration.vibrate(50);
    setIsMonitoring(!isMonitoring);
  };

  const handleAlertPress = (alert: Alert) => {
    setSelectedAlert(alert);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAlert(null);
  };

  const EMERGENCY_CLASSES = [
    "ambulance-siren",
    "fire-alarm",
    "train horns",
    "truck horns",
    "bus horns",
    "ambulance",
    "firetruck",
    "police",
    "train",
    "truck",
    "bus",
  ];

  const triggerAlert = (
    vehicleType: string,
    priority: AlertSeverity,
    emoji: string,
    mlConfidence?: number,
    predicted_class?: string,
  ) => {
    const confidence =
      mlConfidence != null
        ? Math.round(mlConfidence * 100)
        : Math.floor(Math.random() * 16) + 85;

    const EMERGENCY_TYPES = ["Ambulance", "Police", "Firetruck", "Emergency"];
    const title = EMERGENCY_TYPES.includes(vehicleType)
      ? `${vehicleType} Detected`
      : `${vehicleType} Horn Detected`;

    // Add to alerts list
    const newAlert: Alert = {
      id: Date.now().toString(),
      type: `${vehicleType.toLowerCase()}-horn` as any,
      title,
      icon: emoji,
      severity: priority,
      timestamp: new Date(),
    };
    setAlerts((prev) => [newAlert, ...prev]);

    const isEmergency = predicted_class
      ? EMERGENCY_CLASSES.includes(predicted_class)
      : priority === "high";

    // Screen flash
    if (settings.screenFlash) {
      const flashColor = isEmergency ? 1 : 0.5;
      flashAnim.setValue(flashColor);
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }

    if (!settings.showBanners) return; // alert is already in the list; just skip visual overlay

    if (isEmergency) {
      // Tier 1 — continuous strong vibration until user dismisses
      if (settings.vibration) Vibration.vibrate([0, 500, 200], true);
      setEmergencyAlert({ title, emoji, priority });
    } else {
      // Tier 2 — short light cut pattern
      if (settings.vibration) Vibration.vibrate([0, 80, 60, 80, 60, 80]);
      if (bannerTimer.current) clearTimeout(bannerTimer.current);
      setBannerAlert({ title, emoji });
      bannerTimer.current = setTimeout(() => setBannerAlert(null), 3500);
    }
  };

  const filteredAlerts =
    selectedFilter === "all"
      ? alerts
      : alerts.filter((alert) => alert.severity === selectedFilter);

  const stats: MonitoringStats = {
    isActive: isMonitoring,
    alertsToday: alerts.length,
    lastAlert:
      alerts.length > 0
        ? {
            type: alerts[0].title,
            timeAgo: getTimeAgo(alerts[0].timestamp),
          }
        : null,
    activeSounds: alerts.filter((a) => a.severity === "high").length,
  };

  return (
    <View style={styles.container}>
      {/* Screen flash overlay — sits above everything, animates out */}
      <Animated.View
        pointerEvents="none"
        style={[styles.screenFlash, { opacity: flashAnim }]}
      />

      {/* Tier 1 — Emergency full-screen overlay */}
      <Modal visible={!!emergencyAlert} transparent animationType="fade">
        <View style={styles.emergencyOverlay}>
          <Text style={styles.emergencyEmoji}>{emergencyAlert?.emoji}</Text>
          <Text style={styles.emergencyTitle}>{emergencyAlert?.title}</Text>
          <View
            style={[
              styles.priorityBadge,
              emergencyAlert?.priority === "high"
                ? styles.priorityHigh
                : emergencyAlert?.priority === "medium"
                  ? styles.priorityMedium
                  : styles.priorityLow,
            ]}
          >
            <Text style={styles.priorityBadgeText}>
              {(emergencyAlert?.priority ?? "high").toUpperCase()} PRIORITY
            </Text>
          </View>
          <TouchableOpacity
            style={styles.emergencyDismiss}
            onPress={() => {
              Vibration.cancel();
              setEmergencyAlert(null);
            }}
          >
            <Text style={styles.emergencyDismissText}>DISMISS</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Tier 2 — Auto-dismiss banner */}
      {bannerAlert && (
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerEmoji}>{bannerAlert.emoji}</Text>
          <Text style={styles.bannerTitle}>{bannerAlert.title}</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#00BCD4"]}
          />
        }
      >
        {/* Monitoring Status */}
        <MonitoringStatusCard
          isActive={isMonitoring}
          onToggle={toggleMonitoring}
        />

        {/* ML Backend Status */}
        <View style={styles.mlCard}>
          <View style={styles.mlHeader}>
            <View style={styles.mlTitleRow}>
              <Text style={styles.mlTitle}>🤖 ML Detection</Text>
              <View
                style={[
                  styles.statusDot,
                  backendStatus === "online"
                    ? styles.dotOnline
                    : backendStatus === "offline"
                      ? styles.dotOffline
                      : styles.dotUnchecked,
                ]}
              />
              <Text style={styles.statusText}>
                {backendStatus === "online"
                  ? "Backend Online"
                  : backendStatus === "offline"
                    ? "Backend Offline"
                    : "Checking..."}
              </Text>
            </View>
          </View>
          {backendStatus === "offline" && (
            <Text style={styles.mlOfflineHint}>
              Backend is offline. Start the backend server to enable detection.
            </Text>
          )}
          {isMonitoring && backendStatus === "online" && (
            <Text style={styles.mlActiveHint}>
              🎤 Listening via microphone... (2.5s recording cycles)
            </Text>
          )}
        </View>

        {/* Stats Card */}
        <StatsCard
          alertsToday={stats.alertsToday}
          lastAlert={stats.lastAlert}
          activeSounds={stats.activeSounds}
        />

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "all" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "all" && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "high" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter("high")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "high" && styles.filterTextActive,
              ]}
            >
              High
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "medium" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter("medium")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "medium" && styles.filterTextActive,
              ]}
            >
              Medium
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === "low" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedFilter("low")}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === "low" && styles.filterTextActive,
              ]}
            >
              Low
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Recent Alerts Section */}
        <View style={styles.alertsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            {filteredAlerts.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setAlerts([]);
                  AsyncStorage.removeItem(ALERTS_STORAGE_KEY);
                }}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <AlertListItem
                key={alert.id}
                alert={alert}
                onPress={() => handleAlertPress(alert)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color="#CCC"
              />
              <Text style={styles.emptyText}>No alerts found</Text>
              <Text style={styles.emptySubtext}>You're all caught up!</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <SoundAlertBottomNav />

      {/* Alert Details Modal */}
      <AlertDetailsModal
        visible={modalVisible}
        alert={selectedAlert}
        onClose={closeModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  screenFlash: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#E74C3C",
    zIndex: 999,
  },
  // Tier 1 emergency overlay
  emergencyOverlay: {
    flex: 1,
    backgroundColor: "#C0392B",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emergencyEmoji: {
    fontSize: 100,
    marginBottom: 24,
  },
  emergencyTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 20,
  },
  priorityBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 40,
  },
  priorityHigh: { backgroundColor: "rgba(0,0,0,0.3)" },
  priorityMedium: { backgroundColor: "rgba(243,156,18,0.8)" },
  priorityLow: { backgroundColor: "rgba(39,174,96,0.8)" },
  priorityBadgeText: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 2,
  },
  emergencyDismiss: {
    backgroundColor: "white",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emergencyDismissText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#C0392B",
    letterSpacing: 2,
  },
  // Tier 2 banner
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: "#F39C12",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingTop: 50,
    gap: 12,
  },
  bannerEmoji: {
    fontSize: 28,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  notificationBadge: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  filterContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterChipActive: {
    backgroundColor: "#00BCD4",
    borderColor: "#00BCD4",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "white",
  },
  alertsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  clearAllText: {
    fontSize: 14,
    color: "#00BCD4",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#CCC",
    marginTop: 4,
  },
  testSection: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  testButtons: {
    flexDirection: "row",
    gap: 12,
  },
  testButton: {
    backgroundColor: "#00A8B5",
    borderRadius: 8,
    padding: 12,
    minWidth: 100,
    alignItems: "center",
    marginRight: 12,
  },
  testButtonEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  testButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  testButtonPriority: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
  },
  // ML Backend Card
  mlCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#00BCD4",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  mlHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mlTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mlTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: { backgroundColor: "#27AE60" },
  dotOffline: { backgroundColor: "#E74C3C" },
  dotUnchecked: { backgroundColor: "#95A5A6" },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  mlToggleBtn: {
    backgroundColor: "#E0F7FA",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#00BCD4",
  },
  mlToggleBtnActive: {
    backgroundColor: "#00BCD4",
  },
  mlToggleBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#006064",
  },
  mlOfflineHint: {
    marginTop: 8,
    fontSize: 11,
    color: "#E74C3C",
    lineHeight: 15,
  },
  mlActiveHint: {
    marginTop: 6,
    fontSize: 11,
    color: "#27AE60",
    fontWeight: "500",
  },
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
});
