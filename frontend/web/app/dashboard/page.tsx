/**
 * Dashboard Page
 * Main monitoring interface for caregivers
 */

'use client';

import { useState } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAlerts } from '../../hooks/useAlerts';
import { StatusCard } from '../../components/dashboard/StatusCard';
import { DeviceStatus } from '../../components/dashboard/DeviceStatus';
import { VitalSnapshot } from '../../components/dashboard/VitalSnapshot';
import { AlertList } from '../../components/alerts/AlertList';

// TODO: Get this from auth context or query params
const ELDER_ID = 'demo-elder-id';

export default function DashboardPage() {
  const { data, isLoading, error, refresh } = useDashboard(ELDER_ID);
  const { alerts, acknowledgeAlert } = useAlerts(ELDER_ID);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleAcknowledge = async (alertId: string) => {
    if (confirm('Acknowledge this alert?')) {
      try {
        await acknowledgeAlert(alertId, 'acknowledged_by_caregiver');
      } catch (error) {
        alert('Failed to acknowledge alert');
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading dashboard: {error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">
                {data?.elder.user.name || 'Elder'} - Real-time monitoring
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Active Alerts */}
            {alerts.filter(a => a.status === 'open').length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ⚠️ Active Alerts
                </h2>
                <AlertList
                  alerts={alerts.filter(a => a.status === 'open')}
                  onAcknowledge={handleAcknowledge}
                />
              </div>
            )}

            {/* Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <StatusCard telemetry={data?.currentTelemetry || null} />
              </div>
              <div>
                <DeviceStatus device={data?.device || null} />
              </div>
            </div>

            {/* Health Data */}
            <div className="mb-8">
              <VitalSnapshot vitals={data?.recentVitals || null} />
            </div>

            {/* Recent Alerts */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Recent Alerts
              </h2>
              <AlertList alerts={alerts.slice(0, 5)} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

