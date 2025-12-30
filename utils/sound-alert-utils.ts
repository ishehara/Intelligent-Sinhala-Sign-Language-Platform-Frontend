import { Alert } from '@/types/sound-alert';

export const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} sec ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'high':
      return '#FF4444';
    case 'medium':
      return '#FFB340';
    case 'low':
      return '#4CAF50';
    default:
      return '#999';
  }
};

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'car-horn',
    title: 'Car Horn Detected',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
    severity: 'medium',
    icon: '🚗',
  },
  {
    id: '2',
    type: 'bus-horn',
    title: 'Bus Horn Detected',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
    severity: 'high',
    icon: '🚌',
  },
  {
    id: '3',
    type: 'train-horn',
    title: 'Train Passing',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    severity: 'high',
    icon: '🚂',
  },
  {
    id: '4',
    type: 'ambulance-siren',
    title: 'Ambulance Siren Detected',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    severity: 'high',
    icon: '🚑',
  },
  {
    id: '5',
    type: 'bus-horn',
    title: 'Bus Horn Detected',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    severity: 'high',
    icon: '🚌',
  },
];
