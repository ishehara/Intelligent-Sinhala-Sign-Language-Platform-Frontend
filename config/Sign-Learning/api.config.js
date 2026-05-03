// API Configuration
// Update this URL based on your backend server location

// For development with local backend
// Use your computer's IP address when testing on physical device
// Example: http://192.168.1.100:5000

// Get your IP: Open PowerShell and run: (Get-NetIPAddress -AddressFamily IPv4).IPAddress

export const API_BASE_URL = "http://192.168.104.107:5003";

export const API_CONFIG = {
  // Development - Use this when running backend on local machine
  // BASE_URL: 'http://localhost:5000',

  // For physical device testing - Replace with your computer's IP
  BASE_URL: API_BASE_URL,

  // Production - Replace with your deployed backend URL
  // BASE_URL: 'https://your-backend-url.com',

  ENDPOINTS: {
    HEALTH: "/health",
    PREDICT: "/predict-sign",
    PREDICT_VIDEO: "/predict-video-sign",
    CLEAR_VIDEO_BUFFER: "/clear-video-buffer",
    LABELS: "/labels",
    VIDEO_LABELS: "/video-sign-labels",
    ALL_LABELS: "/all-labels",
  },

  TIMEOUT: 30000, // 30 seconds
};

// Get full endpoint URL
export const getEndpoint = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_CONFIG;
