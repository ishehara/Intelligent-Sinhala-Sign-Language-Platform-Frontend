import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS } from '../../constants/colors';

interface LevelCardProps {
  title: string;
  description: string;
  progress: number;
  unlocked: boolean;
  onPress?: () => void;
  levelEmoji?: string;
}

export const LevelCard = ({
  title,
  description,
  progress,
  unlocked,
  onPress,
  levelEmoji = '🌟',
}: LevelCardProps) => {
  // Dynamic colors based on unlock status and progress
  const getProgressColor = () => {
    if (!unlocked) return '#E0E0E0';
    if (progress >= 75) return '#10B981'; // Green
    if (progress >= 50) return '#F59E0B'; // Amber
    if (progress >= 25) return '#3B82F6'; // Blue
    return COLORS.PRIMARY;
  };

  const getCardBgColor = () => {
    if (!unlocked) return '#F5F5F5';
    if (progress >= 75) return '#ECFDF5';
    if (progress >= 50) return '#FFFBEB';
    return '#F0F9FF';
  };

  const getBadgeColor = () => {
    if (!unlocked) return '#9CA3AF';
    if (progress >= 75) return '#10B981';
    if (progress >= 50) return '#F59E0B';
    return COLORS.PRIMARY;
  };

  const getBadgeEmoji = () => {
    if (!unlocked) return '🔒';
    if (progress >= 75) return '⭐';
    if (progress >= 50) return '🔥';
    return '📚';
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: getCardBgColor() }]}
      onPress={onPress}
      disabled={!unlocked}
      activeOpacity={unlocked ? 0.85 : 1}
    >
      {/* Top Gradient Accent */}
      <View
        style={[
          styles.cardAccent,
          { backgroundColor: unlocked ? COLORS.PRIMARY + '20' : '#E0E0E0' + '20' },
        ]}
      />

      {/* Header Row with Emoji */}
      <View style={styles.cardHeader}>
        <View style={styles.titleLeftSection}>
          <Text style={styles.levelEmoji}>{levelEmoji}</Text>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getBadgeColor() },
          ]}
        >
          <Text style={styles.badgeEmoji}>{getBadgeEmoji()}</Text>
          <Text style={styles.statusText}>
            {unlocked ? 'OPEN' : 'LOCKED'}
          </Text>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>📊 Progress</Text>
          <View style={styles.progressPercentageContainer}>
            <Text style={[styles.progressText, { color: getProgressColor() }]}>
              {progress}%
            </Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
      </View>

      {/* Button */}
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: unlocked ? getProgressColor() : '#D1D5DB',
          },
        ]}
        disabled={!unlocked}
        onPress={onPress}
        activeOpacity={unlocked ? 0.8 : 1}
      >
        <Text style={styles.buttonEmoji}>
          {unlocked ? '▶️' : '🔒'}
        </Text>
        <Text style={styles.buttonText}>
          {unlocked ? 'Continue' : 'Locked'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cardAccent: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    zIndex: 1,
  },
  titleLeftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  levelEmoji: {
    fontSize: 28,
    marginRight: 10,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.MUTED,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  progressContainer: {
    marginBottom: 18,
    zIndex: 1,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  progressPercentageContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  progressText: {
    fontSize: 15,
    fontWeight: '800',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonEmoji: {
    fontSize: 18,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
