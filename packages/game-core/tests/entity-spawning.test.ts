import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createGameplayProposal,
  createInitialGameState,
  freezeGameState,
  GameCore,
  type AcceptedGameplayContext,
  type GameState,
  type SpatialEntity,
  type SpawnEntityConsequence,
} from '../src/index.js';

function createBaseState(): GameState {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const initialTree: SpatialEntity = {
    id: 'oak-tree',
    type: 'object',
    label: 'Oak Tree',
    position: { x: 100, y: 100 },
    state: 'visible',
    interactionRadius: 20,
  };
  return freezeGameState({
    ...base,
    world: {
      ...base.world,
      bounds: { minX: 0, minY: 0, maxX: 400, maxY: 400 },
      playerPos: { x: 200, y: 200 },
      entities: { 'oak-tree': initialTree },
    },
  });
}

function runProposalFlow(
  gameCore: GameCore,
  consequences: SpawnEntityConsequence[],
) {
  const state = gameCore.getState();
  const proposal = createGameplayProposal(
    'test-purpose',
    state.version,
    [{ id: 'oak-tree', category: 'object', attributes: ['visible'] }],
    ['observe'],
    'An encounter occurred.',
    undefined,
    consequences,
  );

  const controlledContext = gameCore.createControlledGenerationContext(
    'test-purpose',
    {
      gameState: state,
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: { id: 'oak-tree', category: 'object', attributes: ['visible'] },
    },
  );

  assert.ok(controlledContext !== undefined);
  const validation = gameCore.validateGameplayProposal(controlledContext, proposal);
  return { validation, proposal, controlledContext };
}

test('1. Valid generic entity spawn through GameplayProposal is validated and accepted', () => {
  const gameCore = new GameCore(createBaseState());
  const creatureToSpawn: SpatialEntity = {
    id: 'forest-creature-1',
    type: 'creature',
    label: 'Curious Critter',
    position: { x: 150, y: 160 },
    state: 'visible',
    interactionRadius: 25,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: creatureToSpawn },
  ]);

  assert.ok(validation.valid);
  assert.ok(validation.context !== undefined);
  assert.strictEqual(validation.context.consequences?.length, 1);
  assert.deepStrictEqual(validation.context.consequences[0], {
    type: 'spawn_entity',
    entity: creatureToSpawn,
  });
});

test('2. Spawned entity survives proposal acceptance and is preserved in AcceptedGameplayContext', () => {
  const gameCore = new GameCore(createBaseState());
  const hazardToSpawn: SpatialEntity = {
    id: 'thorny-bush-1',
    type: 'hazard',
    label: 'Thorny Bush',
    position: { x: 180, y: 190 },
    state: 'active',
    interactionRadius: 15,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: hazardToSpawn },
  ]);

  assert.ok(validation.valid);
  const accepted = validation.context;
  assert.ok(accepted !== undefined);
  const consequence = accepted.consequences?.[0];
  assert.ok(consequence !== undefined);
  assert.strictEqual(consequence.type, 'spawn_entity');
  if (consequence.type === 'spawn_entity') {
    assert.deepStrictEqual(consequence.entity, hazardToSpawn);
  }
});

test('3. Spawned entity appears in authoritative GameState.world.entities after application', () => {
  const gameCore = new GameCore(createBaseState());
  const objectToSpawn: SpatialEntity = {
    id: 'crystal-shard',
    type: 'object',
    label: 'Glowing Crystal',
    position: { x: 220, y: 210 },
    state: 'glowing',
    interactionRadius: 30,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: objectToSpawn },
  ]);

  assert.ok(validation.valid);
  const result = gameCore.applyAcceptedGameplayContext(validation.context);

  assert.ok(result.accepted);
  assert.ok(result.state.world.entities['crystal-shard'] !== undefined);
  assert.ok(gameCore.getState().world.entities['crystal-shard'] !== undefined);
  // Pre-existing entities remain present
  assert.ok(result.state.world.entities['oak-tree'] !== undefined);
});

test('4. Spawned entity preserves all supplied generic properties exactly', () => {
  const gameCore = new GameCore(createBaseState());
  const creature: SpatialEntity = {
    id: 'wild-pet-fixture',
    type: 'creature',
    label: 'Small Sprite',
    position: { x: 300, y: 250 },
    state: 'escaped',
    interactionRadius: 18,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: creature },
  ]);

  assert.ok(validation.valid);
  const result = gameCore.applyAcceptedGameplayContext(validation.context);

  assert.ok(result.accepted);
  const spawned = result.state.world.entities['wild-pet-fixture'];
  assert.ok(spawned !== undefined);
  assert.strictEqual(spawned.id, 'wild-pet-fixture');
  assert.strictEqual(spawned.type, 'creature');
  assert.strictEqual(spawned.label, 'Small Sprite');
  assert.strictEqual(spawned.state, 'escaped');
  assert.strictEqual(spawned.position.x, 300);
  assert.strictEqual(spawned.position.y, 250);
  assert.strictEqual(spawned.interactionRadius, 18);
});

test('5. Multiple spawned entities are applied atomically across all types (creature, hazard, object)', () => {
  const gameCore = new GameCore(createBaseState());
  const creature: SpatialEntity = {
    id: 'entity-creature',
    type: 'creature',
    label: 'Critter',
    position: { x: 50, y: 50 },
    state: 'visible',
    interactionRadius: 10,
  };
  const hazard: SpatialEntity = {
    id: 'entity-hazard',
    type: 'hazard',
    label: 'Puddle',
    position: { x: 70, y: 70 },
    state: 'active',
    interactionRadius: 15,
  };
  const object: SpatialEntity = {
    id: 'entity-object',
    type: 'object',
    label: 'Stone',
    position: { x: 90, y: 90 },
    state: 'visible',
    interactionRadius: 12,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: creature },
    { type: 'spawn_entity', entity: hazard },
    { type: 'spawn_entity', entity: object },
  ]);

  assert.ok(validation.valid);
  const result = gameCore.applyAcceptedGameplayContext(validation.context);

  assert.ok(result.accepted);
  assert.ok(result.state.world.entities['entity-creature'] !== undefined);
  assert.ok(result.state.world.entities['entity-hazard'] !== undefined);
  assert.ok(result.state.world.entities['entity-object'] !== undefined);
  assert.ok(result.state.world.entities['oak-tree'] !== undefined);
});

test('6. Multiple spawned entities increment version exactly once total', () => {
  const gameCore = new GameCore(createBaseState());
  assert.strictEqual(gameCore.getState().version, 0);

  const e1: SpatialEntity = {
    id: 'spawn-a',
    type: 'object',
    label: 'A',
    position: { x: 10, y: 10 },
    state: 'visible',
    interactionRadius: 5,
  };
  const e2: SpatialEntity = {
    id: 'spawn-b',
    type: 'creature',
    label: 'B',
    position: { x: 20, y: 20 },
    state: 'visible',
    interactionRadius: 5,
  };
  const e3: SpatialEntity = {
    id: 'spawn-c',
    type: 'hazard',
    label: 'C',
    position: { x: 30, y: 30 },
    state: 'visible',
    interactionRadius: 5,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: e1 },
    { type: 'spawn_entity', entity: e2 },
    { type: 'spawn_entity', entity: e3 },
  ]);

  assert.ok(validation.valid);
  const result = gameCore.applyAcceptedGameplayContext(validation.context);

  assert.ok(result.accepted);
  assert.strictEqual(result.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('7. Duplicate entity ID (existing in world) rejects proposal validation', () => {
  const gameCore = new GameCore(createBaseState());
  const duplicateEntity: SpatialEntity = {
    id: 'oak-tree', // Already exists in base state
    type: 'object',
    label: 'Another Tree',
    position: { x: 110, y: 110 },
    state: 'visible',
    interactionRadius: 20,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: duplicateEntity },
  ]);

  assert.ok(!validation.valid);
  assert.strictEqual(validation.rejection.code, 'INVALID_CONSEQUENCE');
  assert.strictEqual(validation.rejection.message, 'Entity ID already exists');
});

test('8. Intra-batch duplicate spawn ID rejects the entire transition', () => {
  const gameCore = new GameCore(createBaseState());
  const e1: SpatialEntity = {
    id: 'batch-dup',
    type: 'object',
    label: 'Item 1',
    position: { x: 10, y: 10 },
    state: 'visible',
    interactionRadius: 5,
  };
  const e2: SpatialEntity = {
    id: 'batch-dup',
    type: 'object',
    label: 'Item 2',
    position: { x: 20, y: 20 },
    state: 'visible',
    interactionRadius: 5,
  };

  const context: AcceptedGameplayContext = Object.freeze({
    gameplayContext: Object.freeze({
      playerId: 'player-1',
      sourceStateVersion: 0,
      contextualElements: Object.freeze([]),
      applicableCapabilityIds: Object.freeze([]),
    }),
    narrative: 'Duplicate batch spawn',
    consequences: Object.freeze([
      Object.freeze({ type: 'spawn_entity', entity: e1 }),
      Object.freeze({ type: 'spawn_entity', entity: e2 }),
    ]),
  });

  const result = gameCore.applyAcceptedGameplayContext(context);
  assert.ok(!result.accepted);
  assert.strictEqual(result.reason, 'Duplicate spawn_entity ID in batch');
  assert.strictEqual(gameCore.getState().world.entities['batch-dup'], undefined);
});

test('9. Out-of-bounds spawn rejects proposal validation', () => {
  const gameCore = new GameCore(createBaseState());
  const outOfBoundsEntity: SpatialEntity = {
    id: 'out-entity',
    type: 'object',
    label: 'Out of Bounds',
    position: { x: 500, y: 200 }, // world bounds maxX is 400
    state: 'visible',
    interactionRadius: 10,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: outOfBoundsEntity },
  ]);

  assert.ok(!validation.valid);
  assert.strictEqual(validation.rejection.code, 'INVALID_CONSEQUENCE');
  assert.strictEqual(validation.rejection.message, 'Position outside world bounds');
});

test('10. Invalid entity type rejects proposal validation', () => {
  const gameCore = new GameCore(createBaseState());
  const invalidTypeEntity = {
    id: 'invalid-type-item',
    type: 'alien-ship' as any,
    label: 'Alien',
    position: { x: 100, y: 100 },
    state: 'visible' as const,
    interactionRadius: 10,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: invalidTypeEntity },
  ]);

  assert.ok(!validation.valid);
  assert.strictEqual(validation.rejection.code, 'INVALID_CONSEQUENCE');
  assert.strictEqual(validation.rejection.message, 'Invalid entity type');
});

test('11. Invalid entity state rejects proposal validation', () => {
  const gameCore = new GameCore(createBaseState());
  const invalidStateEntity = {
    id: 'invalid-state-item',
    type: 'object' as const,
    label: 'Item',
    position: { x: 100, y: 100 },
    state: 'flying-in-air' as any,
    interactionRadius: 10,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: invalidStateEntity },
  ]);

  assert.ok(!validation.valid);
  assert.strictEqual(validation.rejection.code, 'INVALID_CONSEQUENCE');
  assert.strictEqual(validation.rejection.message, 'Invalid entity state');
});

test('12. Invalid interaction radius (negative / NaN) rejects proposal validation', () => {
  const gameCore = new GameCore(createBaseState());
  const negRadiusEntity: SpatialEntity = {
    id: 'neg-radius-item',
    type: 'object',
    label: 'Negative Radius',
    position: { x: 100, y: 100 },
    state: 'visible',
    interactionRadius: -10,
  };

  const { validation: negVal } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: negRadiusEntity },
  ]);

  assert.ok(!negVal.valid);
  assert.strictEqual(negVal.rejection.code, 'INVALID_CONSEQUENCE');
  assert.strictEqual(negVal.rejection.message, 'Interaction radius cannot be negative');

  const nanRadiusEntity: SpatialEntity = {
    id: 'nan-radius-item',
    type: 'object',
    label: 'NaN Radius',
    position: { x: 100, y: 100 },
    state: 'visible',
    interactionRadius: NaN,
  };

  const { validation: nanVal } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: nanRadiusEntity },
  ]);

  assert.ok(!nanVal.valid);
  assert.strictEqual(nanVal.rejection.code, 'INVALID_CONSEQUENCE');
  assert.strictEqual(nanVal.rejection.message, 'Interaction radius must be finite');
});

test('13. Failed spawn leaves authoritative state and version completely unchanged', () => {
  const gameCore = new GameCore(createBaseState());
  const stateBefore = gameCore.getState();

  const invalidEntity: SpatialEntity = {
    id: '', // Invalid empty ID
    type: 'object',
    label: 'Invalid',
    position: { x: 100, y: 100 },
    state: 'visible',
    interactionRadius: 10,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: invalidEntity },
  ]);

  assert.ok(!validation.valid);
  assert.strictEqual(gameCore.getState(), stateBefore);
  assert.strictEqual(gameCore.getState().version, 0);
});

test('14. Previous GameState remains immutable and unchanged after successful spawn', () => {
  const initialState = createBaseState();
  const gameCore = new GameCore(initialState);

  const entityToSpawn: SpatialEntity = {
    id: 'flower-1',
    type: 'object',
    label: 'Red Flower',
    position: { x: 120, y: 130 },
    state: 'visible',
    interactionRadius: 15,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: entityToSpawn },
  ]);

  assert.ok(validation.valid);
  const result = gameCore.applyAcceptedGameplayContext(validation.context);

  assert.ok(result.accepted);
  assert.strictEqual(initialState.version, 0);
  assert.strictEqual(initialState.world.entities['flower-1'], undefined);
  assert.ok(Object.isFrozen(initialState));
  assert.ok(Object.isFrozen(initialState.world.entities));
});

test('15. Resulting GameState and spawned entity remain immutable and frozen', () => {
  const gameCore = new GameCore(createBaseState());
  const entityToSpawn: SpatialEntity = {
    id: 'crystal-frozen',
    type: 'object',
    label: 'Frozen Crystal',
    position: { x: 140, y: 140 },
    state: 'glowing',
    interactionRadius: 20,
  };

  const { validation } = runProposalFlow(gameCore, [
    { type: 'spawn_entity', entity: entityToSpawn },
  ]);

  assert.ok(validation.valid);
  const result = gameCore.applyAcceptedGameplayContext(validation.context);

  assert.ok(result.accepted);
  assert.ok(Object.isFrozen(result.state));
  assert.ok(Object.isFrozen(result.state.world));
  assert.ok(Object.isFrozen(result.state.world.entities));
  assert.ok(Object.isFrozen(result.state.world.entities['crystal-frozen']));
});
