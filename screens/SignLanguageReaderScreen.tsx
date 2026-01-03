import { SignReaderBottomNav } from '@/components/sign-reader/SignReaderBottomNav';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignLanguageReaderScreen() {
  const [isReady, setIsReady] = useState(true);
  const [detectedText, setDetectedText] = useState('ස්තූතියි');
  const [emotion, setEmotion] = useState('Happy');

  return (
    <View style={styles.container}>
      {/* Camera View Area */}
      <View style={styles.cameraContainer}>
        <View style={styles.positionGuide}>
          <Text style={styles.guideText}>Position yourself here</Text>
        </View>
      </View>

      {/* Detection Results */}
      <View style={styles.resultsContainer}>
        {/* Sinhala Text Output */}
        <View style={styles.textOutput}>
          <View style={styles.textHeader}>
            <View style={styles.textHeaderLeft}>
              <Ionicons name="text" size={18} color="#00BCD4" />
              <Text style={styles.textLabel}>Detected Text</Text>
            </View>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy-outline" size={18} color="#00BCD4" />
            </TouchableOpacity>
          </View>
          <Text style={styles.sinhalaText}>{detectedText}</Text>
        </View>

        {/* Emotion Display */}
        <View style={styles.emotionContainer}>
          <View style={styles.emotionHeader}>
            <Ionicons name="happy-outline" size={18} color="#FF9800" />
            <Text style={styles.emotionHeaderText}>Detected Emotion</Text>
          </View>
          <View style={styles.emotionContent}>
            <Text style={styles.emotionEmoji}>😊</Text>
            <Text style={styles.emotionValue}>{emotion}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.speakButton}>
          <Ionicons name="volume-high" size={24} color="white" />
          <Text style={styles.speakButtonText}>Speak</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="pause" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <SignReaderBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  cameraContainer: {
    flex: 1.5,
    margin: 16,
    marginBottom: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#00BCD4',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  positionGuide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detectionBox: {
    width: 120,
    height: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#00BCD4',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  boxLabel: {
    fontSize: 14,
    color: '#00BCD4',
    fontWeight: '600',
  },
  guideText: {
    fontSize: 16,
    color: '#00BCD4',
    fontWeight: '600',
    marginVertical: 10,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  textOutput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  textHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00BCD4',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  copyButton: {
    padding: 4,
  },
  sinhalaText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 6,
  },
  translationText: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  emotionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  emotionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emotionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emotionEmoji: {
    fontSize: 40,
  },
  emotionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
    alignItems: 'center',
  },
  speakButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#00BCD4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  speakButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  iconButton: {
    width: 56,
    height: 56,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
