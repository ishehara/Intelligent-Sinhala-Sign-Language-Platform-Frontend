import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';

export default function App() {
  const handlePress = () => {
    Alert.alert('Success!', 'Your Expo app is working perfectly!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🤟 Intelligent Sinhala Sign Language Platform
      </Text>
      <Text style={styles.subtitle}>Built with Expo & React Native</Text>
      <Button title="Test Button" onPress={handlePress} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
});