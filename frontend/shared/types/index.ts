/**
 * Shared TypeScript types for SafeHouse Frontend
 * Used across both mobile and web applications
 */

// User roles
export type UserRole = 'elder' | 'caregiver' | 'admin';

// User types
export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  email: string;
}

export interface ElderProfile {
  id: string;
  userId: string;
  address: string;
  timezone: string;
  consentFlags: {
    healthDataSharing: boolean;
    emergencyContact: boolean;
    locationSharing: boolean;
  };
  appleDeviceLinked: boolean;
}

// Sensor & Telemetry types
export interface SensorDevice {
  id: string;
  elderId: string;
  hardwareId: string;
  firmwareVersion: string;
  lastSeenAt: Date;
  status: 'online' | 'offline' | 'warning';
}

export interface Telemetry {
  id: string;
  deviceId: string;
  timestamp: Date;
  tempC: number;
  humidity: number;
  heatIndexC: number;
  riskLevel: RiskLevel;
}

export type RiskLevel = 'normal' | 'warning' | 'danger';

// Alert types
export type AlertStatus = 'open' | 'closed' | 'acknowledged';

export interface Alert {
  id: string;
  elderId: string;
  elderName?: string;
  startedAt: Date;
  status: AlertStatus;
  closeReason?: string;
  closedAt?: Date;
  currentRiskLevel: RiskLevel;
  steps: AlertStep[];
}

export type AlertAction = 
  | 'call' 
  | 'sms' 
  | 'push' 
  | 'vital_check' 
  | 'dispatch'
  | 'acknowledged';

export type AlertStepResult = 
  | 'success' 
  | 'no_answer' 
  | 'voicemail' 
  | 'failed' 
  | 'pending'
  | 'abnormal_vitals'
  | 'normal_vitals';

export interface AlertStep {
  id: string;
  alertId: string;
  timestamp: Date;
  action: AlertAction;
  target: string;
  result: AlertStepResult;
  metadata?: Record<string, any>;
}

// Contact types
export type ContactType = 'self' | 'caregiver' | 'first_responder';

export interface Contact {
  id: string;
  elderId: string;
  type: ContactType;
  name: string;
  phone: string;
  email?: string;
  priorityOrder: number;
  relationship?: string;
}

// Vital/Health data types
export interface VitalSnapshot {
  id: string;
  elderId: string;
  timestamp: Date;
  heartRate?: number;
  heartRateVariability?: number;
  steps5min?: number;
  fallDetected: boolean;
  stalenessSec: number;
  status: 'fresh' | 'stale' | 'unavailable';
}

// Dashboard/Real-time data
export interface DashboardData {
  elder: ElderProfile & { user: User };
  currentTelemetry: Telemetry | null;
  device: SensorDevice | null;
  activeAlerts: Alert[];
  recentVitals: VitalSnapshot | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Notification types
export interface NotificationPayload {
  type: 'alert' | 'vital_check' | 'reminder';
  alertId?: string;
  elderId: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Configuration types
export interface ThresholdConfig {
  warningHeatIndexC: number;
  dangerHeatIndexC: number;
  warningDurationMin: number;
  dangerDurationSec: number;
}

export interface EscalationConfig {
  totalCalls: number;
  windowSec: number;
  firstCallTimeoutSec: number;
  enableBackToBackCalls: boolean;
  enableDispatch: boolean;
}

