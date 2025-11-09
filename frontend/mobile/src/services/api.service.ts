/**
 * API Service for backend communication
 */

import apiClient from '../config/api';
import type {
  Alert,
  VitalSnapshot,
  Contact,
  DashboardData,
  ApiResponse,
  User,
} from '../../../shared/types';

export const apiService = {
  // Authentication
  async login(phone: string, code: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await apiClient.post('/auth/login', { phone, code });
    return response.data;
  },

  // Alerts
  async getActiveAlerts(): Promise<ApiResponse<Alert[]>> {
    const response = await apiClient.get('/alerts/active');
    return response.data;
  },

  async acknowledgeAlert(alertId: string): Promise<ApiResponse<Alert>> {
    const response = await apiClient.post(`/alerts/${alertId}/ack`, {
      closeReason: 'user_acknowledged',
    });
    return response.data;
  },

  async getAlertDetails(alertId: string): Promise<ApiResponse<Alert>> {
    const response = await apiClient.get(`/alerts/${alertId}`);
    return response.data;
  },

  // Vitals
  async submitVitals(elderId: string, vitals: Partial<VitalSnapshot>): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/commands/vitalsCallback', {
      elderId,
      ...vitals,
      ts: new Date().toISOString(),
    });
    return response.data;
  },

  // Contacts
  async getContacts(elderId: string): Promise<ApiResponse<Contact[]>> {
    const response = await apiClient.get(`/elders/${elderId}/contacts`);
    return response.data;
  },

  // Dashboard data
  async getDashboardData(elderId: string): Promise<ApiResponse<DashboardData>> {
    const response = await apiClient.get(`/elders/${elderId}/dashboard`);
    return response.data;
  },

  // Profile
  async getUserProfile(): Promise<ApiResponse<User>> {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  // Device pairing
  async pairDevice(inviteCode: string): Promise<ApiResponse<{ elderId: string }>> {
    const response = await apiClient.post('/devices/pair', { inviteCode });
    return response.data;
  },
};

