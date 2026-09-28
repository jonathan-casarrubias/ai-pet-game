import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyConsequenceBatch,
  createGameplayProposal,
  createInitialGameState,
  freezeGameState,
  GameCore,
  type AcceptedGameplayContext,
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
  const chest: SpatialEntity = {
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
      entities: { 'chest-1': chest },
    },
  });
}

function createAcceptedContext(
  gameCore: GameCore,
  consequences?: (ChangeEntityStateConsequence | SpawnEntityConsequence)[],
  sourceStateVersionOverride?: number,
): AcceptedGameplayContext {
  const state = gameCore.getState();
  const proposal = createGameplayProposal(
    'test-purpose',
    sourceStateVersionOverride ?? state.version,
    [{ id: 'chest-1', category: 'object', attributes: ['visible'] }],
    ['observe'],
    'Test narrative',
    undefined,
    consequences,
  );

  const controlledContext = gameCore.createControlledGenerationContext(
    'test-purpose',
    {
      gameState: state,
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: {
        id: 'chest-1',
        category: 'object',
        attributes: ['visible'],
      },
    },
  )!;

  const validation = gameCore.validateGameplayProposal(controlledContext, proposal);
  if (validation.valid) {
    return validation.context;
  }

  // If we wanted to test stale version or something that failed proposal validation,
  // we construct an AcceptedGameplayContext manually for unit-testing the application boundary directly
  return Object.freeze({
    gameplayContext: Object.freeze({
      playerId: 'player-1',
      sourceStateVersion: sourceStateVersionOverride ?? state.version,
      contextualElements: Object.freeze([{ id: 'chest-1', category: 'object', attributes: Object.freeze(['visible']) }]),
      applicableCapabilityIds: Object.freeze(['observe']),
    }),
    narrative: 'Forced context',
    ...(consequences !== undefined ? { consequences: Object.freeze(consequences.map(c => Object.freeze(c))) } : {}),
  });
}

test('1. One valid consequence is applied', () => {
  const gameCore = new GameCore(createBaseState());
  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };

  const acceptedContext = createAcceptedContext(gameCore, [consequence]);
  const result = gameCore.applyAcceptedGameplayContext(acceptedContext);

  assert.ok(result.accepted);
  const chest = result.state.world.entities['chest-1'];
  assert.ok(chest !== undefined);
  assert.strictEqual(chest.state, 'glowing');
  assert.strictEqual(gameCore.getState().world.entities['chest-1']?.state, 'glowing');
});

test('2. One valid consequence increments version exactly once', () => {
  const gameCore = new GameCore(createBaseState());
  assert.strictEqual(gameCore.getState().version, 0);

  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };

  const acceptedContext = createAcceptedContext(gameCore, [consequence]);
  const result = gameCore.applyAcceptedGameplayContext(acceptedContext);

  assert.ok(result.accepted);
  assert.strictEqual(result.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('3. Multiple valid consequences are all applied', () => {
  const gameCore = new GameCore(createBaseState());
  const c1: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };
  const c2: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'butterfly-1',
      type: 'creature',
      label: 'Blue Butterfly',
      position: { x: 150, y: 150 },
      state: 'visible',
      interactionRadius: 20,
    },
  };
  const c3: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'rock-1',
      type: 'object',
      label: 'Small Rock',
      position: { x: 50, y: 50 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const acceptedContext = createAcceptedContext(gameCore, [c1, c2, c3]);
  const result = gameCore.applyAcceptedGameplayContext(acceptedContext);

  assert.ok(result.accepted);
  assert.strictEqual(result.state.world.entities['chest-1']?.state, 'glowing');
  assert.ok(result.state.world.entities['butterfly-1'] !== undefined);
  assert.ok(result.state.world.entities['rock-1'] !== undefined);
  assert.strictEqual(result.state.world.entities['butterfly-1']?.label, 'Blue Butterfly');
  assert.strictEqual(result.state.world.entities['rock-1']?.label, 'Small Rock');
});

test('4. Multiple valid consequences increment version exactly once total', () => {
  const gameCore = new GameCore(createBaseState());
  assert.strictEqual(gameCore.getState().version, 0);

  const c1: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };
  const c2: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'butterfly-1',
      type: 'creature',
      label: 'Blue Butterfly',
      position: { x: 150, y: 150 },
      state: 'visible',
      interactionRadius: 20,
    },
  };
  const c3: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'rock-1',
      type: 'object',
      label: 'Small Rock',
      position: { x: 50, y: 50 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const acceptedContext = createAcceptedContext(gameCore, [c1, c2, c3]);
  const result = gameCore.applyAcceptedGameplayContext(acceptedContext);

  assert.ok(result.accepted);
  assert.strictEqual(result.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('5. A combination such as change_entity_state + spawn_entity works atomically', () => {
  const gameCore = new GameCore(createBaseState());
  const changeC: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'discovered',
  };
  const spawnC: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'sparkle-1',
      type: 'object',
      label: 'Sparkle Dust',
      position: { x: 110, y: 100 },
      state: 'visible',
      interactionRadius: 15,
    },
  };

  const acceptedContext = createAcceptedContext(gameCore, [changeC, spawnC]);
  const result = gameCore.applyAcceptedGameplayContext(acceptedContext);

  assert.ok(result.accepted);
  assert.strictEqual(result.state.world.entities['chest-1']?.state, 'discovered');
  assert.strictEqual(result.state.world.entities['sparkle-1']?.label, 'Sparkle Dust');
  assert.strictEqual(result.state.version, 1);
});

test('6. An invalid consequence among otherwise valid consequences rejects the entire batch', () => {
  const gameCore = new GameCore(createBaseState());
  const validC: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };
  const invalidC: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: '', // invalid empty ID
      type: 'object',
      label: 'Bad Object',
      position: { x: 50, y: 50 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  // We test the batch application boundary directly
  const context: AcceptedGameplayContext = Object.freeze({
    gameplayContext: Object.freeze({
      playerId: 'player-1',
      sourceStateVersion: 0,
      contextualElements: Object.freeze([]),
      applicableCapabilityIds: Object.freeze([]),
    }),
    narrative: 'Batch test',
    consequences: Object.freeze([validC, invalidC]),
  });

  const result = gameCore.applyAcceptedGameplayContext(context);
  assert.ok(!result.accepted);
  assert.strictEqual(result.reason, 'Empty or invalid entity ID');
});

test('7. Invalid batch leaves the original state completely unchanged', () => {
  const initialState = createBaseState();
  const gameCore = new GameCore(initialState);
  const stateBefore = gameCore.getState();

  const validC: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };
  const invalidC: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'out-of-bounds',
      type: 'object',
      label: 'Out Object',
      position: { x: 500, y: 500 }, // outside bounds
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const context: AcceptedGameplayContext = Object.freeze({
    gameplayContext: Object.freeze({
      playerId: 'player-1',
      sourceStateVersion: 0,
      contextualElements: Object.freeze([]),
      applicableCapabilityIds: Object.freeze([]),
    }),
    narrative: 'Batch test',
    consequences: Object.freeze([validC, invalidC]),
  });

  const result = gameCore.applyAcceptedGameplayContext(context);
  assert.ok(!result.accepted);

  // Authoritative state must NOT have partially applied validC
  assert.strictEqual(gameCore.getState(), stateBefore);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().world.entities['chest-1']?.state, 'visible');
  assert.strictEqual(gameCore.getState().world.entities['out-of-bounds'], undefined);
});

test('8. Stale sourceStateVersion rejects the batch', () => {
  const gameCore = new GameCore(createBaseState());

  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };

  // State is version 0, but context claims source version 5 (stale)
  const staleContext: AcceptedGameplayContext = Object.freeze({
    gameplayContext: Object.freeze({
      playerId: 'player-1',
      sourceStateVersion: 5,
      contextualElements: Object.freeze([]),
      applicableCapabilityIds: Object.freeze([]),
    }),
    narrative: 'Stale test',
    consequences: Object.freeze([consequence]),
  });

  const result = gameCore.applyAcceptedGameplayContext(staleContext);
  assert.ok(!result.accepted);
  assert.strictEqual(result.reason, 'Stale source state version');
});

test('9. Stale context leaves state and version unchanged', () => {
  const gameCore = new GameCore(createBaseState());
  const stateBefore = gameCore.getState();

  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };

  const staleContext: AcceptedGameplayContext = Object.freeze({
    gameplayContext: Object.freeze({
      playerId: 'player-1',
      sourceStateVersion: 99,
      contextualElements: Object.freeze([]),
      applicableCapabilityIds: Object.freeze([]),
    }),
    narrative: 'Stale test',
    consequences: Object.freeze([consequence]),
  });

  const result = gameCore.applyAcceptedGameplayContext(staleContext);
  assert.ok(!result.accepted);
  assert.strictEqual(gameCore.getState(), stateBefore);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().world.entities['chest-1']?.state, 'visible');
});

test('10. Zero consequences is a no-op (no version bump)', () => {
  const gameCore = new GameCore(createBaseState());
  assert.strictEqual(gameCore.getState().version, 0);

  const contextWithoutConsequences: AcceptedGameplayContext = Object.freeze({
    gameplayContext: Object.freeze({
      playerId: 'player-1',
      sourceStateVersion: 0,
      contextualElements: Object.freeze([]),
      applicableCapabilityIds: Object.freeze([]),
    }),
    narrative: 'No consequence test',
  });

  const result = gameCore.applyAcceptedGameplayContext(contextWithoutConsequences);
  assert.ok(result.accepted);
  assert.strictEqual(result.state.version, 0);
  assert.strictEqual(gameCore.getState().version, 0);

  const contextWithEmptyArray: AcceptedGameplayContext = Object.freeze({
    gameplayContext: Object.freeze({
      playerId: 'player-1',
      sourceStateVersion: 0,
      contextualElements: Object.freeze([]),
      applicableCapabilityIds: Object.freeze([]),
    }),
    narrative: 'Empty consequence array test',
    consequences: Object.freeze([]),
  });

  const result2 = gameCore.applyAcceptedGameplayContext(contextWithEmptyArray);
  assert.ok(result2.accepted);
  assert.strictEqual(result2.state.version, 0);
  assert.strictEqual(gameCore.getState().version, 0);
});

test('11. Resulting state is immutable', () => {
  const gameCore = new GameCore(createBaseState());
  const c: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'spawned-item',
      type: 'object',
      label: 'Item',
      position: { x: 50, y: 50 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const context = createAcceptedContext(gameCore, [c]);
  const result = gameCore.applyAcceptedGameplayContext(context);
  assert.ok(result.accepted);

  assert.ok(Object.isFrozen(result.state));
  assert.ok(Object.isFrozen(result.state.world));
  assert.ok(Object.isFrozen(result.state.world.entities));
  assert.ok(Object.isFrozen(result.state.world.entities['spawned-item']));
});

test('12. Previous state remains unchanged', () => {
  const initialState = createBaseState();
  const gameCore = new GameCore(initialState);
  const entitiesBefore = { ...initialState.world.entities };

  const c: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };

  const context = createAcceptedContext(gameCore, [c]);
  const result = gameCore.applyAcceptedGameplayContext(context);
  assert.ok(result.accepted);

  assert.strictEqual(initialState.version, 0);
  assert.strictEqual(initialState.world.entities['chest-1']?.state, 'visible');
  assert.deepStrictEqual(initialState.world.entities, entitiesBefore);
});

test('13. Existing applyConsequence behavior/tests continue to pass', () => {
  const gameCore = new GameCore(createBaseState());
  const result = gameCore.applyConsequence({
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  });
  assert.ok(result.accepted);
  assert.strictEqual(result.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('14. Existing proposal validation/correction/fallback behavior continues to pass', () => {
  const gameCore = new GameCore(createBaseState());
  const state = gameCore.getState();

  const invalidProposal = createGameplayProposal(
    'test-purpose',
    state.version,
    [{ id: 'chest-1', category: 'object', attributes: ['visible'] }],
    ['observe'],
    'Invalid narrative',
    undefined,
    [{
      type: 'change_entity_state',
      entityId: 'non-existent',
      state: 'glowing',
    }],
  );

  const controlledContext = gameCore.createControlledGenerationContext(
    'test-purpose',
    {
      gameState: state,
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: { id: 'chest-1', category: 'object', attributes: ['visible'] },
    },
  )!;

  const corrector = {
    correct: (attempt: any) => {
      return createGameplayProposal(
        attempt.controlledContext.generationPurpose,
        attempt.controlledContext.sourceStateVersion,
        attempt.controlledContext.gameplayContext.contextualElements,
        attempt.controlledContext.gameplayContext.applicableCapabilityIds,
        'Corrected narrative',
      );
    },
  };

  const resolution = gameCore.resolveGameplayProposal(
    controlledContext,
    invalidProposal,
    corrector,
  );

  assert.strictEqual(resolution.acceptedFrom, 'corrected');
  assert.ok(resolution.context !== undefined);
});

test('15. Standalone applyConsequenceBatch function behaves deterministically and immutably', () => {
  const state = createBaseState();
  const c1: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };
  const c2: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'butterfly-standalone',
      type: 'creature',
      label: 'Butterfly',
      position: { x: 120, y: 120 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const result = applyConsequenceBatch([c1, c2], state);
  assert.ok(result.accepted);
  assert.strictEqual(state.version, 0); // Original state unmodified
  assert.strictEqual(result.state.version, 1);
  assert.strictEqual(result.state.world.entities['chest-1']?.state, 'glowing');
  assert.ok(result.state.world.entities['butterfly-standalone'] !== undefined);
  assert.ok(Object.isFrozen(result.state));
});

test('16. Duplicate spawn_entity IDs in one batch are rejected', () => {
  const gameCore = new GameCore(createBaseState());
  const stateBefore = gameCore.getState();

  const c1: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'ant-1',
      type: 'creature',
      label: 'Ant 1',
      position: { x: 150, y: 150 },
      state: 'visible',
      interactionRadius: 10,
    },
  };
  const c2: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'ant-1', // duplicate ID
      type: 'creature',
      label: 'Ant Duplicate',
      position: { x: 160, y: 160 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const context: AcceptedGameplayContext = Object.freeze({
    gameplayContext: Object.freeze({
      playerId: 'player-1',
      sourceStateVersion: 0,
      contextualElements: Object.freeze([]),
      applicableCapabilityIds: Object.freeze([]),
    }),
    narrative: 'Duplicate spawn test',
    consequences: Object.freeze([c1, c2]),
  });

  const result = gameCore.applyAcceptedGameplayContext(context);
  assert.ok(!result.accepted);
  assert.strictEqual(result.reason, 'Duplicate spawn_entity ID in batch');
  assert.strictEqual(gameCore.getState(), stateBefore);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().world.entities['ant-1'], undefined);
});

test('17. Duplicate record_discovery IDs in one batch are rejected', () => {
  const gameCore = new GameCore(createBaseState());
  const stateBefore = gameCore.getState();

  const c1 = {
    type: 'record_discovery' as const,
    entityId: 'chest-1',
  };
  const c2 = {
    type: 'record_discovery' as const,
    entityId: 'chest-1', // duplicate discovery in batch
  };

  const context: AcceptedGameplayContext = Object.freeze({
    gameplayContext: Object.freeze({
      playerId: 'player-1',
      sourceStateVersion: 0,
      contextualElements: Object.freeze([]),
      applicableCapabilityIds: Object.freeze([]),
    }),
    narrative: 'Duplicate discovery test',
    consequences: Object.freeze([c1, c2]),
  });

  const result = gameCore.applyAcceptedGameplayContext(context);
  assert.ok(!result.accepted);
  assert.strictEqual(result.reason, 'Duplicate record_discovery entity ID in batch');
  assert.strictEqual(gameCore.getState(), stateBefore);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.deepStrictEqual(gameCore.getState().discoveries, []);
});

test('18. Duplicate rejections leave the original state unchanged and version unchanged', () => {
  const state = createBaseState();
  const c1: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'dup-item',
      type: 'object',
      label: 'Item 1',
      position: { x: 50, y: 50 },
      state: 'visible',
      interactionRadius: 10,
    },
  };
  const c2: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'dup-item',
      type: 'object',
      label: 'Item 2',
      position: { x: 60, y: 60 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const result = applyConsequenceBatch([c1, c2], state);
  assert.ok(!result.accepted);
  assert.strictEqual(result.reason, 'Duplicate spawn_entity ID in batch');
  assert.strictEqual(result.state.version, 0);
  assert.strictEqual(result.state, state);
});
