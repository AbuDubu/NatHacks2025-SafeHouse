import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LandingScreen } from './components/LandingScreen';
import { ConnectionScreen } from './components/ConnectionScreen';
import { ResidentDashboard } from './components/ResidentDashboard';
import { GuardianDashboard } from './components/GuardianDashboard';
import { EmergencyFlow } from './components/EmergencyFlow';
import { apiClient } from './lib/api';

type Screen = 'landing' | 'connection' | 'resident' | 'guardian' | 'emergency';
type UserMode = 'guardian' | 'resident' | null;

function AppContent() {
  const { colors } = useTheme();
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [userMode, setUserMode] = useState<UserMode>(null);
  const [residentName, setResidentName] = useState('Margaret');
  const [emergencyContext, setEmergencyContext] = useState<{
    residentName?: string;
    alertType?: string;
  }>({});

  useEffect(() => {
    // Try to load primary user name on app start
    loadPrimaryUserName();
  }, []);

  const loadPrimaryUserName = async () => {
    try {
      const user = await apiClient.getPrimaryUser();
      setResidentName(user.name);
    } catch (err) {
      console.error('Error loading primary user:', err);
      // Keep default name if API fails
    }
  };

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

  const handleEmergency = async (context?: { residentName?: string; alertType?: string }) => {
    setEmergencyContext(context || {});
    
    // Make the actual phone call
    try {
      const result = await apiClient.makeEmergencyCall({
        resident_name: context?.residentName,
        alert_type: context?.alertType,
      });
      console.log('Emergency call initiated:', result);
    } catch (error) {
      console.error('Failed to initiate emergency call:', error);
      // Still show emergency screen even if call fails
    }
    
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

  const handleLogout = () => {
    // Reset all state and go back to landing screen
    setUserMode(null);
    setCurrentScreen('landing');
    setEmergencyContext({});
    // Reset resident name to default (will be reloaded if needed)
    setResidentName('Margaret');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
          onLogout={handleLogout}
        />
      )}
      {currentScreen === 'guardian' && (
        <GuardianDashboard onEmergency={handleEmergency} onLogout={handleLogout} />
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
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
