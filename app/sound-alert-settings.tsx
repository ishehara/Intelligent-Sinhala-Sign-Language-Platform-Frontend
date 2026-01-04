import SoundAlertSettingsScreen from '@/screens/SoundAlertSettingsScreen';
import { Stack } from 'expo-router';

export default function SoundAlertSettingsPage() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Settings',
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#2C3E50',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <SoundAlertSettingsScreen />
    </>
  );
}
