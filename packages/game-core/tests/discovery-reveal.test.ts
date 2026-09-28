import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createGameplayProposal,
  createInitialGameState,
  freezeGameState,
  GameCore,
  type AcceptedGameplayContext,
  type ChangeEntityStateConsequence,
  type GameState,
  type RecordDiscoveryConsequence,
  type SpatialEntity,
  type SpawnEntityConsequence,
} from '../src/index.js';

function createBaseState(): GameState {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const ancientRuin: SpatialEntity = {
    id: 'ancient-ruin',
    type: 'object',
    label: 'Ancient Ruin',
    position: { x: 120, y: 140 },
    state: 'visible',
    interactionRadius: 25,
  };
  return freezeGameState({
    ...base,
    world: {
      ...base.world,
      entities: { 'ancient-ruin': ancientRuin },
    },
  });
}

function createAcceptedContext(
  gameCore: GameCore,
  consequences?: (ChangeEntityStateConsequence | SpawnEntityConsequence | RecordDiscoveryConsequence)[],
): AcceptedGameplayContext {
  const state = gameCore.getState();
  return Object.freeze({
    gameplayContext: Object.freeze({
      playerId: state.player.id,
      sourceStateVersion: state.version,
      contextualElements: Object.freeze([
        { id: 'ancient-ruin', category: 'object', attributes: Object.freeze(['visible']) },
      ]),
      applicableCapabilityIds: Object.freeze(['observe']),
    }),
    narrative: 'A discovery proposal',
    ...(consequences !== undefined ? { consequences: Object.freeze(consequences.map(c => Object.freeze(c))) } : {}),
  });
}

test('1. Valid record_discovery records the entity in discoveries', () => {
  const gameCore = new GameCore(createBaseState());
  const discoveryConsequence: RecordDiscoveryConsequence = {
    type: 'record_discovery',
    entityId: 'ancient-ruin',
  };

  const validation = gameCore.validateConsequence(discoveryConsequence);
  assert.ok(validation.valid);

  const result = gameCore.applyConsequence(discoveryConsequence);
  assert.ok(result.accepted);
  assert.deepStrictEqual(result.state.discoveries, ['ancient-ruin']);
  assert.deepStrictEqual(gameCore.getState().discoveries, ['ancient-ruin']);
});

test('2. Discovery increments version exactly once when applied individually', () => {
  const gameCore = new GameCore(createBaseState());
  assert.strictEqual(gameCore.getState().version, 0);

  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'ancient-ruin',
  });

  assert.ok(result.accepted);
  assert.strictEqual(result.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('3. Duplicate discovery is rejected', () => {
  const gameCore = new GameCore(createBaseState());
  gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'ancient-ruin',
  });

  const duplicate = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'ancient-ruin',
  });

  assert.ok(!duplicate.accepted);
  assert.strictEqual(duplicate.reason, 'Discovery already recorded');
  assert.strictEqual(gameCore.getState().version, 1);
});

test('4. Unknown entity is rejected for record_discovery', () => {
  const gameCore = new GameCore(createBaseState());
  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'unknown-entity',
  });

  assert.ok(!result.accepted);
  assert.strictEqual(result.reason, 'Entity not found');
  assert.strictEqual(gameCore.getState().version, 0);
});

test('5. Invalid / empty entity ID is rejected', () => {
  const gameCore = new GameCore(createBaseState());

  const emptyResult = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: '',
  });
  assert.ok(!emptyResult.accepted);
  assert.strictEqual(emptyResult.reason, 'Invalid entity ID');

  const whitespaceResult = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: '   ',
  });
  assert.ok(!whitespaceResult.accepted);
  assert.strictEqual(whitespaceResult.reason, 'Invalid entity ID');
});

test('6. Recording a discovery does not change the entity state', () => {
  const gameCore = new GameCore(createBaseState());
  const initialEntityState = gameCore.getState().world.entities['ancient-ruin']?.state;
  assert.strictEqual(initialEntityState, 'visible');

  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'ancient-ruin',
  });

  assert.ok(result.accepted);
  assert.strictEqual(result.state.world.entities['ancient-ruin']?.state, 'visible');
});

test('7. Recording a discovery does not remove the entity from world.entities', () => {
  const gameCore = new GameCore(createBaseState());
  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'ancient-ruin',
  });

  assert.ok(result.accepted);
  const entity = result.state.world.entities['ancient-ruin'];
  assert.ok(entity !== undefined);
  assert.strictEqual(entity.id, 'ancient-ruin');
  assert.strictEqual(entity.label, 'Ancient Ruin');
});

test('8. Previous GameState remains unchanged upon discovery', () => {
  const initialState = createBaseState();
  const gameCore = new GameCore(initialState);

  gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'ancient-ruin',
  });

  assert.strictEqual(initialState.version, 0);
  assert.deepStrictEqual(initialState.discoveries, []);
});

test('9. Resulting GameState remains immutable and frozen', () => {
  const gameCore = new GameCore(createBaseState());
  const result = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'ancient-ruin',
  });

  assert.ok(result.accepted);
  assert.ok(Object.isFrozen(result.state));
  assert.ok(Object.isFrozen(result.state.discoveries));
  assert.ok(Object.isFrozen(result.state.world));
});

test('10. change_entity_state remains independent from discovery recording', () => {
  const gameCore = new GameCore(createBaseState());

  // 1. change_entity_state alone modifies entity state, but leaves discoveries untouched
  const stateChangeResult = gameCore.applyConsequence({
    type: 'change_entity_state',
    entityId: 'ancient-ruin',
    state: 'glowing',
  });
  assert.ok(stateChangeResult.accepted);
  assert.strictEqual(stateChangeResult.state.world.entities['ancient-ruin']?.state, 'glowing');
  assert.deepStrictEqual(stateChangeResult.state.discoveries, []);

  // 2. record_discovery alone modifies discoveries, but leaves glowing state untouched
  const discoveryResult = gameCore.applyConsequence({
    type: 'record_discovery',
    entityId: 'ancient-ruin',
  });
  assert.ok(discoveryResult.accepted);
  assert.strictEqual(discoveryResult.state.world.entities['ancient-ruin']?.state, 'glowing');
  assert.deepStrictEqual(discoveryResult.state.discoveries, ['ancient-ruin']);
});

test('11. A combined accepted proposal containing change_entity_state and record_discovery is applied atomically with exactly one version increment', () => {
  const gameCore = new GameCore(createBaseState());
  assert.strictEqual(gameCore.getState().version, 0);

  const revealConsequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'ancient-ruin',
    state: 'discovered',
  };
  const discoveryConsequence: RecordDiscoveryConsequence = {
    type: 'record_discovery',
    entityId: 'ancient-ruin',
  };

  const context = createAcceptedContext(gameCore, [revealConsequence, discoveryConsequence]);
  const result = gameCore.applyAcceptedGameplayContext(context);

  assert.ok(result.accepted);
  // Both effects applied
  assert.strictEqual(result.state.world.entities['ancient-ruin']?.state, 'discovered');
  assert.deepStrictEqual(result.state.discoveries, ['ancient-ruin']);
  // Exactly ONE version increment for the atomic batch
  assert.strictEqual(result.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('12. Invalid discovery inside a combined proposal rejects the entire proposal/batch with no partial mutation', () => {
  const gameCore = new GameCore(createBaseState());
  const stateBefore = gameCore.getState();

  const validReveal: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'ancient-ruin',
    state: 'discovered',
  };
  const invalidDiscovery: RecordDiscoveryConsequence = {
    type: 'record_discovery',
    entityId: 'non-existent-entity',
  };

  const context = createAcceptedContext(gameCore, [validReveal, invalidDiscovery]);
  const result = gameCore.applyAcceptedGameplayContext(context);

  assert.ok(!result.accepted);
  assert.strictEqual(result.reason, 'Entity not found');

  // No partial mutation of ancient-ruin state
  assert.strictEqual(gameCore.getState(), stateBefore);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.strictEqual(gameCore.getState().world.entities['ancient-ruin']?.state, 'visible');
  assert.deepStrictEqual(gameCore.getState().discoveries, []);
});

test('13. Proposal validation and correction/fallback behavior remains intact with record_discovery', () => {
  const gameCore = new GameCore(createBaseState());
  const state = gameCore.getState();

  const invalidProposal = createGameplayProposal(
    'test-purpose',
    state.version,
    [{ id: 'ancient-ruin', category: 'object', attributes: ['visible'] }],
    ['observe'],
    'Narrative',
    undefined,
    [{
      type: 'record_discovery',
      entityId: 'non-existent',
    }],
  );

  const controlledContext = gameCore.createControlledGenerationContext(
    'test-purpose',
    {
      gameState: state,
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: { id: 'ancient-ruin', category: 'object', attributes: ['visible'] },
    },
  )!;

  const corrector = {
    correct: (attempt: any) => {
      return createGameplayProposal(
        attempt.controlledContext.generationPurpose,
        attempt.controlledContext.sourceStateVersion,
        attempt.controlledContext.gameplayContext.contextualElements,
        attempt.controlledContext.gameplayContext.applicableCapabilityIds,
        'Corrected narrative with valid discovery',
        undefined,
        [{
          type: 'record_discovery',
          entityId: 'ancient-ruin',
        }],
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
  assert.strictEqual(resolution.context.consequences?.length, 1);
  assert.strictEqual(resolution.context.consequences[0]?.type, 'record_discovery');
});
