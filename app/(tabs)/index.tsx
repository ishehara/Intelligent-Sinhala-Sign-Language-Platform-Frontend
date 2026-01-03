import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      router.push('../../sound-alert' as any);
    } else if (route === 'sign-reader') {
      router.push('../../sign-reader' as any);
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
        <LinearGradient
          colors={['#00A8B5', '#008A95', '#006A75']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.tagline}>Intelligent Sinhala Sign Language Platform</Text>
          <Text style={styles.subtitle}>🤟 Empowering the Deaf Community</Text>
        </LinearGradient>

        {/* Component Cards */}
        <View style={styles.componentsContainer}>
          <Text style={styles.sectionTitle}>Explore Features</Text>
          {components.map((component, index) => (
            <TouchableOpacity
              key={component.id}
              style={[
                styles.componentCard,
                { transform: [{ scale: 1 }] }
              ]}
              onPress={() => handleComponentPress(component.route)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: component.color + '15' }]}>
                  <View style={[styles.iconCircle, { backgroundColor: component.color }]}>
                    <Ionicons name={component.icon as any} size={28} color="white" />
                  </View>
                </View>
                <View style={styles.componentInfo}>
                  <Text style={styles.componentTitle}>{component.title}</Text>
                  <Text style={styles.componentSubtext}>Tap to explore →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    padding: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 62,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: '500',
  },
  componentsContainer: {
    padding: 24,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A2332',
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  componentCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  componentInfo: {
    flex: 1,
  },
  componentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A2332',
    marginBottom: 6,
    lineHeight: 21,
  },
  componentSubtext: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '600',
  },
});