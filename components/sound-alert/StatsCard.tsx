import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatsCardProps {
  alertsToday: number;
  lastAlert: {
    type: string;
    timeAgo: string;
  } | null;
  activeSounds: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  alertsToday, 
  lastAlert, 
  activeSounds 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.statRow}>
        <Ionicons name="notifications" size={16} color="#00BCD4" />
        <Text style={styles.statText}>Alerts Today: {alertsToday}</Text>
      </View>
      
      <View style={styles.statRow}>
        <Ionicons name="time" size={16} color="#00BCD4" />
        <Text style={styles.statText}>
          Last Alert: {lastAlert ? `${lastAlert.type} - ${lastAlert.timeAgo}` : 'None'}
        </Text>
      </View>
      
      <View style={styles.statRow}>
        <Ionicons name="stats-chart" size={16} color="#00BCD4" />
        <Text style={styles.statText}>Active Sounds: {activeSounds}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
});
