/**
 * useGameSession -- manages the game session lifecycle.
 *
 * Creates an anonymous session on mount, holds authoritative GameState,
 * derives PresentationModel, and exposes generate + submitAction.
 *
 * Components receive only PresentationModel and action callbacks.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { RuntimeClient } from '../api/runtime-client';
import { RUNTIME_BASE_URL } from '../config/runtime';
import { mapGameStateToPresentationModel } from '../presentation/presentation-mapper';
import type { PresentationModel } from '../presentation/presentation-model';
import type {
  GameState,
  GenerateResponse,
  PlayerAction,
  Position,
} from '../api/runtime-client';

const client = new RuntimeClient({ baseUrl: RUNTIME_BASE_URL });

export type GameSessionState =
  | { phase: 'loading' }
  | { phase: 'error'; message: string }
  | {
      phase: 'playing';
      sessionId: string;
      gameState: GameState;
      presentation: PresentationModel;
    };

export type GameSessionActions = {
  generate: (elementId?: string) => Promise<void>;
  move: (position: Position) => Promise<boolean>;
  interact: (entityId: string) => Promise<boolean>;
};

export function useGameSession(petName = 'Lumi'): {
  session: GameSessionState;
  actions: GameSessionActions;
} {
  const [session, setSession] = useState<GameSessionState>({ phase: 'loading' });
  const sessionIdRef = useRef<string | null>(null);
  const narrativeRef = useRef<string | null>(null);
  const statusMessageRef = useRef<string | null>(null);
  const generationInFlightRef = useRef(false);

  const generate = useCallback(async (elementId?: string) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId || generationInFlightRef.current) return;
    generationInFlightRef.current = true;
    setSession((prev) => {
      if (prev.phase !== 'playing') return prev;
      return {
        ...prev,
        presentation: mapGameStateToPresentationModel(prev.gameState, {
          isGenerating: true,
          activeNarrative: narrativeRef.current,
          statusMessage: statusMessageRef.current,
        }),
      };
    });
    try {
      const result: GenerateResponse = await client.generate(sessionId, elementId);
      const acceptedCtx = result.acceptedContext ?? result.context ?? null;
      narrativeRef.current = acceptedCtx?.narrative ?? result.proposal?.narrative ?? null;
      setSession((prev) => {
        if (prev.phase !== 'playing') return prev;
        const newEntities = Object.values(result.state.world.entities).filter(
          (entity) => prev.gameState.world.entities[entity.id] === undefined,
        );
        statusMessageRef.current = newEntities.length > 0
          ? `${newEntities[0]?.label ?? 'Something new'} appeared along the trail.`
          : 'Lumi listened to the world around her.';
        return {
          ...prev,
          gameState: result.state,
          presentation: mapGameStateToPresentationModel(result.state, {
            isGenerating: false,
            acceptedContext: acceptedCtx,
            activeNarrative: narrativeRef.current,
            statusMessage: statusMessageRef.current,
          }),
        };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed';
      setSession((prev) => {
        if (prev.phase !== 'playing') return prev;
        return {
          ...prev,
          presentation: mapGameStateToPresentationModel(prev.gameState, {
            isGenerating: false,
            lastError: msg,
            activeNarrative: narrativeRef.current,
            statusMessage: statusMessageRef.current,
          }),
        };
      });
    } finally {
      generationInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const { sessionId, state } = await client.createSession(petName);
        if (cancelled) return;
        sessionIdRef.current = sessionId;
        setSession({
          phase: 'playing',
          sessionId,
          gameState: state,
          presentation: mapGameStateToPresentationModel(state),
        });
        void generate('exploration-frontier');
      } catch (err) {
        if (cancelled) return;
        setSession({
          phase: 'error',
          message: err instanceof Error ? err.message : 'Failed to connect to runtime',
        });
      }
    }
    void init();
    return () => { cancelled = true; };
  }, [petName, generate]);

  const submitAction = useCallback(async (action: PlayerAction): Promise<boolean> => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return false;
    try {
      const result = await client.submitAction(sessionId, action);
      let message: string | null = null;
      if (result.accepted && result.events.some((event) => event.type === 'pet_escaped_threat')) {
        message = 'Lumi dashed away from danger!';
      } else if (result.accepted && action.type === 'interact') {
        message = `Lumi explored ${result.state.world.entities[action.entityId]?.label ?? 'something nearby'}.`;
      } else if (result.accepted && action.type === 'move') {
        message = 'The trail opens ahead.';
      }
      statusMessageRef.current = message;
      setSession((prev) => {
        if (prev.phase !== 'playing') return prev;
        return {
          ...prev,
          gameState: result.state,
          presentation: mapGameStateToPresentationModel(result.state, {
            activeNarrative: narrativeRef.current,
            statusMessage: message,
            lastError: result.accepted ? null : 'That action is not available right now.',
          }),
        };
      });
      return result.accepted;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not reach the game runtime';
      setSession((prev) => {
        if (prev.phase !== 'playing') return prev;
        return {
          ...prev,
          presentation: mapGameStateToPresentationModel(prev.gameState, {
            activeNarrative: narrativeRef.current,
            statusMessage: statusMessageRef.current,
            lastError: message,
          }),
        };
      });
      return false;
    }
  }, []);

  const move = useCallback(
    (position: Position) => submitAction({ type: 'move', position }),
    [submitAction],
  );
  const interact = useCallback(
    (entityId: string) => submitAction({ type: 'interact', entityId }),
    [submitAction],
  );

  return { session, actions: { generate, move, interact } };
}
