import { SoundAlertBottomNav } from "@/components/sound-alert/SoundAlertBottomNav";
import { Alert, AlertSeverity } from "@/types/sound-alert";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const ALERTS_STORAGE_KEY = "sound_alerts_history";

// Map alert types to the filter keys used in this screen
const TYPE_FILTER_MAP: Record<string, string> = {
  "car-horn": "car-horn",
  "motorcycle-horn": "motorcycle-horn",
  "truck-horn": "truck-horn",
  "bus-horn": "bus-horn",
  "train-horn": "train-horn",
  "ambulance-siren": "ambulance-siren",
  "fire-alarm": "fire-alarm",
  loudspeaker: "loudspeaker",
};

function getSection(
  timestamp: Date,
): "today" | "yesterday" | "thisWeek" | null {
  const now = new Date();
  const alertDate = new Date(timestamp);
  const diffMs = now.getTime() - alertDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  const sameDay =
    alertDate.getDate() === now.getDate() &&
    alertDate.getMonth() === now.getMonth() &&
    alertDate.getFullYear() === now.getFullYear();

  if (sameDay) return "today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    alertDate.getDate() === yesterday.getDate() &&
    alertDate.getMonth() === yesterday.getMonth() &&
    alertDate.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "yesterday";
  if (diffDays <= 7) return "thisWeek";
  return null; // older than 7 days — skip
}

function formatTime(timestamp: Date): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AlertHistoryScreen() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] =
    useState<AlertSeverity | null>(null);

  // Reload from storage every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(ALERTS_STORAGE_KEY).then((stored) => {
        if (stored) {
          const parsed: Alert[] = JSON.parse(stored).map((a: any) => ({
            ...a,
            timestamp: new Date(a.timestamp),
          }));
          setAlerts(parsed);
        } else {
          setAlerts([]);
        }
      });
    }, []),
  );

  const alertTypeFilters = [
    { key: "ambulance-siren", label: "Ambulance", icon: "medkit" },
    { key: "fire-alarm", label: "Fire Alarm", icon: "flame" },
    { key: "train-horn", label: "Train", icon: "train" },
    { key: "truck-horn", label: "Truck", icon: "bus" },
    { key: "bus-horn", label: "Bus", icon: "bus" },
    { key: "car-horn", label: "Car", icon: "car" },
    { key: "motorcycle-horn", label: "Motorcycle", icon: "bicycle" },
  ];

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  // Exclude ambient-only entries (loudspeaker) from history view
  const historyAlerts = alerts.filter((a) => a.type !== "loudspeaker");

  const filteredAlerts = historyAlerts.filter((alert) => {
    const typeMatch =
      selectedTypes.length === 0 ||
      selectedTypes.includes(TYPE_FILTER_MAP[alert.type] ?? alert.type);
    const severityMatch =
      !selectedSeverity || alert.severity === selectedSeverity;
    return typeMatch && severityMatch;
  });

  const todayAlerts = filteredAlerts.filter(
    (a) => getSection(a.timestamp) === "today",
  );
  const yesterdayAlerts = filteredAlerts.filter(
    (a) => getSection(a.timestamp) === "yesterday",
  );
  const thisWeekAlerts = filteredAlerts.filter(
    (a) => getSection(a.timestamp) === "thisWeek",
  );

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "high":
        return "#E74C3C";
      case "medium":
        return "#F39C12";
      case "low":
        return "#2ECC71";
    }
  };

  const getSeverityLabel = (severity: AlertSeverity) =>
    severity.charAt(0).toUpperCase() + severity.slice(1);

  const renderAlertItem = (alert: Alert) => (
    <View key={alert.id} style={styles.alertItem}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${getSeverityColor(alert.severity)}15` },
        ]}
      >
        <Text style={styles.iconEmoji}>{alert.icon}</Text>
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertName}>{alert.title}</Text>
        <Text style={styles.alertSubtext}>
          {getSeverityLabel(alert.severity)} priority
        </Text>
      </View>
      <View style={styles.alertRight}>
        <Text style={styles.alertTime}>{formatTime(alert.timestamp)}</Text>
        <View
          style={[
            styles.severityBadge,
            { backgroundColor: getSeverityColor(alert.severity) },
          ]}
        >
          <Text style={styles.severityBadgeText}>
            {alert.severity.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );

  const totalFiltered =
    todayAlerts.length + yesterdayAlerts.length + thisWeekAlerts.length;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Last 7 Days</Text>

          {/* Alert Type Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeFilterContainer}
          >
            {alertTypeFilters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.typeFilterChip,
                  selectedTypes.includes(filter.key) &&
                    styles.typeFilterChipActive,
                ]}
                onPress={() => toggleTypeFilter(filter.key)}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={16}
                  color={
                    selectedTypes.includes(filter.key) ? "white" : "#00BCD4"
                  }
                />
                <Text
                  style={[
                    styles.typeFilterText,
                    selectedTypes.includes(filter.key) &&
                      styles.typeFilterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Severity Filters */}
          <View style={styles.severityFilterContainer}>
            {(["high", "medium", "low"] as AlertSeverity[]).map((sev) => (
              <TouchableOpacity
                key={sev}
                style={[
                  styles.severityChip,
                  sev === "high" && styles.severityHigh,
                  sev === "medium" && styles.severityMedium,
                  sev === "low" && styles.severityLow,
                  selectedSeverity === sev && styles.severityActive,
                ]}
                onPress={() =>
                  setSelectedSeverity(selectedSeverity === sev ? null : sev)
                }
              >
                <Text style={styles.severityText}>
                  {sev.charAt(0).toUpperCase() + sev.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Alert History List */}
        {todayAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayAlerts.map(renderAlertItem)}
          </View>
        )}

        {yesterdayAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yesterday</Text>
            {yesterdayAlerts.map(renderAlertItem)}
          </View>
        )}

        {thisWeekAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week</Text>
            {thisWeekAlerts.map(renderAlertItem)}
          </View>
        )}

        {totalFiltered === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color="#BDC3C7"
            />
            <Text style={styles.emptyText}>
              {historyAlerts.length === 0
                ? "No alerts yet"
                : "No alerts match your filters"}
            </Text>
            <Text style={styles.emptySubtext}>
              {historyAlerts.length === 0
                ? "Detections will appear here"
                : "Try clearing some filters"}
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <SoundAlertBottomNav activeTab="history" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  filterSection: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 12,
  },
  typeFilterContainer: {
    marginBottom: 12,
  },
  typeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E8F5F7",
    marginRight: 8,
    gap: 6,
  },
  typeFilterChipActive: {
    backgroundColor: "#00BCD4",
  },
  typeFilterText: {
    fontSize: 13,
    color: "#00BCD4",
    fontWeight: "500",
  },
  typeFilterTextActive: {
    color: "white",
  },
  severityFilterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  severityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  severityHigh: {
    backgroundColor: "#FADBD8",
  },
  severityMedium: {
    backgroundColor: "#FCF3CF",
  },
  severityLow: {
    backgroundColor: "#D5F4E6",
  },
  severityActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: "#2C3E50",
  },
  severityText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2C3E50",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconEmoji: {
    fontSize: 24,
  },
  alertContent: {
    flex: 1,
  },
  alertName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 2,
  },
  alertSubtext: {
    fontSize: 12,
    color: "#95A5A6",
  },
  alertRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  alertTime: {
    fontSize: 13,
    color: "#95A5A6",
  },
  severityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7F8C8D",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#95A5A6",
    textAlign: "center",
  },
});
