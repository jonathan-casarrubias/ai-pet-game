import assert from 'node:assert/strict';

import test from 'node:test';

import {
  createGameplayProposal,
  GameCore,
  type SpawnEntityConsequence,
  type ChangeEntityStateConsequence,
} from '../src/index.js';

// Use helper to create properly typed base state
function createBaseGameState(): import('../src/index.js').GameState {
  const base = {
    player: { id: 'player-1' },
    pet: { id: 'pet-1', name: 'Lumi', interactionCount: 0 },
    version: 0,
    discoveries: [],
    escapedThreats: [],
    world: {
      bounds: { minX: 0, minY: 0, maxX: 400, maxY: 400 },
      playerPos: { x: 200, y: 200 },
      entities: {
        'chest-1': {
          id: 'chest-1',
          type: 'object' as const,
          label: 'Old Chest',
          position: { x: 100, y: 100 },
          state: 'visible' as const,
          interactionRadius: 25,
        },
      },
    },
  };
  return Object.freeze({
    ...base,
    world: Object.freeze({
      ...base.world,
      entities: Object.freeze({ ...base.world.entities }),
    }),
  });
}

const baseState = createBaseGameState();
const gameCore = new GameCore(baseState);

const contextualElements = [
  {
    id: 'chest-1',
    category: 'object',
    attributes: ['visible'],
  },
];

function createGenerationContext() {
  const context = gameCore.createControlledGenerationContext(
    'initial-adventure',
    {
      gameState: gameCore.getState(),
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: contextualElements[0] as any,
    },
  );
  assert.ok(context);
  return context;
}

test('1. A valid GameplayProposal can contain a valid change_entity_state consequence', () => {
  const consequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };
  const proposal = createGameplayProposal(
    'initial-adventure',
    gameCore.getState().version,
    contextualElements,
    ['observe'],
    'The chest glows mysteriously.',
    undefined,
    [consequence],
  );

  const controlledContext = createGenerationContext();
  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, true);
  assert.ok(result.context !== undefined);
});

test('2. A valid GameplayProposal can contain a valid spawn_entity consequence', () => {
  const consequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'firefly-1',
      type: 'creature',
      label: 'Golden Firefly',
      position: { x: 150, y: 150 },
      state: 'glowing',
      interactionRadius: 30,
    },
  };
  const proposal = createGameplayProposal(
    'initial-adventure',
    gameCore.getState().version,
    contextualElements,
    ['observe'],
    'A firefly appears.',
    undefined,
    [consequence],
  );

  const controlledContext = createGenerationContext();
  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, true);
  assert.ok(result.context !== undefined);
});

test('3. Multiple valid consequences can coexist in one proposal', () => {
  const changeConsequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };
  const spawnConsequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'firefly-2',
      type: 'creature',
      label: 'Silver Firefly',
      position: { x: 160, y: 160 },
      state: 'glowing',
      interactionRadius: 25,
    },
  };

  const proposal = createGameplayProposal(
    'initial-adventure',
    gameCore.getState().version,
    contextualElements,
    ['observe'],
    'Multiple things happen.',
    undefined,
    [changeConsequence, spawnConsequence],
  );

  const controlledContext = createGenerationContext();
  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, true);
  assert.ok(result.context !== undefined);
});

test('4. Proposal creation preserves consequences', () => {
  const consequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'item-1',
      type: 'object',
      label: 'Rare Item',
      position: { x: 50, y: 50 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const proposal = createGameplayProposal(
    'test-purpose',
    5,
    contextualElements,
    ['explore'],
    'Test narrative',
    'explore',
    [consequence],
  );

  assert.ok(proposal.consequences !== undefined);
  assert.strictEqual(proposal.consequences.length, 1);
  const first = proposal.consequences![0] as SpawnEntityConsequence;
  assert.strictEqual(first.type, 'spawn_entity');
  assert.strictEqual(first.entity.id, 'item-1');
});

test('5. Consequences are not aliased/mutable through the caller original array/object references', () => {
  const mutableConsequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'mutable-item',
      type: 'object',
      label: 'Mutable Item',
      position: { x: 50, y: 50 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const proposal = createGameplayProposal(
    'test-purpose',
    5,
    contextualElements,
    ['explore'],
    'Test narrative',
    undefined,
    [mutableConsequence],
  );

  // The proposal should have frozen the consequence
  const frozen = proposal.consequences![0] as SpawnEntityConsequence;
  assert.strictEqual(Object.isFrozen(frozen), true);
  assert.strictEqual(Object.isFrozen(frozen.entity), true);
});

test('6. An invalid consequence causes proposal validation to reject the proposal', () => {
  const invalidConsequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: '',
      type: 'object',
      label: 'Invalid',
      position: { x: 10, y: 10 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const proposal = createGameplayProposal(
    'initial-adventure',
    gameCore.getState().version,
    contextualElements,
    ['observe'],
    'Test with invalid consequence',
    undefined,
    [invalidConsequence],
  );

  const controlledContext = createGenerationContext();
  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, false);
  assert.ok(result.rejection !== undefined);
  assert.strictEqual(result.rejection.code, 'INVALID_CONSEQUENCE');
});

test('7. A consequence referencing an invalid/nonexistent entity is rejected', () => {
  const invalidConsequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'does-not-exist',
    state: 'discovered',
  };

  const proposal = createGameplayProposal(
    'initial-adventure',
    gameCore.getState().version,
    contextualElements,
    ['observe'],
    'Test with missing entity',
    undefined,
    [invalidConsequence],
  );

  const controlledContext = createGenerationContext();
  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, false);
  assert.ok(result.rejection !== undefined);
  assert.strictEqual(result.rejection.code, 'INVALID_CONSEQUENCE');
});

test('8. A spawn consequence outside world bounds is rejected', () => {
  const outOfBoundsConsequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: 'out-of-bounds',
      type: 'object',
      label: 'Outside',
      position: { x: 500, y: 200 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const proposal = createGameplayProposal(
    'initial-adventure',
    gameCore.getState().version,
    contextualElements,
    ['observe'],
    'Test with out of bounds',
    undefined,
    [outOfBoundsConsequence],
  );

  const controlledContext = createGenerationContext();
  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, false);
  assert.ok(result.rejection !== undefined);
  assert.strictEqual(result.rejection.code, 'INVALID_CONSEQUENCE');
});

test('9. Proposal validation does not mutate authoritative GameState', () => {
  const stateBefore = gameCore.getState();

  const invalidConsequence: SpawnEntityConsequence = {
    type: 'spawn_entity',
    entity: {
      id: '',
      type: 'object',
      label: 'Invalid',
      position: { x: 10, y: 10 },
      state: 'visible',
      interactionRadius: 10,
    },
  };

  const proposal = createGameplayProposal(
    'initial-adventure',
    stateBefore.version,
    contextualElements,
    ['observe'],
    'Test mutation',
    undefined,
    [invalidConsequence],
  );

  const controlledContext = createGenerationContext();
  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, false);
  assert.deepStrictEqual(gameCore.getState(), stateBefore);
});

test('10. Existing proposal validation behavior remains unchanged', () => {
  const controlledContext = createGenerationContext();

  const proposal = createGameplayProposal(
    'different-purpose',
    gameCore.getState().version,
    contextualElements,
    ['observe'],
    'Wrong purpose',
  );

  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.rejection?.code, 'INVALID_PURPOSE');
});

test('11. Correction/fallback still works when an invalid proposal contains an invalid consequence', () => {
  const controlledContext = createGenerationContext();

  const invalidProposal = createGameplayProposal(
    'initial-adventure',
    controlledContext.sourceStateVersion,
    contextualElements,
    ['observe'],
    'Invalid with bad consequence',
    undefined,
    [{
      type: 'spawn_entity',
      entity: {
        id: '',
        type: 'object',
        label: 'Bad',
        position: { x: 10, y: 10 },
        state: 'visible',
        interactionRadius: 10,
      },
    }],
  );

  // Corrector fixes it
  const corrector = {
    correct: (attempt: any) => {
      return createGameplayProposal(
        attempt.controlledContext.generationPurpose,
        attempt.controlledContext.sourceStateVersion,
        attempt.controlledContext.gameplayContext.contextualElements,
        attempt.controlledContext.gameplayContext.applicableCapabilityIds,
        'Fixed narrative',
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

test('12. A valid corrected proposal containing consequences can be accepted', () => {
  const controlledContext = createGenerationContext();

  const invalidOriginal = createGameplayProposal(
    'initial-adventure',
    controlledContext.sourceStateVersion,
    contextualElements,
    ['observe'],
    'Original with bad consequence',
    undefined,
    [{
      type: 'spawn_entity',
      entity: {
        id: '',
        type: 'object',
        label: 'Bad',
        position: { x: 10, y: 10 },
        state: 'visible',
        interactionRadius: 10,
      },
    }],
  );

  const corrector = {
    correct: (attempt: any) => {
      const validConsequence: SpawnEntityConsequence = {
        type: 'spawn_entity',
        entity: {
          id: 'firefly-fixed',
          type: 'creature',
          label: 'Firefly',
          position: { x: 100, y: 100 },
          state: 'glowing',
          interactionRadius: 20,
        },
      };
      return createGameplayProposal(
        attempt.controlledContext.generationPurpose,
        attempt.controlledContext.sourceStateVersion,
        attempt.controlledContext.gameplayContext.contextualElements,
        attempt.controlledContext.gameplayContext.applicableCapabilityIds,
        'Corrected narrative',
        undefined,
        [validConsequence],
      );
    },
  };

  const result = gameCore.resolveGameplayProposal(
    controlledContext,
    invalidOriginal,
    corrector,
  );
  assert.strictEqual(result.acceptedFrom, 'corrected');
  assert.ok(result.context !== undefined);
});

test('13. Accepted proposal/context preserves the validated consequences', () => {
  const changeConsequence: ChangeEntityStateConsequence = {
    type: 'change_entity_state',
    entityId: 'chest-1',
    state: 'glowing',
  };

  const proposal = createGameplayProposal(
    'initial-adventure',
    gameCore.getState().version,
    contextualElements,
    ['observe'],
    'Valid consequence proposal',
    undefined,
    [changeConsequence],
  );

  const controlledContext = createGenerationContext();
  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, true);
  assert.ok(result.context !== undefined);
  assert.deepStrictEqual(result.context.consequences, [changeConsequence]);
});

test('14. Existing provider-independent gameplay generation tests continue to pass', () => {
  const controlledContext = createGenerationContext();

  const proposal = createGameplayProposal(
    'initial-adventure',
    controlledContext.sourceStateVersion,
    contextualElements,
    ['observe'],
    'Existing test proposal',
  );

  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, true);
  assert.ok(result.context !== undefined);
});
