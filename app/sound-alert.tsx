import SoundMonitoringScreen from '@/screens/SoundMonitoringScreen';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function SoundAlertPage() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#333',
          headerTitle: 'Environmental Sound Alert',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)' as any)}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          ),
        }} 
      />
      <SoundMonitoringScreen />
    </>
  );
}
