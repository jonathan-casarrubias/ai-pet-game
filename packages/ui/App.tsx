import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGameSession } from './src/hooks/useGameSession';
import { GameScreen } from './src/screens/GameScreen';

export default function App() {
  const { session, actions } = useGameSession('Lumi');

  if (session.phase === 'loading') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#a78bfa" />
        <Text style={styles.loadingText}>Connecting to Lumi&apos;s World...</Text>
      </SafeAreaView>
    );
  }

  if (session.phase === 'error') {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <StatusBar style="light" />
        <Text style={styles.errorIcon}>😿</Text>
        <Text style={styles.errorTitle}>Could not start game</Text>
        <Text style={styles.errorMessage}>{session.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <GameScreen
      presentation={session.presentation}
      actions={actions}
      sessionId={session.sessionId}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: '#090514',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#c4b5fd',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    color: '#f3e8ff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#fca5a5',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
