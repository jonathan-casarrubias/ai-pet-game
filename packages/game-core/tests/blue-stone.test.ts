import assert from 'node:assert/strict';

import test from 'node:test';

import {
  createInitialGameState,
  freezeGameState,
  GameCore,
  type GameState,
  type SpatialEntity,
} from '../src/index.js';

function makeBlueStoneState(stateOverrides?: Partial<GameState>): GameState {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const blueStone: SpatialEntity = {
    id: 'blue-stone',
    type: 'object',
    label: 'Blue Stone',
    position: { x: 210, y: 200 },
    state: 'visible',
    interactionRadius: 20,
  };
  return freezeGameState({
    ...base,
    ...stateOverrides,
    world: {
      ...base.world,
      entities: { 'blue-stone': blueStone },
    },
  });
}

function makeGenericEntityState(): GameState {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const generic: SpatialEntity = {
    id: 'glowing-mushroom',
    type: 'object',
    label: 'Glowing Mushroom',
    position: { x: 205, y: 205 },
    state: 'glowing',
    interactionRadius: 20,
  };
  return freezeGameState({
    ...base,
    world: {
      ...base.world,
      entities: { 'glowing-mushroom': generic },
    },
  });
}

test('successful blue-stone interaction produces an accepted transition', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(transition.accepted);
});

test('blue stone becomes discovered', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(transition.accepted);
  const stone = transition.state.world.entities['blue-stone'];
  assert.ok(stone !== undefined);
  assert.strictEqual(stone.state, 'discovered');
});

test('blue-stone is added to discoveries', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(transition.accepted);
  assert.deepStrictEqual([...transition.state.discoveries], ['blue-stone']);
  assert.deepStrictEqual([...gameCore.getState().discoveries], ['blue-stone']);
});

test('version increments exactly once', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(transition.accepted);
  assert.strictEqual(transition.previousState.version, 0);
  assert.strictEqual(transition.state.version, 1);
});

test('blue_stone_discovered event is emitted with correct ids', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(transition.accepted);
  assert.deepStrictEqual(transition.events, [
    {
      type: 'blue_stone_discovered',
      playerId: 'player-1',
      petId: 'pet-1',
      entityId: 'blue-stone',
    },
  ]);
});

test('blue stone remains present in world.entities', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(transition.accepted);
  const stone = transition.state.world.entities['blue-stone'];
  assert.ok(stone !== undefined);
  assert.strictEqual(stone.interactionRadius, 20);
  assert.strictEqual(stone.position.x, 210);
  assert.strictEqual(stone.position.y, 200);
});

test('unrelated state is preserved after blue-stone interaction', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(transition.accepted);
  assert.deepStrictEqual(transition.state.player, { id: 'player-1' });
  assert.deepStrictEqual(transition.state.pet, {
    id: 'pet-1',
    name: 'Lumi',
    interactionCount: 0,
  });
  assert.strictEqual(transition.state.world.playerPos.x, 200);
  assert.strictEqual(transition.state.world.playerPos.y, 200);
  assert.deepStrictEqual(transition.state.world.bounds, {
    minX: 0,
    minY: 0,
    maxX: 400,
    maxY: 400,
  });
});

test('re-interacting with a discovered blue stone is rejected', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const first = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(first.accepted);
  const second = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(!second.accepted);
  assert.strictEqual(second.rejectionReason, 'inapplicable_action');
});

test('rejected repeated interaction does not increment version', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  const second = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(!second.accepted);
  assert.strictEqual(second.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('rejected repeated interaction does not duplicate the discovery', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  const second = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(!second.accepted);
  assert.deepStrictEqual([...gameCore.getState().discoveries], ['blue-stone']);
});

test('rejected repeated interaction emits no discovery event', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  const second = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(!second.accepted);
  assert.deepStrictEqual(second.events, []);
});

test('generic interaction with a non-blue-stone entity keeps generic behavior', () => {
  const gameCore = new GameCore(makeGenericEntityState());
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'glowing-mushroom',
  });
  assert.ok(transition.accepted);
  assert.deepStrictEqual(transition.events, [
    {
      type: 'entity_interacted',
      playerId: 'player-1',
      petId: 'pet-1',
      entityId: 'glowing-mushroom',
    },
  ]);
  const mushroom = transition.state.world.entities['glowing-mushroom'];
  assert.ok(mushroom !== undefined);
  assert.strictEqual(mushroom.state, 'glowing');
  assert.deepStrictEqual([...transition.state.discoveries], []);
  assert.strictEqual(transition.state.version, 1);
});
