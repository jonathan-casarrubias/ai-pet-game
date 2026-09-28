import { createDefaultCapabilitySpace } from './capabilities/capability-space.js';
import type { CapabilityContext } from './capabilities/capability.js';
import { isSupportedContextualElement } from './context/contextual-element.js';
import {
  createControlledGenerationContext,
  type ControlledGenerationContext,
  type GenerationPurpose,
} from './context/controlled-generation-context.js';
import {
  createGameplayContext,
  type GameplayContext,
} from './context/gameplay-context.js';
import {
  createAcceptedGameplayContext,
  createGameplayProposal,
  type AcceptedGameplayContext,
  type GameplayProposal,
} from './context/gameplay-proposal.js';
import {
  createProposalRejection,
  type ProposalRejection,
} from './context/proposal-rejection.js';
import {
  type ProposalValidationResult,
} from './context/proposal-validation-result.js';
import {
  type ProposalResolutionResult,
} from './context/proposal-resolution-result.js';
import {
  type CorrectionAttempt,
  type ProposalCorrector,
} from './generation/proposal-corrector.js';
import { freezeDomainEvent } from './domain/domain-events.js';
import {
  applyGameplayConsequence,
  validateGameplayConsequence,
  type ConsequenceApplicationResult,
  type ConsequenceValidationResult,
  type GameplayConsequence,
} from './domain/gameplay-consequence.js';
import {
  freezeGameState,
  type GameState,
  type Position,
  type SpatialEntity,
  type WorldState,
} from './domain/game-state.js';
import {
  isExplorePlayerAction,
  isInteractPlayerAction,
  isMovePlayerAction,
  isObservePlayerAction,
  isSupportedIntentType,
  isValidPlayerAction,
  type ExplorePlayerAction,
  type InteractPlayerAction,
  type MovePlayerAction,
  type ObservePlayerAction,
  type PlayerAction,
} from './domain/player-actions.js';
import {
  createRejectedTransition,
  freezeTransition,
  type StateTransition,
} from './domain/transitions.js';

export class GameCore {
  #state: GameState;
  #capabilitySpace = createDefaultCapabilitySpace();

  public constructor(initialState: GameState) {
    this.#state = freezeGameState(initialState);
  }

  public getState(): GameState {
    return this.#state;
  }

  public validateConsequence(
    consequence: GameplayConsequence,
  ): ConsequenceValidationResult {
    return validateGameplayConsequence(consequence, this.#state);
  }

  public applyConsequence(
    consequence: GameplayConsequence,
  ): ConsequenceApplicationResult {
    const result = applyGameplayConsequence(consequence, this.#state);
    if (result.accepted) {
      this.#state = result.state;
    }
    return result;
  }

  public createGameplayContext(
    context: CapabilityContext,
  ): GameplayContext | undefined {
    const currentState = this.#state;

    if (
      !isCurrentGameState(context.gameState, currentState) ||
      context.playerContext.playerId !== currentState.player.id
    ) {
      return undefined;
    }

    const contextualElement = context.contextualElement;

    if (
      contextualElement !== undefined &&
      !isSupportedContextualElement(contextualElement)
    ) {
      return undefined;
    }

    const validatedContext: CapabilityContext = {
      gameState: currentState,
      playerContext: context.playerContext,
      ...(contextualElement === undefined
        ? {}
        : { contextualElement }),
    };

    const applicableCapabilityIds = this.#capabilitySpace
      .getSupportedCapabilities()
      .filter(
        (capability) =>
          this.#capabilitySpace.evaluateApplicability(
            capability.id,
            validatedContext,
          ).applicable,
      )
      .map((capability) => capability.id);

    return createGameplayContext(
      currentState.player.id,
      currentState.version,
      contextualElement === undefined ? [] : [contextualElement],
      applicableCapabilityIds,
    );
  }

  public createControlledGenerationContext(
    generationPurpose: GenerationPurpose,
    context: CapabilityContext,
  ): ControlledGenerationContext | undefined {
    if (
      typeof generationPurpose !== 'string' ||
      generationPurpose.trim().length === 0
    ) {
      return undefined;
    }

    const gameplayContext = this.createGameplayContext(context);

    if (gameplayContext === undefined) {
      return undefined;
    }

    const currentState = this.#state;

    return createControlledGenerationContext(
      generationPurpose,
      currentState.version,
      {
        pet: {
          name: currentState.pet.name,
          interactionCount: currentState.pet.interactionCount,
        },
        discoveryCount: currentState.discoveries.length,
        recentDiscoveries: [...currentState.discoveries],
      },
      {
        contextualElements: gameplayContext.contextualElements,
        applicableCapabilityIds: gameplayContext.applicableCapabilityIds,
      },
    );
  }

  /**
   * Validates a gameplay proposal against the current game state and controlled context.
   * Returns structured validation results including rejection details when invalid.
   */
  public validateGameplayProposal(
    controlledContext: ControlledGenerationContext,
    proposal: GameplayProposal,
  ): ProposalValidationResult {
    const currentState = this.#state;
    const applicableCapabilityIds =
      controlledContext.gameplayContext.applicableCapabilityIds;

    // Check generation purpose first
    if (proposal.generationPurpose !== controlledContext.generationPurpose) {
      return {
        valid: false,
        rejection: createProposalRejection(
          'INVALID_PURPOSE',
          'The proposal purpose does not match the current context.',
          applicableCapabilityIds,
        ),
      };
    }

    // Check state version separately
    if (proposal.sourceStateVersion !== currentState.version) {
      return {
        valid: false,
        rejection: createProposalRejection(
          'STALE_STATE_VERSION',
          'The proposal source state version does not match the current game state.',
          applicableCapabilityIds,
        ),
      };
    }

    // Check pet identity
    if (
      controlledContext.relevantState.pet.name !== currentState.pet.name ||
      controlledContext.relevantState.pet.interactionCount !==
        currentState.pet.interactionCount
    ) {
      return {
        valid: false,
        rejection: createProposalRejection(
          'PET_MISMATCH',
          'The proposal references a different pet than the current state.',
          applicableCapabilityIds,
        ),
      };
    }

    // Check contextual elements
    if (
      !proposal.contextualElements.every((element) =>
        isSupportedContextualElement(element),
      )
    ) {
      return {
        valid: false,
        rejection: createProposalRejection(
          'UNSUPPORTED_CONTEXTUAL_ELEMENT',
          'The proposal contains a contextual element that is not supported in this context.',
          applicableCapabilityIds,
        ),
      };
    }

    // Check capabilities
    if (
      !proposal.capabilityIds.every((capabilityId) =>
        applicableCapabilityIds.includes(capabilityId),
      )
    ) {
      return {
        valid: false,
        rejection: createProposalRejection(
          'INVALID_CAPABILITY',
          'The proposal contains capabilities not applicable in this context.',
          applicableCapabilityIds,
        ),
      };
    }

    // Validate consequences if present
    if (proposal.consequences && proposal.consequences.length > 0) {
      for (let i = 0; i < proposal.consequences.length; i++) {
        const consequence = proposal.consequences[i];
        if (!consequence) continue;
        const validation = this.validateConsequence(consequence);
        if (!validation.valid) {
          return {
            valid: false,
            rejection: createProposalRejection(
              'INVALID_CONSEQUENCE',
              validation.reason ?? 'Invalid consequence',
              applicableCapabilityIds,
            ),
          };
        }
      }
    }

    // All validations passed - return accepted context
    return {
      valid: true,
      context: createAcceptedGameplayContext(
        {
          playerId: currentState.player.id,
          sourceStateVersion: proposal.sourceStateVersion,
          contextualElements: proposal.contextualElements,
          applicableCapabilityIds: proposal.capabilityIds,
        },
        proposal.narrative,
        proposal.activityId,
        proposal.consequences,
      ),
    };
  }

  /**
   * Accepts a gameplay proposal and returns the accepted context.
   * Preserves existing contract: returns undefined if proposal is invalid.
   */
  public acceptGameplayProposal(
    controlledContext: ControlledGenerationContext,
    proposal: GameplayProposal,
  ): AcceptedGameplayContext | undefined {
    const validation = this.validateGameplayProposal(controlledContext, proposal);

    if (!validation.valid) {
      return undefined;
    }

    return validation.context;
  }

  /**
   * Orchestrates the bounded proposal resolution flow:
   * 1. Validate original proposal
   * 2. If valid, accept
   * 3. If rejected, invoke exactly one correction attempt
   * 4. Validate corrected proposal
   * 5. If valid, accept
   * 6. If rejected, produce and validate fallback
   * 
   * Returns result indicating which path was taken.
   */
  public resolveGameplayProposal(
    controlledContext: ControlledGenerationContext,
    originalProposal: GameplayProposal,
    corrector: ProposalCorrector,
  ): ProposalResolutionResult {
    // Step 1: Validate original proposal
    const originalValidation = this.validateGameplayProposal(controlledContext, originalProposal);
    
    if (originalValidation.valid) {
      return {
        acceptedFrom: 'original',
        context: originalValidation.context,
      };
    }

    // Step 2: Invoke exactly one correction attempt
    const correctionAttempt: CorrectionAttempt = {
      controlledContext,
      original: originalProposal,
      rejection: originalValidation.rejection,
    };
    
    const correctedProposal = corrector.correct(correctionAttempt);

    // Step 3: Validate corrected proposal
    const correctedValidation = this.validateGameplayProposal(controlledContext, correctedProposal);
    
    if (correctedValidation.valid) {
      return {
        acceptedFrom: 'corrected',
        context: correctedValidation.context,
      };
    }

    // Step 4: Produce and validate fallback
    const fallbackProposal = this.produceFallback(controlledContext, correctedValidation.rejection);
    const fallbackValidation = this.validateGameplayProposal(controlledContext, fallbackProposal);

    // Fallback should always be valid by construction, but validate for safety
    if (!fallbackValidation.valid) {
      // This should never happen in normal operation
      throw new Error('Fallback proposal failed validation: ' + fallbackValidation.rejection.message);
    }

    return {
      acceptedFrom: 'fallback',
      context: fallbackValidation.context,
    };
  }

  /**
   * Produces a deterministic fallback proposal when correction fails.
   * Uses existing deterministic generation logic based on controlled context.
   */
  public produceFallback(
    controlledContext: ControlledGenerationContext,
    _rejection: ProposalRejection,
  ): GameplayProposal {
    const applicableCapabilityIds = controlledContext.gameplayContext.applicableCapabilityIds;
    const contextualElement = controlledContext.gameplayContext.contextualElements[0];
    const petName = controlledContext.relevantState.pet.name;
    const discoveryCount = controlledContext.relevantState.discoveryCount;
    const recentDiscoveries = controlledContext.relevantState.recentDiscoveries;

    let narrative: string;
    let activityId: string | undefined;

    if (contextualElement === undefined) {
      narrative = `${petName} is ready for a new adventure.`;
    } else if (discoveryCount === 0) {
      narrative = `${petName} notices the ${contextualElement.id} and feels curious about it.`;
    } else {
      // Guard against empty or undefined discoveries
      const lastDiscovery = recentDiscoveries.length > 0 
        ? recentDiscoveries[recentDiscoveries.length - 1] 
        : contextualElement.id;
      narrative = `${petName} remembers discovering the ${lastDiscovery} and wonders how the ${contextualElement.id} connects to it.`;
    }

    if (applicableCapabilityIds.includes('explore')) {
      activityId = 'explore';
    }

    return createGameplayProposal(
      controlledContext.generationPurpose,
      controlledContext.sourceStateVersion,
      controlledContext.gameplayContext.contextualElements,
      applicableCapabilityIds,
      narrative,
      activityId,
    );
  }

  public evaluate(
    action: PlayerAction,
    context?: CapabilityContext,
  ): StateTransition {
    const previousState = this.#state;

    if (!isValidPlayerAction(action)) {
      return createRejectedTransition(previousState, 'invalid_intent');
    }

    if (action.playerId !== previousState.player.id) {
      return createRejectedTransition(previousState, 'player_mismatch');
    }

    if (isMovePlayerAction(action)) {
      return this.evaluateMoveAction(previousState, action);
    }

    if (isInteractPlayerAction(action)) {
      return this.evaluateInteractAction(previousState, action);
    }

    if (isObservePlayerAction(action)) {
      return this.evaluateObserveAction(previousState, action, context);
    }

    if (isExplorePlayerAction(action)) {
      return this.evaluateExploreAction(previousState, action, context);
    }

    if (!isSupportedIntentType(action.type)) {
      return createRejectedTransition(previousState, 'unsupported_intent');
    }

    const nextState = freezeGameState({
      player: previousState.player,
      pet: {
        ...previousState.pet,
        interactionCount: previousState.pet.interactionCount + 1,
      },
      version: previousState.version + 1,
      discoveries: [...previousState.discoveries],
      world: previousState.world,
    });

    const event = freezeDomainEvent(
      action.type === 'ask_pet_question'
        ? {
            type: 'pet_question_asked',
            playerId: previousState.player.id,
            petId: previousState.pet.id,
            interactionCount: nextState.pet.interactionCount,
          }
        : {
            type: 'pet_greeted',
            playerId: previousState.player.id,
            petId: previousState.pet.id,
            interactionCount: nextState.pet.interactionCount,
          },
    );

    const transition = freezeTransition({
      accepted: true,
      previousState,
      state: nextState,
      events: [event],
    });

    this.#state = nextState;
    return transition;
  }

  private evaluateObserveAction(
    previousState: GameState,
    action: ObservePlayerAction,
    context: CapabilityContext | undefined,
  ): StateTransition {
    if (
      context === undefined ||
      !isCurrentGameState(context.gameState, previousState) ||
      context.playerContext.playerId !== previousState.player.id ||
      context.contextualElement?.id !== action.elementId
    ) {
      return createRejectedTransition(previousState, 'inapplicable_action');
    }

    const applicability = this.#capabilitySpace.evaluateApplicability(
      'observe',
      context,
    );

    if (!applicability.applicable) {
      return createRejectedTransition(previousState, 'inapplicable_action');
    }

    const nextState = freezeGameState({
      player: previousState.player,
      pet: previousState.pet,
      version: previousState.version + 1,
      discoveries: [...previousState.discoveries],
      world: previousState.world,
    });

    const event = freezeDomainEvent({
      type: 'contextual_element_observed',
      capabilityId: 'observe',
      playerId: previousState.player.id,
      elementId: action.elementId,
    });

    const transition = freezeTransition({
      accepted: true,
      previousState,
      state: nextState,
      events: [event],
    });

    this.#state = nextState;
    return transition;
  }

  private evaluateExploreAction(
    previousState: GameState,
    action: ExplorePlayerAction,
    context: CapabilityContext | undefined,
  ): StateTransition {
    if (
      context === undefined ||
      !isCurrentGameState(context.gameState, previousState) ||
      context.playerContext.playerId !== previousState.player.id ||
      context.contextualElement?.id !== action.elementId
    ) {
      return createRejectedTransition(previousState, 'inapplicable_action');
    }

    const applicability = this.#capabilitySpace.evaluateApplicability(
      'explore',
      context,
    );

    if (!applicability.applicable) {
      return createRejectedTransition(previousState, 'inapplicable_action');
    }

    const nextState = freezeGameState({
      player: previousState.player,
      pet: {
        ...previousState.pet,
        interactionCount: previousState.pet.interactionCount + 1,
      },
      version: previousState.version + 1,
      discoveries: [...previousState.discoveries, action.elementId],
      world: previousState.world,
    });

    const event = freezeDomainEvent({
      type: 'discovery_made',
      capabilityId: 'explore',
      playerId: previousState.player.id,
      petId: previousState.pet.id,
      elementId: action.elementId,
      interactionCount: nextState.pet.interactionCount,
    });

    const transition = freezeTransition({
      accepted: true,
      previousState,
      state: nextState,
      events: [event],
    });

    this.#state = nextState;
    return transition;
  }

  private evaluateMoveAction(
    previousState: GameState,
    action: MovePlayerAction,
  ): StateTransition {
    const target = action.position;

    if (!isPositionWithinBounds(target, previousState.world.bounds)) {
      return createRejectedTransition(previousState, 'invalid_intent');
    }

    if (target.x === previousState.world.playerPos.x &&
        target.y === previousState.world.playerPos.y) {
      return createRejectedTransition(previousState, 'inapplicable_action');
    }

    const nextState = freezeGameState({
      player: previousState.player,
      pet: previousState.pet,
      version: previousState.version + 1,
      discoveries: [...previousState.discoveries],
      world: {
        ...previousState.world,
        playerPos: { x: target.x, y: target.y },
      },
    });

    const event = freezeDomainEvent({
      type: 'pet_moved',
      playerId: previousState.player.id,
      petId: previousState.pet.id,
      position: { x: target.x, y: target.y },
    });

    const transition = freezeTransition({
      accepted: true,
      previousState,
      state: nextState,
      events: [event],
    });

    this.#state = nextState;
    return transition;
  }

  private evaluateInteractAction(
    previousState: GameState,
    action: InteractPlayerAction,
  ): StateTransition {
    const entity = previousState.world.entities[action.entityId];

    if (entity === undefined) {
      return createRejectedTransition(previousState, 'inapplicable_action');
    }

    if (!isInteractableEntity(entity.state)) {
      return createRejectedTransition(previousState, 'inapplicable_action');
    }

    if (
      !isWithinInteractionRadius(
        previousState.world.playerPos,
        entity.position,
        entity.interactionRadius,
      )
    ) {
      return createRejectedTransition(previousState, 'inapplicable_action');
    }

    const nextState = freezeGameState({
      player: previousState.player,
      pet: previousState.pet,
      version: previousState.version + 1,
      discoveries: [...previousState.discoveries],
      world: previousState.world,
    });

    const event = freezeDomainEvent({
      type: 'entity_interacted',
      playerId: previousState.player.id,
      petId: previousState.pet.id,
      entityId: action.entityId,
    });

    const transition = freezeTransition({
      accepted: true,
      previousState,
      state: nextState,
      events: [event],
    });

    this.#state = nextState;
    return transition;
  }
}

function isCurrentGameState(
  contextState: GameState,
  currentState: GameState,
): boolean {
  return (
    contextState.version === currentState.version &&
    contextState.player.id === currentState.player.id &&
    contextState.pet.id === currentState.pet.id &&
    contextState.pet.name === currentState.pet.name &&
    contextState.pet.interactionCount === currentState.pet.interactionCount
  );
}

function isPositionWithinBounds(
  position: { x: number; y: number },
  bounds: WorldState['bounds'],
): boolean {
  return (
    position.x >= bounds.minX &&
    position.x <= bounds.maxX &&
    position.y >= bounds.minY &&
    position.y <= bounds.maxY
  );
}

function isInteractableEntity(state: SpatialEntity['state']): boolean {
  return state === 'visible' || state === 'glowing' || state === 'active';
}

function calculateDistance(
  a: Position,
  b: Position,
): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function isWithinInteractionRadius(
  playerPos: Position,
  entityPos: Position,
  interactionRadius: number,
): boolean {
  return calculateDistance(playerPos, entityPos) <= interactionRadius;
}
