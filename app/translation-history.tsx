import TranslationHistoryScreen from '@/screens/TranslationHistoryScreen';
import { Stack } from 'expo-router';

export default function TranslationHistoryPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#00BCD4',
          },
          headerTintColor: 'white',
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
