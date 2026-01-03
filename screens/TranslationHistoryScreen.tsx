import { SignReaderBottomNav } from '@/components/sign-reader/SignReaderBottomNav';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface HistoryItem {
  id: number;
  text: string;
  emotion: string;
  time: string;
  section: 'today' | 'yesterday' | 'thisWeek';
}

export default function TranslationHistoryScreen() {
  const historyData: HistoryItem[] = [
    { id: 1, text: 'ස්තූතියි', emotion: 'Happy', time: '2:34 PM', section: 'today' },
    { id: 2, text: 'ආයුබෝවන්', emotion: 'Happy', time: '4:30 PM', section: 'today' },
    { id: 3, text: 'සමාවෙන්න', emotion: 'Sad', time: '9:15 AM', section: 'yesterday' },
    { id: 4, text: 'කවුද ?', emotion: 'surprised', time: '11:40 AM', section: 'thisWeek' },
  ];

  const todayItems = historyData.filter(item => item.section === 'today');
  const yesterdayItems = historyData.filter(item => item.section === 'yesterday');
  const thisWeekItems = historyData.filter(item => item.section === 'thisWeek');

  const getEmotionEmoji = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😔';
      case 'angry':
        return '😠';
      case 'surprised':
        return '😳';
      case 'neutral':
        return '😐';
      default:
        return '😊';
    }
  };

  const renderHistoryItem = (item: HistoryItem) => (
    <View key={item.id} style={styles.historyItem}>
      <View style={styles.itemContent}>
        <Text style={styles.itemText}>{item.text}</Text>
        <View style={styles.itemDetails}>
          <Text style={styles.emotionEmoji}>{getEmotionEmoji(item.emotion)}</Text>
          <Text style={styles.emotionText}>{item.emotion}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.speakerButton}>
        <Ionicons name="volume-high" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* History List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {todayItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            {todayItems.map(renderHistoryItem)}
          </View>
        )}

        {yesterdayItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yesterday</Text>
            {yesterdayItems.map(renderHistoryItem)}
          </View>
        )}

        {thisWeekItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Week</Text>
            {thisWeekItems.map(renderHistoryItem)}
          </View>
        )}
      </ScrollView>

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
  header: {
    backgroundColor: '#00BCD4',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emotionEmoji: {
    fontSize: 18,
  },
  emotionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    color: '#95A5A6',
    marginLeft: 'auto',
  },
  speakerButton: {
    width: 48,
    height: 48,
    backgroundColor: '#00BCD4',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
