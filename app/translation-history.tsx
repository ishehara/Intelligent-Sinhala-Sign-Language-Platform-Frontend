import TranslationHistoryScreen from '@/screens/TranslationHistoryScreen';
import { Stack } from 'expo-router';

export default function TranslationHistoryPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#2C3E50',
          headerTitle: 'Translation History',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackVisible: false,
        }}
      />
      <TranslationHistoryScreen />
    </>
  );
}
