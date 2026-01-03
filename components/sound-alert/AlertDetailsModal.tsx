import { Alert } from '@/types/sound-alert';
import { getSeverityColor, getTimeAgo } from '@/utils/sound-alert-utils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertDetailsModalProps {
  visible: boolean;
  alert: Alert | null;
  onClose: () => void;
}

export const AlertDetailsModal: React.FC<AlertDetailsModalProps> = ({ visible, alert, onClose }) => {
  if (!alert) return null;

  const severityColor = getSeverityColor(alert.severity);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#999" />
          </TouchableOpacity>

          {/* Alert Icon/Image */}
          <View style={styles.iconContainer}>
            <Text style={styles.iconLarge}>{alert.icon}</Text>
          </View>

          {/* Alert Title */}
          <Text style={styles.title}>{alert.title}</Text>

          {/* Priority Badge */}
          <View style={[styles.priorityBadge, { backgroundColor: severityColor }]}>
            <Text style={styles.priorityText}>
              {alert.severity === 'high' ? 'High Priority' : 
               alert.severity === 'medium' ? 'Medium Priority' : 'Low Priority'}
            </Text>
          </View>

          {/* Alert Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="analytics" size={20} color="#00BCD4" />
              <Text style={styles.detailLabel}>Confidence: </Text>
              <Text style={styles.detailValue}>87%</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="car" size={20} color="#00BCD4" />
              <Text style={styles.detailLabel}>Vehicle Type: </Text>
              <Text style={styles.detailValue}>
                {alert.type.includes('bus') ? 'Bus' : 
                 alert.type.includes('car') ? 'Car' :
                 alert.type.includes('train') ? 'Train' :
                 alert.type.includes('ambulance') ? 'Ambulance' : 'Vehicle'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color="#00BCD4" />
              <Text style={styles.detailLabel}>Detection Time: </Text>
              <Text style={styles.detailValue}>{getTimeAgo(alert.timestamp)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="hourglass" size={20} color="#00BCD4" />
              <Text style={styles.detailLabel}>Duration: </Text>
              <Text style={styles.detailValue}>2.5 seconds</Text>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconLarge: {
    fontSize: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  priorityText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  buttonOutline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00BCD4',
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: '#00BCD4',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonFilled: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#00BCD4',
    alignItems: 'center',
  },
  buttonFilledText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
