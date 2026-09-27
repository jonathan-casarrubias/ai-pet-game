import assert from 'node:assert/strict';

import test from 'node:test';

import {
  CapabilitySpace,
  createDefaultCapabilitySpace,
  createInitialGameState,
  GameCore,
  type ContextualElement,
  type CapabilityContext,
  type PlayerIntent,
} from '../src/index.js';

const initialState = createInitialGameState(
  { id: 'player-1' },
  { id: 'pet-1', name: 'Sprout' },
);

function createCapabilityContext(progressionLevel: number): CapabilityContext {
  return {
    gameState: initialState,
    playerContext: {
      playerId: 'player-1',
      progressionLevel,
    },
  };
}

function createObserveContext(
  gameCore: GameCore,
  contextualElement: ContextualElement,
): CapabilityContext {
  return {
    gameState: gameCore.getState(),
    playerContext: {
      playerId: 'player-1',
      progressionLevel: 0,
    },
    contextualElement,
  };
}

test('exposes observe as a supported concrete capability', () => {
  const capabilitySpace = createDefaultCapabilitySpace();
  assert.strictEqual(capabilitySpace.find('observe')?.id, 'observe');
});

test('applies observe to a supported contextual element without a content catalog', () => {
  const capabilitySpace = createDefaultCapabilitySpace();
  const result = capabilitySpace.evaluateApplicability('observe', {
    ...createCapabilityContext(0),
    contextualElement: {
      id: 'newly-generated-element',
      category: 'phenomenon',
      attributes: ['visible', 'glowing'],
    },
  });
  assert.ok(result.applicable);
});

test('does not apply observe to a contextual element without observation support', () => {
  const capabilitySpace = createDefaultCapabilitySpace();
  const result = capabilitySpace.evaluateApplicability('observe', {
    ...createCapabilityContext(0),
    contextualElement: {
      id: 'hidden-element',
      category: 'object',
      attributes: [],
    },
  });
  assert.deepStrictEqual(result, {
    applicable: false,
    capabilityId: 'observe',
    reason: 'inapplicable',
  });
});

test('does not trust contextual capability declarations', () => {
  const capabilitySpace = createDefaultCapabilitySpace();
  const result = capabilitySpace.evaluateApplicability('observe', {
    ...createCapabilityContext(0),
    contextualElement: {
      id: 'untrusted-element',
      category: 'object',
      attributes: [],
      capabilities: ['observe'],
    } as unknown as ContextualElement,
  });
  assert.deepStrictEqual(result, {
    applicable: false,
    capabilityId: 'observe',
    reason: 'inapplicable',
  });
});

test('does not apply observe to an unsupported contextual category', () => {
  const capabilitySpace = createDefaultCapabilitySpace();
  const result = capabilitySpace.evaluateApplicability('observe', {
    ...createCapabilityContext(0),
    contextualElement: {
      id: 'unsupported-element',
      category: 'unsupported-category',
      attributes: ['visible'],
    },
  });
  assert.deepStrictEqual(result, {
    applicable: false,
    capabilityId: 'observe',
    reason: 'inapplicable',
  });
});

test('represents a reusable capability in a capability space', () => {
  const capability = {
    id: 'observe',
    isApplicable: () => true,
  };
  const capabilitySpace = new CapabilitySpace([capability]);
  assert.strictEqual(capabilitySpace.find('observe')?.id, 'observe');
  assert.deepStrictEqual(capabilitySpace.getSupportedCapabilities(), [
    capability,
  ]);
});

test('evaluates a supported capability as applicable in context', () => {
  const capabilitySpace = new CapabilitySpace([
    {
      id: 'observe',
      isApplicable: () => true,
    },
  ]);
  const result = capabilitySpace.evaluateApplicability(
    'observe',
    createCapabilityContext(0),
  );
  assert.ok(result.applicable);
  assert.strictEqual(result.capability.id, 'observe');
});

test('allows applicability to differ by player-specific context', () => {
  const capabilitySpace = new CapabilitySpace([
    {
      id: 'advanced_observation',
      isApplicable: ({ playerContext }) =>
        playerContext.progressionLevel >= 2,
    },
  ]);
  const earlyResult = capabilitySpace.evaluateApplicability(
    'advanced_observation',
    createCapabilityContext(1),
  );
  const progressedResult = capabilitySpace.evaluateApplicability(
    'advanced_observation',
    createCapabilityContext(2),
  );
  assert.deepStrictEqual(earlyResult, {
    applicable: false,
    capabilityId: 'advanced_observation',
    reason: 'inapplicable',
  });
  assert.ok(progressedResult.applicable);
});

test('does not treat unavailable or inapplicable capabilities as applicable', () => {
  const capabilitySpace = new CapabilitySpace([
    {
      id: 'progression_locked',
      isApplicable: ({ playerContext }) =>
        playerContext.progressionLevel >= 1,
    },
  ]);
  const context = createCapabilityContext(0);
  assert.deepStrictEqual(
    capabilitySpace.evaluateApplicability('missing', context),
    {
      applicable: false,
      capabilityId: 'missing',
      reason: 'unavailable',
    },
  );
  assert.deepStrictEqual(
    capabilitySpace.evaluateApplicability('progression_locked', context),
    {
      applicable: false,
      capabilityId: 'progression_locked',
      reason: 'inapplicable',
    },
  );
});

test('evaluating capability applicability does not mutate authoritative game state', () => {
  const gameCore = new GameCore(initialState);
  const capabilitySpace = new CapabilitySpace([
    {
      id: 'observe',
      isApplicable: ({ gameState }) =>
        gameState.pet.interactionCount === 0,
    },
  ]);
  const stateBeforeEvaluation = gameCore.getState();
  const result = capabilitySpace.evaluateApplicability('observe', {
    gameState: gameCore.getState(),
    playerContext: {
      playerId: 'player-1',
      progressionLevel: 0,
    },
  });
  assert.ok(result.applicable);
  assert.strictEqual(gameCore.getState(), stateBeforeEvaluation);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 0);
});

test('creates a GameplayContext from the current authoritative state', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'generated-phenomenon',
    category: 'phenomenon',
    attributes: ['visible', 'glowing'],
  };
  const gameplayContext = gameCore.createGameplayContext({
    gameState: gameCore.getState(),
    playerContext: {
      playerId: 'player-1',
      progressionLevel: 0,
    },
    contextualElement,
  });
  assert.deepStrictEqual(gameplayContext, {
    playerId: 'player-1',
    sourceStateVersion: 0,
    contextualElements: [contextualElement],
    applicableCapabilityIds: ['observe', 'explore'],
  });
});

test('derives GameplayContext capabilities instead of exposing caller declarations', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement = {
    id: 'caller-declared-element',
    category: 'object',
    attributes: ['visible'],
    capabilities: ['not-a-game-core-capability'],
  } as unknown as ContextualElement;
  const gameplayContext = gameCore.createGameplayContext({
    gameState: gameCore.getState(),
    playerContext: {
      playerId: 'player-1',
      progressionLevel: 0,
    },
    contextualElement,
  });
  assert.deepStrictEqual(gameplayContext, {
    playerId: 'player-1',
    sourceStateVersion: 0,
    contextualElements: [
      {
        id: 'caller-declared-element',
        category: 'object',
        attributes: ['visible'],
      },
    ],
    applicableCapabilityIds: ['observe', 'explore'],
  });
});

test('does not include observe for a hidden contextual element', () => {
  const gameCore = new GameCore(initialState);
  const gameplayContext = gameCore.createGameplayContext({
    gameState: gameCore.getState(),
    playerContext: {
      playerId: 'player-1',
      progressionLevel: 0,
    },
    contextualElement: {
      id: 'hidden-object',
      category: 'object',
      attributes: [],
    },
  });
  assert.deepStrictEqual(gameplayContext?.applicableCapabilityIds, []);
});

test('rejects GameplayContext creation for another player', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'visible-object',
    category: 'object',
    attributes: ['visible'],
  };
  const gameplayContext = gameCore.createGameplayContext({
    gameState: gameCore.getState(),
    playerContext: {
      playerId: 'player-2',
      progressionLevel: 0,
    },
    contextualElement,
  });
  assert.strictEqual(gameplayContext, undefined);
});

test('rejects GameplayContext creation from a stale CapabilityContext', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'visible-object',
    category: 'object',
    attributes: ['visible'],
  };
  const capturedContext: CapabilityContext = {
    gameState: gameCore.getState(),
    playerContext: {
      playerId: 'player-1',
      progressionLevel: 0,
    },
    contextualElement,
  };
  const acceptedTransition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'greet_pet',
  });
  assert.ok(acceptedTransition.accepted);
  assert.strictEqual(gameCore.getState().version, 1);
  assert.strictEqual(
    gameCore.createGameplayContext(capturedContext),
    undefined,
  );
});

test('does not mutate authoritative state when creating a GameplayContext', () => {
  const gameCore = new GameCore(initialState);
  const stateBeforeContext = gameCore.getState();
  const petBeforeContext = stateBeforeContext.pet;
  const gameplayContext = gameCore.createGameplayContext({
    gameState: stateBeforeContext,
    playerContext: {
      playerId: 'player-1',
      progressionLevel: 0,
    },
    contextualElement: {
      id: 'visible-object',
      category: 'object',
      attributes: ['visible'],
    },
  });
  assert.ok(gameplayContext);
  assert.strictEqual(gameCore.getState(), stateBeforeContext);
  assert.strictEqual(gameCore.getState().pet, petBeforeContext);
  assert.strictEqual(gameCore.getState().version, 0);
});

test('creates a controlled generation context from validated runtime context', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'generation-object',
    category: 'object',
    attributes: ['visible'],
  };
  const controlledContext = gameCore.createControlledGenerationContext(
    'initial_gameplay',
    createObserveContext(gameCore, contextualElement),
  );
  assert.deepStrictEqual(controlledContext, {
    generationPurpose: 'initial_gameplay',
    sourceStateVersion: 0,
    relevantState: {
      pet: {
        name: 'Sprout',
        interactionCount: 0,
      },
    },
    gameplayContext: {
      contextualElements: [contextualElement],
      applicableCapabilityIds: ['observe', 'explore'],
    },
    boundaries: {
      safety: 'game-core-enforced',
      domain: 'game-core-enforced',
      data: 'purpose-scoped',
    },
  });
});

test('does not expose complete GameState or an AI proposal in controlled context', () => {
  const gameCore = new GameCore(initialState);
  const controlledContext = gameCore.createControlledGenerationContext(
    'subsequent_gameplay',
    createObserveContext(gameCore, {
      id: 'generation-phenomenon',
      category: 'phenomenon',
      attributes: ['visible', 'glowing'],
    }),
  );
  assert.ok(controlledContext);
  assert.deepStrictEqual(Object.keys(controlledContext).sort(), [
    'boundaries',
    'gameplayContext',
    'generationPurpose',
    'relevantState',
    'sourceStateVersion',
  ]);
  assert.ok(!('gameState' in controlledContext));
  assert.ok(!('proposal' in controlledContext));
});

test('does not expose internal pet identity in relevant generation state', () => {
  const gameCore = new GameCore(initialState);
  const controlledContext = gameCore.createControlledGenerationContext(
    'initial_gameplay',
    createObserveContext(gameCore, {
      id: 'generation-object',
      category: 'object',
      attributes: ['visible'],
    }),
  );
  assert.ok(controlledContext);
  assert.deepStrictEqual(Object.keys(controlledContext.relevantState), [
    'pet',
  ]);
  assert.deepStrictEqual(
    Object.keys(controlledContext.relevantState.pet).sort(),
    ['interactionCount', 'name'],
  );
  assert.ok(!('id' in controlledContext.relevantState.pet));
});

test('reflects current authoritative interaction state in relevant generation state', () => {
  const gameCore = new GameCore(initialState);
  const initialContext = gameCore.createControlledGenerationContext(
    'initial_gameplay',
    createObserveContext(gameCore, {
      id: 'generation-object',
      category: 'object',
      attributes: ['visible'],
    }),
  );
  assert.ok(initialContext);
  assert.strictEqual(
    initialContext.relevantState.pet.interactionCount,
    0,
  );
  const acceptedTransition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'greet_pet',
  });
  assert.ok(acceptedTransition.accepted);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 1);
  const updatedContext = gameCore.createControlledGenerationContext(
    'subsequent_gameplay',
    createObserveContext(gameCore, {
      id: 'generation-object-after-interaction',
      category: 'object',
      attributes: ['visible'],
    }),
  );
  assert.ok(updatedContext);
  assert.strictEqual(
    updatedContext.relevantState.pet.interactionCount,
    1,
  );
  assert.strictEqual(updatedContext.relevantState.pet.name, 'Sprout');
});

test('rejects controlled generation context for invalid source context', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'generation-object',
    category: 'object',
    attributes: ['visible'],
  };
  assert.strictEqual(
    gameCore.createControlledGenerationContext(
      'initial_gameplay',
      {
        ...createObserveContext(gameCore, contextualElement),
        playerContext: {
          playerId: 'player-2',
          progressionLevel: 0,
        },
      },
    ),
    undefined,
  );
});

test('rejects controlled generation context from stale authoritative state', () => {
  const gameCore = new GameCore(initialState);
  const capturedContext = createObserveContext(gameCore, {
    id: 'generation-object',
    category: 'object',
    attributes: ['visible'],
  });
  const acceptedTransition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'greet_pet',
  });
  assert.ok(acceptedTransition.accepted);
  assert.strictEqual(
    gameCore.createControlledGenerationContext(
      'subsequent_gameplay',
      capturedContext,
    ),
    undefined,
  );
  assert.strictEqual(gameCore.getState().version, 1);
});

test('keeps controlled generation context immutable and does not mutate state', () => {
  const gameCore = new GameCore(initialState);
  const stateBeforeCreation = gameCore.getState();
  const controlledContext = gameCore.createControlledGenerationContext(
    'initial_gameplay',
    createObserveContext(gameCore, {
      id: 'generation-object',
      category: 'object',
      attributes: ['visible'],
    }),
  );
  assert.ok(controlledContext);
  assert.ok(Object.isFrozen(controlledContext));
  assert.ok(Object.isFrozen(controlledContext.relevantState));
  assert.ok(Object.isFrozen(controlledContext.relevantState.pet));
  assert.ok(Object.isFrozen(controlledContext.gameplayContext));
  assert.ok(Object.isFrozen(controlledContext.boundaries));
  assert.strictEqual(gameCore.getState(), stateBeforeCreation);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(
    gameCore.getState().pet.interactionCount,
    0,
  );
});

test('rejects controlled generation context with an empty generation purpose', () => {
  const gameCore = new GameCore(initialState);
  assert.strictEqual(
    gameCore.createControlledGenerationContext(
      '',
      createObserveContext(gameCore, {
        id: 'generation-object',
        category: 'object',
        attributes: ['visible'],
      }),
    ),
    undefined,
  );
});

test('rejects controlled generation context with a whitespace-only generation purpose', () => {
  const gameCore = new GameCore(initialState);
  assert.strictEqual(
    gameCore.createControlledGenerationContext(
      '   ',
      createObserveContext(gameCore, {
        id: 'generation-object',
        category: 'object',
        attributes: ['visible'],
      }),
    ),
    undefined,
  );
});

test('keeps contextual elements non-authoritative', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'context-only-object',
    category: 'object',
    attributes: ['visible'],
  };
  const gameplayContext = gameCore.createGameplayContext({
    gameState: gameCore.getState(),
    playerContext: {
      playerId: 'player-1',
      progressionLevel: 0,
    },
    contextualElement,
  });
  assert.ok(gameplayContext);
  assert.deepStrictEqual(gameCore.getState(), initialState);
  assert.strictEqual(
    Object.prototype.hasOwnProperty.call(
      gameCore.getState(),
      contextualElement.id,
    ),
    false,
  );
});

test('accepts a valid observe player action and emits an authoritative event', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'glowing-seed-context',
    category: 'plant',
    attributes: ['visible', 'glowing'],
  };
  const transition = gameCore.evaluate(
    {
      playerId: 'player-1',
      type: 'observe',
      elementId: contextualElement.id,
    },
    createObserveContext(gameCore, contextualElement),
  );
  assert.ok(transition.accepted, 'valid observe action should be accepted');
  assert.strictEqual(transition.previousState.version, 0);
  assert.strictEqual(transition.state.version, 1);
  assert.strictEqual(transition.state.pet.interactionCount, 0);
  assert.deepStrictEqual(transition.events, [
    {
      type: 'contextual_element_observed',
      capabilityId: 'observe',
      playerId: 'player-1',
      elementId: 'glowing-seed-context',
    },
  ]);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('rejects an invalid observe action without partially mutating state', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'unobservable-object',
    category: 'object',
    attributes: [],
  };
  const stateBeforeAction = gameCore.getState();
  const transition = gameCore.evaluate(
    {
      playerId: 'player-1',
      type: 'observe',
      elementId: contextualElement.id,
    },
    createObserveContext(gameCore, contextualElement),
  );
  assert.ok(
    !transition.accepted,
    'inapplicable observe action should be rejected',
  );
  assert.strictEqual(
    transition.rejectionReason,
    'inapplicable_action',
  );
  assert.deepStrictEqual(transition.events, []);
  assert.strictEqual(transition.previousState, stateBeforeAction);
  assert.strictEqual(transition.state, stateBeforeAction);
  assert.strictEqual(gameCore.getState(), stateBeforeAction);
});

test('does not accept an observe action for a different contextual element', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'visible-object',
    category: 'object',
    attributes: ['visible'],
  };
  const transition = gameCore.evaluate(
    {
      playerId: 'player-1',
      type: 'observe',
      elementId: 'different-object',
    },
    createObserveContext(gameCore, contextualElement),
  );
  assert.ok(!transition.accepted);
  assert.strictEqual(
    transition.rejectionReason,
    'inapplicable_action',
  );
  assert.deepStrictEqual(transition.events, []);
  assert.strictEqual(gameCore.getState().version, 0);
});

test('rejects an observe action when the context belongs to another player', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'visible-object',
    category: 'object',
    attributes: ['visible'],
  };
  const stateBeforeAction = gameCore.getState();
  const transition = gameCore.evaluate(
    {
      playerId: 'player-1',
      type: 'observe',
      elementId: contextualElement.id,
    },
    {
      gameState: gameCore.getState(),
      playerContext: {
        playerId: 'player-2',
        progressionLevel: 0,
      },
      contextualElement,
    },
  );
  assert.ok(!transition.accepted);
  assert.strictEqual(
    transition.rejectionReason,
    'inapplicable_action',
  );
  assert.deepStrictEqual(transition.events, []);
  assert.strictEqual(gameCore.getState(), stateBeforeAction);
  assert.strictEqual(gameCore.getState().version, 0);
});

test('rejects an observe action with a stale Game Core context', () => {
  const gameCore = new GameCore(initialState);
  const contextualElement: ContextualElement = {
    id: 'visible-object',
    category: 'object',
    attributes: ['visible'],
  };
  const capturedContext = createObserveContext(
    gameCore,
    contextualElement,
  );
  const acceptedTransition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'greet_pet',
  });
  assert.ok(acceptedTransition.accepted);
  assert.strictEqual(gameCore.getState().version, 1);
  const stateAfterAcceptedAction = gameCore.getState();
  const transition = gameCore.evaluate(
    {
      playerId: 'player-1',
      type: 'observe',
      elementId: contextualElement.id,
    },
    capturedContext,
  );
  assert.ok(!transition.accepted);
  assert.strictEqual(
    transition.rejectionReason,
    'inapplicable_action',
  );
  assert.deepStrictEqual(transition.events, []);
  assert.strictEqual(gameCore.getState(), stateAfterAcceptedAction);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('evaluates a valid player intent and produces an authoritative transition', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'greet_pet',
  });
  assert.ok(transition.accepted, 'valid intent should be accepted');
  assert.strictEqual(transition.previousState.version, 0);
  assert.strictEqual(transition.state.version, 1);
  assert.strictEqual(transition.state.pet.interactionCount, 1);
  assert.strictEqual(gameCore.getState().version, 1);
  assert.strictEqual(
    gameCore.getState().pet.interactionCount,
    1,
  );
});

test('produces a domain event for an accepted pet interaction', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'greet_pet',
  });
  assert.strictEqual(transition.events.length, 1);
  assert.deepStrictEqual(transition.events[0], {
    type: 'pet_greeted',
    playerId: 'player-1',
    petId: 'pet-1',
    interactionCount: 1,
  });
});


test('accepts a valid pet question and produces a bounded domain event', () => {
  const gameCore = new GameCore(initialState);

  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'ask_pet_question',
    question: 'Why is the sky blue?',
  });

  assert.ok(transition.accepted, 'valid question should be accepted');

  assert.strictEqual(transition.state.version, 1);

  assert.strictEqual(transition.state.pet.interactionCount, 1);

  assert.deepStrictEqual(transition.state, {
    player: { id: 'player-1' },
    pet: {
      id: 'pet-1',
      name: 'Sprout',
      interactionCount: 1,
    },
    version: 1,
    discoveries: [],
  });

  assert.deepStrictEqual(transition.events, [
    {
      type: 'pet_question_asked',
      playerId: 'player-1',
      petId: 'pet-1',
      interactionCount: 1,
    },
  ]);
});


test('rejects a pet question with a missing question without mutating state', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'ask_pet_question',
  });
  assert.ok(!transition.accepted);
  assert.strictEqual(
    transition.rejectionReason,
    'invalid_intent',
  );
  assert.strictEqual(transition.events.length, 0);
  assert.strictEqual(transition.state.version, 0);
  assert.strictEqual(
    transition.state.pet.interactionCount,
    0,
  );
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(
    gameCore.getState().pet.interactionCount,
    0,
  );
});

test('rejects a pet question with a non-string question without mutating state', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'ask_pet_question',
    question: 42,
  } as unknown as PlayerIntent);
  assert.ok(!transition.accepted);
  assert.strictEqual(
    transition.rejectionReason,
    'invalid_intent',
  );
  assert.strictEqual(transition.events.length, 0);
  assert.strictEqual(transition.state.version, 0);
  assert.strictEqual(
    transition.state.pet.interactionCount,
    0,
  );
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(
    gameCore.getState().pet.interactionCount,
    0,
  );
});

test('rejects an empty pet question without mutating state', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'ask_pet_question',
    question: '',
  });
  assert.ok(!transition.accepted);
  assert.strictEqual(
    transition.rejectionReason,
    'invalid_intent',
  );
  assert.strictEqual(transition.events.length, 0);
  assert.strictEqual(transition.state.version, 0);
  assert.strictEqual(
    transition.state.pet.interactionCount,
    0,
  );
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(
    gameCore.getState().pet.interactionCount,
    0,
  );
});

test('rejects a whitespace-only pet question without mutating state', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'ask_pet_question',
    question: '   \t\n',
  });
  assert.ok(!transition.accepted);
  assert.strictEqual(
    transition.rejectionReason,
    'invalid_intent',
  );
  assert.strictEqual(transition.events.length, 0);
  assert.strictEqual(transition.state.version, 0);
  assert.strictEqual(
    transition.state.pet.interactionCount,
    0,
  );
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(
    gameCore.getState().pet.interactionCount,
    0,
  );
});

test('does not allow callers to mutate authoritative state directly', () => {
  const gameCore = new GameCore(initialState);
  const state = gameCore.getState();
  try {
    (state.pet as { interactionCount: number }).interactionCount = 99;
  } catch {}
  assert.strictEqual(
    gameCore.getState().pet.interactionCount,
    0,
  );
  assert.ok(
    !('applyTransition' in gameCore),
    'GameCore should expose evaluation, not a caller-controlled transition method',
  );
});

test('rejects an unsupported intent without partially mutating state', () => {
  const gameCore = new GameCore(initialState);
  const unsupportedIntent = {
    playerId: 'player-1',
    type: 'open_inventory',
  } as PlayerIntent;
  const transition = gameCore.evaluate(unsupportedIntent);
  assert.ok(
    !transition.accepted,
    'unsupported intent should be rejected',
  );
  assert.strictEqual(
    transition.rejectionReason,
    'unsupported_intent',
  );
  assert.strictEqual(transition.events.length, 0);
  assert.strictEqual(transition.state.version, 0);
  assert.strictEqual(
    transition.state.pet.interactionCount,
    0,
  );
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(
    gameCore.getState().pet.interactionCount,
    0,
  );
});

test('rejects an intent for another player without changing state', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-2',
    type: 'greet_pet',
  });
  assert.ok(
    !transition.accepted,
    'intent for another player should be rejected',
  );
  assert.strictEqual(
    transition.rejectionReason,
    'player_mismatch',
  );
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(
    gameCore.getState().pet.interactionCount,
    0,
  );
});