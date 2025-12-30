import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const components = [
    {
      id: 1,
      title: 'Adaptive Sinhala Sign Language Learning System',
      icon: 'school',
      color: '#4CAF50',
      route: 'learning',
    },
    {
      id: 2,
      title: 'Environmental Sound Alert Module',
      icon: 'notifications',
      color: '#00BCD4',
      route: 'sound-alert',
    },
    {
      id: 3,
      title: 'Smart Sinhala Sign Language Reader with Emotion Recognition',
      icon: 'hand-left',
      color: '#FF9800',
      route: 'sign-reader',
    },
    {
      id: 4,
      title: 'Sinhala Two-Way Communication System',
      icon: 'chatbubbles',
      color: '#9C27B0',
      route: 'communication',
    },
  ];

  const handleComponentPress = (route: string) => {
    if (route === 'sound-alert') {
      router.push('/sound-alert');
    } else {
      // Placeholder for other components
      console.log(`Navigating to: ${route}`);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>HearSense</Text>
          <Text style={styles.tagline}>Intelligent Sinhala Sign Language Platform</Text>
        </View>

        {/* Component Cards */}
        <View style={styles.componentsContainer}>
          {components.map((component) => (
            <TouchableOpacity
              key={component.id}
              style={styles.componentCard}
              onPress={() => handleComponentPress(component.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: component.color }]}>
                <Ionicons name={component.icon as any} size={32} color="white" />
              </View>
              <View style={styles.componentInfo}>
                <Text style={styles.componentTitle}>{component.title}</Text>
                <Text style={styles.componentSubtext}>Tap to explore</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🤟 Empowering the Deaf Community</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#008080',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
  },
  componentsContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
  },
  componentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  componentInfo: {
    flex: 1,
  },
  componentTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
    lineHeight: 20,
  },
  componentSubtext: {
    fontSize: 12,
    color: '#95A5A6',
  },
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
});