import { useState } from 'react';
import { Link2, Send, KeyRound } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

type UserMode = 'guardian' | 'resident' | null;

interface ConnectionScreenProps {
  userMode: UserMode;
  onComplete: (skipConnection?: boolean) => void;
}

export function ConnectionScreen({ userMode, onComplete }: ConnectionScreenProps) {
  const [code, setCode] = useState('');
  const [showCodeSent, setShowCodeSent] = useState(false);

  const handleSendCode = () => {
    setShowCodeSent(true);
    setTimeout(() => setShowCodeSent(false), 3000);
  };

  const handleEnterCode = () => {
    if (code.length >= 4) {
      onComplete(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-100 via-blue-50 to-white">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-blue-100 rounded-full">
            <Link2 className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-blue-900 text-center mb-2">
          Connect with your {userMode === 'guardian' ? 'Resident' : 'Guardian'}
        </h2>
        <p className="text-blue-700 text-center mb-8 opacity-80">
          Share a secure code to link your profiles and start monitoring
        </p>

        {/* Connection Options */}
        <div className="space-y-4 mb-6">
          {/* Send Code */}
          <div className="p-6 bg-white rounded-3xl shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Send className="w-5 h-5 text-blue-600" />
              <p className="text-gray-800">Send Connection Code</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Generate and share a secure code with your {userMode === 'guardian' ? 'resident' : 'guardian'}
            </p>
            <Button
              onClick={handleSendCode}
              variant="outline"
              className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Generate Code
            </Button>
            {showCodeSent && (
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 animate-in fade-in">
                <p className="text-green-800 text-center">Code: <span className="font-mono">8472</span></p>
                <p className="text-sm text-green-600 text-center mt-1">Share this code securely</p>
              </div>
            )}
          </div>

          {/* Enter Code */}
          <div className="p-6 bg-white rounded-3xl shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <p className="text-gray-800">Enter Connection Code</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Enter the code provided by your {userMode === 'guardian' ? 'resident' : 'guardian'}
            </p>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Enter 4-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg tracking-widest"
                maxLength={4}
              />
              <Button
                onClick={handleEnterCode}
                disabled={code.length < 4}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Connect
              </Button>
            </div>
          </div>
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={() => onComplete(true)}
            className="text-blue-600 hover:underline text-sm"
          >
            Continue without connecting
          </button>
        </div>
      </div>
    </div>
  );
}
