export { GameCore } from './game-core.js';

export {
  CapabilitySpace,
  createDefaultCapabilitySpace,
} from './capabilities/capability-space.js';
export { observeCapability } from './capabilities/observe.js';
export type {
  CapabilityApplicability,
  CapabilityContext,
  CapabilityDefinition,
} from './capabilities/capability.js';

export {
  canObserveContextualElement,
  isSupportedContextualElement,
} from './context/contextual-element.js';
export type { ContextualElement } from './context/contextual-element.js';
export type { GameplayContext } from './context/gameplay-context.js';

export type { DomainEvent } from './domain/domain-events.js';
export {
  createInitialGameState,
  type GameState,
  type Pet,
  type Player,
} from './domain/game-state.js';
export type {
  ObservePlayerAction,
  PlayerAction,
  PlayerIntent,
} from './domain/player-actions.js';
export type {
  RejectionReason,
  StateTransition,
} from './domain/transitions.js';
