/**
 * Alert Detail Page
 * Detailed view of a single alert with timeline
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Alert } from '../../../../../shared/types';
import { apiClient } from '../../../lib/api/client';
import { AlertTimeline } from '../../../components/alerts/AlertTimeline';
import { ALERT_STATUS_COLORS, RISK_LEVEL_COLORS, RISK_LEVEL_LABELS } from '../../../../../shared/constants';

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadAlert(params.id as string);
    }
  }, [params.id]);

  const loadAlert = async (alertId: string) => {
    try {
      const response = await apiClient.getAlertDetails(alertId);
      if (response.success && response.data) {
        setAlert(response.data);
      } else {
        setError(response.error || 'Alert not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alert');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!alert || !confirm('Acknowledge this alert?')) return;

    try {
      const response = await apiClient.acknowledgeAlert(alert.id, 'acknowledged_by_caregiver');
      if (response.success && response.data) {
        setAlert(response.data);
      }
    } catch (err) {
      alert('Failed to acknowledge alert');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading alert...</p>
      </div>
    );
  }

  if (error || !alert) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Alert not found'}</p>
            <button
              onClick={() => router.push('/alerts')}
              className="mt-2 text-red-600 hover:underline"
            >
              Back to alerts
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = ALERT_STATUS_COLORS[alert.status];
  const riskColor = RISK_LEVEL_COLORS[alert.currentRiskLevel];
  const riskLabel = RISK_LEVEL_LABELS[alert.currentRiskLevel];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <button
            onClick={() => router.push('/alerts')}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to alerts
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Alert Details
              </h1>
              <p className="text-gray-500 mt-1">
                {alert.elderName || 'Elder'} - Started {new Date(alert.startedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: riskColor }}
              >
                {riskLabel}
              </span>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: statusColor }}
              >
                {alert.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {alert.status === 'open' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              This alert is active
            </h2>
            <p className="text-yellow-800 mb-4">
              The elder has not acknowledged this alert yet. You can acknowledge it on their behalf.
            </p>
            <button
              onClick={handleAcknowledge}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Acknowledge Alert
            </button>
          </div>
        )}

        <AlertTimeline steps={alert.steps} />

        {alert.closeReason && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Resolution
            </h2>
            <p className="text-gray-700 mb-2">{alert.closeReason}</p>
            {alert.closedAt && (
              <p className="text-sm text-gray-500">
                Closed at: {new Date(alert.closedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

