import { AlertSeverity } from '@/types/sound-alert';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertBannerProps {
  vehicleType: string;
  priority: AlertSeverity;
  emoji: string;
  onDismiss: () => void;
  onTap: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  vehicleType,
  priority,
  emoji,
  onDismiss,
  onTap,
}) => {
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Slide down animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto-dismiss logic
    let dismissTimer: ReturnType<typeof setTimeout>;
    if (priority === 'medium') {
      dismissTimer = setTimeout(() => {
        handleDismiss();
      }, 7000);
    } else if (priority === 'low') {
      dismissTimer = setTimeout(() => {
        handleDismiss();
      }, 5000);
    }

    return () => {
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return '#E74C3C';
      case 'medium':
        return '#F39C12';
      case 'low':
        return '#27AE60';
    }
  };

  const getPriorityText = () => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
          borderLeftColor: getPriorityColor(),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.bannerContent}
        onPress={onTap}
        activeOpacity={0.8}
      >
        {/* Left Section */}
        <View style={styles.leftSection}>
          <View style={[styles.urgencyDot, { backgroundColor: getPriorityColor() }]} />
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        {/* Center Section */}
        <View style={styles.centerSection}>
          <Text style={styles.title}>{vehicleType} Horn Detected</Text>
          <Text style={styles.subtitle}>
            {getPriorityText()} Priority • Now
          </Text>
          <Text style={styles.indicators}>📳 Vibrating | 💡 Flash Active</Text>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          <Text style={styles.tapText}>Tap for{'\n'}details →</Text>
        </View>
      </TouchableOpacity>

      {/* Dismiss Button */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={handleDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={20} color="#666" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 10,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderLeftWidth: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
    zIndex: 1000,
  },
  bannerContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  urgencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  emoji: {
    fontSize: 32,
  },
  centerSection: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  indicators: {
    fontSize: 11,
    color: '#00A8B5',
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  tapText: {
    fontSize: 11,
    color: '#00A8B5',
    fontWeight: '600',
    textAlign: 'right',
  },
  dismissButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});
