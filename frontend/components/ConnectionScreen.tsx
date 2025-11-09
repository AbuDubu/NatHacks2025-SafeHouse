import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type UserMode = 'guardian' | 'resident' | null;

interface ConnectionScreenProps {
  userMode: UserMode;
  onComplete: (skipConnection?: boolean) => void;
}

export function ConnectionScreen({ userMode, onComplete }: ConnectionScreenProps) {
  const [code, setCode] = useState('');
  const [showCodeSent, setShowCodeSent] = useState(false);

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
      colors={['#dbeafe', '#eff6ff', '#ffffff']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="link" size={48} color="#2563eb" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Connect with your {userMode === 'guardian' ? 'Resident' : 'Guardian'}
          </Text>
          <Text style={styles.subtitle}>
            Share a secure code to link your profiles and start monitoring
          </Text>

          {/* Connection Options */}
          <View style={styles.optionsContainer}>
            {/* Send Code */}
            <View style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <Ionicons name="send" size={20} color="#2563eb" />
                <Text style={styles.optionTitle}>Send Connection Code</Text>
              </View>
              <Text style={styles.optionDescription}>
                Generate and share a secure code with your {userMode === 'guardian' ? 'resident' : 'guardian'}
              </Text>
              <TouchableOpacity
                onPress={handleSendCode}
                style={styles.optionButton}
              >
                <Text style={styles.optionButtonText}>Generate Code</Text>
              </TouchableOpacity>
              {showCodeSent && (
                <View style={styles.codeSentContainer}>
                  <Text style={styles.codeSentText}>
                    Code: <Text style={styles.codeValue}>8472</Text>
                  </Text>
                  <Text style={styles.codeSentSubtext}>Share this code securely</Text>
                </View>
              )}
            </View>

            {/* Enter Code */}
            <View style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <Ionicons name="key" size={20} color="#2563eb" />
                <Text style={styles.optionTitle}>Enter Connection Code</Text>
              </View>
              <Text style={styles.optionDescription}>
                Enter the code provided by your {userMode === 'guardian' ? 'resident' : 'guardian'}
              </Text>
              <TextInput
                style={styles.codeInput}
                placeholder="Enter 4-digit code"
                placeholderTextColor="#9ca3af"
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
                  code.length < 4 && styles.connectButtonDisabled
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
            <Text style={styles.skipButtonText}>Continue without connecting</Text>
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
    backgroundColor: '#dbeafe',
    borderRadius: 999,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#1e40af',
    opacity: 0.8,
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
    backgroundColor: '#ffffff',
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
    color: '#1f2937',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93c5fd',
    backgroundColor: '#ffffff',
  },
  optionButtonText: {
    color: '#2563eb',
    textAlign: 'center',
    fontWeight: '500',
  },
  codeSentContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  codeSentText: {
    color: '#166534',
    textAlign: 'center',
    marginBottom: 4,
  },
  codeValue: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  codeSentSubtext: {
    fontSize: 12,
    color: '#15803d',
    textAlign: 'center',
  },
  codeInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    letterSpacing: 8,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  connectButton: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#2563eb',
  },
  connectButtonDisabled: {
    backgroundColor: '#9ca3af',
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
    color: '#2563eb',
  },
});
