import SoundMonitoringScreen from '@/screens/SoundMonitoringScreen';
import { Stack } from 'expo-router';

export default function SoundAlertPage() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#333',
          headerTitle: 'sound-alert',
        }} 
      />
      <SoundMonitoringScreen />
    </>
  );
}
