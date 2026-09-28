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
import { createInitialPresentationModel } from '../presentation/presentation-model';
import type { PresentationModel } from '../presentation/presentation-model';
import type { GameState, GenerateResponse } from '../api/runtime-client';

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
  generate: (elementId: string) => Promise<void>;
  submitAction: (type: string, elementId?: string) => Promise<void>;
};

export function useGameSession(petName = 'Lumi'): {
  session: GameSessionState;
  actions: GameSessionActions;
} {
  const [session, setSession] = useState<GameSessionState>({ phase: 'loading' });
  const sessionIdRef = useRef<string | null>(null);
  const narrativeRef = useRef<string | null>(null);

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
  }, [petName]);

  const generate = useCallback(async (elementId: string) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    setSession((prev) => {
      if (prev.phase !== 'playing') return prev;
      return {
        ...prev,
        presentation: mapGameStateToPresentationModel(prev.gameState, {
          isGenerating: true,
          activeNarrative: narrativeRef.current,
        }),
      };
    });
    try {
      const result: GenerateResponse = await client.generate(sessionId, elementId);
      const acceptedCtx = result.acceptedContext ?? result.context ?? null;
      narrativeRef.current = acceptedCtx?.narrative ?? result.proposal?.narrative ?? null;
      setSession((prev) => {
        if (prev.phase !== 'playing') return prev;
        return {
          ...prev,
          gameState: result.state,
          presentation: mapGameStateToPresentationModel(result.state, {
            isGenerating: false,
            acceptedContext: acceptedCtx,
            activeNarrative: narrativeRef.current,
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
          }),
        };
      });
    }
  }, []);

  const submitAction = useCallback(async (type: string, elementId?: string) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    try {
      const result = await client.submitAction(sessionId, { type, elementId });
      if (result.accepted) {
        setSession((prev) => {
          if (prev.phase !== 'playing') return prev;
          return {
            ...prev,
            gameState: result.state,
            presentation: mapGameStateToPresentationModel(result.state, {
              activeNarrative: narrativeRef.current,
            }),
          };
        });
      }
    } catch {
      // Action error handling
    }
  }, []);

  return { session, actions: { generate, submitAction } };
}

export { createInitialPresentationModel };
