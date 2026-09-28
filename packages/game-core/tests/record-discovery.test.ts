import assert from 'node:assert/strict';

import test from 'node:test';

import {
  createGameplayProposal,
  createInitialGameState,
  freezeGameState,
  GameCore,
  type GameState,
  type RecordDiscoveryConsequence,
  type SpatialEntity,
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

function createGenerationContext(gameCore: GameCore) {
  const context = gameCore.createControlledGenerationContext(
    'initial-adventure',
    {
      gameState: gameCore.getState(),
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: {
        id: 'chest-1',
        category: 'object',
        attributes: ['visible'],
      },
    },
  );
  assert.ok(context);
  return context;
}

test('1. A valid record_discovery consequence is accepted', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  const consequence: RecordDiscoveryConsequence = {
    type: 'record_discovery',
    entityId: 'chest-1',
  };

  const validation = gameCore.validateConsequence(consequence);
  assert.ok(validation.valid);

  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
});

test('2. Applying it adds the entity ID to discoveries', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  const consequence: RecordDiscoveryConsequence = {
    type: 'record_discovery',
    entityId: 'chest-1',
  };

  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
  assert.deepStrictEqual(result.state.discoveries, ['chest-1']);
});

test('3. Applying it increments version exactly once', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  assert.strictEqual(gameCore.getState().version, 0);

  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'chest-1',
  });
  assert.ok(result.accepted);
  assert.strictEqual(result.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('4. The discovered entity remains in world.entities', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'chest-1',
  });
  assert.ok(result.accepted);
  const entity = result.state.world.entities['chest-1'];
  assert.ok(entity !== undefined);
  assert.strictEqual(entity.id, 'chest-1');
  assert.strictEqual(entity.label, 'Old Chest');
});

test('5. Unrelated GameState is preserved', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'chest-1',
  });
  assert.ok(result.accepted);
  assert.deepStrictEqual(result.state.player, state.player);
  assert.deepStrictEqual(result.state.pet, state.pet);
  assert.deepStrictEqual(result.state.world.bounds, state.world.bounds);
  assert.deepStrictEqual(result.state.world.playerPos, state.world.playerPos);
});

test('6. The entity state is NOT automatically changed by recording discovery', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'chest-1',
  });
  assert.ok(result.accepted);
  const entity = result.state.world.entities['chest-1'];
  assert.ok(entity !== undefined);
  assert.strictEqual(entity.state, 'visible');
});

test('7. A nonexistent entity is rejected', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const validation = gameCore.validateConsequence({
    type: 'record_discovery',
    entityId: 'does-not-exist',
  });
  assert.ok(!validation.valid);
  assert.strictEqual(validation.reason, 'Entity not found');

  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'does-not-exist',
  });
  assert.ok(!result.accepted);
});

test('8. An empty entity ID is rejected', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const validation = gameCore.validateConsequence({
    type: 'record_discovery',
    entityId: '',
  });
  assert.ok(!validation.valid);
  assert.strictEqual(validation.reason, 'Invalid entity ID');

  const whitespaceValidation = gameCore.validateConsequence({
    type: 'record_discovery',
    entityId: '   ',
  });
  assert.ok(!whitespaceValidation.valid);
});

test('9. A duplicate discovery is rejected', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const first = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'chest-1',
  });
  assert.ok(first.accepted);

  const second = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'chest-1',
  });
  assert.ok(!second.accepted);
  assert.strictEqual(second.reason, 'Discovery already recorded');
});

test('10. Rejected discovery does not mutate GameState', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  const versionBefore = gameCore.getState().version;

  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'does-not-exist',
  });
  assert.ok(!result.accepted);
  assert.strictEqual(gameCore.getState().version, versionBefore);
  assert.deepStrictEqual(gameCore.getState().discoveries, []);
});

test('11. Previous GameState remains immutable', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);
  const previousDiscoveries = [...state.discoveries];

  gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'chest-1',
  });

  assert.deepStrictEqual(state.discoveries, previousDiscoveries);
  assert.strictEqual(state.version, 0);
});

test('12. Resulting GameState is immutable', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'chest-1',
  });
  assert.ok(result.accepted);
  assert.ok(Object.isFrozen(result.state));
  assert.ok(Object.isFrozen(result.state.world));
  assert.ok(Object.isFrozen(result.state.discoveries));
});

test('13. record_discovery preserves entity state separately from discovery', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const changeResult = gameCore.applyConsequence({
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  });
  assert.ok(changeResult.accepted);
  const changedEntity = changeResult.state.world.entities['chest-1'] as import('../src/index.js').SpatialEntity | undefined;
  assert.ok(changedEntity !== undefined);
  assert.strictEqual(changedEntity.state, 'glowing');

  const discoverResult = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'chest-1',
  });
  assert.ok(discoverResult.accepted);
  // Entity state remains glowing, not changed by discovery
  const discoveredEntity = discoverResult.state.world.entities['chest-1'] as import('../src/index.js').SpatialEntity | undefined;
  assert.ok(discoveredEntity !== undefined);
  assert.strictEqual(discoveredEntity.state, 'glowing');
  assert.deepStrictEqual(discoverResult.state.discoveries, ['chest-1']);
});

test('14. change_entity_state continues to work without modifying discoveries', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const result = gameCore.applyConsequence({
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  });
  assert.ok(result.accepted);
  assert.deepStrictEqual(result.state.discoveries, []);
  const entity = result.state.world.entities['chest-1'];
  assert.ok(entity !== undefined);
  assert.strictEqual(entity.state, 'glowing');
});

test('15. spawn_entity continues to work without modifying discoveries', () => {
  const state = createBaseState();
  const gameCore = new GameCore(state);

  const result = gameCore.applyConsequence({
    type: 'spawn_entity',
    entity: {
      id: 'firefly-1',
      type: 'creature',
      label: 'Golden Firefly',
      position: { x: 150, y: 150 },
      state: 'glowing',
      interactionRadius: 30,
    },
  });
  assert.ok(result.accepted);
  assert.deepStrictEqual(result.state.discoveries, []);
  assert.ok(result.state.world.entities['firefly-1'] !== undefined);
});

test('16. A GameplayProposal containing a valid discovery consequence is accepted', () => {
  const gameCore = new GameCore(createBaseState());
  const controlledContext = createGenerationContext(gameCore);

  const proposal = createGameplayProposal(
    'initial-adventure',
    controlledContext.sourceStateVersion,
    [
      { id: 'chest-1', category: 'object', attributes: ['visible'] },
    ],
    ['observe'],
    'The chest reveals its secrets.',
    undefined,
    [
      {
        type: 'record_discovery',
        entityId: 'chest-1',
      },
    ],
  );

  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, true);
  assert.ok(result.context !== undefined);
});

test('17. A GameplayProposal containing an invalid discovery consequence is rejected with INVALID_CONSEQUENCE', () => {
  const gameCore = new GameCore(createBaseState());
  const controlledContext = createGenerationContext(gameCore);

  const proposal = createGameplayProposal(
    'initial-adventure',
    controlledContext.sourceStateVersion,
    [
      { id: 'chest-1', category: 'object', attributes: ['visible'] },
    ],
    ['observe'],
    'Invalid proposal',
    undefined,
    [
      {
        type: 'record_discovery',
        entityId: 'does-not-exist',
      },
    ],
  );

  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.rejection.code, 'INVALID_CONSEQUENCE');
});

test('18. Correction/fallback behavior remains intact with record_discovery', () => {
  const gameCore = new GameCore(createBaseState());
  const controlledContext = createGenerationContext(gameCore);

  const invalidProposal = createGameplayProposal(
    'initial-adventure',
    controlledContext.sourceStateVersion,
    [
      { id: 'chest-1', category: 'object', attributes: ['visible'] },
    ],
    ['observe'],
    'Invalid with bad consequence',
    undefined,
    [
      {
        type: 'record_discovery',
        entityId: 'does-not-exist',
      },
    ],
  );

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

  const result = gameCore.resolveGameplayProposal(
    controlledContext,
    invalidProposal,
    corrector,
  );
  assert.strictEqual(result.acceptedFrom, 'corrected');
  assert.ok(result.context !== undefined);
});
