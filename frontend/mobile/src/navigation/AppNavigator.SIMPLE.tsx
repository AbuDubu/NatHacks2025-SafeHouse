/**
 * Simplified App Navigation for Testing
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Simplified screens - no contexts needed
import HomeScreen from '../screens/HomeScreen.SIMPLE';
import AlertScreen from '../screens/AlertScreen.SIMPLE';
import ProfileScreen from '../screens/ProfileScreen.SIMPLE';

export type MainTabParamList = {
  Home: undefined;
  Alerts: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Tab.Screen 
          name="Alerts" 
          component={AlertScreen}
          options={{ title: 'Alerts' }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
