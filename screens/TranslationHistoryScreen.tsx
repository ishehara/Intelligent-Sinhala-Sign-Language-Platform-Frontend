import { SignReaderBottomNav } from '@/components/sign-reader/SignReaderBottomNav';
import signReaderService from '@/services/signReaderService';
import { TranslationHistoryItem } from '@/types/sign-reader';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SECTION_LABELS: Record<TranslationHistoryItem['dateCategory'], string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  older: 'Older',
};
const SECTION_ORDER: TranslationHistoryItem['dateCategory'][] = [
  'today',
  'yesterday',
  'thisWeek',
  'older',
];

export default function TranslationHistoryScreen() {
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    const items = await signReaderService.getHistory();
    setHistory(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will permanently delete all translation history. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await signReaderService.clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleSpeak = (item: TranslationHistoryItem) => {
    Speech.speak(item.sinhalaText, { language: 'si-LK' });
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.75) return '#43A047';
    if (conf >= 0.5) return '#FB8C00';
    return '#E53935';
  };

  const grouped = SECTION_ORDER.reduce<
    Record<string, TranslationHistoryItem[]>
  >((acc, key) => {
    const items = history.filter((h) => h.dateCategory === key);
    if (items.length) acc[key] = items;
    return acc;
  }, {});

  const renderItem = (item: TranslationHistoryItem) => (
    <View key={item.id} style={styles.historyItem}>
      <View style={styles.itemContent}>
        <Text style={styles.sinhalaText}>{item.sinhalaText}</Text>
        <Text style={styles.englishText}>{item.englishLabel}</Text>
        <View style={styles.itemMeta}>
          <View
            style={[
              styles.confBadge,
              { backgroundColor: getConfidenceColor(item.confidence) + '20' },
            ]}
          >
            <Text
              style={[
                styles.confBadgeText,
                { color: getConfidenceColor(item.confidence) },
              ]}
            >
              {Math.round(item.confidence * 100)}% confidence
            </Text>
          </View>
          <Text style={styles.timeText}>
            {signReaderService.formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.speakBtn}
        onPress={() => handleSpeak(item)}
      >
        <Ionicons name="volume-high" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00BCD4']} />
        }
      >
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Translation History</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={16} color="#E53935" />
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#00BCD4" />
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={56} color="#B0BEC5" />
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyText}>
              Recognised signs will appear here.{'\n'}Use the reader and save results.
            </Text>
          </View>
        ) : (
          SECTION_ORDER.map((key) =>
            grouped[key] ? (
              <View key={key} style={styles.section}>
                <Text style={styles.sectionTitle}>{SECTION_LABELS[key]}</Text>
                {grouped[key].map(renderItem)}
              </View>
            ) : null
          )
        )}
      </ScrollView>

      <SignReaderBottomNav activeTab="history" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  scroll: { flex: 1 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#2C3E50' },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  clearText: { fontSize: 13, color: '#E53935', fontWeight: '600' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#607D8B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#90A4AE',
    textAlign: 'center',
    lineHeight: 22,
  },

  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#90A4AE',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },

  historyItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: { flex: 1 },
  sinhalaText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2C3E50',
    marginBottom: 2,
  },
  englishText: {
    fontSize: 13,
    color: '#90A4AE',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confBadgeText: { fontSize: 11, fontWeight: '700' },
  timeText: { fontSize: 12, color: '#B0BEC5', marginLeft: 'auto' as any },

  speakBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#00BCD4',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
