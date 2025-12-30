import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MonitoringStatusCardProps {
  isActive: boolean;
  onToggle?: () => void;
}

export const MonitoringStatusCard: React.FC<MonitoringStatusCardProps> = ({ isActive, onToggle }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
        <Animated.View 
          style={[
            styles.iconContainer, 
            isActive && styles.iconContainerActive,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <Ionicons 
            name={isActive ? "mic" : "mic-off"} 
            size={40} 
            color="white" 
          />
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.statusText}>
        {isActive ? 'Monitoring Active' : 'Monitoring Inactive'}
      </Text>
      <Text style={styles.tapHint}>Tap to {isActive ? 'pause' : 'start'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconContainerActive: {
    backgroundColor: '#00BCD4',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BCD4',
  },
  tapHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
