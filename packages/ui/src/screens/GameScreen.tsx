import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { GameWorldRenderer } from '../renderer/GameWorldRenderer';
import type { PresentationModel } from '../presentation/presentation-model';
import type { GameSessionActions } from '../hooks/useGameSession';

type GameScreenProps = {
  presentation: PresentationModel;
  actions: GameSessionActions;
  sessionId: string;
};

export const GameScreen: React.FC<GameScreenProps> = ({
  presentation,
  actions,
}) => {
  const handleStoneTap = () => {
    void actions.generate('blue-stone');
  };

  const handlePetTap = () => {
    void actions.submitAction('observe', 'lumi');
  };

  const handleExploreAction = () => {
    void actions.submitAction('explore', 'blue-stone');
  };

  const isGenerating = presentation.isGenerating;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <View style={styles.headerHud}>
          <View>
            <Text style={styles.titleText}>🐾 {presentation.petName}&apos;s World</Text>
            <Text style={styles.subtitleText}>
              Mood: <Text style={styles.highlightText}>{presentation.petVisualState}</Text>
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Interactions: {presentation.petInteractionCount}
            </Text>
          </View>
        </View>

        <View style={styles.worldWrapper}>
          <GameWorldRenderer
            presentation={presentation}
            onSelectPet={handlePetTap}
            onSelectObject={handleStoneTap}
          />
        </View>

        <ScrollView style={styles.hudScroll} contentContainerStyle={styles.hudContent}>
          {presentation.activeNarrative ? (
            <View style={styles.narrativeCard}>
              <Text style={styles.narrativeHeader}>✨ Story Chapter</Text>
              <Text style={styles.narrativeText}>{presentation.activeNarrative}</Text>
            </View>
          ) : (
            <View style={styles.narrativeCardHint}>
              <Text style={styles.hintText}>
                Tap the glowing <Text style={styles.stoneHighlight}>Mysterious Stone</Text> or press the AI button below to channel magic!
              </Text>
            </View>
          )}

          {presentation.lastError && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>⚠️ {presentation.lastError}</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.primaryButton, isGenerating && styles.disabledButton]}
              onPress={handleStoneTap}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.buttonText}>✨ AI Channel Magic</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, isGenerating && styles.disabledButton]}
              onPress={handleExploreAction}
              disabled={isGenerating}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>🔍 Explore Stone</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090514',
  },
  container: {
    flex: 1,
    backgroundColor: '#090514',
  },
  headerHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#150d2a',
    borderBottomWidth: 1,
    borderBottomColor: '#2e1d52',
  },
  titleText: {
    color: '#f3e8ff',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitleText: {
    color: '#a78bfa',
    fontSize: 13,
    marginTop: 2,
  },
  highlightText: {
    color: '#e9d5ff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  badge: {
    backgroundColor: '#2e1d52',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4c1d95',
  },
  badgeText: {
    color: '#c4b5fd',
    fontSize: 12,
    fontWeight: '600',
  },
  worldWrapper: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#090514',
  },
  hudScroll: {
    flex: 1,
    backgroundColor: '#0f0a1c',
  },
  hudContent: {
    padding: 16,
    gap: 12,
  },
  narrativeCard: {
    backgroundColor: '#1e1438',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3b2175',
  },
  narrativeHeader: {
    color: '#ddd6fe',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  narrativeText: {
    color: '#f5f3ff',
    fontSize: 15,
    lineHeight: 22,
  },
  narrativeCardHint: {
    backgroundColor: '#161026',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#291b47',
  },
  hintText: {
    color: '#a78bfa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  stoneHighlight: {
    color: '#38bdf8',
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#450a0a',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryButtonText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
