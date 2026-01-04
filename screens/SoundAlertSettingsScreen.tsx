import { SoundAlertBottomNav } from '@/components/sound-alert/SoundAlertBottomNav';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function SoundAlertSettingsScreen() {
  // Monitoring
  const [soundDetection, setSoundDetection] = useState(true);

  // Alert Types
  const [carHorns, setCarHorns] = useState(true);
  const [busHorns, setBusHorns] = useState(true);
  const [truckHorns, setTruckHorns] = useState(true);
  const [trainHorns, setTrainHorns] = useState(true);
  const [motorcycleHorns, setMotorcycleHorns] = useState(true);

  // Alert Notifications
  const [vibration, setVibration] = useState(true);
  const [screenFlash, setScreenFlash] = useState(true);
  const [showBanners, setShowBanners] = useState(true);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Monitoring */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Monitoring</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Enable Sound Detection</Text>
            <Switch
              value={soundDetection}
              onValueChange={setSoundDetection}
              trackColor={{ false: '#D1D1D6', true: '#00A8B5' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Alert Types */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Alert Types</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🚗 Car Horns</Text>
            <Switch
              value={carHorns}
              onValueChange={setCarHorns}
              trackColor={{ false: '#D1D1D6', true: '#00A8B5' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🚌 Bus Horns</Text>
            <Switch
              value={busHorns}
              onValueChange={setBusHorns}
              trackColor={{ false: '#D1D1D6', true: '#00A8B5' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🚛 Truck Horns</Text>
            <Switch
              value={truckHorns}
              onValueChange={setTruckHorns}
              trackColor={{ false: '#D1D1D6', true: '#00A8B5' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🚂 Train Horns</Text>
            <Switch
              value={trainHorns}
              onValueChange={setTrainHorns}
              trackColor={{ false: '#D1D1D6', true: '#00A8B5' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🏍️ Motorcycle Horns</Text>
            <Switch
              value={motorcycleHorns}
              onValueChange={setMotorcycleHorns}
              trackColor={{ false: '#D1D1D6', true: '#00A8B5' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Alert Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Alert Notifications</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>📳 Vibration Alerts</Text>
            <Switch
              value={vibration}
              onValueChange={setVibration}
              trackColor={{ false: '#D1D1D6', true: '#00A8B5' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>💡 Screen Flash</Text>
            <Switch
              value={screenFlash}
              onValueChange={setScreenFlash}
              trackColor={{ false: '#D1D1D6', true: '#00A8B5' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>🔔 Show Banners</Text>
            <Switch
              value={showBanners}
              onValueChange={setShowBanners}
              trackColor={{ false: '#D1D1D6', true: '#00A8B5' }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </ScrollView>

      <SoundAlertBottomNav activeTab="settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});
