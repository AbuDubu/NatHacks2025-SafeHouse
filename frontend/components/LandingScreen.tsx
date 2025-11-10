import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

type UserMode = 'guardian' | 'resident' | null;

interface LandingScreenProps {
  selectedMode: UserMode;
  onModeSelect: (mode: UserMode) => void;
  onContinue: () => void;
}

export function LandingScreen({ selectedMode, onModeSelect, onContinue }: LandingScreenProps) {
  const { colors, isDark } = useTheme();
  
  const gradientColors = isDark 
    ? ['#1e293b', '#0f172a', '#020617']
    : ['#dbeafe', '#eff6ff', '#ffffff'];
  
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Ionicons name="shield" size={80} color="#2563eb" />
            <View style={styles.heartIcon}>
              <Ionicons name="heart" size={32} color="#f87171" style={styles.heartIconInner} />
            </View>
          </View>
          <Text style={[styles.title, { color: isDark ? colors.foreground : '#1e3a8a' }]}>SafeHaven</Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.mutedForeground : '#1e40af' }]}>Stay connected. Stay safe.</Text>
        </View>

        {/* Mode Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Guardian Card */}
          <TouchableOpacity
            onPress={() => onModeSelect('guardian')}
            style={[
              styles.card,
              { backgroundColor: isDark ? colors.card : '#ffffff' },
              selectedMode === 'guardian' && [styles.cardSelected, { backgroundColor: colors.primary }]
            ]}
          >
            <View style={styles.cardContent}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: selectedMode === 'guardian' ? 'rgba(255, 255, 255, 0.2)' : (isDark ? colors.muted : '#dbeafe') },
                selectedMode === 'guardian' && styles.iconContainerSelected
              ]}>
                <Ionicons name="hand-left" size={32} color={selectedMode === 'guardian' ? '#ffffff' : colors.primary} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={[
                  styles.cardTitle,
                  { color: selectedMode === 'guardian' ? '#ffffff' : (isDark ? colors.foreground : '#374151') }
                ]}>
                  I'm a Guardian
                </Text>
                <Text style={[
                  styles.cardSubtitle,
                  { color: selectedMode === 'guardian' ? 'rgba(255, 255, 255, 0.8)' : (isDark ? colors.mutedForeground : '#6b7280') }
                ]}>
                  Monitor and care for loved ones
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Resident Card */}
          <TouchableOpacity
            onPress={() => onModeSelect('resident')}
            style={[
              styles.card,
              { backgroundColor: isDark ? colors.card : '#ffffff' },
              selectedMode === 'resident' && [styles.cardSelected, { backgroundColor: colors.primary }]
            ]}
          >
            <View style={styles.cardContent}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: selectedMode === 'resident' ? 'rgba(255, 255, 255, 0.2)' : (isDark ? colors.muted : '#dbeafe') },
                selectedMode === 'resident' && styles.iconContainerSelected
              ]}>
                <Ionicons name="person" size={32} color={selectedMode === 'resident' ? '#ffffff' : colors.primary} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={[
                  styles.cardTitle,
                  { color: selectedMode === 'resident' ? '#ffffff' : (isDark ? colors.foreground : '#374151') }
                ]}>
                  I'm a Resident
                </Text>
                <Text style={[
                  styles.cardSubtitle,
                  { color: selectedMode === 'resident' ? 'rgba(255, 255, 255, 0.8)' : (isDark ? colors.mutedForeground : '#6b7280') }
                ]}>
                  Stay safe and connected
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        {selectedMode && (
          <TouchableOpacity
            onPress={onContinue}
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={[styles.footerSeparator, { color: isDark ? colors.mutedForeground : '#93c5fd' }]}>•</Text>
          <TouchableOpacity>
            <Text style={[styles.footerLink, { color: colors.primary }]}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIconInner: {
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  cardsContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
    gap: 16,
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardSelected: {
    borderWidth: 4,
    borderColor: '#93c5fd',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    padding: 16,
    borderRadius: 999,
  },
  iconContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  continueButton: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 48,
    gap: 16,
  },
  footerLink: {
    fontSize: 14,
  },
  footerSeparator: {
    fontSize: 14,
  },
});
