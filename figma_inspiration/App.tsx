import { useState } from 'react';
import { LandingScreen } from './components/LandingScreen';
import { ConnectionScreen } from './components/ConnectionScreen';
import { ResidentDashboard } from './components/ResidentDashboard';
import { GuardianDashboard } from './components/GuardianDashboard';
import { EmergencyFlow } from './components/EmergencyFlow';

type Screen = 'landing' | 'connection' | 'resident' | 'guardian' | 'emergency';
type UserMode = 'guardian' | 'resident' | null;

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userMode, setUserMode] = useState<UserMode>(null);
  const [residentName, setResidentName] = useState('Margaret');
  const [emergencyContext, setEmergencyContext] = useState<{
    residentName?: string;
    alertType?: string;
  }>({});

  const handleModeSelect = (mode: UserMode) => {
    setUserMode(mode);
  };

  const handleContinue = () => {
    setCurrentScreen('connection');
  };

  const handleConnectionComplete = (skipConnection?: boolean) => {
    if (userMode === 'guardian') {
      setCurrentScreen('guardian');
    } else {
      setCurrentScreen('resident');
    }
  };

  const handleEmergency = (context?: { residentName?: string; alertType?: string }) => {
    setEmergencyContext(context || {});
    setCurrentScreen('emergency');
  };

  const handleEmergencyResolve = () => {
    // Return to appropriate dashboard
    if (userMode === 'guardian') {
      setCurrentScreen('guardian');
    } else {
      setCurrentScreen('resident');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentScreen === 'landing' && (
          <LandingScreen
            selectedMode={userMode}
            onModeSelect={handleModeSelect}
            onContinue={handleContinue}
          />
        )}
        {currentScreen === 'connection' && (
          <ConnectionScreen
            userMode={userMode}
            onComplete={handleConnectionComplete}
          />
        )}
        {currentScreen === 'resident' && (
          <ResidentDashboard
            name={residentName}
            onEmergency={handleEmergency}
          />
        )}
        {currentScreen === 'guardian' && (
          <GuardianDashboard onEmergency={handleEmergency} />
        )}
        {currentScreen === 'emergency' && (
          <EmergencyFlow
            context={emergencyContext}
            onResolve={handleEmergencyResolve}
          />
        )}
      </div>
    </div>
  );
}
