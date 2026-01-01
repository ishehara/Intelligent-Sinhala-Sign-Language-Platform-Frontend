import TranslationHistoryScreen from '@/screens/TranslationHistoryScreen';
import { Stack } from 'expo-router';

export default function TranslationHistoryPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <TranslationHistoryScreen />
    </>
  );
}
