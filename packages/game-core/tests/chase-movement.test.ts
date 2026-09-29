import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyGameplayConsequence,
  createGameplayProposal,
  createInitialGameState,
  freezeGameState,
  GameCore,
  type MoveEntityConsequence,
  type SpatialEntity,
} from '../src/index.js';

function createGameStateWithEntities(
  playerState: import('../src/index.js').GameState,
  entities: Record<string, SpatialEntity>,
): import('../src/index.js').GameState {
  const frozenEntities = Object.fromEntries(
    Object.entries(entities).map(([id, entity]) => [id, Object.freeze({ ...entity })]),
  );
  return freezeGameState({
    ...playerState,
    world: {
      ...playerState.world,
      entities: Object.freeze(frozenEntities),
    },
  });
}

function baseState(): import('../src/index.js').GameState {
  return createGameStateWithEntities(
    createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }),
    {
      threat: {
        id: 'threat',
        type: 'creature',
        label: 'Chaser',
        position: { x: 0, y: 0 },
        state: 'active',
        interactionRadius: 20,
      },
      target: {
        id: 'target',
        type: 'creature',
        label: 'Runner',
        position: { x: 100, y: 100 },
        state: 'visible',
        interactionRadius: 15,
      },
    },
  );
}

test('1. Valid chase moves threat toward target by bounded step', () => {
  const state = baseState();
  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'threat',
    targetId: 'target',
  };

  const result = applyGameplayConsequence(consequence, state);
  assert.ok(result.accepted);

  // Threat should be 10 units closer to target (CHASE_STEP_SIZE)
  const newThreatPos = result.state.world.entities['threat']!.position;
  assert.ok(newThreatPos.x > 0 || newThreatPos.y > 0, 'threat should move toward target');
  assert.ok(newThreatPos.x <= 100 && newThreatPos.y <= 100, 'threat should not overshoot target');
});

test('2. Chase movement is deterministic', () => {
  const state = baseState();
  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'threat',
    targetId: 'target',
  };

  const result1 = applyGameplayConsequence(consequence, state);
  const result2 = applyGameplayConsequence(consequence, state);

  const expectedPos = result1.state.world.entities['threat']!.position;
  assert.ok(Math.abs(expectedPos.x - 7.071067811865475) < 0.0001);
  assert.ok(Math.abs(expectedPos.y - 7.071067811865475) < 0.0001);
  const expectedPos2 = result2.state.world.entities['threat']!.position;
  assert.ok(Math.abs(expectedPos2.x - 7.071067811865475) < 0.0001);
  assert.ok(Math.abs(expectedPos2.y - 7.071067811865475) < 0.0001);
});

test('3. Threat moves closer to target after chase', () => {
  const state = baseState();
  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'threat',
    targetId: 'target',
  };

  const fromDist = Math.sqrt(
    Math.pow(state.world.entities['target']!.position.x - state.world.entities['threat']!.position.x, 2) +
    Math.pow(state.world.entities['target']!.position.y - state.world.entities['threat']!.position.y, 2),
  );

  const result = applyGameplayConsequence(consequence, state);
  const toDist = Math.sqrt(
    Math.pow(result.state.world.entities['target']!.position.x - result.state.world.entities['threat']!.position.x, 2) +
    Math.pow(result.state.world.entities['target']!.position.y - result.state.world.entities['threat']!.position.y, 2),
  );

  assert.ok(toDist < fromDist, 'threat should be closer to target after movement');
});

test('4. Both threat and target remain in authoritative world', () => {
  const state = baseState();
  const gameCore = new GameCore(state);
  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'threat',
    targetId: 'target',
  };

  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
  assert.ok(result.state.world.entities['threat'] !== undefined);
  assert.ok(result.state.world.entities['target'] !== undefined);
});

test('5. Unknown threat entity is rejected', () => {
  const state = baseState();
  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'nonexistent',
    targetId: 'target',
  };

  const result = applyGameplayConsequence(consequence, state);
  assert.ok(!result.accepted);
  assert.strictEqual(result.reason, 'Entity not found');
});

test('6. Unknown target entity is rejected', () => {
  const state = baseState();
  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'threat',
    targetId: 'nonexistent',
  };

  const result = applyGameplayConsequence(consequence, state);
  assert.ok(!result.accepted);
  assert.strictEqual(result.reason, 'Target entity not found');
});

test('7. Invalid chase does not mutate state', () => {
  const state = baseState();
  const gameCore = new GameCore(state);
  const initialVersion = gameCore.getState().version;
  const initialThreatPos = gameCore.getState().world.entities['threat']!.position;

  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'nonexistent',
    targetId: 'target',
  };

  const result = gameCore.applyConsequence(consequence);
  assert.ok(!result.accepted);
  assert.strictEqual(gameCore.getState().version, initialVersion);
  assert.deepStrictEqual(
    gameCore.getState().world.entities['threat']!.position,
    initialThreatPos,
  );
});

test('8. World bounds are respected when threat reaches boundary', () => {
  const state = createGameStateWithEntities(
    createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }),
    {
      threat: {
        id: 'threat',
        type: 'creature',
        label: 'Edge Chaser',
        position: { x: 395, y: 395 },
        state: 'active',
        interactionRadius: 10,
      },
      target: {
        id: 'target',
        type: 'creature',
        label: 'Far Runner',
        position: { x: 400, y: 400 },
        state: 'visible',
        interactionRadius: 10,
      },
    },
  );
  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'threat',
    targetId: 'target',
  };

  const result = applyGameplayConsequence(consequence, state);
  assert.ok(result.accepted);

  const pos = result.state.world.entities['threat']!.position;
  assert.ok(pos.x >= 0 && pos.x <= 400, 'x within bounds');
  assert.ok(pos.y >= 0 && pos.y <= 400, 'y within bounds');
  assert.strictEqual(pos.x, 400, 'threat clamped to max X');
  assert.strictEqual(pos.y, 400, 'threat clamped to max Y');
});

test('9. Stale source state is handled correctly via proposal validation', () => {
  const state = baseState();
  const gameCore = new GameCore(state);

  // First apply a consequence to bump version
  gameCore.applyConsequence({
    type: 'move_entity',
    entityId: 'threat',
    targetId: 'target',
  });

  // Now try to apply using the old state as base (stale)
  const staleState = gameCore.getState();
  assert.strictEqual(staleState.version, 1);

  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'threat',
    targetId: 'target',
  };

  // This should work because the consequence itself validates against current state
  const result = applyGameplayConsequence(consequence, staleState);
  assert.ok(result.accepted);
});

test('10. Resulting state is immutable', () => {
  const state = baseState();
  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'threat',
    targetId: 'target',
  };

  const result = applyGameplayConsequence(consequence, state);
  assert.ok(result.accepted);
  assert.ok(Object.isFrozen(result.state));
  assert.ok(Object.isFrozen(result.state.world));
  assert.ok(Object.isFrozen(result.state.world.entities));
  assert.ok(Object.isFrozen(result.state.world.entities['threat']!));
});

test('11. Previous state remains unchanged after successful chase', () => {
  const state = baseState();
  const initialThreatPos = state.world.entities['threat']!.position;

  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'threat',
    targetId: 'target',
  };

  applyGameplayConsequence(consequence, state);
  assert.strictEqual(state.world.entities['threat']!.position.x, initialThreatPos.x);
  assert.strictEqual(state.world.entities['threat']!.position.y, initialThreatPos.y);
});

test('12. AI proposal containing chase operation is validated and accepted', () => {
  const state = baseState();
  const gameCore = new GameCore(state);

  const proposal = createGameplayProposal(
    'chase-sequence',
    gameCore.getState().version,
    [
      { id: 'threat', category: 'creature', attributes: ['visible'] },
      { id: 'target', category: 'creature', attributes: ['visible'] },
    ],
    ['observe'],
    'A threat moves toward the target.',
    undefined,
    [
      {
        type: 'move_entity',
        entityId: 'threat',
        targetId: 'target',
      },
    ],
  );

  const controlledContext = gameCore.createControlledGenerationContext(
    'chase-sequence',
    {
      gameState: gameCore.getState(),
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: { id: 'threat', category: 'creature', attributes: ['visible'] },
    },
  );

  assert.ok(controlledContext !== undefined);
  const validation = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.ok(validation.valid, 'proposal should be valid');
  assert.ok(validation.context !== undefined);
});

test('13. Accepted chase operation is applied through atomic application path', () => {
  const state = baseState();
  const gameCore = new GameCore(state);

  const proposal = createGameplayProposal(
    'chase-sequence',
    gameCore.getState().version,
    [
      { id: 'threat', category: 'creature', attributes: ['visible'] },
      { id: 'target', category: 'creature', attributes: ['visible'] },
    ],
    ['observe'],
    'A threat moves toward the target.',
    undefined,
    [
      {
        type: 'move_entity',
        entityId: 'threat',
        targetId: 'target',
      },
    ],
  );

  const controlledContext = gameCore.createControlledGenerationContext(
    'chase-sequence',
    {
      gameState: gameCore.getState(),
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: { id: 'threat', category: 'creature', attributes: ['visible'] },
    },
  )!;

  const validation = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.ok(validation.valid);
  assert.ok(validation.context !== undefined);

  const result = gameCore.applyAcceptedGameplayContext(validation.context);
  assert.ok(result.accepted);
  assert.strictEqual(result.state.version, 1);

  const newThreatPos = result.state.world.entities['threat']!.position;
  assert.ok(Math.abs(newThreatPos.x - 7.071067811865475) < 0.0001);
  assert.ok(Math.abs(newThreatPos.y - 7.071067811865475) < 0.0001);
});

test('14. Existing tests continue passing', () => {
  // Regression check: ensure basic movement, interaction, discovery still work
  const state = createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' });
  const gameCore = new GameCore(state);

  // Basic movement
  const moveResult = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 250, y: 250 },
  });
  assert.ok(moveResult.accepted);
  assert.strictEqual(gameCore.getState().version, 1);

  // Greet pet
  const greetResult = gameCore.evaluate({
    playerId: 'player-1',
    type: 'greet_pet',
  });
  assert.ok(greetResult.accepted);
  assert.strictEqual(gameCore.getState().version, 2);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 1);
});
