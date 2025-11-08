/**
 * Vital Snapshot Component
 * Shows recent health data from wearable
 */

'use client';

import type { VitalSnapshot as VitalSnapshotType } from '../../../../shared/types';

interface VitalSnapshotProps {
  vitals: VitalSnapshotType | null;
}

export function VitalSnapshot({ vitals }: VitalSnapshotProps) {
  if (!vitals) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Data</h2>
        <p className="text-gray-500">No health data available</p>
      </div>
    );
  }

  const statusColor = {
    fresh: 'bg-green-100 text-green-800',
    stale: 'bg-yellow-100 text-yellow-800',
    unavailable: 'bg-gray-100 text-gray-800',
  }[vitals.status];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Health Data</h2>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {vitals.status}
        </span>
      </div>
      
      <div className="space-y-3">
        {vitals.heartRate && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Heart Rate</span>
            <span className="text-lg font-semibold text-gray-900">
              {vitals.heartRate} bpm
            </span>
          </div>
        )}

        {vitals.heartRateVariability && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">HRV</span>
            <span className="text-lg font-semibold text-gray-900">
              {vitals.heartRateVariability} ms
            </span>
          </div>
        )}

        {vitals.steps5min !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Steps (5 min)</span>
            <span className="text-lg font-semibold text-gray-900">
              {vitals.steps5min}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Fall Detected</span>
          <span className="text-lg font-semibold text-gray-900">
            {vitals.fallDetected ? '⚠️ Yes' : '✓ No'}
          </span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Updated: {new Date(vitals.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

