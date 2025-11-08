/**
 * SafeHouse Mobile App Entry Point
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { AlertProvider } from './src/contexts/AlertContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <AlertProvider>
          <HomeScreen />
        </AlertProvider>
      </AuthProvider>
    </>
  );
}
