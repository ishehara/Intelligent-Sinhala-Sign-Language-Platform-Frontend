import SignLanguageReaderScreen from '@/screens/SignLanguageReaderScreen';
import { Stack } from 'expo-router';

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
        }} 
      />
      <SignLanguageReaderScreen />
    </>
  );
}
