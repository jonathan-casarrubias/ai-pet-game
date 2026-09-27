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
  type AcceptedGameplayContext,
  type GameplayProposal,
} from './context/gameplay-proposal.js';
import { freezeDomainEvent } from './domain/domain-events.js';
import { freezeGameState, type GameState } from './domain/game-state.js';
import {
  isExplorePlayerAction,
  isObservePlayerAction,
  isSupportedIntentType,
  isValidPlayerAction,
  type ExplorePlayerAction,
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
      },
      {
        contextualElements: gameplayContext.contextualElements,
        applicableCapabilityIds: gameplayContext.applicableCapabilityIds,
      },
    );
  }

  public acceptGameplayProposal(
    controlledContext: ControlledGenerationContext,
    proposal: GameplayProposal,
  ): AcceptedGameplayContext | undefined {
    const currentState = this.#state;

    if (
      proposal.generationPurpose !== controlledContext.generationPurpose ||
      proposal.sourceStateVersion !== currentState.version
    ) {
      return undefined;
    }

    if (
      controlledContext.relevantState.pet.name !== currentState.pet.name ||
      controlledContext.relevantState.pet.interactionCount !==
        currentState.pet.interactionCount
    ) {
      return undefined;
    }

    if (
      !proposal.contextualElements.every((element) =>
        isSupportedContextualElement(element),
      )
    ) {
      return undefined;
    }

    const applicableCapabilityIds =
      controlledContext.gameplayContext.applicableCapabilityIds;

    if (
      !proposal.capabilityIds.every((capabilityId) =>
        applicableCapabilityIds.includes(capabilityId),
      )
    ) {
      return undefined;
    }

    return createAcceptedGameplayContext(
      {
        playerId: currentState.player.id,
        sourceStateVersion: proposal.sourceStateVersion,
        contextualElements: proposal.contextualElements,
        applicableCapabilityIds: proposal.capabilityIds,
      },
      proposal.narrative,
      proposal.activityId,
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
