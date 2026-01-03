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

export default function SignLearningProgressScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings' | 'profile'>('history');

  // Personalized Performance Data
  const performanceMetrics = {
    currentLevel: '⭐ Alphabet Basics',
    successRate: 78,
    confidenceLevel: 72,
    consecutiveFailures: 2,
    attemptedToday: 12,
    successfulToday: 9,
    totalPracticeTime: '4h 32m',
  };

  // Letter-specific history with difficulty and performance
  const letterHistory = [
    { letter: 'අ', difficulty: 'Easy', mastery: 94, attempts: 8, failures: 1, consecutiveFails: 0, confidence: 95 },
    { letter: 'ය', difficulty: 'Medium', mastery: 87, attempts: 12, failures: 3, consecutiveFails: 0, confidence: 85 },
    { letter: 'ච', difficulty: 'Medium', mastery: 92, attempts: 10, failures: 2, consecutiveFails: 0, confidence: 90 },
    { letter: 'ස', difficulty: 'Hard', mastery: 89, attempts: 15, failures: 5, consecutiveFails: 2, confidence: 80 },
    { letter: 'ඩ', difficulty: 'Medium', mastery: 91, attempts: 9, failures: 2, consecutiveFails: 0, confidence: 88 },
    { letter: 'ග', difficulty: 'Easy', mastery: 86, attempts: 7, failures: 1, consecutiveFails: 0, confidence: 92 },
    { letter: 'ක', difficulty: 'Medium', mastery: 88, attempts: 11, failures: 3, consecutiveFails: 0, confidence: 87 },
  ];

  const handleBack = () => {
    router.back();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#10B981';
      case 'Medium':
        return '#F59E0B';
      case 'Hard':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getConfidenceBadge = (level: number) => {
    if (level >= 90) return '🔥 Excellent';
    if (level >= 80) return '💪 Strong';
    if (level >= 70) return '👍 Good';
    return '🤔 Building';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📊 Learning History</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Performance Summary */}
        <View style={styles.performanceCard}>
          <Text style={styles.sectionTitle}>📊 Session Summary</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Success Rate</Text>
              <Text style={[styles.metricValue, { color: '#10B981' }]}>{performanceMetrics.successRate}%</Text>
              <Text style={styles.metricSubtext}>Today: {performanceMetrics.successfulToday}/{performanceMetrics.attemptedToday}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Confidence</Text>
              <Text style={[styles.metricValue, { color: COLORS.PRIMARY }]}>{performanceMetrics.confidenceLevel}%</Text>
              <Text style={styles.metricSubtext}>↑ +7% this week</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Consecutive Fails</Text>
              <Text style={[styles.metricValue, { color: '#F59E0B' }]}>{performanceMetrics.consecutiveFailures}</Text>
              <Text style={styles.metricSubtext}>Current streak</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Practice Time</Text>
              <Text style={[styles.metricValue, { color: '#8B5CF6' }]}>4h 32m</Text>
              <Text style={styles.metricSubtext}>This week</Text>
            </View>
          </View>
        </View>

        {/* Letter Performance Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>📚 Letter Performance Breakdown</Text>
          
          {letterHistory.map((item) => (
            <View key={item.letter} style={styles.letterDetailCard}>
              {/* Letter Header */}
              <View style={styles.letterDetailHeader}>
                <View style={styles.letterDetailLeft}>
                  <Text style={styles.letterDetailText}>{item.letter}</Text>
                  <View style={styles.difficultyBadge}>
                    <Text style={[styles.difficultyText, { color: getDifficultyColor(item.difficulty) }]}>
                      {item.difficulty}
                    </Text>
                  </View>
                </View>
                <View style={styles.letterDetailRight}>
                  <Text style={styles.confidenceBadgeText}>{getConfidenceBadge(item.confidence)}</Text>
                </View>
              </View>

              {/* Metrics Row */}
              <View style={styles.letterMetricsRow}>
                <View style={styles.letterMetric}>
                  <Text style={styles.letterMetricLabel}>Mastery</Text>
                  <View style={styles.miniProgressBar}>
                    <View style={[styles.miniProgressFill, { width: `${item.mastery}%` }]} />
                  </View>
                  <Text style={styles.letterMetricValue}>{item.mastery}%</Text>
                </View>

                <View style={styles.letterMetric}>
                  <Text style={styles.letterMetricLabel}>Attempts</Text>
                  <Text style={styles.letterMetricValueBig}>{item.attempts}</Text>
                </View>

                <View style={styles.letterMetric}>
                  <Text style={styles.letterMetricLabel}>Failures</Text>
                  <Text style={[styles.letterMetricValueBig, { color: '#EF4444' }]}>{item.failures}</Text>
                </View>

                <View style={styles.letterMetric}>
                  <Text style={styles.letterMetricLabel}>Consec. Fails</Text>
                  <Text style={[styles.letterMetricValueBig, { color: item.consecutiveFails > 0 ? '#F59E0B' : '#10B981' }]}>
                    {item.consecutiveFails}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Performance Trends */}
        <View style={styles.trendsCard}>
          <Text style={styles.sectionTitle}>📈 Weekly Trends</Text>
          <View style={styles.trendItem}>
            <View style={styles.trendInfo}>
              <Text style={styles.trendLabel}>Success Rate</Text>
              <Text style={styles.trendValue}>78%</Text>
            </View>
            <View style={styles.trendBar}>
              <View style={[styles.trendFill, { width: '78%' }]} />
            </View>
          </View>
          <View style={styles.trendItem}>
            <View style={styles.trendInfo}>
              <Text style={styles.trendLabel}>Avg. Confidence</Text>
              <Text style={styles.trendValue}>72%</Text>
            </View>
            <View style={styles.trendBar}>
              <View style={[styles.trendFill, { width: '72%' }]} />
            </View>
          </View>
          <View style={styles.trendItem}>
            <View style={styles.trendInfo}>
              <Text style={styles.trendLabel}>Mastery Growth</Text>
              <Text style={styles.trendValue}>+5%</Text>
            </View>
            <View style={styles.trendBar}>
              <View style={[styles.trendFill, { width: '85%', backgroundColor: '#10B981' }]} />
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Personalized Tips</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>1️⃣</Text>
            <Text style={styles.tipText}>Practice the hard letters in short 5-minute sessions</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>2️⃣</Text>
            <Text style={styles.tipText}>Use visual hints when you fail twice on same letter</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>3️⃣</Text>
            <Text style={styles.tipText}>Take breaks when consecutive fails reach 3</Text>
          </View>
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
  // Performance Card
  performanceCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.MUTED,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: 4,
  },
  metricSubtext: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '600',
  },
  // Details Card
  detailsCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  letterDetailCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  letterDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  letterDetailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  letterDetailText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  letterDetailRight: {
    alignItems: 'flex-end',
  },
  confidenceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  letterMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  letterMetric: {
    flex: 1,
    alignItems: 'center',
  },
  letterMetricLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.MUTED,
    marginBottom: 4,
  },
  miniProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
  },
  letterMetricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  letterMetricValueBig: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  // Trends Card
  trendsCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  trendItem: {
    marginBottom: 14,
  },
  trendInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  trendLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  trendBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  trendFill: {
    height: '100%',
    backgroundColor: COLORS.PRIMARY,
  },
  // Tips Card
  tipsCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  tipNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  tipText: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
});
