import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SoundAlertBottomNavProps {
  activeTab?: 'home' | 'history' | 'settings' | 'profile';
}

export const SoundAlertBottomNav: React.FC<SoundAlertBottomNavProps> = ({ activeTab = 'home' }) => {
  const handleNavigation = (route: string) => {
    if (route === 'sound-alert') {
      router.push('../../sound-alert' as any);
    } else if (route === 'history') {
      router.push('../../alert-history' as any);
    }
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => handleNavigation('sound-alert')}
      >
        <Ionicons name="home" size={24} color={activeTab === 'home' ? '#00BCD4' : '#999'} />
        <Text style={[styles.navText, activeTab !== 'home' && styles.navTextInactive]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => handleNavigation('history')}
      >
        <Ionicons name="time" size={24} color={activeTab === 'history' ? '#00BCD4' : '#999'} />
        <Text style={[styles.navText, activeTab !== 'history' && styles.navTextInactive]}>History</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem}>
        <Ionicons name="settings" size={24} color="#999" />
        <Text style={[styles.navText, styles.navTextInactive]}>Settings</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.navItem}>
        <Ionicons name="person" size={24} color="#999" />
        <Text style={[styles.navText, styles.navTextInactive]}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#00BCD4',
    marginTop: 4,
  },
  navTextInactive: {
    color: '#999',
  },
});
