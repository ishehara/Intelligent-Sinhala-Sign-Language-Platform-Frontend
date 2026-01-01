import { AlertDetailsModal } from '@/components/sound-alert/AlertDetailsModal';
import { AlertListItem } from '@/components/sound-alert/AlertListItem';
import { MonitoringStatusCard } from '@/components/sound-alert/MonitoringStatusCard';
import { SoundAlertBottomNav } from '@/components/sound-alert/SoundAlertBottomNav';
import { StatsCard } from '@/components/sound-alert/StatsCard';
import { Alert, AlertSeverity, MonitoringStats } from '@/types/sound-alert';
import { getTimeAgo, mockAlerts } from '@/utils/sound-alert-utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';

export default function SoundMonitoringScreen() {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | AlertSeverity>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const filteredAlerts = selectedFilter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.severity === selectedFilter);

  const stats: MonitoringStats = {
    isActive: isMonitoring,
    alertsToday: 12,
    lastAlert: alerts.length > 0 
      ? {
          type: 'Car horn',
          timeAgo: getTimeAgo(alerts[0].timestamp),
        }
      : null,
    activeSounds: 5,
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00BCD4']} />
        }
      >
        {/* Monitoring Status */}
        <MonitoringStatusCard isActive={isMonitoring} onToggle={toggleMonitoring} />

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
            style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, selectedFilter === 'high' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('high')}
          >
            <Text style={[styles.filterText, selectedFilter === 'high' && styles.filterTextActive]}>High</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, selectedFilter === 'medium' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('medium')}
          >
            <Text style={[styles.filterText, selectedFilter === 'medium' && styles.filterTextActive]}>Medium</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, selectedFilter === 'low' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('low')}
          >
            <Text style={[styles.filterText, selectedFilter === 'low' && styles.filterTextActive]}>Low</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Recent Alerts Section */}
        <View style={styles.alertsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            {filteredAlerts.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <AlertListItem key={alert.id} alert={alert} onPress={() => handleAlertPress(alert)} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color="#CCC" />
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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
    backgroundColor: 'white',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  alertsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearAllText: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
});
