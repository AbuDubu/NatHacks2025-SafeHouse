/**
 * Status Card Component
 * Shows current temperature, humidity, and risk level
 */

'use client';

import type { Telemetry } from '../../../../shared/types';
import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS } from '../../../../shared/constants';

interface StatusCardProps {
  telemetry: Telemetry | null;
}

export function StatusCard({ telemetry }: StatusCardProps) {
  if (!telemetry) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
        <p className="text-gray-500">No sensor data available</p>
      </div>
    );
  }

  const riskColor = RISK_LEVEL_COLORS[telemetry.riskLevel];
  const riskLabel = RISK_LEVEL_LABELS[telemetry.riskLevel];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
      
      <div className="mb-4">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: riskColor }}
        >
          {riskLabel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Temperature</p>
          <p className="text-2xl font-bold text-gray-900">
            {telemetry.tempC.toFixed(1)}°C
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Humidity</p>
          <p className="text-2xl font-bold text-gray-900">
            {telemetry.humidity.toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-1">Heat Index</p>
          <p className="text-2xl font-bold text-gray-900">
            {telemetry.heatIndexC.toFixed(1)}°C
          </p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Updated: {new Date(telemetry.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}

