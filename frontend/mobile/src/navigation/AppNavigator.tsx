/**
 * Main App Navigation
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import AlertScreen from '../screens/AlertScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PairingScreen from '../screens/PairingScreen';
import AlertDetailScreen from '../screens/AlertDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  AlertDetail: { alertId: string };
  Pairing: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Alerts: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#EF4444',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
      />
      <Tab.Screen 
        name="Alerts" 
        component={AlertScreen}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Pairing" 
              component={PairingScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AlertDetail" 
              component={AlertDetailScreen}
              options={{ title: 'Alert Details' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
