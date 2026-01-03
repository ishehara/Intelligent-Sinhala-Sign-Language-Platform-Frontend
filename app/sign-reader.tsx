import SignLanguageReaderScreen from '@/screens/SignLanguageReaderScreen';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function SignReaderPage() {
  return (
    <>
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: 'white',
          },
          headerTintColor: '#000',
          headerTitle: 'Sign Language Reader',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)' as any)}
              style={{ marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          ),
        }} 
      />
      <SignLanguageReaderScreen />
    </>
  );
}
