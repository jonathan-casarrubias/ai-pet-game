import assert from 'node:assert/strict';

import test from 'node:test';

import {
  applyGameplayConsequence,
  createInitialGameState,
  freezeGameState,
  GameCore,
  validateGameplayConsequence,
  type ChangeEntityStateConsequence,
  type GameState,
  type SpatialEntity,
  type SpawnEntityConsequence,
} from '../src/index.js';

function createBaseState(): GameState {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const initialEntity: SpatialEntity = {
    id: 'chest-1',
    type: 'object',
    label: 'Old Chest',
    position: { x: 100, y: 100 },
    state: 'visible',
    interactionRadius: 25,
  };
  return freezeGameState({
    ...base,
    world: {
      ...base.world,
      entities: { 'chest-1': initialEntity },
    },
  });
}

test('1. Valid change_entity_state changes the requested entity state', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };

  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
  const entity = result.state.world.entities['chest-1'];
  assert.ok(entity !== undefined);
  assert.strictEqual(entity.state, 'glowing');
  const stored = gameCore.getState().world.entities['chest-1'];
  assert.ok(stored !== undefined);
  assert.strictEqual(stored.state, 'glowing');
});

test('2. The entity remains present in world.entities', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'discovered',
  };

  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
  const entity = result.state.world.entities['chest-1'];
  assert.ok(entity !== undefined);
  assert.strictEqual(entity.id, 'chest-1');
  assert.strictEqual(entity.label, 'Old Chest');
  assert.strictEqual(entity.type, 'object');
  assert.strictEqual(entity.position.x, 100);
  assert.strictEqual(entity.position.y, 100);
  assert.strictEqual(entity.interactionRadius, 25);
  assert.strictEqual(entity.state, 'discovered');
});

test('3. Valid spawn_entity adds a new entity', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  const newEntity: SpatialEntity = {
    id: 'firefly-1',
    type: 'creature',
    label: 'Golden Firefly',
    position: { x: 150, y: 150 },
    state: 'glowing',
    interactionRadius: 30,
  };
  const consequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: newEntity,
  };

  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
  assert.ok(result.state.world.entities['firefly-1'] !== undefined);
  assert.ok(result.state.world.entities['chest-1'] !== undefined);
});

test('4. Spawned entity is preserved exactly as supplied after freezing', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  const newEntity: SpatialEntity = {
    id: 'rock-hazard',
    type: 'hazard',
    label: 'Falling Pebble',
    position: { x: 50, y: 75 },
    state: 'active',
    interactionRadius: 15,
  };
  const consequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: newEntity,
  };

  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
  const spawned = result.state.world.entities['rock-hazard'];
  assert.deepStrictEqual(spawned, newEntity);
  assert.ok(Object.isFrozen(spawned));
  assert.ok(Object.isFrozen(result.state));
  assert.ok(Object.isFrozen(result.state.world));
  assert.ok(Object.isFrozen(result.state.world.entities));
});

test('5. Duplicate entity ID is rejected', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  const duplicateEntity: SpatialEntity = {
    id: 'chest-1',
    type: 'object',
    label: 'Another Chest',
    position: { x: 200, y: 200 },
    state: 'visible',
    interactionRadius: 20,
  };
  const consequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: duplicateEntity,
  };

  const validation = gameCore.validateConsequence(consequence);
  assert.ok(!validation.valid);
  assert.strictEqual(validation.reason, 'Entity ID already exists');

  const result = gameCore.applyConsequence(consequence);
  assert.ok(!result.accepted);
});

test('6. Invalid entity position outside world bounds is rejected', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  // state world bounds are (0, 0) to (400, 400)
  const outOfBoundsEntity: SpatialEntity = {
    id: 'out-1',
    type: 'object',
    label: 'Outside',
    position: { x: 500, y: 200 },
    state: 'visible',
    interactionRadius: 10,
  };
  const consequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: outOfBoundsEntity,
  };

  const validation = gameCore.validateConsequence(consequence);
  assert.ok(!validation.valid);
  assert.strictEqual(validation.reason, 'Position outside world bounds');

  const result = gameCore.applyConsequence(consequence);
  assert.ok(!result.accepted);
});

test('7. Invalid interaction radius is rejected', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const negativeRadiusEntity: SpatialEntity = {
    id: 'neg-radius',
    type: 'object',
    label: 'Negative Radius',
    position: { x: 100, y: 100 },
    state: 'visible',
    interactionRadius: -5,
  };
  const consequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: negativeRadiusEntity,
  };

  const validation = gameCore.validateConsequence(consequence);
  assert.ok(!validation.valid);
  assert.strictEqual(validation.reason, 'Interaction radius cannot be negative');

  const nanRadiusEntity: SpatialEntity = {
    id: 'nan-radius',
    type: 'object',
    label: 'NaN Radius',
    position: { x: 100, y: 100 },
    state: 'visible',
    interactionRadius: NaN,
  };
  const nanValidation = gameCore.validateConsequence({
    type: 'spawn_entity',
    entity: nanRadiusEntity,
  });
  assert.ok(!nanValidation.valid);
});

test('8. Invalid/malformed entity data is rejected', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  // Empty id
  const emptyIdResult = gameCore.validateConsequence({
    type: 'spawn_entity',
    entity: {
      id: '',
      type: 'object',
      label: 'Empty ID',
      position: { x: 10, y: 10 },
      state: 'visible',
      interactionRadius: 10,
    },
  });
  assert.ok(!emptyIdResult.valid);

  // Invalid type
  const invalidTypeResult = gameCore.validateConsequence({
    type: 'spawn_entity',
    entity: {
      id: 'bad-type',
      type: 'alien' as any,
      label: 'Alien',
      position: { x: 10, y: 10 },
      state: 'visible',
      interactionRadius: 10,
    },
  });
  assert.ok(!invalidTypeResult.valid);

  // Non-existent entity for change_entity_state
  const missingEntityResult = gameCore.validateConsequence({
    type: 'change_entity_state',
    entityId: 'does-not-exist',
    state: 'discovered',
  });
  assert.ok(!missingEntityResult.valid);
  assert.strictEqual(missingEntityResult.reason, 'Entity not found');
});

test('9. Invalid state transition is rejected', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  // 1. Transition to same state (visible -> visible)
  const sameStateResult = gameCore.validateConsequence({
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'visible',
  });
  assert.ok(!sameStateResult.valid);
  assert.strictEqual(sameStateResult.reason, 'State unchanged');

  // Transition to discovered first
  gameCore.applyConsequence({
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'discovered',
  });

  // 2. Terminal state transition: discovered -> visible
  const fromDiscoveredResult = gameCore.validateConsequence({
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'visible',
  });
  assert.ok(!fromDiscoveredResult.valid);
  assert.strictEqual(fromDiscoveredResult.reason, 'Cannot transition from terminal state');

  // Spawn escaped entity and test terminal state transition
  gameCore.applyConsequence({
    type: 'spawn_entity',
    entity: {
      id: 'bird-1',
      type: 'creature',
      label: 'Sparrow',
      position: { x: 200, y: 200 },
      state: 'escaped',
      interactionRadius: 10,
    },
  });

  const fromEscapedResult = gameCore.validateConsequence({
    type: 'change_entity_state',
    entityId: 'bird-1',
    state: 'visible',
  });
  assert.ok(!fromEscapedResult.valid);
  assert.strictEqual(fromEscapedResult.reason, 'Cannot transition from terminal state');
});

test('10. Accepted consequence increments version exactly once', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  assert.strictEqual(gameCore.getState().version, 0);

  const result1 = gameCore.applyConsequence({
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  });
  assert.ok(result1.accepted);
  assert.strictEqual(result1.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);

  const result2 = gameCore.applyConsequence({
    type: 'spawn_entity',
    entity: {
      id: 'item-2',
      type: 'object',
      label: 'Item 2',
      position: { x: 10, y: 10 },
      state: 'visible',
      interactionRadius: 5,
    },
  });
  assert.ok(result2.accepted);
  assert.strictEqual(result2.state.version, 2);
  assert.strictEqual(gameCore.getState().version, 2);
});

test('11. Rejected consequence does not change version', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  assert.strictEqual(gameCore.getState().version, 0);

  const invalidConsequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'visible', // unchanged
  };

  const result = gameCore.applyConsequence(invalidConsequence);
  assert.ok(!result.accepted);
  assert.strictEqual(result.state.version, 0);
  assert.strictEqual(gameCore.getState().version, 0);
});

test('12. Unrelated state remains unchanged', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const result = gameCore.applyConsequence({
    type: 'spawn_entity',
    entity: {
      id: 'item-3',
      type: 'object',
      label: 'Item 3',
      position: { x: 50, y: 50 },
      state: 'visible',
      interactionRadius: 10,
    },
  });

  assert.ok(result.accepted);
  assert.deepStrictEqual(result.state.player, state.player);
  assert.deepStrictEqual(result.state.pet, state.pet);
  assert.deepStrictEqual(result.state.discoveries, state.discoveries);
  assert.deepStrictEqual(result.state.world.bounds, state.world.bounds);
  assert.deepStrictEqual(result.state.world.playerPos, state.world.playerPos);
  assert.deepStrictEqual(result.state.world.entities['chest-1'], state.world.entities['chest-1']);
});

test('13. Standalone applyGameplayConsequence and validateGameplayConsequence behave deterministically and immutably', () => {
  const state = createBaseState();
  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };

  const validation = validateGameplayConsequence(consequence, state);
  assert.ok(validation.valid);

  const result = applyGameplayConsequence(consequence, state);
  assert.ok(result.accepted);
  assert.strictEqual(state.version, 0); // Original state unmodified
  assert.strictEqual(result.state.version, 1);
  assert.ok(Object.isFrozen(result.state));
});
