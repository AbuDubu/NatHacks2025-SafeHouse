import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

