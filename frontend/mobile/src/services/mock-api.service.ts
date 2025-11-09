/**
 * Mock API Service for Testing Without Backend
 * 
 * Usage: Import this instead of api.service.ts to test UI without a backend
 */

import type {
  Alert,
  VitalSnapshot,
  Contact,
  DashboardData,
  ApiResponse,
  User,
  AlertStep,
} from '../../../shared/types';

// Mock data
const mockUser: User = {
  id: 'demo-elder-1',
  role: 'elder',
  name: 'John Smith',
  phone: '+1 (555) 123-4567',
  email: 'john.smith@example.com',
};

const mockAlertSteps: AlertStep[] = [
  {
    id: 'step-1',
    alertId: 'alert-1',
    timestamp: new Date(Date.now() - 300000),
    action: 'call',
    target: '+1 (555) 123-4567',
    result: 'no_answer',
  },
  {
    id: 'step-2',
    alertId: 'alert-1',
    timestamp: new Date(Date.now() - 240000),
    action: 'vital_check',
    target: 'HealthKit',
    result: 'normal_vitals',
  },
  {
    id: 'step-3',
    alertId: 'alert-1',
    timestamp: new Date(Date.now() - 180000),
    action: 'call',
    target: '+1 (555) 987-6543',
    result: 'no_answer',
  },
  {
    id: 'step-4',
    alertId: 'alert-1',
    timestamp: new Date(Date.now() - 120000),
    action: 'sms',
    target: '+1 (555) 987-6543',
    result: 'success',
  },
];

const mockAlert: Alert = {
  id: 'alert-1',
  elderId: 'demo-elder-1',
  elderName: 'John Smith',
  startedAt: new Date(Date.now() - 300000),
  status: 'open',
  currentRiskLevel: 'danger',
  steps: mockAlertSteps,
};

export const mockApiService = {
  // Authentication
  async login(phone: string, code: string): Promise<ApiResponse<{ token: string; user: User }>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: mockUser,
      },
    };
  },

  // Alerts
  async getActiveAlerts(): Promise<ApiResponse<Alert[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return empty array or mock alert based on your testing needs
    return {
      success: true,
      data: [], // Change to [mockAlert] to test with an active alert
    };
  },

  async acknowledgeAlert(alertId: string): Promise<ApiResponse<Alert>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        ...mockAlert,
        status: 'acknowledged',
        closeReason: 'user_acknowledged',
        closedAt: new Date(),
      },
    };
  },

  async getAlertDetails(alertId: string): Promise<ApiResponse<Alert>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: mockAlert,
    };
  },

  // Vitals
  async submitVitals(elderId: string, vitals: Partial<VitalSnapshot>): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log('Mock: Submitting vitals', vitals);
    
    return {
      success: true,
      message: 'Vitals submitted successfully',
    };
  },

  // Contacts
  async getContacts(elderId: string): Promise<ApiResponse<Contact[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: [
        {
          id: 'contact-1',
          elderId: elderId,
          type: 'self',
          name: 'John Smith',
          phone: '+1 (555) 123-4567',
          email: 'john.smith@example.com',
          priorityOrder: 1,
          relationship: 'Self',
        },
        {
          id: 'contact-2',
          elderId: elderId,
          type: 'caregiver',
          name: 'Sarah Smith',
          phone: '+1 (555) 987-6543',
          email: 'sarah.smith@example.com',
          priorityOrder: 2,
          relationship: 'Daughter',
        },
        {
          id: 'contact-3',
          elderId: elderId,
          type: 'first_responder',
          name: '911 Emergency',
          phone: '911',
          priorityOrder: 3,
        },
      ],
    };
  },

  // Dashboard data
  async getDashboardData(elderId: string): Promise<ApiResponse<DashboardData>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      data: {
        elder: {
          id: elderId,
          userId: elderId,
          address: '123 Maple Street, San Francisco, CA 94102',
          timezone: 'America/Los_Angeles',
          consentFlags: {
            healthDataSharing: true,
            emergencyContact: true,
            locationSharing: true,
          },
          appleDeviceLinked: true,
          user: mockUser,
        },
        currentTelemetry: {
          id: 'telemetry-1',
          deviceId: 'device-1',
          timestamp: new Date(),
          tempC: 28.5,
          humidity: 65,
          heatIndexC: 32.1,
          riskLevel: 'warning',
        },
        device: {
          id: 'device-1',
          elderId: elderId,
          hardwareId: 'ESP32-HOME-001',
          firmwareVersion: '1.0.0',
          lastSeenAt: new Date(Date.now() - 30000),
          status: 'online',
        },
        activeAlerts: [], // Change to [mockAlert] to test alerts
        recentVitals: {
          id: 'vitals-1',
          elderId: elderId,
          timestamp: new Date(Date.now() - 120000),
          heartRate: 75,
          heartRateVariability: 45,
          steps5min: 120,
          fallDetected: false,
          stalenessSec: 120,
          status: 'fresh',
        },
      },
    };
  },

  // Profile
  async getUserProfile(): Promise<ApiResponse<User>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      success: true,
      data: mockUser,
    };
  },

  // Device pairing
  async pairDevice(inviteCode: string): Promise<ApiResponse<{ elderId: string }>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (inviteCode.length < 6) {
      return {
        success: false,
        error: 'Invalid invite code',
      };
    }
    
    return {
      success: true,
      data: {
        elderId: 'demo-elder-1',
      },
    };
  },
};

// Export with same interface as real apiService
export const apiService = mockApiService;

