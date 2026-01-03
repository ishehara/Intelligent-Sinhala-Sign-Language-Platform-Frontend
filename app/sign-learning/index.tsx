import { SignLearningHeader } from '@/components/common/SignLearningHeader';
import { COLORS } from '@/constants/colors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignLearningScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings' | 'profile'>('home');

  const handleSettingsPress = () => {
    console.log('Settings pressed');
  };

  const handleStartLesson = () => {
    router.push('/sign-learning/lesson' as any);
  };

  const handleLevelsCardPress = () => {
    router.push('/sign-learning/levels' as any);
  };

  const handleStreakCardPress = () => {
    router.push('/sign-learning/progress' as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Message */}
        <Text style={styles.welcomeText}>👋 Welcome back!</Text>

        {/* Header with Settings */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Today's Lesson</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
          >
            <Text style={styles.settingsEmoji}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Lesson Card */}
        <View style={styles.todayLessonCard}>
          <View style={styles.lessonContent}>
            <View style={styles.lessonLabel}>
              <Text style={styles.continueLearningText}>📖 CONTINUE LEARNING</Text>
              <Text style={styles.lessonEmoji}>🤟</Text>
            </View>
            <Text style={styles.letterText}>Letter ප</Text>
            <Text style={styles.lessonSubtext}>Show this hand sign</Text>
          </View>
          <TouchableOpacity
            style={styles.startLessonButton}
            onPress={handleStartLesson}
          >
            <Text style={styles.buttonEmoji}>▶️</Text>
            <Text style={styles.startLessonButtonText}>Start Lesson</Text>
          </TouchableOpacity>
        </View>

        {/* Level 1 Progress Card */}
        <View style={styles.levelProgressCard}>
          <View style={styles.levelHeaderRow}>
            <Text style={styles.levelTitle}>⭐ Alphabet Basics</Text>
          </View>
          <View style={styles.progressRowContainer}>
            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>📊 Progress</Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: '28%' },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.progressPercentage}>28%</Text>
          </View>
          <Text style={styles.lettersCompleted}>✨ 2 of 5 letters completed • Master the foundation</Text>
        </View>

        {/* Stats Cards Container */}
        <Text style={styles.sectionTitle}>📈 Your Stats</Text>
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={handleLevelsCardPress}
            activeOpacity={0.8}
          >
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statTitle}>Total Levels</Text>
            <Text style={styles.statValue}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statCard}
            onPress={handleStreakCardPress}
            activeOpacity={0.8}
          >
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statTitle}>Streak</Text>
            <Text style={styles.statValue}>5 days</Text>
          </TouchableOpacity>
        </View>

        {/* Motivational Tip */}
        <View style={styles.tipBox}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={styles.tipText}>
            Keep practicing daily! You're doing amazing! 🎉
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
    paddingTop: 12,
    paddingBottom: 28,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.MUTED,
    marginBottom: 10,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE4B5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsEmoji: {
    fontSize: 24,
  },
  todayLessonCard: {
    backgroundColor: '#E0F2F1',
    borderRadius: 20,
    padding: 26,
    marginBottom: 22,
    borderWidth: 2.5,
    borderColor: COLORS.PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lessonContent: {
    marginBottom: 20,
  },
  lessonLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  continueLearningText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 0.8,
  },
  lessonEmoji: {
    fontSize: 32,
  },
  letterText: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  lessonSubtext: {
    fontSize: 16,
    color: COLORS.MUTED,
    fontWeight: '600',
  },
  startLessonButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonEmoji: {
    fontSize: 20,
  },
  startLessonButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelProgressCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  levelHeaderRow: {
    marginBottom: 20,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  progressRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressSection: {
    flex: 1,
    marginRight: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: COLORS.MUTED,
    marginBottom: 8,
    fontWeight: '700',
  },
  progressTrack: {
    height: 12,
    backgroundColor: COLORS.BORDER,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 6,
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  lettersCompleted: {
    fontSize: 15,
    color: COLORS.MUTED,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 14,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 13,
    color: COLORS.MUTED,
    marginBottom: 6,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#FFB84D',
    alignItems: 'flex-start',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.TEXT,
    lineHeight: 21,
    fontWeight: '600',
  },
});
