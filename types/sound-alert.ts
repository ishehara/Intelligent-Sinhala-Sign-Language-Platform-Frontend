export type AlertType = 
  | 'car-horn' 
  | 'bus-horn' 
  | 'motorcycle-horn' 
  | 'train-horn' 
  | 'truck-horn'
  | 'ambulance-siren' 
  | 'fire-alarm'
  | 'dog-bark'
  | 'loudspeaker';

export type AlertSeverity = 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  timestamp: Date;
  severity: AlertSeverity;
  icon: string;
}

export interface MonitoringStats {
  isActive: boolean;
  alertsToday: number;
  lastAlert: {
    type: string;
    timeAgo: string;
  } | null;
  activeSounds: number;
}
