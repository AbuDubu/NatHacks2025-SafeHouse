/**
 * Shared constants for SafeHouse Frontend
 */

export const RISK_LEVELS = {
  NORMAL: 'normal' as const,
  WARNING: 'warning' as const,
  DANGER: 'danger' as const,
};

export const RISK_LEVEL_COLORS = {
  normal: '#10B981',  // green
  warning: '#F59E0B', // amber
  danger: '#EF4444',  // red
};

export const RISK_LEVEL_LABELS = {
  normal: 'Normal',
  warning: 'Warning',
  danger: 'Danger',
};

export const ALERT_STATUS_COLORS = {
  open: '#EF4444',        // red
  closed: '#6B7280',      // gray
  acknowledged: '#10B981', // green
};

export const ALERT_STATUS_LABELS = {
  open: 'Active',
  closed: 'Resolved',
  acknowledged: 'Acknowledged',
};

export const CONTACT_TYPES = {
  SELF: 'self' as const,
  CAREGIVER: 'caregiver' as const,
  FIRST_RESPONDER: 'first_responder' as const,
};

export const CONTACT_TYPE_LABELS = {
  self: 'Self',
  caregiver: 'Caregiver',
  first_responder: 'First Responder',
};

export const DEFAULT_THRESHOLDS = {
  WARNING_HI_C: 30,
  DANGER_HI_C: 40,
  WARNING_DURATION_MIN: 10,
  DANGER_DURATION_SEC: 60,
};

export const ESCALATION_DEFAULTS = {
  TOTAL_CALLS: 6,
  WINDOW_SEC: 180,
  FIRST_CALL_TIMEOUT_SEC: 25,
};

export const HEALTH_DATA_TYPES = {
  HEART_RATE: 'heartRate',
  HEART_RATE_VARIABILITY: 'heartRateVariability',
  STEPS: 'steps',
  FALL_DETECTION: 'fallDetection',
} as const;

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  URGENT: 'urgent' as const,
};

// API endpoints - update these with your actual backend URL
export const API_ENDPOINTS = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  TELEMETRY: '/telemetry',
  ALERTS: '/alerts',
  ALERTS_ACK: (id: string) => `/alerts/${id}/ack`,
  VITALS_CALLBACK: '/commands/vitalsCallback',
  VITALS_REQUEST: '/commands/requestVitals',
  CONTACTS: '/contacts',
  DEVICES: '/devices',
  ELDERS: '/elders',
  USER_PROFILE: '/user/profile',
};

export const REFRESH_INTERVALS = {
  TELEMETRY: 30000,      // 30 seconds
  ALERTS: 5000,          // 5 seconds
  DASHBOARD: 15000,      // 15 seconds
  VITALS: 60000,         // 1 minute
};
