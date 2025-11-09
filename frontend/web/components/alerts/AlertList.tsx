/**
 * Alert List Component
 * Shows list of alerts with status
 */

'use client';

import Link from 'next/link';
import type { Alert } from '../../../../shared/types';
import { ALERT_STATUS_COLORS, RISK_LEVEL_COLORS, RISK_LEVEL_LABELS } from '../../../../shared/constants';

interface AlertListProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
}

export function AlertList({ alerts, onAcknowledge }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">No alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => {
        const statusColor = ALERT_STATUS_COLORS[alert.status];
        const riskColor = RISK_LEVEL_COLORS[alert.currentRiskLevel];
        const riskLabel = RISK_LEVEL_LABELS[alert.currentRiskLevel];

        return (
          <div key={alert.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {alert.elderName || 'Elder'}
                </h3>
                <p className="text-sm text-gray-500">
                  Started: {new Date(alert.startedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: riskColor }}
                >
                  {riskLabel}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: statusColor }}
                >
                  {alert.status}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {alert.steps.length} escalation {alert.steps.length === 1 ? 'step' : 'steps'}
              </p>
              <div className="flex gap-2">
                {alert.status === 'open' && onAcknowledge && (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Acknowledge
                  </button>
                )}
                <Link
                  href={`/alerts/${alert.id}`}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-300"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

