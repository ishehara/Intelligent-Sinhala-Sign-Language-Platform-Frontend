import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const SignReaderBottomNav: React.FC = () => {
  const handleNavigation = (route: string) => {
    if (route === 'sign-reader') {
      router.push('../../sign-reader' as any);
    } else if (route === 'history') {
      router.push('../../translation-history' as any);
    }
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => handleNavigation('sign-reader')}
      >
        <Ionicons name="home" size={24} color="#00BCD4" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => handleNavigation('history')}
      >
        <Ionicons name="time" size={24} color="#999" />
        <Text style={[styles.navText, styles.navTextInactive]}>History</Text>
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
