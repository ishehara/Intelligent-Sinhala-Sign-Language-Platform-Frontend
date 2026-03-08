import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

/**
 * PredictionResult Component
 * Displays the prediction results with feedback
 */
const PredictionResult = ({ result, onRetry, onNext }) => {
  if (!result) {
    return null;
  }

  const { predicted_label, confidence, status, feedback, feedback_level, hand_detected, warning } = result;
  const confidencePercent = (confidence * 100).toFixed(1);

  // Feedback-level theme (icon, color, label)
  const feedbackTheme = {
    excellent: { icon: '✅', color: '#2E7D32', label: 'Excellent', bg: '#E8F5E9' },
    good:      { icon: '👍', color: '#388E3C', label: 'Good',      bg: '#F1F8E9' },
    fair:      { icon: '⚠️', color: '#F57F17', label: 'Fair',      bg: '#FFF8E1' },
    poor:      { icon: '🔄', color: '#E65100', label: 'Poor',      bg: '#FFF3E0' },
    incorrect: { icon: '✗',  color: '#C62828', label: 'Incorrect', bg: '#FFEBEE' },
  };

  const level = feedback_level || (status === 'incorrect' ? 'incorrect' : 'good');
  const theme = feedbackTheme[level] || feedbackTheme.good;

  // Status colors (header)
  const getStatusColor = () => {
    switch (status) {
      case 'correct':
        return '#4CAF50';
      case 'incorrect':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'correct':
        return '✓';
      case 'incorrect':
        return '✗';
      default:
        return '👁';
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View
        style={[styles.statusHeader, { backgroundColor: getStatusColor() }]}
      >
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <Text style={styles.statusText}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>

      {/* Prediction Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Predicted Sign</Text>
        <Text style={styles.predictedSign}>{predicted_label}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Confidence</Text>
        <View style={styles.confidenceContainer}>
          <View style={styles.confidenceBarBackground}>
            <View
              style={[
                styles.confidenceBarFill,
                {
                  width: `${confidencePercent}%`,
                  backgroundColor: theme.color,
                },
              ]}
            />
          </View>
          <Text style={styles.confidenceText}>{confidencePercent}%</Text>
        </View>

        <View style={styles.divider} />

        {/* Feedback with level badge */}
        <Text style={styles.label}>Feedback</Text>
        <View style={[styles.feedbackBox, { backgroundColor: theme.bg, borderLeftColor: theme.color }]}>  
          <View style={styles.feedbackHeader}>
            <Text style={styles.feedbackIcon}>{theme.icon}</Text>
            <Text style={[styles.feedbackLevel, { color: theme.color }]}>{theme.label}</Text>
          </View>
          <Text style={styles.feedbackMessage}>{feedback}</Text>
        </View>

        {/* Hand detection warning */}
        {hand_detected === false && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ {warning || 'No hand was detected. Make sure your hand is clearly visible inside the green frame.'}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={onRetry}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>

        {status === 'correct' && onNext && (
          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={onNext}
          >
            <Text style={styles.buttonText}>Next Sign</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  statusIcon: {
    fontSize: 30,
    color: '#fff',
    marginRight: 10,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  predictedSign: {
    fontSize: 72,
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  confidenceContainer: {
    marginBottom: 5,
  },
  confidenceBarBackground: {
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 15,
  },
  confidenceText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  feedback: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    textAlign: 'center',
  },
  feedbackBox: {
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 14,
    marginTop: 4,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  feedbackLevel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  feedbackMessage: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  warningText: {
    color: '#E65100',
    fontSize: 13,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PredictionResult;
