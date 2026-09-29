export { GameCore } from './game-core.js';

export {
  CapabilitySpace,
  createDefaultCapabilitySpace,
} from './capabilities/capability-space.js';
export { observeCapability } from './capabilities/observe.js';
export { exploreCapability } from './capabilities/explore.js';
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
export type {
  ControlledGenerationContext,
  GenerationBoundaries,
  GenerationPurpose,
} from './context/controlled-generation-context.js';

export {
  createProposalRejection,
  type ProposalRejection,
  type ProposalRejectionCode,
} from './context/proposal-rejection.js';

export {
  type ProposalValidationResult,
} from './context/proposal-validation-result.js';

export {
  type ProposalResolutionResult,
} from './context/proposal-resolution-result.js';

export type { DomainEvent } from './domain/domain-events.js';
export {
  applyConsequenceBatch,
  isEntityThreatened,
  applyGameplayConsequence,
  validateGameplayConsequence,
  type BatchConsequenceApplicationResult,
  type ChangeEntityStateConsequence,
  type SpawnEntityConsequence,
  type MoveEntityConsequence,
  type RecordDiscoveryConsequence,
  type GameplayConsequence,
  type ConsequenceApplicationResult,
  type ConsequenceValidationResult,
} from './domain/gameplay-consequence.js';
export {
  createInitialGameState,
  freezeGameState,
  type GameState,
  type Pet,
  type Player,
  type Position,
  type WorldBounds,
  type SpatialEntity,
  type WorldState,
  type EntityRole,
} from './domain/game-state.js';
export type {
  ExplorePlayerAction,
  MovePlayerAction,
  InteractPlayerAction,
  ObservePlayerAction,
  PlayerAction,
  PlayerIntent,
} from './domain/player-actions.js';
export {
  isMovePlayerAction,
  isInteractPlayerAction,
} from './domain/player-actions.js';
export type {
  RejectionReason,
  StateTransition,
} from './domain/transitions.js';
export {
  createGameplayProposal,
  type AcceptedGameplayContext,
  type GameplayProposal,
} from './context/gameplay-proposal.js';
export type { GameplayGenerator } from './generation/gameplay-generator.js';
export { DeterministicGameplayGenerator } from './generation/deterministic-gameplay-generator.js';
export type {
  CorrectionAttempt,
  ProposalCorrector,
} from './generation/proposal-corrector.js';
export {
  createGenerationRequest,
  type GenerationRequest,
} from './generation/generation-request.js';
export type {
  GenerationError,
  GenerationResult,
} from './generation/generation-result.js';
export type { GenerationProvider } from './generation/generation-provider.js';
export { ProviderGameplayGenerator } from './generation/provider-gameplay-generator.js';
// Ollama adapter — infrastructure boundary, not part of Game Core domain.
// Exported only so it can be instantiated for manual integration/testing.
export {
  OllamaGenerationProvider,
  createOllamaConfig,
  type OllamaConfig,
} from './generation/ollama-generation-provider.js';
