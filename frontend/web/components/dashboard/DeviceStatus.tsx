/**
 * Device Status Component
 * Shows sensor device connection status
 */

'use client';

import type { SensorDevice } from '../../../../shared/types';

interface DeviceStatusProps {
  device: SensorDevice | null;
}

export function DeviceStatus({ device }: DeviceStatusProps) {
  if (!device) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Device Status</h2>
        <p className="text-gray-500">No device connected</p>
      </div>
    );
  }

  const statusColor = {
    online: 'bg-green-100 text-green-800',
    offline: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
  }[device.status];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Device Status</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
            {device.status}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Hardware ID</span>
          <span className="text-sm font-mono text-gray-900">
            {device.hardwareId}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Firmware</span>
          <span className="text-sm text-gray-900">
            v{device.firmwareVersion}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Last Seen</span>
          <span className="text-sm text-gray-900">
            {new Date(device.lastSeenAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

