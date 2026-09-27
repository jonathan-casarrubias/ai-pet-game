import type { DomainEvent } from './domain-events.js';
import type { GameState } from './game-state.js';

export type RejectionReason =
  | 'invalid_intent'
  | 'unsupported_intent'
  | 'player_mismatch'
  | 'inapplicable_action';

export type StateTransition = Readonly<{
  accepted: boolean;
  previousState: GameState;
  state: GameState;
  events: readonly DomainEvent[];
  rejectionReason?: RejectionReason;
}>;

export function createRejectedTransition(
  state: GameState,
  rejectionReason: RejectionReason,
): StateTransition {
  return freezeTransition({
    accepted: false,
    previousState: state,
    state,
    events: [],
    rejectionReason,
  });
}

export function freezeTransition(transition: StateTransition): StateTransition {
  return Object.freeze({
    ...transition,
    events: Object.freeze([...transition.events]),
  });
}
