import { useState, useEffect } from 'react';
import { Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

interface EmergencyFlowProps {
  context?: {
    residentName?: string;
    alertType?: string;
  };
  onResolve: () => void;
}

export function EmergencyFlow({ context, onResolve }: EmergencyFlowProps) {
  const [callStage, setCallStage] = useState<'detecting' | 'calling' | 'waiting' | 'contacted'>('detecting');
  const [pulseAnimation, setPulseAnimation] = useState(true);

  useEffect(() => {
    // Simulate emergency detection flow
    const timer1 = setTimeout(() => setCallStage('calling'), 2000);
    const timer2 = setTimeout(() => setCallStage('waiting'), 4000);
    const timer3 = setTimeout(() => setCallStage('contacted'), 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleResponse = (response: '1' | '2') => {
    if (response === '1') {
      // User is OK
      setCallStage('contacted');
      setTimeout(() => onResolve(), 2000);
    } else {
      // Emergency help needed
      setCallStage('contacted');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Detecting Stage */}
        {callStage === 'detecting' && (
          <div className="text-center animate-in fade-in">
            <div className="mb-6 flex justify-center">
              <div className={`p-8 bg-red-100 rounded-full ${pulseAnimation ? 'animate-pulse' : ''}`}>
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <h2 className="text-red-900 mb-2">Alert Detected</h2>
            <p className="text-red-700 mb-6">
              {context?.alertType === 'no-response' 
                ? `${context?.residentName || 'Resident'} has not responded`
                : 'Unusual vital signs detected'}
            </p>
            <div className="flex justify-center">
              <div className="px-6 py-3 bg-white rounded-full shadow-sm">
                <p className="text-red-600">Initiating safety protocol...</p>
              </div>
            </div>
          </div>
        )}

        {/* Calling Stage */}
        {callStage === 'calling' && (
          <div className="text-center animate-in fade-in">
            <div className="mb-6 flex justify-center">
              <div className="p-8 bg-red-100 rounded-full animate-pulse">
                <Phone className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <h2 className="text-red-900 mb-2">Calling...</h2>
            <p className="text-red-700 mb-6">
              Attempting to reach {context?.residentName || 'resident'}
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                <p className="text-gray-700">🔊 AI Voice Call Active</p>
              </div>
            </div>
          </div>
        )}

        {/* Waiting for Response Stage */}
        {callStage === 'waiting' && (
          <div className="text-center animate-in fade-in">
            <div className="mb-6 flex justify-center">
              <div className="p-8 bg-red-100 rounded-full">
                <Phone className="w-16 h-16 text-red-600" />
              </div>
            </div>
            <h2 className="text-red-900 mb-2">Are You OK?</h2>
            <p className="text-red-700 mb-6">Please respond using your phone keypad</p>
            
            {/* Instructions */}
            <div className="mb-6 space-y-3">
              <div className="p-5 bg-white rounded-2xl shadow-sm border-2 border-gray-200">
                <p className="text-gray-900 mb-2">Press 1</p>
                <p className="text-gray-600 text-sm">If you're OK</p>
              </div>
              <div className="p-5 bg-white rounded-2xl shadow-sm border-2 border-gray-200">
                <p className="text-gray-900 mb-2">Press 2</p>
                <p className="text-gray-600 text-sm">For emergency help</p>
              </div>
            </div>

            {/* Simulate response buttons (for demo purposes) */}
            <div className="flex space-x-3">
              <Button
                onClick={() => handleResponse('1')}
                className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl"
              >
                I'm OK (Press 1)
              </Button>
              <Button
                onClick={() => handleResponse('2')}
                className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl"
              >
                Need Help (Press 2)
              </Button>
            </div>

            <p className="text-red-600 text-sm mt-4">
              No response after 2 calls → Emergency services will be contacted
            </p>
          </div>
        )}

        {/* Emergency Services Contacted Stage */}
        {callStage === 'contacted' && (
          <div className="text-center animate-in fade-in">
            <div className="mb-6 flex justify-center">
              <div className="p-8 bg-green-100 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h2 className="text-green-900 mb-2">Emergency Services Contacted</h2>
            <p className="text-green-700 mb-6">
              Help is on the way. Guardian has been notified.
            </p>

            <div className="space-y-3 mb-6">
              <div className="p-5 bg-white rounded-2xl shadow-sm border border-green-200">
                <p className="text-gray-900">✓ 911 Dispatch Notified</p>
                <p className="text-gray-600 text-sm mt-1">ETA: 6 minutes</p>
              </div>
              <div className="p-5 bg-white rounded-2xl shadow-sm border border-blue-200">
                <p className="text-gray-900">✓ Guardian Alerted</p>
                <p className="text-gray-600 text-sm mt-1">Notification sent</p>
              </div>
            </div>

            <Button
              onClick={onResolve}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl"
            >
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
