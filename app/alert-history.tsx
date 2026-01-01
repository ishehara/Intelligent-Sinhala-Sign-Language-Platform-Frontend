import AlertHistoryScreen from '@/screens/AlertHistoryScreen';
import { Stack } from 'expo-router';

export default function AlertHistoryPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#2C3E50',
          headerTitle: 'Alert History',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackVisible: false,
        }}
      />
      <AlertHistoryScreen />
    </>
  );
}
