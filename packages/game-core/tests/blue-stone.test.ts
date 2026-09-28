import assert from 'node:assert/strict';

import test from 'node:test';

import {
  createInitialGameState,
  freezeGameState,
  GameCore,
  type ChangeEntityStateConsequence,
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

test('blue stone state can be changed to discovered via generic consequence mechanism', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const interaction = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'blue-stone',
  });
  assert.ok(interaction.accepted);

  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'blue-stone',
    state: 'discovered',
  };

  const consequenceResult = gameCore.applyConsequence(consequence);
  assert.ok(consequenceResult.accepted);
  const stone = consequenceResult.state.world.entities['blue-stone'];
  assert.ok(stone !== undefined);
  assert.strictEqual(stone.state, 'discovered');
  const storedStone = gameCore.getState().world.entities['blue-stone'];
  assert.ok(storedStone !== undefined);
  assert.strictEqual(storedStone.state, 'discovered');
});

test('applying consequence increments version exactly once', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'blue-stone',
    state: 'discovered',
  };
  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('blue stone remains present in world.entities after state change', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'blue-stone',
    state: 'discovered',
  };
  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
  const stone = result.state.world.entities['blue-stone'];
  assert.ok(stone !== undefined);
  assert.strictEqual(stone.interactionRadius, 20);
  assert.strictEqual(stone.position.x, 210);
  assert.strictEqual(stone.position.y, 200);
});

test('unrelated state is preserved after blue-stone consequence application', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'blue-stone',
    state: 'discovered',
  };
  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
  assert.deepStrictEqual(result.state.player, { id: 'player-1' });
  assert.deepStrictEqual(result.state.pet, {
    id: 'pet-1',
    name: 'Lumi',
    interactionCount: 0,
  });
  assert.strictEqual(result.state.world.playerPos.x, 200);
  assert.strictEqual(result.state.world.playerPos.y, 200);
  assert.deepStrictEqual(result.state.world.bounds, {
    minX: 0,
    minY: 0,
    maxX: 400,
    maxY: 400,
  });
});

test('re-changing state of an already discovered blue stone is rejected', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'blue-stone',
    state: 'discovered',
  };
  const first = gameCore.applyConsequence(consequence);
  assert.ok(first.accepted);

  const second = gameCore.applyConsequence(consequence);
  assert.ok(!second.accepted);
});

test('rejected repeated consequence application does not increment version', () => {
  const gameCore = new GameCore(makeBlueStoneState());
  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'blue-stone',
    state: 'discovered',
  };
  gameCore.applyConsequence(consequence);
  const versionBefore = gameCore.getState().version;
  const second = gameCore.applyConsequence(consequence);
  assert.ok(!second.accepted);
  assert.strictEqual(second.state.version, versionBefore);
  assert.strictEqual(gameCore.getState().version, versionBefore);
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
