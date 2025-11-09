import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type UserMode = 'guardian' | 'resident' | null;

interface LandingScreenProps {
  selectedMode: UserMode;
  onModeSelect: (mode: UserMode) => void;
  onContinue: () => void;
}

export function LandingScreen({ selectedMode, onModeSelect, onContinue }: LandingScreenProps) {
  return (
    <LinearGradient
      colors={['#dbeafe', '#eff6ff', '#ffffff']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Ionicons name="shield" size={80} color="#2563eb" />
            <View style={styles.heartIcon}>
              <Ionicons name="heart" size={32} color="#f87171" />
            </View>
          </View>
          <Text style={styles.title}>SafeHaven</Text>
          <Text style={styles.subtitle}>Stay connected. Stay safe.</Text>
        </View>

        {/* Mode Selection Cards */}
        <View style={styles.cardsContainer}>
          {/* Guardian Card */}
          <TouchableOpacity
            onPress={() => onModeSelect('guardian')}
            style={[
              styles.card,
              selectedMode === 'guardian' && styles.cardSelected
            ]}
          >
            <View style={styles.cardContent}>
              <View style={[
                styles.iconContainer,
                selectedMode === 'guardian' && styles.iconContainerSelected
              ]}>
                <Ionicons name="hand-left" size={32} color={selectedMode === 'guardian' ? '#ffffff' : '#2563eb'} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={[
                  styles.cardTitle,
                  selectedMode === 'guardian' && styles.cardTitleSelected
                ]}>
                  I'm a Guardian
                </Text>
                <Text style={[
                  styles.cardSubtitle,
                  selectedMode === 'guardian' && styles.cardSubtitleSelected
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
              selectedMode === 'resident' && styles.cardSelected
            ]}
          >
            <View style={styles.cardContent}>
              <View style={[
                styles.iconContainer,
                selectedMode === 'resident' && styles.iconContainerSelected
              ]}>
                <Ionicons name="person" size={32} color={selectedMode === 'resident' ? '#ffffff' : '#2563eb'} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={[
                  styles.cardTitle,
                  selectedMode === 'resident' && styles.cardTitleSelected
                ]}>
                  I'm a Resident
                </Text>
                <Text style={[
                  styles.cardSubtitle,
                  selectedMode === 'resident' && styles.cardSubtitleSelected
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
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        )}

        {/* Footer Links */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.footerSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Terms of Service</Text>
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
  },
  heartIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#1e40af',
    opacity: 0.8,
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
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardSelected: {
    backgroundColor: '#2563eb',
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
    backgroundColor: '#dbeafe',
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
    color: '#374151',
    marginBottom: 4,
  },
  cardTitleSelected: {
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardSubtitleSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  continueButton: {
    width: '100%',
    maxWidth: 400,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
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
    color: '#2563eb',
  },
  footerSeparator: {
    fontSize: 14,
    color: '#93c5fd',
  },
});
