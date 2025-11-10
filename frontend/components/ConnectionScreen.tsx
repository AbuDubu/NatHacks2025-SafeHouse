import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

type UserMode = 'guardian' | 'resident' | null;

interface ConnectionScreenProps {
  userMode: UserMode;
  onComplete: (skipConnection?: boolean) => void;
}

export function ConnectionScreen({ userMode, onComplete }: ConnectionScreenProps) {
  const { colors, isDark } = useTheme();
  const [code, setCode] = useState('');
  const [showCodeSent, setShowCodeSent] = useState(false);

  const gradientColors = isDark 
    ? ['#1e293b', '#0f172a', '#020617']
    : ['#dbeafe', '#eff6ff', '#ffffff'];

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
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? colors.muted : '#dbeafe' }]}>
              <Ionicons name="link" size={48} color={colors.primary} />
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: isDark ? colors.foreground : '#1e3a8a' }]}>
            Connect with your {userMode === 'guardian' ? 'Resident' : 'Guardian'}
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? colors.mutedForeground : '#1e40af' }]}>
            Share a secure code to link your profiles and start monitoring
          </Text>

          {/* Connection Options */}
          <View style={styles.optionsContainer}>
            {/* Send Code */}
            <View style={[styles.optionCard, { backgroundColor: isDark ? colors.card : '#ffffff' }]}>
              <View style={styles.optionHeader}>
                <Ionicons name="send" size={20} color={colors.primary} />
                <Text style={[styles.optionTitle, { color: isDark ? colors.foreground : '#1f2937' }]}>Send Connection Code</Text>
              </View>
              <Text style={[styles.optionDescription, { color: isDark ? colors.mutedForeground : '#6b7280' }]}>
                Generate and share a secure code with your {userMode === 'guardian' ? 'resident' : 'guardian'}
              </Text>
              <TouchableOpacity
                onPress={handleSendCode}
                style={[styles.optionButton, { 
                  borderColor: colors.primary,
                  backgroundColor: isDark ? colors.muted : '#ffffff'
                }]}
              >
                <Text style={[styles.optionButtonText, { color: colors.primary }]}>Generate Code</Text>
              </TouchableOpacity>
              {showCodeSent && (
                <View style={[styles.codeSentContainer, { 
                  backgroundColor: isDark ? '#1a2e1a' : '#f0fdf4',
                  borderColor: isDark ? '#22c55e' : '#bbf7d0'
                }]}>
                  <Text style={[styles.codeSentText, { color: isDark ? '#86efac' : '#166534' }]}>
                    Code: <Text style={styles.codeValue}>8472</Text>
                  </Text>
                  <Text style={[styles.codeSentSubtext, { color: isDark ? '#86efac' : '#15803d' }]}>Share this code securely</Text>
                </View>
              )}
            </View>

            {/* Enter Code */}
            <View style={[styles.optionCard, { backgroundColor: isDark ? colors.card : '#ffffff' }]}>
              <View style={styles.optionHeader}>
                <Ionicons name="key" size={20} color={colors.primary} />
                <Text style={[styles.optionTitle, { color: isDark ? colors.foreground : '#1f2937' }]}>Enter Connection Code</Text>
              </View>
              <Text style={[styles.optionDescription, { color: isDark ? colors.mutedForeground : '#6b7280' }]}>
                Enter the code provided by your {userMode === 'guardian' ? 'resident' : 'guardian'}
              </Text>
              <TextInput
                style={[styles.codeInput, { 
                  borderColor: isDark ? colors.border : '#d1d5db',
                  backgroundColor: isDark ? colors.muted : '#ffffff',
                  color: isDark ? colors.foreground : '#000000'
                }]}
                placeholder="Enter 4-digit code"
                placeholderTextColor={isDark ? colors.mutedForeground : '#9ca3af'}
                value={code}
                onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 4))}
                keyboardType="number-pad"
                maxLength={4}
                textAlign="center"
              />
              <TouchableOpacity
                onPress={handleEnterCode}
                disabled={code.length < 4}
                style={[
                  styles.connectButton,
                  { backgroundColor: code.length >= 4 ? colors.primary : (isDark ? colors.muted : '#9ca3af') }
                ]}
              >
                <Text style={styles.connectButtonText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Skip Option */}
          <TouchableOpacity
            onPress={() => onComplete(true)}
            style={styles.skipButton}
          >
            <Text style={[styles.skipButtonText, { color: colors.primary }]}>Continue without connecting</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    padding: 24,
    borderRadius: 999,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
    gap: 16,
  },
  optionCard: {
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionButtonText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  codeSentContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  codeSentText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  codeValue: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  codeSentSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  codeInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    letterSpacing: 8,
    marginBottom: 12,
  },
  connectButton: {
    padding: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
  },
  skipButton: {
    marginTop: 8,
  },
  skipButtonText: {
    fontSize: 14,
  },
});
