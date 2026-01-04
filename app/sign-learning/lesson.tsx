import { COLORS } from '@/constants/colors';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignLearningLessonScreen() {
  const router = useRouter();
  const [handDetected, setHandDetected] = useState(true);
  const [attemptCount, setAttemptCount] = useState(1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [difficultyAdjustment, setDifficultyAdjustment] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState('More Visual Hints');
  const [isSinhalaMode, setIsSinhalaMode] = useState(false);

  // Current Letter Being Practiced
  const currentLetter = 'ප';

  // Previous Performance History for this Letter
  const letterPerformanceHistory = {
    letter: 'ප',
    sinhalaName: 'Pa',
    totalAttempts: 18,
    successRate: 72,
    failures: 5,
    consecutiveFailures: 1,
    lastAttemptDate: 'Today',
    difficulty: 'Medium',
    confidence: 68,
    averageMastery: 72,
    bestScore: 94,
    improvementTrend: '+8%',
  };

  // Next letter in the curriculum
  const nextLesson = {
    letter: 'ම',
    sinhalaName: 'Ma',
    difficulty: 'Medium',
    estimatedTime: '8-10 minutes',
    description: 'Straightforward hand positioning with moderate hand speed',
  };

  // Adaptive lesson path based on performance with Sinhala support
  const getAdaptiveLessonPath = () => {
    const perf = letterPerformanceHistory;
    
    if (perf.successRate >= 90) {
      return {
        stage: isSinhalaMode ? 'පරිපූර්ණතාවය' : 'Mastery',
        description: isSinhalaMode ? 'ඔබ විශිෂ්ට ඉටුවීමටයි! දැන් ඔබගේ කෞශල පිරිපහදා ගනීම සඳහා නිකම්ම!' : 'You\'re doing great! Time to refine your technique.',
        focus: isSinhalaMode ? 'ගතිය සහ නිරවද්‍යතාවය' : 'Speed and accuracy',
        intensity: isSinhalaMode ? 'ඉහළ' : 'High',
      };
    } else if (perf.successRate >= 75) {
      return {
        stage: isSinhalaMode ? 'ස්මීර්ණකරණය' : 'Consolidation',
        description: isSinhalaMode ? 'හොඳ දියුණුවක! ස්මීරතාවයට අවධානය දෙන්න.' : 'Good progress! Focus on consistency.',
        focus: isSinhalaMode ? 'කෞශල පිරිපහසුවීම' : 'Technique refinement',
        intensity: isSinhalaMode ? 'මධ්‍යම' : 'Medium',
      };
    } else if (perf.consecutiveFailures >= 2) {
      return {
        stage: isSinhalaMode ? 'ප්‍රතිකරණය' : 'Remedial',
        description: isSinhalaMode ? 'අපි ප්‍රතිකරණ කර ඉහළ ගිය යුතුයි. දෘශ්‍ය සහාය භාවිතා කරමු.' : 'Let\'s reset and rebuild. Use more visual aids.',
        focus: isSinhalaMode ? 'මූලික පිහිටුවීම' : 'Fundamental positioning',
        intensity: isSinhalaMode ? 'පහළ' : 'Low',
      };
    } else {
      return {
        stage: isSinhalaMode ? 'ඉගෙනීම' : 'Learning',
        description: isSinhalaMode ? 'ඔබ හොඳින් ඉගෙන ගන්නවා! පුහුණුව කරගෙන යන්න.' : 'You\'re learning well! Keep practicing.',
        focus: isSinhalaMode ? 'මූලික තාක්‍ෂණය' : 'Core technique',
        intensity: isSinhalaMode ? 'මධ්‍යම' : 'Medium',
      };
    }
  };

  // Predict next lesson path based on current performance with Sinhala support
  const getNextLessonPath = () => {
    const perf = letterPerformanceHistory;
    
    if (perf.successRate >= 90) {
      return {
        stage: isSinhalaMode ? 'පරිපූර්ණතා ගමන්' : 'Mastery Track',
        description: isSinhalaMode ? `${nextLesson.sinhalaName} පරිපූර්ණයෙන් ශිෂ්ඨ කිරීමට සූදානම්! ඔබ උසස ප්‍රභේදයන් ඉගෙන ගනු ඇත.` : `Ready to master ${nextLesson.sinhalaName}! You'll learn advanced variations.`,
        recommendation: isSinhalaMode ? 'සංයුක්ත ටයුවන සමඟ ඔබ අභිවර්ධනය කරන්න' : 'Challenge yourself with combined gestures',
        intensity: isSinhalaMode ? 'ඉහළ' : 'High',
        tips: isSinhalaMode ? [
          '🎯 නව අකුරු මූලික පිහිටුවීම සමඟ ආරම්භ කරන්න',
          '⚡ ගතිය සහ ප්‍රවාහතා ප්‍රභේදයන්ට ඉදිරි ගිය යුතුයි',
          '🔄 කලින් ඉගෙන ගත අකුරු සමඟ සංයුක්ත කරන්න'
        ] : [
          '🎯 Start with basic positioning of the new letter',
          '⚡ Progress to speed and fluency variations',
          '🔄 Combine with previously learned letters'
        ]
      };
    } else if (perf.successRate >= 75) {
      return {
        stage: isSinhalaMode ? 'සම්මත ගමන්' : 'Standard Track',
        description: isSinhalaMode ? `ඔබගේ ඉදිරි ගිය දියුණුවක් ඉටුවීමටයි! ${nextLesson.sinhalaName} වැඩිපුරේ සමාන වෙයි.` : `Build on your progress! ${nextLesson.sinhalaName} is similar in structure.`,
        recommendation: isSinhalaMode ? 'ඊට පසු අකුරුට ගිය හෙතින් ස්වභාවික කෞශල වලට අවධානය දෙන්න' : 'Focus on consistent technique before moving to next letter',
        intensity: isSinhalaMode ? 'මධ්‍යම' : 'Medium',
        tips: isSinhalaMode ? [
          '👆 මේ අකුරු සමඟ මාස්පේෂී ස්මරණයි ශක්තිමත් කරන්න',
          '📈 භ්‍යාස ගතිය ක්‍රමයෙන් වැඩි කරන්න',
          '✓ ඊට පසු අකුරුට ගිය පෙර පවතින අකුරු 85%+ පරිපූර්ණයෙන් ශිෂ්ඨ කරන්න'
        ] : [
          '👆 Strengthen muscle memory with this letter first',
          '📈 Gradually increase practice speed',
          '✓ Master current letter at 85%+ before advancing'
        ]
      };
    } else if (perf.consecutiveFailures >= 2) {
      return {
        stage: isSinhalaMode ? 'පදනම් ගමන්' : 'Foundation Track',
        description: isSinhalaMode ? `ප්‍රධාන වශයෙන් ${currentLetter} ඝටිස්ට කරමු. ${nextLesson.sinhalaName} සමාන ගලිතයන් බේදා ගනු.` : `Let's solidify ${currentLetter} first. ${nextLesson.sinhalaName} shares similar movements.`,
        recommendation: isSinhalaMode ? 'ඊට පසු අකුරුට ගිය හෙතින් එම අකුරු සමඟ විශ්වාසය පිහිටුවා ගන්න' : 'Build confidence with current letter before moving forward',
        intensity: isSinhalaMode ? 'පහළ' : 'Low',
        tips: isSinhalaMode ? [
          '💪 අතිරේකා භ්‍යාස සැසි එම අකුරු ගැනීමත (දිනපතින 3-5 විනාඩි)',
          '📚 දෘශ්‍ය මාර්ගෝපදේශ සහ පිහිටුවීම නැවතත් බලන්න',
          '⏸️ අපහසු නම් විවේකයන් අරගත කර, නැවතත් ශක්තිමත්ව ආපසු එන්න'
        ] : [
          '💪 Extra practice sessions on current letter (3-5 min daily)',
          '📚 Review visual guides and positioning',
          '⏸️ Take breaks if struggling, return refreshed'
        ]
      };
    } else {
      return {
        stage: isSinhalaMode ? 'සමතුලිත මාර්ගය' : 'Balanced Track',
        description: isSinhalaMode ? `හොඳ දියුණුවක්! ඊට පසු වූවේ ${nextLesson.sinhalaName} (${nextLesson.difficulty} දුෂ්කරතා).` : `Good progress! Next is ${nextLesson.sinhalaName} (${nextLesson.difficulty} difficulty).`,
        recommendation: isSinhalaMode ? 'නිරන්තර පුහුණුව කළ පසු ඉදිරි අකුරට යන්න.' : 'Continue steady practice, then move to next letter when ready',
        intensity: isSinhalaMode ? 'මධ්‍යම' : 'Medium',
        tips: isSinhalaMode ? [
          '✓ ඉදිරියට යාමට පෙර 80% කට වැඩි සාර්ථකතා අනුපාතයට ළඟා වන්න',
          '🎓 අකුරු අතර සමානතා අධ්‍යයනය කරන්න',
          '🔄 හොඳම ප්‍රතිඵල සඳහා සෑම සැසියකම 2–3 වරක් පුහුණුව කරන්න'
        ] : [
          '✓ Reach 80%+ success rate before advancing',
          '🎓 Study the similarities between letters',
          '🔄 Practice 2-3 times per session for best results'
        ]
      };
    }
  };

  // RL Agent Personalized Analysis with Sinhala Support
  const getRLAgentFeedback = () => {
    const perf = letterPerformanceHistory;
    
    if (perf.successRate < 70 && perf.consecutiveFailures > 0) {
      return {
        emoji: '⚠️',
        title: isSinhalaMode ? 'අවධානයට බඳින ලබන ස්ථානය' : 'Focus Area Alert',
        message: isSinhalaMode 
          ? `ඔබ සඳහා ${currentLetter} (${perf.sinhalaName}) සමඟ කලින් අපහසුතා ගොස් ඇත. ඔබට ${perf.totalAttempts} උත්සාහයින් ${perf.failures} අසාර්ථකතා ඇති විය.`
          : `You've struggled with ${currentLetter} (${perf.sinhalaName}) before. You had ${perf.failures} failures in ${perf.totalAttempts} attempts.`,
        recommendation: isSinhalaMode 
          ? 'ඔබට මණිබැンඩ පිහිටුවීම වඩා හොඳින් තේරුම් ගැනීමට සහාය වීම සඳහා අපි දෘශ්‍ය මාර්ගෝපදේශ භාවිතා කරමු.'
          : 'We\'ll use visual guides to help you understand the wrist positioning better.',
        strategy: 'More Visual Hints',
        color: '#FEE2E2',
        borderColor: '#EF4444',
      };
    } else if (perf.successRate >= 80 && perf.successRate < 90) {
      return {
        emoji: '💪',
        title: isSinhalaMode ? 'විශाල චලිතය!' : 'Great Momentum!',
        message: isSinhalaMode
          ? `ඔබ ${currentLetter} සඳහා දියුණු වෙමින් ඉටුවීමටයි! ඔබගේ සාර්ථකතා අනුපාතය ${perf.successRate}% වන අතර මෙම සතිය සඳහා ${perf.improvementTrend} වැඩිවීමක් ඉටුවීමටයි.`
          : `You're improving on ${currentLetter}! Your success rate is ${perf.successRate}% with a ${perf.improvementTrend} boost this week.`,
        recommendation: isSinhalaMode
          ? 'අපි එම අවසාන 10% සඳහා ඉදිරි ගිය යුතුයි එই අකුරු සම්පූර්ණයෙන් ශිෂ්ඨ කිරීම සඳහා.'
          : 'Let\'s push for that final 10% to master this letter completely.',
        strategy: 'Slower Level Progress',
        color: '#F0FDF4',
        borderColor: '#10B981',
      };
    } else if (perf.successRate >= 90) {
      return {
        emoji: '🔥',
        title: isSinhalaMode ? 'විශේෂඥ මට්ටම අගුළු හැරිණි' : 'Expert Level Unlocked',
        message: isSinhalaMode
          ? `විශිෂ්ට! ඔබ ${currentLetter} සම්පූර්ණයෙන් ශිෂ්ඨ කර ඇත ${perf.successRate}% සාර්ථකතා අනුපාතයක් සමඟ. ඔබගේ හොඳම ලකුණු වූවේ ${perf.bestScore}% විය.`
          : `Excellent! You've mastered ${currentLetter} with a ${perf.successRate}% success rate. Your best score was ${perf.bestScore}%.`,
        recommendation: isSinhalaMode
          ? 'ඔබ ගිණුම්ගේ ගතිගයි අඩු කිරීමට නම්. ඔබට එය වඩා ඉක්මනින් සිදු කළ හැකිද පසුවත් නිරවද්‍යතාව පවත්වා ගනිමින්?'
          : 'Time to challenge yourself with speed. Can you do it faster and still maintain accuracy?',
        strategy: 'Repeat Same Letter',
        color: '#FEF3C7',
        borderColor: '#F59E0B',
      };
    } else {
      return {
        emoji: '👍',
        title: isSinhalaMode ? 'ඉගෙන ගැනීම තබාගන්න' : 'Keep Learning',
        message: isSinhalaMode
          ? `${currentLetter} සඳහා කටයුතු කරමින් ඉටුවීමටයි! ඔබ ${perf.successRate}% සාර්ථකතා අනුපාතයට ඉටුවීමටයි. භ්‍යාසයි විතරමු!`
          : `Working on ${currentLetter}! You're at ${perf.successRate}% success rate. Practice makes perfect!`,
        recommendation: isSinhalaMode
          ? 'අකුරුවල පිහිටුවීම මත අවධානයට බඳින්න. ඔබගේ විශ්වාසය මට්ටම ස්ථිරවත්ව වැඩිවෙමින් ඉටුවීමටයි.'
          : 'Focus on the hand position. Your confidence level is growing steadily.',
        strategy: 'More Visual Hints',
        color: '#F3F4F6',
        borderColor: '#9CA3AF',
      };
    }
  };

  // Dynamic hints based on letter difficulty and failure patterns
  const getDynamicHints = () => {
    const perf = letterPerformanceHistory;
    if (perf.difficulty === 'Hard') {
      return [
        { emoji: '👆', text: 'Position fingers at middle height' },
        { emoji: '🔄', text: 'Rotate wrist in controlled motion' },
        { emoji: '⏸️', text: 'Hold the position for 2 seconds' },
      ];
    }
    return [
      { emoji: '👆', text: 'Raise your palm higher' },
      { emoji: '👆', text: 'Keep fingers closer together' },
      { emoji: '🔵', text: 'Rotate your wrist slightly' },
    ];
  };

  const rlStrategies = isSinhalaMode 
    ? ['වඩා ඉහළ දෘශ්‍ය ඉඟි ඇති සලකුණු', 'පියවර මන්දගාමීව ඉදිරියට යන්න', 'එම අකුර නැවත පුහුණුව කරන්න']
    : ['More Visual Hints', 'Slower Level Progress', 'Repeat Same Letter'];
  const rlAgentFeedback = getRLAgentFeedback();
  const adaptiveLessonPath = getAdaptiveLessonPath();
  const hints = getDynamicHints();

  const handleBack = () => {
    router.back();
  };

  const handleTryAgain = () => {
    setShowFeedback(true);
  };

  const handleViewExample = () => {
    console.log('View example pressed');
    setShowFeedback(false);
  };

  const handleFeedbackTryAgain = () => {
    setAttemptCount(attemptCount + 1);
    setHandDetected(false);
    setTimeout(() => setHandDetected(true), 1500);
    setShowFeedback(false);
  };

  const handleHint = () => {
    setShowHintModal(true);
  };

  const handleHintClose = () => {
    setShowHintModal(false);
  };

  const handleSkip = () => {
    setShowSkipModal(true);
  };

  const handleSkipConfirm = () => {
    setShowSkipModal(false);
    router.back();
  };

  const handleSkipCancel = () => {
    setShowSkipModal(false);
  };

  const getDifficultyColor = () => {
    if (difficultyAdjustment > 0) return '#10B981';
    if (difficultyAdjustment < 0) return '#F59E0B';
    return COLORS.PRIMARY;
  };

  const getCoachTipText = () => {
    if (selectedStrategy === 'More Visual Hints' || selectedStrategy === 'වඩා ඉහළ දෘශ්‍ය ඉඟි') {
      return isSinhalaMode ? 'සංඥාව හොඳින් තේරුම් ගැනීමට, දැක්මත් ඇති උදාහරණ වැඩි ලෙස භාවිතා කරන්න.' : 'Try using more visual examples to understand the gesture better.';
    }
    if (selectedStrategy === 'Slower Level Progress' || selectedStrategy === 'තරම් මධ්‍යම දියුණුවක') {
      return isSinhalaMode ? 'එක් එක් අකුරු ශිෂ්ඨ කිරීම සඳහා කාලයක ගැනීම ඔබගේ නිරවද්‍යතාවය වැඩි කරනු ඇත.' : 'Taking time to master each letter will improve your accuracy.';
    }
    return isSinhalaMode ? 'භ්‍යාසය අසම්පූර්ණතාවයි! පුනරාවර්තනය පෙශි මතක ගිණුම්ගේ ගතිගයි කිරීමට සහාය වේ.' : 'Practice makes perfect! Repeating helps build muscle memory.';
  };

  const getIntensityColor = (intensity: string) => {
    if (intensity === 'High') return '#EF4444';
    if (intensity === 'Low') return '#F59E0B';
    return '#3B82F6';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          <Text style={styles.letterCounter}>📚 Alphabet Basics • Letter 3 of 5</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Show This Sign Section */}
        <View style={styles.signDisplayCard}>
          <Text style={styles.instructionLabel}>👆 SHOW THIS SIGN</Text>
          <Text style={styles.largeSign}>ප</Text>
          <Text style={styles.instructionSubtext}>
            Keep your hand in frame and match the gesture
          </Text>
        </View>

        {/* Camera Preview Area */}
        <View style={styles.cameraPreviewContainer}>
          {/* Hand Detection Badge */}
          {handDetected && (
            <View style={styles.handDetectedBadge}>
              <Text style={styles.badgeEmoji}>✓</Text>
              <Text style={styles.badgeText}>Hand detected</Text>
            </View>
          )}

          {/* Camera Preview Placeholder */}
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraText}>Camera Preview</Text>
            <Text style={styles.cameraSubtext}>
              {handDetected
                ? '🎯 Position looks good!'
                : '👆 Move your hand into frame'}
            </Text>
          </View>
        </View>

        {/* RL AGENT CARD - Main Container */}
        <View style={styles.rlAgentCardContainer}>
          {/* RL Agent Header */}
          <View style={styles.rlAgentHeader}>
            <View style={styles.rlAgentHeaderContent}>
              <Text style={styles.rlAgentHeaderIcon}>🤖</Text>
              <View style={styles.rlAgentHeaderText}>
                <Text style={styles.rlAgentHeaderTitle}>{isSinhalaMode ? 'RL ඒජන්ට් මඟින් ලබාදෙන විශ්ලේෂණය' : 'RL Agent Analysis'}</Text>
                <Text style={styles.rlAgentHeaderSubtitle}>{isSinhalaMode ? 'පෞද්ගලික ඉගෙනුම් නිර්දේශ' : 'Personalized Learning Recommendations'}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.sinhalaToggleButton}
              onPress={() => setIsSinhalaMode(!isSinhalaMode)}
            >
              <Text style={styles.sinhalaToggleText}>{isSinhalaMode ? 'සි' : 'EN'}</Text>
            </TouchableOpacity>
          </View>

          {/* RL Agent Content Sections */}
          <View style={styles.rlAgentContent}>
            {/* Feedback Section */}
            <View style={styles.rlAgentFeedbackSection}>
              <View style={[styles.feedbackBox, { backgroundColor: rlAgentFeedback.color, borderLeftColor: rlAgentFeedback.borderColor }]}>
                <Text style={styles.rlAgentFeedbackTitle}>{rlAgentFeedback.emoji} {rlAgentFeedback.title}</Text>
                <Text style={styles.feedbackMessage}>{rlAgentFeedback.message}</Text>
                <Text style={styles.feedbackRecommendation}>{rlAgentFeedback.recommendation}</Text>
              </View>
            </View>

            {/* Performance & Strategy Row */}
            <View style={styles.rlAgentRowContainer}>
              {/* Performance Stats */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionHeading}>{isSinhalaMode ? '📊 කාර්ය සාධනය' : '📊 Performance'}</Text>
                <View style={styles.performanceStatsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{isSinhalaMode ? 'සාර්ථකතා අනුපාතය' : 'Success Rate'}</Text>
                    <Text style={styles.statValue}>{letterPerformanceHistory.successRate}%</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{isSinhalaMode ? 'උත්සාහ' : 'Attempts'}</Text>
                    <Text style={styles.statValue}>{letterPerformanceHistory.totalAttempts}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{isSinhalaMode ? 'විශ්වාසය' : 'Confidence'}</Text>
                    <Text style={styles.statValue}>{letterPerformanceHistory.confidence}%</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>{isSinhalaMode ? 'ප්‍රවණතාවය' : 'Trend'}</Text>
                    <Text style={[styles.statValue, { color: '#10B981' }]}>{letterPerformanceHistory.improvementTrend}</Text>
                  </View>
                </View>
              </View>

              {/* Learning Path */}
              <View style={styles.learningPathSection}>
                <Text style={styles.sectionHeading}>{isSinhalaMode ? '📚 ඉගෙනුම් මාර්ගය' : '📚 Learning Path'}</Text>
                <View style={styles.lessonPathCard}>
                  <View style={styles.pathStageHeader}>
                    <Text style={styles.pathStage}>{adaptiveLessonPath.stage}</Text>
                    <Text style={styles.pathIntensity}>{adaptiveLessonPath.intensity}</Text>
                  </View>
                  <Text style={styles.pathDescription}>{adaptiveLessonPath.description}</Text>
                  <Text style={styles.pathFocus}>🎯 {adaptiveLessonPath.focus}</Text>
                </View>
              </View>
            </View>

            {/* Strategy Section */}
            <View style={styles.strategySection}>
              <Text style={styles.sectionHeading}>{isSinhalaMode ? '📊 RL උපායමාර්ගය' : '📊 RL Strategy'}</Text>
              <View style={styles.strategyChips}>
                {rlStrategies.map((strategy) => (
                  <TouchableOpacity
                    key={strategy}
                    style={[
                      styles.strategyChip,
                      (strategy === rlAgentFeedback.strategy || selectedStrategy === strategy) && styles.strategyChipActive,
                    ]}
                    onPress={() => setSelectedStrategy(strategy)}
                  >
                    <Text
                      style={[
                        styles.strategyChipText,
                        (strategy === rlAgentFeedback.strategy || selectedStrategy === strategy) && styles.strategyChipTextActive,
                      ]}
                    >
                      {strategy}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedStrategy === rlAgentFeedback.strategy && (
                <Text style={styles.strategyRecommended}>{isSinhalaMode ? '✓ RL ඒජන්ට විසින් නිර්දේශිතය' : '✓ Recommended by RL Agent'}</Text>
              )}
            </View>

            {/* Difficulty & Adjustments */}
            <View style={styles.adjustmentsSection}>
              <Text style={styles.sectionHeading}>{isSinhalaMode ? '⚙️ ගිණුම්' : '⚙️ Adjustments'}</Text>
              <View style={styles.difficultySection}>
                <View style={styles.difficultyLabelRow}>
                  <Text style={styles.difficultyLabel}>{isSinhalaMode ? 'දුෂ්කරතා මට්ටම' : 'Difficulty Level'}</Text>
                  <Text style={styles.difficultyValue}>
                    {difficultyAdjustment > 0 ? '+' : ''}{difficultyAdjustment}
                  </Text>
                </View>
                <View style={styles.difficultyMeterContainer}>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => setDifficultyAdjustment(Math.max(-1, difficultyAdjustment - 1))}
                  >
                    <Text style={styles.adjustButtonText}>−</Text>
                  </TouchableOpacity>
                  <View style={styles.difficultyMeter}>
                    <View
                      style={[
                        styles.difficultyFill,
                        {
                          width: `${((difficultyAdjustment + 1) / 2) * 100}%`,
                          backgroundColor: getDifficultyColor(),
                        },
                      ]}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => setDifficultyAdjustment(Math.min(1, difficultyAdjustment + 1))}
                  >
                    <Text style={styles.adjustButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.difficultyLabels}>
                  <Text style={styles.difficultyLabelSmall}>{isSinhalaMode ? 'පහළ' : 'Easier'}</Text>
                  <Text style={styles.difficultyLabelSmall}>{isSinhalaMode ? 'ඉහළ' : 'Harder'}</Text>
                </View>
              </View>
            </View>

            {/* Next Lesson Preview */}
            <View style={styles.nextLessonSection}>
              <Text style={styles.sectionHeading}>{isSinhalaMode ? '🎯 ඉදිරි පාඩම' : '🎯 Next Lesson'}</Text>
              <View style={styles.nextLessonCard}>
                <View style={styles.nextLetterHeader}>
                  <View style={styles.nextLetterBadge}>
                    <Text style={styles.nextLetterText}>{nextLesson.letter}</Text>
                    <Text style={styles.nextLetterName}>{nextLesson.sinhalaName}</Text>
                  </View>
                  <View style={styles.nextLessonInfo}>
                    <Text style={styles.nextLessonStage}>{getNextLessonPath().stage}</Text>
                    <Text style={styles.nextLessonTime}>⏱️ {nextLesson.estimatedTime}</Text>
                  </View>
                </View>
                
                <Text style={styles.nextLessonDescription}>
                  {getNextLessonPath().description}
                </Text>
                
                <View style={styles.nextLessonRecommendation}>
                  <Text style={styles.recommendationIcon}>💡</Text>
                  <Text style={styles.recommendationText}>
                    {getNextLessonPath().recommendation}
                  </Text>
                </View>

                <View style={styles.nextLessonTips}>
                  <Text style={styles.tipsLabel}>{isSinhalaMode ? '📋 සූදානම් වන ආකාරය:' : '📋 How to Prepare:'}</Text>
                  {getNextLessonPath().tips.map((tip) => (
                    <Text key={tip} style={styles.tipItemNext}>
                      {tip}
                    </Text>
                  ))}
                </View>

                <View style={styles.lessonIntensityBadge}>
                  <Text style={styles.intensityLabel}>{isSinhalaMode ? 'නිර්දේශිත තීව්‍රතාවය:' : 'Recommended Intensity:'}</Text>
                  <Text style={[
                    styles.intensityValue,
                    {
                      color: getIntensityColor(getNextLessonPath().intensity)
                    }
                  ]}>
                    {getNextLessonPath().intensity}
                  </Text>
                </View>
              </View>
            </View>

            {/* Coach Tip */}
            <View style={styles.coachTip}>
              <Text style={styles.coachTipEmoji}>💡</Text>
              <Text style={styles.coachTipText}>
                {getCoachTipText()}
              </Text>
            </View>
          </View>
        </View>

        {/* Attempt Counter */}
        <View style={styles.attemptContainer}>
          <Text style={styles.attemptText}>
            🎯 Attempt <Text style={styles.attemptNumber}>{attemptCount}</Text>
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleTryAgain}
          >
            <Text style={styles.primaryButtonEmoji}>🔄</Text>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleHint}
          >
            <Text style={styles.secondaryButtonEmoji}>💡</Text>
            <Text style={styles.secondaryButtonText}>Hint</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSkip}
          >
            <Text style={styles.secondaryButtonEmoji}>⏭️</Text>
            <Text style={styles.secondaryButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Tips for Success</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipDot}>• </Text>
            <Text style={styles.tipText}>Keep your hand clearly visible in the camera frame</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipDot}>• </Text>
            <Text style={styles.tipText}>Match the hand position exactly as shown</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipDot}>• </Text>
            <Text style={styles.tipText}>Hold the gesture for 1-2 seconds</Text>
          </View>
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedback}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModal}>
            {/* Close by scrolling down or pressing outside */}
            <TouchableOpacity
              style={styles.modalHandle}
              onPress={() => setShowFeedback(false)}
            >
              <View style={styles.handleBar} />
            </TouchableOpacity>

            {/* Sign Display Section */}
            <View style={styles.signDisplayCardModal}>
              <Text style={styles.instructionLabelModal}>👆 SHOW THIS SIGN</Text>
              <Text style={styles.largeSignModal}>ශ</Text>
              <Text style={styles.instructionSubtextModal}>
                Keep your hand in frame and match the gesture
              </Text>
            </View>

            {/* Feedback Content */}
            <ScrollView
              contentContainerStyle={styles.feedbackContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Feedback Title */}
              <Text style={styles.feedbackTitle}>✨ Almost! Let's improve</Text>
              <Text style={styles.feedbackSubtitle}>
                Here's how to perfect your gesture:
              </Text>

              {/* Hints List */}
              <View style={styles.hintsList}>
                {hints.map((hint) => (
                  <View key={hint.text} style={styles.hintItem}>
                    <Text style={styles.hintEmoji}>{hint.emoji}</Text>
                    <Text style={styles.hintText}>{hint.text}</Text>
                  </View>
                ))}
              </View>

              {/* Buttons */}
              <View style={styles.feedbackButtonsContainer}>
                <TouchableOpacity
                  style={styles.secondaryFeedbackButton}
                  onPress={handleViewExample}
                >
                  <Text style={styles.secondaryFeedbackButtonEmoji}>📹</Text>
                  <Text style={styles.secondaryFeedbackButtonText}>View Example</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryFeedbackButton}
                  onPress={handleFeedbackTryAgain}
                >
                  <Text style={styles.primaryFeedbackButtonEmoji}>🔄</Text>
                  <Text style={styles.primaryFeedbackButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Hint Modal */}
      <Modal
        visible={showHintModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModal}>
            <TouchableOpacity
              style={styles.modalHandle}
              onPress={handleHintClose}
            >
              <View style={styles.handleBar} />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.feedbackContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.feedbackTitle}>💡 Helpful Tips</Text>
              <Text style={styles.feedbackSubtitle}>
                Follow these tips to improve your gesture:
              </Text>

              <View style={styles.hintsList}>
                <View style={styles.hintItem}>
                  <Text style={styles.hintEmoji}>👁️</Text>
                  <Text style={styles.hintText}>Look at the camera while performing the gesture</Text>
                </View>
                <View style={styles.hintItem}>
                  <Text style={styles.hintEmoji}>💪</Text>
                  <Text style={styles.hintText}>Keep your hand steady and well-lit</Text>
                </View>
                <View style={styles.hintItem}>
                  <Text style={styles.hintEmoji}>⏱️</Text>
                  <Text style={styles.hintText}>Hold the gesture for 1-2 seconds before releasing</Text>
                </View>
                <View style={styles.hintItem}>
                  <Text style={styles.hintEmoji}>🎯</Text>
                  <Text style={styles.hintText}>Practice slowly first, then increase your speed</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleHintClose}
              >
                <Text style={styles.primaryButtonEmoji}>✓</Text>
                <Text style={styles.primaryButtonText}>Got It!</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Skip Modal */}
      <Modal
        visible={showSkipModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModal}>
            <TouchableOpacity
              style={styles.modalHandle}
              onPress={handleSkipCancel}
            >
              <View style={styles.handleBar} />
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.feedbackContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.feedbackTitle}>⏭️ Skip This Lesson?</Text>
              <Text style={styles.feedbackSubtitle}>
                You won't earn points if you skip, but you can try again later.
              </Text>

              <View style={[styles.hintItem, { marginVertical: 16, backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.hintEmoji}>⚠️</Text>
                <Text style={styles.hintText}>Skipping doesn't mark this letter as completed</Text>
              </View>

              <View style={styles.feedbackButtonsContainer}>
                <TouchableOpacity
                  style={styles.secondaryFeedbackButton}
                  onPress={handleSkipCancel}
                >
                  <Text style={styles.secondaryFeedbackButtonEmoji}>🔙</Text>
                  <Text style={styles.secondaryFeedbackButtonText}>Keep Trying</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryFeedbackButton}
                  onPress={handleSkipConfirm}
                >
                  <Text style={styles.primaryFeedbackButtonEmoji}>➡️</Text>
                  <Text style={styles.primaryFeedbackButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 24,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
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
  letterCounter: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  placeholder: {
    width: 40,
  },
  signDisplayCard: {
    backgroundColor: '#E0F2F1',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  largeSign: {
    fontSize: 72,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: 16,
    marginTop: 8,
  },
  instructionSubtext: {
    fontSize: 15,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  cameraPreviewContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  handDetectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeEmoji: {
    fontSize: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraPlaceholder: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: COLORS.PRIMARY,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cameraIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  cameraText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 6,
  },
  cameraSubtext: {
    fontSize: 14,
    color: COLORS.MUTED,
    fontWeight: '600',
  },
  attemptContainer: {
    backgroundColor: '#FFF9E6',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB84D',
  },
  attemptText: {
    fontSize: 14,
    color: COLORS.TEXT,
    fontWeight: '700',
  },
  attemptNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1.2,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButtonEmoji: {
    fontSize: 18,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonEmoji: {
    fontSize: 16,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  tipsSection: {
    backgroundColor: COLORS.CARD,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tipDot: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '800',
    marginRight: 8,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '600',
    flex: 1,
    lineHeight: 19,
  },
  // Feedback Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  feedbackModal: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 12,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHandle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  signDisplayCardModal: {
    backgroundColor: '#E0F2F1',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  instructionLabelModal: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  largeSignModal: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    marginBottom: 12,
  },
  instructionSubtextModal: {
    fontSize: 14,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
  },
  feedbackContent: {
    paddingHorizontal: 4,
    paddingBottom: 24,
  },
  feedbackTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 6,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: COLORS.MUTED,
    fontWeight: '600',
    marginBottom: 18,
  },
  hintsList: {
    marginBottom: 22,
  },
  hintItem: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hintEmoji: {
    fontSize: 24,
    minWidth: 36,
  },
  hintText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
    flex: 1,
  },
  feedbackButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryFeedbackButton: {
    flex: 1,
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryFeedbackButtonEmoji: {
    fontSize: 16,
  },
  secondaryFeedbackButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  primaryFeedbackButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryFeedbackButtonEmoji: {
    fontSize: 16,
  },
  primaryFeedbackButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Coach Card Styles
  coachCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  coachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  coachTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  coachBadge: {
    backgroundColor: '#E0F2F1',
    color: COLORS.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    fontWeight: '700',
  },
  coachSubtitle: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 19,
  },
  // Personalized Feedback Styles
  feedbackBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    backgroundColor: '#F9FAFB',
  },
  feedbackMessage: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 6,
    lineHeight: 19,
  },
  feedbackRecommendation: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.MUTED,
    lineHeight: 18,
  },
  performanceStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.MUTED,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.PRIMARY,
  },
  lessonPathContainer: {
    marginBottom: 14,
  },
  lessonPathLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  lessonPathCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  pathStageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pathStage: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  pathIntensity: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pathDescription: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 6,
  },
  pathFocus: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    fontStyle: 'italic',
  },
  difficultySection: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  difficultyLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  difficultyValue: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.PRIMARY,
    backgroundColor: '#E0F2F1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyMeterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  adjustButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#00A3AA',
  },
  adjustButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  difficultyMeter: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  difficultyFill: {
    height: '100%',
    borderRadius: 3,
  },
  difficultyLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyLabelSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  coachTip: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  coachTipEmoji: {
    fontSize: 16,
  },
  coachTipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#78350F',
    flex: 1,
    lineHeight: 18,
  },
  strategySection: {
    marginTop: 16,
    marginBottom: 12,
  },
  strategyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  strategyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  strategyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  strategyChipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  strategyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.MUTED,
  },
  strategyChipTextActive: {
    color: '#FFFFFF',
  },
  strategyRecommended: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 8,
  },
  nextLessonContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  nextLessonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 12,
  },
  nextLessonCard: {
    backgroundColor: '#F0FDFB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  nextLetterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  nextLetterBadge: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 60,
  },
  nextLetterText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  nextLetterName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
  nextLessonInfo: {
    flex: 1,
  },
  nextLessonStage: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
  },
  nextLessonTime: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.MUTED,
    marginTop: 2,
  },
  nextLessonDescription: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.TEXT,
    lineHeight: 18,
    marginBottom: 12,
  },
  nextLessonRecommendation: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    fontSize: 14,
    marginTop: 1,
  },
  recommendationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
    flex: 1,
  },
  nextLessonTips: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  tipsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 8,
  },
  tipItemNext: {
    fontSize: 10,
    fontWeight: '600',
    color: '#78350F',
    lineHeight: 16,
    marginBottom: 4,
  },
  lessonIntensityBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  intensityLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.MUTED,
  },
  intensityValue: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  // RL Agent Card Styles
  rlAgentCardContainer: {
    backgroundColor: '#F0FDFB',
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  rlAgentHeader: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rlAgentHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rlAgentHeaderIcon: {
    fontSize: 24,
  },
  rlAgentHeaderText: {
    flex: 1,
  },
  rlAgentHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rlAgentHeaderSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E0F2F1',
    marginTop: 2,
  },
  rlAgentBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: '700',
  },
  sinhalaToggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  sinhalaToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  rlAgentContent: {
    padding: 16,
    gap: 14,
  },
  rlAgentFeedbackSection: {
    marginBottom: 4,
  },
  rlAgentFeedbackTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 8,
  },
  rlAgentRowContainer: {
    gap: 12,
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
  learningPathSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.TEXT,
    marginBottom: 10,
  },
  adjustmentsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
  nextLessonSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
});
