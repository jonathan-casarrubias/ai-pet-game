import assert from 'node:assert/strict';

import test from 'node:test';

import {
  createInitialGameState,
  GameCore,
  type PlayerAction,
  isMovePlayerAction,
} from '../src/index.js';

const initialState = createInitialGameState(
  { id: 'player-1' },
  { id: 'pet-1', name: 'Sprout' },
);

test('GameState contains a world field with spatial state', () => {
  assert.ok('world' in initialState);
  assert.ok(initialState.world !== null);
});

test('Lumi starts at a deterministic position inside world bounds', () => {
  assert.strictEqual(initialState.world.playerPos.x, 200);
  assert.strictEqual(initialState.world.playerPos.y, 200);
});

test('World bounds are present and deterministic', () => {
  const bounds = initialState.world.bounds;
  assert.strictEqual(bounds.minX, 0);
  assert.strictEqual(bounds.minY, 0);
  assert.strictEqual(bounds.maxX, 400);
  assert.strictEqual(bounds.maxY, 400);
});

test('A valid movement action changes Lumi position', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 250, y: 300 },
  });
  assert.ok(transition.accepted);
  assert.strictEqual(transition.state.world.playerPos.x, 250);
  assert.strictEqual(transition.state.world.playerPos.y, 300);
});

test('A valid movement increments version per existing transition conventions', () => {
  const gameCore = new GameCore(initialState);
  assert.strictEqual(gameCore.getState().version, 0);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 100, y: 100 },
  });
  assert.ok(transition.accepted);
  assert.strictEqual(transition.previousState.version, 0);
  assert.strictEqual(transition.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('Movement preserves unrelated GameState fields', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 300, y: 50 },
  });
  assert.ok(transition.accepted);
  assert.deepStrictEqual(transition.state.player, { id: 'player-1' });
  assert.deepStrictEqual(transition.state.pet, {
    id: 'pet-1',
    name: 'Sprout',
    interactionCount: 0,
  });
  assert.deepStrictEqual(transition.state.discoveries, []);
});

test('Movement outside world bounds is rejected', () => {
  const gameCore = new GameCore(initialState);
  const before = gameCore.getState();
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 401, y: 401 },
  });
  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'invalid_intent');
  assert.deepStrictEqual(transition.events, []);
  assert.strictEqual(gameCore.getState(), before);
  assert.strictEqual(gameCore.getState().version, 0);
});

test('Movement outside world bounds is rejected for negative coordinates', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: -1, y: -1 },
  });
  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'invalid_intent');
});

test('Movement outside world bounds does not mutate state', () => {
  const gameCore = new GameCore(initialState);
  gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 500, y: 500 },
  });
  assert.strictEqual(gameCore.getState().world.playerPos.x, 200);
  assert.strictEqual(gameCore.getState().world.playerPos.y, 200);
  assert.strictEqual(gameCore.getState().version, 0);
});

test('Invalid player identity is rejected for movement', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-99',
    type: 'move',
    position: { x: 100, y: 100 },
  } as unknown as PlayerAction);
  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'player_mismatch');
  assert.strictEqual(gameCore.getState().version, 0);
});

test('Resulting GameState remains immutable after movement', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 50, y: 75 },
  });
  assert.ok(transition.accepted);
  assert.ok(Object.isFrozen(transition.state));
  assert.ok(Object.isFrozen(transition.state.world));
  assert.ok(Object.isFrozen(transition.state.world.playerPos));
  assert.ok(Object.isFrozen(transition.state.world.bounds));

  try {
    (transition.state.world.playerPos as { x: number }).x = 999;
  } catch {}
  assert.strictEqual(transition.state.world.playerPos.x, 50);
});

test('isMovePlayerAction narrows correctly for a valid move', () => {
  const moveAction: PlayerAction = {
    playerId: 'player-1',
    type: 'move',
    position: { x: 1, y: 2 },
  };
  assert.ok(isMovePlayerAction(moveAction));
});

test('Same position movement is rejected as inapplicable', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 200, y: 200 },
  });
  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'inapplicable_action');
});

test('Existing greet_pet behavior is unaffected by movement addition', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'greet_pet',
  });
  assert.ok(transition.accepted);
  assert.strictEqual(transition.state.version, 1);
  assert.strictEqual(transition.state.pet.interactionCount, 1);
  assert.strictEqual(transition.state.world.playerPos.x, 200);
  assert.strictEqual(transition.state.world.playerPos.y, 200);
});

test('Existing ask_pet_question behavior is unaffected by movement addition', () => {
  const gameCore = new GameCore(initialState);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'ask_pet_question',
    question: 'Where did I come from?',
  });
  assert.ok(transition.accepted);
  assert.strictEqual(transition.state.version, 1);
  assert.strictEqual(transition.state.pet.interactionCount, 1);
  assert.strictEqual(transition.state.world.playerPos.x, 200);
  assert.strictEqual(transition.state.world.playerPos.y, 200);
});
