import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialGameState,
  GameCore,
  type PlayerIntent,
} from '../src/index.js';

const initialState = createInitialGameState(
  { id: 'player-1' },
  { id: 'pet-1', name: 'Sprout' },
);

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
