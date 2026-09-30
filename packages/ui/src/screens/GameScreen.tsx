import React, { useCallback, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { GameWorldRenderer } from '../renderer/GameWorldRenderer';
import type { PresentationModel } from '../presentation/presentation-model';
import type { GameSessionActions } from '../hooks/useGameSession';

type GameScreenProps = {
  presentation: PresentationModel;
  actions: GameSessionActions;
  sessionId: string;
};

const MOVE_STEP = 32;
const EXPLORATION_GENERATION_STEPS = 4;

export const GameScreen: React.FC<GameScreenProps> = ({ presentation, actions }) => {
  const { width, height } = useWindowDimensions();
  const movementPending = useRef(false);
  const isGeneratingRef = useRef(presentation.isGenerating);
  const explorationMoves = useRef(0);
  const startingY = useRef(presentation.playerPosition.y);
  const playerPositionRef = useRef(presentation.playerPosition);
  const worldBoundsRef = useRef(presentation.worldBounds);
  isGeneratingRef.current = presentation.isGenerating;
  playerPositionRef.current = presentation.playerPosition;
  worldBoundsRef.current = presentation.worldBounds;

  const move = useCallback(async (direction: 'up' | 'down') => {
    if (isGeneratingRef.current || movementPending.current) return;
    movementPending.current = true;
    const current = playerPositionRef.current;
    const bounds = worldBoundsRef.current;
    const nextY = Math.max(
      bounds.minY,
      Math.min(
        bounds.maxY,
        current.y + (direction === 'up' ? -MOVE_STEP : MOVE_STEP),
      ),
    );
    if (nextY === current.y) {
      movementPending.current = false;
      return;
    }

    try {
      const accepted = await actions.move({
        x: current.x,
        y: nextY,
      });
      if (!accepted) return;
      playerPositionRef.current = { x: current.x, y: nextY };

      explorationMoves.current += 1;
      if (explorationMoves.current >= EXPLORATION_GENERATION_STEPS) {
        explorationMoves.current = 0;
        void actions.generate('exploration-frontier');
      }
    } finally {
      movementPending.current = false;
    }
  }, [actions.move]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      event.preventDefault();
      if (event.repeat) return;
      void move(event.key === 'ArrowUp' ? 'up' : 'down');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleEntitySelect = async (entityId: string) => {
    if (presentation.isGenerating) return;
    const accepted = await actions.interact(entityId);
    if (accepted) void actions.generate(entityId);
  };

  const nearbyEntities = presentation.entities.filter(
    (entity) => entity.isNearby && !entity.isEscapedThreat,
  );
  const activeThreats = presentation.entities.filter(
    (entity) => entity.role === 'threat' && !entity.isEscapedThreat && entity.state !== 'escaped',
  );
  const trailDepth = Math.max(
    0,
    Math.round(Math.abs(startingY.current - presentation.playerPosition.y) / MOVE_STEP),
  );
  const sceneWidth = Math.min(width, 1040);
  const sceneHeight = Math.min(560, Math.max(300, height * 0.55));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.eyebrow}>FIELD JOURNAL</Text>
            <Text style={styles.title}>{presentation.petName}&apos;s trail</Text>
          </View>
          <View style={styles.depthReadout}>
            <Text style={styles.depthNumber}>{String(trailDepth).padStart(2, '0')}</Text>
            <Text style={styles.depthLabel}>steps explored</Text>
          </View>
        </View>

        <View style={styles.worldFrame}>
          <GameWorldRenderer
            presentation={presentation}
            onMove={(direction) => void move(direction)}
            onSelectEntity={(entityId) => void handleEntitySelect(entityId)}
            width={sceneWidth}
            height={sceneHeight}
          />
          <View pointerEvents="none" style={styles.sceneCaption}>
            <Text style={styles.sceneCaptionText}>THE TRAIL CONTINUES</Text>
          </View>
        </View>

        <View style={styles.hud}>
          <View style={styles.signalRow}>
            <View style={[styles.signalDot, activeThreats.length > 0 && styles.dangerDot]} />
            <Text style={styles.signalText}>
              {activeThreats.length > 0
                ? `${activeThreats.length} presence${activeThreats.length === 1 ? '' : 's'} in the wild`
                : nearbyEntities.length > 0
                  ? `Within reach · ${nearbyEntities[0]?.label}`
                  : 'Quiet trail · keep exploring'}
            </Text>
            <Text style={styles.interactionCount}>{presentation.petInteractionCount} interactions</Text>
          </View>

          <Text style={styles.feedbackText}>
            {presentation.lastError ?? presentation.statusMessage ??
              (nearbyEntities.length > 0
                ? 'Tap a glowing shape to explore it.'
                : 'Use ↑ / ↓ or swipe up / down to follow the trail.')}
          </Text>

          {presentation.activeNarrative ? (
            <ScrollView style={styles.storyViewport}>
              <Text style={styles.storyText}>{presentation.activeNarrative}</Text>
            </ScrollView>
          ) : null}

          <TouchableOpacity
            style={[styles.revealButton, presentation.isGenerating && styles.disabledButton]}
            onPress={() => void actions.generate()}
            disabled={presentation.isGenerating}
            activeOpacity={0.84}
          >
            {presentation.isGenerating ? (
              <ActivityIndicator color="#fffaf0" size="small" />
            ) : (
              <Text style={styles.revealButtonText}>
                {presentation.entities.length === 0 ? 'Reveal what lies ahead' : 'Listen for what comes next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3e8ca',
  },
  page: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#f3e8ca',
  },
  header: {
    width: '100%',
    maxWidth: 1040,
    minHeight: 70,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandBlock: {
    gap: 2,
  },
  eyebrow: {
    color: '#65806a',
    fontSize: 10,
    fontWeight: '800',
  },
  title: {
    color: '#273d35',
    fontSize: 22,
    fontWeight: '800',
  },
  depthReadout: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
  },
  depthNumber: {
    color: '#b35b40',
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  depthLabel: {
    color: '#657266',
    fontSize: 11,
    fontWeight: '700',
  },
  worldFrame: {
    width: '100%',
    maxWidth: 1040,
    alignItems: 'center',
    overflow: 'hidden',
  },
  sceneCaption: {
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(37, 74, 55, 0.35)',
  },
  sceneCaptionText: {
    color: '#f8efd8',
    fontSize: 9,
    fontWeight: '800',
  },
  hud: {
    width: '100%',
    maxWidth: 1040,
    flex: 1,
    minHeight: 176,
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 16,
    backgroundColor: '#fffaf0',
    gap: 10,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6e9a70',
  },
  dangerDot: {
    backgroundColor: '#d65e47',
  },
  signalText: {
    flex: 1,
    color: '#43584c',
    fontSize: 12,
    fontWeight: '700',
  },
  interactionCount: {
    color: '#788276',
    fontSize: 11,
    fontWeight: '600',
  },
  feedbackText: {
    color: '#68766b',
    fontSize: 13,
    lineHeight: 18,
  },
  storyViewport: {
    maxHeight: 58,
  },
  storyText: {
    color: '#354a3d',
    fontSize: 14,
    lineHeight: 19,
  },
  revealButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 5,
    backgroundColor: '#b35b40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealButtonText: {
    color: '#fffaf0',
    fontSize: 14,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.62,
  },
});