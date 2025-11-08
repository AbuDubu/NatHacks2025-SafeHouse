/**
 * Alert Timeline Component
 * Shows detailed timeline of alert steps
 */

'use client';

import type { AlertStep } from '../../../../shared/types';

interface AlertTimelineProps {
  steps: AlertStep[];
}

export function AlertTimeline({ steps }: AlertTimelineProps) {
  if (steps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">No steps recorded</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Timeline</h2>
      
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                {!isLast && <div className="w-0.5 h-full bg-gray-300 mt-2" />}
              </div>
              
              <div className="flex-1 pb-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-semibold text-gray-900 capitalize">
                    {step.action.replace(/_/g, ' ')}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-medium">Target:</span> {step.target}
                </p>
                
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Result:</span>{' '}
                  <span className="capitalize">{step.result.replace(/_/g, ' ')}</span>
                </p>

                {step.metadata && Object.keys(step.metadata).length > 0 && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-500 cursor-pointer">
                      View metadata
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(step.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

