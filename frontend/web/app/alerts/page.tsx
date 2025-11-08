/**
 * Alerts Page
 * List of all alerts
 */

'use client';

import { useAlerts } from '../../hooks/useAlerts';
import { AlertList } from '../../components/alerts/AlertList';

export default function AlertsPage() {
  const { alerts, isLoading, error, acknowledgeAlert } = useAlerts();

  const handleAcknowledge = async (alertId: string) => {
    if (confirm('Acknowledge this alert?')) {
      try {
        await acknowledgeAlert(alertId, 'acknowledged_by_caregiver');
      } catch (error) {
        alert('Failed to acknowledge alert');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-500 mt-1">
            View and manage all heat-related alerts
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error loading alerts: {error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading alerts...</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Active Alerts ({alerts.filter(a => a.status === 'open').length})
              </h2>
            </div>
            <AlertList
              alerts={alerts.filter(a => a.status === 'open')}
              onAcknowledge={handleAcknowledge}
            />

            <div className="mt-12 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Resolved Alerts
              </h2>
            </div>
            <AlertList
              alerts={alerts.filter(a => a.status !== 'open')}
            />
          </>
        )}
      </div>
    </div>
  );
}

