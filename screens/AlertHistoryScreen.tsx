import { SoundAlertBottomNav } from '@/components/sound-alert/SoundAlertBottomNav';
import { AlertSeverity, AlertType } from '@/types/sound-alert';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HistoryAlert {
  id: number;
  type: AlertType;
  displayName: string;
  icon: string;
  time: string;
  severity: AlertSeverity;
  section: 'today' | 'yesterday' | 'thisWeek';
}

export default function AlertHistoryScreen() {
  const [showFilters, setShowFilters] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | null>(null);

  const alertHistory: HistoryAlert[] = [
    { id: 1, type: 'car-horn', displayName: 'Car Horn Detected', icon: '🚗', time: '2:54 PM', severity: 'medium', section: 'today' },
    { id: 2, type: 'bus-horn', displayName: 'Bus Horn Detected', icon: '🚌', time: '1:12 PM', severity: 'high', section: 'today' },
    { id: 3, type: 'train-horn', displayName: 'Train Passing', icon: '🚂', time: '3:42 PM', severity: 'high', section: 'yesterday' },
    { id: 4, type: 'fire-alarm', displayName: 'Fire Alarm Detected', icon: '🔥', time: '11:30 AM', severity: 'high', section: 'yesterday' },
    { id: 5, type: 'ambulance-siren', displayName: 'Siren Detected', icon: '🚑', time: '5:13 PM', severity: 'high', section: 'thisWeek' },
    { id: 6, type: 'motorcycle-horn', displayName: 'Motorcycle Horn Detected', icon: '🏍️', time: '9:02 AM', severity: 'low', section: 'thisWeek' },
  ];

  const alertTypeFilters = [
    { key: 'car-horn', label: 'Car', icon: 'car' },
    { key: 'bus-horn', label: 'Bus', icon: 'bus' },
    { key: 'train-horn', label: 'Train', icon: 'train' },
    { key: 'fire-alarm', label: 'Fire Alarm', icon: 'flame' },
    { key: 'ambulance-siren', label: 'Siren', icon: 'medical' },
  ];

  const toggleTypeFilter = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const filteredAlerts = alertHistory.filter(alert => {
    const typeMatch = selectedTypes.length === 0 || selectedTypes.some(type => alert.type === type);
    const severityMatch = !selectedSeverity || alert.severity === selectedSeverity;
    return typeMatch && severityMatch;
  });

  const todayAlerts = filteredAlerts.filter(a => a.section === 'today');
  const yesterdayAlerts = filteredAlerts.filter(a => a.section === 'yesterday');
  const thisWeekAlerts = filteredAlerts.filter(a => a.section === 'thisWeek');

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'high': return '#E74C3C';
      case 'medium': return '#F39C12';
      case 'low': return '#2ECC71';
    }
  };

  const renderAlertItem = (alert: HistoryAlert) => (
    <View key={alert.id} style={styles.alertItem}>
      <View style={[styles.iconContainer, { backgroundColor: `${getSeverityColor(alert.severity)}15` }]}>
        <Text style={styles.iconEmoji}>{alert.icon}</Text>
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertName}>{alert.displayName}</Text>
        <Text style={styles.alertSubtext}>{alert.displayName.split(' ')[0]}</Text>
      </View>
      <View style={styles.alertRight}>
        <Text style={styles.alertTime}>{alert.time}</Text>
        <View style={[styles.severityDot, { backgroundColor: getSeverityColor(alert.severity) }]} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filter Section */}
        {showFilters && (
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Last 7 Days</Text>
            
            {/* Alert Type Filters */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.typeFilterContainer}
            >
              {alertTypeFilters.map(filter => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.typeFilterChip,
                    selectedTypes.includes(filter.key) && styles.typeFilterChipActive
                  ]}
                  onPress={() => toggleTypeFilter(filter.key)}
                >
                  <Ionicons 
                    name={filter.icon as any} 
                    size={18} 
                    color={selectedTypes.includes(filter.key) ? 'white' : '#00BCD4'} 
                  />
                  <Text style={[
                    styles.typeFilterText,
                    selectedTypes.includes(filter.key) && styles.typeFilterTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Severity Filters */}
            <View style={styles.severityFilterContainer}>
              <TouchableOpacity
                style={[
                  styles.severityChip,
                  styles.severityHigh,
                  selectedSeverity === 'high' && styles.severityActive
                ]}
                onPress={() => setSelectedSeverity(selectedSeverity === 'high' ? null : 'high')}
              >
                <Text style={styles.severityText}>High</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.severityChip,
                  styles.severityMedium,
                  selectedSeverity === 'medium' && styles.severityActive
                ]}
                onPress={() => setSelectedSeverity(selectedSeverity === 'medium' ? null : 'medium')}
              >
                <Text style={styles.severityText}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.severityChip,
                  styles.severityLow,
                  selectedSeverity === 'low' && styles.severityActive
                ]}
                onPress={() => setSelectedSeverity(selectedSeverity === 'low' ? null : 'low')}
              >
                <Text style={styles.severityText}>Low</Text>
              </TouchableOpacity>
            </View>

            {/* Apply Filters Button */}
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        )}

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

        {filteredAlerts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyText}>No alerts found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
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
    backgroundColor: '#F5F5F5',
  },
  filterSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  typeFilterContainer: {
    marginBottom: 12,
  },
  typeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5F7',
    marginRight: 8,
    gap: 6,
  },
  typeFilterChipActive: {
    backgroundColor: '#00BCD4',
  },
  typeFilterText: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
  },
  typeFilterTextActive: {
    color: 'white',
  },
  severityFilterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  severityChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  severityHigh: {
    backgroundColor: '#FADBD8',
  },
  severityMedium: {
    backgroundColor: '#FCF3CF',
  },
  severityLow: {
    backgroundColor: '#D5F4E6',
  },
  severityActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#2C3E50',
  },
  severityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  applyButton: {
    backgroundColor: '#00BCD4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  alertSubtext: {
    fontSize: 12,
    color: '#95A5A6',
  },
  alertRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  alertTime: {
    fontSize: 13,
    color: '#95A5A6',
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
  },
});
