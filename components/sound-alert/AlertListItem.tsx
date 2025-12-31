import { Alert } from '@/types/sound-alert';
import { getSeverityColor, getTimeAgo } from '@/utils/sound-alert-utils';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertListItemProps {
  alert: Alert;
  onPress: () => void;
}

export const AlertListItem: React.FC<AlertListItemProps> = ({ alert, onPress }) => {
  const severityColor = getSeverityColor(alert.severity);
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{alert.icon}</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.timestamp}>{getTimeAgo(alert.timestamp)}</Text>
      </View>
      
      <View style={[styles.indicator, { backgroundColor: severityColor }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
