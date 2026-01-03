import { SignLearningHeader } from '@/components/common/SignLearningHeader';
import { COLORS } from '@/constants/colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignLearningLevelsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings' | 'profile'>('home');

  const levels = [
    {
      id: 1,
      title: 'Alphabet Basics',
      subtitle: 'Letters ඉ-ඔ (5 letters)',
      progress: 28,
      status: 'In Progress',
      unlocked: true,
      emoji: '⭐',
      statusColor: COLORS.PRIMARY,
      statusBgColor: '#E0F2F1',
      description: 'Master the foundation',
      letters: 5,
      completed: 2,
    },
    {
      id: 2,
      title: 'Consonant Quest',
      subtitle: 'Letters ක-ඩ (6 letters)',
      progress: 0,
      status: 'Locked',
      unlocked: false,
      emoji: '🔒',
      statusColor: '#9CA3AF',
      statusBgColor: '#F3F4F6',
      description: 'Challenge your skills',
      letters: 6,
      completed: 0,
    },
    {
      id: 3,
      title: 'Vowel Mastery',
      subtitle: 'Special vowels (4 letters)',
      progress: 0,
      status: 'Locked',
      unlocked: false,
      emoji: '🔒',
      statusColor: '#9CA3AF',
      statusBgColor: '#F3F4F6',
      description: 'Learn unique sounds',
      letters: 4,
      completed: 0,
    },
    {
      id: 4,
      title: 'Intermediate Fusion',
      subtitle: 'Complex combinations (7 letters)',
      progress: 0,
      status: 'Locked',
      unlocked: false,
      emoji: '🔒',
      statusColor: '#9CA3AF',
      statusBgColor: '#F3F4F6',
      description: 'Blend letters smoothly',
      letters: 7,
      completed: 0,
    },
    {
      id: 5,
      title: 'Advanced Patterns',
      subtitle: 'Rapid sequences (8 letters)',
      progress: 0,
      status: 'Locked',
      unlocked: false,
      emoji: '🔒',
      statusColor: '#9CA3AF',
      statusBgColor: '#F3F4F6',
      description: 'Speed and accuracy',
      letters: 8,
      completed: 0,
    },
    {
      id: 6,
      title: 'Expert Challenge',
      subtitle: 'All letters combined (25 letters)',
      progress: 0,
      status: 'Locked',
      unlocked: false,
      emoji: '🔒',
      statusColor: '#9CA3AF',
      statusBgColor: '#F3F4F6',
      description: 'Ultimate mastery test',
      letters: 25,
      completed: 0,
    },
    {
      id: 7,
      title: '🏆 Master\'s Hall',
      subtitle: 'Endless mode unlocked',
      progress: 0,
      status: 'Locked',
      unlocked: false,
      emoji: '👑',
      statusColor: '#F59E0B',
      statusBgColor: '#FEF3C7',
      description: 'Champion level',
      letters: 0,
      completed: 0,
    },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleLevelPress = (levelId: number, unlocked: boolean) => {
    if (unlocked) {
      router.push('/sign-learning/lesson' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📚 Levels</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Levels List */}
        <View style={styles.levelsContainer}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                { opacity: level.unlocked ? 1 : 0.7 },
              ]}
              onPress={() => handleLevelPress(level.id, level.unlocked)}
              activeOpacity={level.unlocked ? 0.85 : 1}
              disabled={!level.unlocked}
            >
              {/* Left Content */}
              <View style={styles.levelLeftContent}>
                <View style={styles.titleSection}>
                  <Text style={styles.levelTitle}>{level.title}</Text>
                  <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
                  <Text style={styles.levelDescription}>{level.description}</Text>
                </View>

                {/* Letters Info */}
                {level.letters > 0 && (
                  <View style={styles.lettersInfo}>
                    <Text style={styles.lettersText}>
                      📖 {level.completed}/{level.letters} letters
                    </Text>
                  </View>
                )}

                {/* Progress or Lock Status */}
                {level.unlocked ? (
                  <View style={styles.progressSection}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <View style={styles.progressTrackContainer}>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${level.progress}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressPercentage}>{level.progress}%</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: level.statusBgColor }]}>
                      <Text style={[styles.statusText, { color: level.statusColor }]}>
                        ✓ {level.status}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.lockedSection}>
                    <Text style={styles.lockedLabel}>🔐 Locked</Text>
                  </View>
                )}
              </View>

              {/* Right Badge */}
              <View style={styles.levelBadge}>
                <Text style={styles.levelEmoji}>{level.emoji}</Text>
              </View>

              {/* Button */}
              <View style={styles.levelButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.levelButton,
                    {
                      backgroundColor: level.unlocked ? COLORS.PRIMARY : '#D1D5DB',
                    },
                  ]}
                  onPress={() => handleLevelPress(level.id, level.unlocked)}
                  disabled={!level.unlocked}
                >
                  <Text style={styles.buttonEmoji}>
                    {level.unlocked ? '▶️' : '🔒'}
                  </Text>
                  <Text style={styles.levelButtonText}>
                    {level.unlocked ? 'Continue' : 'Locked'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievement Section */}
        <View style={styles.achievementSection}>
          <Text style={styles.achievementTitle}>🏆 Your Achievement</Text>
          <View style={styles.achievementCard}>
            <View style={styles.achievementLeft}>
              <Text style={styles.achievementEmoji}>📈</Text>
              <View>
                <Text style={styles.achievementLabel}>Total Progress</Text>
                <Text style={styles.achievementValue}>28%</Text>
              </View>
            </View>
            <Text style={styles.achievementArrow}>→</Text>
          </View>
        </View>

        {/* Motivation */}
        <View style={styles.motivationBox}>
          <Text style={styles.motivationEmoji}>💪</Text>
          <Text style={styles.motivationText}>
            Complete Level 1 to unlock Level 2 and progress further!
          </Text>
        </View>
      </ScrollView>
      <SignLearningHeader activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 28,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.TEXT,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  placeholder: {
    width: 40,
  },
  levelsContainer: {
    marginBottom: 28,
  },
  levelCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  levelLeftContent: {
    marginBottom: 14,
  },
  titleSection: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  levelSubtitle: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '600',
  },
  levelDescription: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontWeight: '700',
    marginTop: 4,
    fontStyle: 'italic',
  },
  lettersInfo: {
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
  },
  lettersText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  levelBadge: {
    position: 'absolute',
    top: 14,
    right: 16,
  },
  levelEmoji: {
    fontSize: 28,
  },
  progressSection: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginBottom: 6,
  },
  progressTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
    minWidth: 35,
    textAlign: 'right',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lockedSection: {
    marginTop: 8,
  },
  lockedLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  levelButtonContainer: {
    marginBottom: 0,
  },
  levelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonEmoji: {
    fontSize: 16,
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  achievementSection: {
    marginBottom: 20,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  achievementCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFE4B5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementLabel: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '600',
  },
  achievementValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  achievementArrow: {
    fontSize: 20,
    color: '#FFB84D',
    fontWeight: '800',
  },
  motivationBox: {
    backgroundColor: '#E0F2F1',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
  },
  motivationEmoji: {
    fontSize: 24,
  },
  motivationText: {
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: '700',
    flex: 1,
    lineHeight: 19,
  },
});
