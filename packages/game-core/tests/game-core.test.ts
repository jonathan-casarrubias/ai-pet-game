import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CapabilitySpace,
  createInitialGameState,
  GameCore,
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

test('represents a reusable capability in a capability space', () => {
  const capability = {
    id: 'observe',
    isApplicable: () => true,
  };
  const capabilitySpace = new CapabilitySpace([capability]);

  assert.strictEqual(capabilitySpace.find('observe')?.id, 'observe');
  assert.deepStrictEqual(capabilitySpace.getSupportedCapabilities(), [capability]);
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
      isApplicable: ({ playerContext }) => playerContext.progressionLevel >= 2,
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
      isApplicable: ({ playerContext }) => playerContext.progressionLevel >= 1,
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
      isApplicable: ({ gameState }) => gameState.pet.interactionCount === 0,
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
  assert.strictEqual(gameCore.getState().pet.interactionCount, 1);
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
    pet: { id: 'pet-1', name: 'Sprout', interactionCount: 1 },
    version: 1,
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
  assert.strictEqual(transition.rejectionReason, 'invalid_intent');
  assert.strictEqual(transition.events.length, 0);
  assert.strictEqual(transition.state.version, 0);
  assert.strictEqual(transition.state.pet.interactionCount, 0);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 0);
});

test('rejects a pet question with a non-string question without mutating state', () => {
  const gameCore = new GameCore(initialState);

  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'ask_pet_question',
    question: 42,
  } as unknown as PlayerIntent);

  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'invalid_intent');
  assert.strictEqual(transition.events.length, 0);
  assert.strictEqual(transition.state.version, 0);
  assert.strictEqual(transition.state.pet.interactionCount, 0);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 0);
});

test('rejects an empty pet question without mutating state', () => {
  const gameCore = new GameCore(initialState);

  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'ask_pet_question',
    question: '',
  });

  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'invalid_intent');
  assert.strictEqual(transition.events.length, 0);
  assert.strictEqual(transition.state.version, 0);
  assert.strictEqual(transition.state.pet.interactionCount, 0);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 0);
});

test('rejects a whitespace-only pet question without mutating state', () => {
  const gameCore = new GameCore(initialState);

  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'ask_pet_question',
    question: '   \t\n',
  });

  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'invalid_intent');
  assert.strictEqual(transition.events.length, 0);
  assert.strictEqual(transition.state.version, 0);
  assert.strictEqual(transition.state.pet.interactionCount, 0);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 0);
});

test('does not allow callers to mutate authoritative state directly', () => {
  const gameCore = new GameCore(initialState);
  const state = gameCore.getState();

  try {
    (state.pet as { interactionCount: number }).interactionCount = 99;
  } catch {}

  assert.strictEqual(gameCore.getState().pet.interactionCount, 0);
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

  assert.ok(!transition.accepted, 'unsupported intent should be rejected');
  assert.strictEqual(transition.rejectionReason, 'unsupported_intent');
  assert.strictEqual(transition.events.length, 0);
  assert.strictEqual(transition.state.version, 0);
  assert.strictEqual(transition.state.pet.interactionCount, 0);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 0);
});

test('rejects an intent for another player without changing state', () => {
  const gameCore = new GameCore(initialState);

  const transition = gameCore.evaluate({
    playerId: 'player-2',
    type: 'greet_pet',
  });

  assert.ok(!transition.accepted, 'intent for another player should be rejected');
  assert.strictEqual(transition.rejectionReason, 'player_mismatch');
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 0);
});
