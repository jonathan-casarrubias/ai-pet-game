import type { ContextualElement } from '../context/contextual-element.js';
import type { GameState } from '../domain/game-state.js';

export type CapabilityContext = Readonly<{
  gameState: GameState;
  playerContext: Readonly<{
    playerId: string;
    progressionLevel: number;
  }>;
  contextualElement?: ContextualElement;
}>;

export type CapabilityDefinition = Readonly<{
  id: string;
  isApplicable: (context: CapabilityContext) => boolean;
}>;

export type CapabilityApplicability =
  | Readonly<{
      applicable: true;
      capability: CapabilityDefinition;
    }>
  | Readonly<{
      applicable: false;
      capabilityId: string;
      reason: 'unavailable' | 'inapplicable';
    }>;
