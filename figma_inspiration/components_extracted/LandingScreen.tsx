import { Shield, Heart, Hand, User } from 'lucide-react';
import { Button } from './ui/button';

type UserMode = 'guardian' | 'resident' | null;

interface LandingScreenProps {
  selectedMode: UserMode;
  onModeSelect: (mode: UserMode) => void;
  onContinue: () => void;
}

export function LandingScreen({ selectedMode, onModeSelect, onContinue }: LandingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-100 via-blue-50 to-white">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="relative mb-4">
          <Shield className="w-20 h-20 text-blue-600" strokeWidth={1.5} />
          <Heart className="w-8 h-8 text-red-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h1 className="text-blue-900 text-center mb-2">SafeHaven</h1>
        <p className="text-blue-700 text-center opacity-80">Stay connected. Stay safe.</p>
      </div>

      {/* Mode Selection Cards */}
      <div className="w-full max-w-sm space-y-4 mb-8">
        {/* Guardian Card */}
        <button
          onClick={() => onModeSelect('guardian')}
          className={`w-full p-6 rounded-3xl shadow-lg transition-all transform hover:scale-105 ${
            selectedMode === 'guardian'
              ? 'bg-blue-600 text-white ring-4 ring-blue-300'
              : 'bg-white text-gray-800 hover:shadow-xl'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`p-4 rounded-full ${
                selectedMode === 'guardian' ? 'bg-white/20' : 'bg-blue-100'
              }`}
            >
              <Hand
                className={`w-8 h-8 ${selectedMode === 'guardian' ? 'text-white' : 'text-blue-600'}`}
              />
            </div>
            <div className="flex-1 text-left">
              <p className={selectedMode === 'guardian' ? 'text-white' : 'text-gray-600'}>
                I'm a Guardian
              </p>
              <p
                className={`text-sm ${
                  selectedMode === 'guardian' ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                Monitor and care for loved ones
              </p>
            </div>
          </div>
        </button>

        {/* Resident Card */}
        <button
          onClick={() => onModeSelect('resident')}
          className={`w-full p-6 rounded-3xl shadow-lg transition-all transform hover:scale-105 ${
            selectedMode === 'resident'
              ? 'bg-blue-600 text-white ring-4 ring-blue-300'
              : 'bg-white text-gray-800 hover:shadow-xl'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div
              className={`p-4 rounded-full ${
                selectedMode === 'resident' ? 'bg-white/20' : 'bg-blue-100'
              }`}
            >
              <User
                className={`w-8 h-8 ${selectedMode === 'resident' ? 'text-white' : 'text-blue-600'}`}
              />
            </div>
            <div className="flex-1 text-left">
              <p className={selectedMode === 'resident' ? 'text-white' : 'text-gray-600'}>
                I'm a Resident
              </p>
              <p
                className={`text-sm ${
                  selectedMode === 'resident' ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                Stay safe and connected
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Continue Button */}
      {selectedMode && (
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4">
          <Button
            onClick={onContinue}
            className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            Continue
          </Button>
        </div>
      )}

      {/* Footer Links */}
      <div className="mt-12 flex space-x-4 text-sm text-blue-600">
        <button className="hover:underline">Privacy Policy</button>
        <span className="text-blue-300">•</span>
        <button className="hover:underline">Terms of Service</button>
      </div>
    </div>
  );
}
