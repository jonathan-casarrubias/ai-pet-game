import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyConsequenceBatch,
  applyGameplayConsequence,
  createInitialGameState,
  freezeGameState,
  isEntityThreatened,
  isLumiThreatened,
  GameCore,
  validateGameplayConsequence,
  type GameState,
  type MoveEntityConsequence,
  type SpatialEntity,
} from '../src/index.js';

function createBaseState(entities: Record<string, SpatialEntity> = {}): GameState {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  return freezeGameState({
    ...base,
    world: {
      ...base.world,
      entities: Object.freeze(
        Object.fromEntries(
          Object.entries(entities).map(([id, entity]) => [id, Object.freeze({ ...entity })]),
        ),
      ),
    },
  });
}

test('1. Valid roles (neutral, threat, helper) are accepted during spawn validation', () => {
  const state = createBaseState();

  const neutralEntity: SpatialEntity = {
    id: 'entity-neutral',
    type: 'object',
    role: 'neutral',
    label: 'Stone',
    position: { x: 50, y: 50 },
    state: 'visible',
    interactionRadius: 10,
  };
  assert.ok(validateGameplayConsequence({ type: 'spawn_entity', entity: neutralEntity }, state).valid);

  const threatEntity: SpatialEntity = {
    id: 'entity-threat',
    type: 'creature',
    role: 'threat',
    threatRadius: 30,
    label: 'Threat Critter',
    position: { x: 50, y: 50 },
    state: 'active',
    interactionRadius: 10,
  };
  assert.ok(validateGameplayConsequence({ type: 'spawn_entity', entity: threatEntity }, state).valid);

  const helperEntity: SpatialEntity = {
    id: 'entity-helper',
    type: 'creature',
    role: 'helper',
    label: 'Guide Sprite',
    position: { x: 50, y: 50 },
    state: 'visible',
    interactionRadius: 10,
  };
  assert.ok(validateGameplayConsequence({ type: 'spawn_entity', entity: helperEntity }, state).valid);
});

test('2. Invalid role is rejected during spawn validation', () => {
  const state = createBaseState();
  const invalidRoleEntity = {
    id: 'bad-role',
    type: 'creature' as const,
    role: 'villain' as any,
    label: 'Bad Role',
    position: { x: 50, y: 50 },
    state: 'visible' as const,
    interactionRadius: 10,
  };

  const validation = validateGameplayConsequence(
    { type: 'spawn_entity', entity: invalidRoleEntity },
    state,
  );
  assert.ok(!validation.valid);
  assert.strictEqual(validation.reason, 'Invalid entity role');
});

test('3. Valid threatRadius is accepted during spawn validation', () => {
  const state = createBaseState();
  const entity: SpatialEntity = {
    id: 'threat-valid-radius',
    type: 'hazard',
    role: 'threat',
    threatRadius: 25.5,
    label: 'Hazard',
    position: { x: 100, y: 100 },
    state: 'active',
    interactionRadius: 10,
  };

  const validation = validateGameplayConsequence({ type: 'spawn_entity', entity }, state);
  assert.ok(validation.valid);
});

test('4. Zero threatRadius is valid', () => {
  const state = createBaseState();
  const entity: SpatialEntity = {
    id: 'threat-zero-radius',
    type: 'hazard',
    role: 'threat',
    threatRadius: 0,
    label: 'Point Hazard',
    position: { x: 100, y: 100 },
    state: 'active',
    interactionRadius: 10,
  };

  const validation = validateGameplayConsequence({ type: 'spawn_entity', entity }, state);
  assert.ok(validation.valid);
});

test('5. Negative or non-finite threatRadius is rejected', () => {
  const state = createBaseState();

  const negEntity: SpatialEntity = {
    id: 'threat-neg-radius',
    type: 'hazard',
    role: 'threat',
    threatRadius: -10,
    label: 'Negative Radius',
    position: { x: 100, y: 100 },
    state: 'active',
    interactionRadius: 10,
  };
  const negValidation = validateGameplayConsequence({ type: 'spawn_entity', entity: negEntity }, state);
  assert.ok(!negValidation.valid);
  assert.strictEqual(negValidation.reason, 'Threat radius cannot be negative');

  const nanEntity: SpatialEntity = {
    id: 'threat-nan-radius',
    type: 'hazard',
    role: 'threat',
    threatRadius: NaN,
    label: 'NaN Radius',
    position: { x: 100, y: 100 },
    state: 'active',
    interactionRadius: 10,
  };
  const nanValidation = validateGameplayConsequence({ type: 'spawn_entity', entity: nanEntity }, state);
  assert.ok(!nanValidation.valid);
  assert.strictEqual(nanValidation.reason, 'Threat radius must be finite');

  const infEntity: SpatialEntity = {
    id: 'threat-inf-radius',
    type: 'hazard',
    role: 'threat',
    threatRadius: Infinity,
    label: 'Inf Radius',
    position: { x: 100, y: 100 },
    state: 'active',
    interactionRadius: 10,
  };
  const infValidation = validateGameplayConsequence({ type: 'spawn_entity', entity: infEntity }, state);
  assert.ok(!infValidation.valid);
  assert.strictEqual(infValidation.reason, 'Threat radius must be finite');
});

test('6. Role threat without threatRadius is rejected', () => {
  const state = createBaseState();
  const entity: SpatialEntity = {
    id: 'threat-no-radius',
    type: 'creature',
    role: 'threat',
    label: 'Missing Radius',
    position: { x: 100, y: 100 },
    state: 'active',
    interactionRadius: 10,
  };

  const validation = validateGameplayConsequence({ type: 'spawn_entity', entity }, state);
  assert.ok(!validation.valid);
  assert.strictEqual(validation.reason, 'Threat entity requires threat radius');
});

test('7. Target inside vs outside threat radius predicate evaluation', () => {
  const threat: SpatialEntity = {
    id: 'threat-source',
    type: 'creature',
    role: 'threat',
    threatRadius: 50,
    label: 'Chaser',
    position: { x: 100, y: 100 },
    state: 'active',
    interactionRadius: 10,
  };

  const insideTarget: SpatialEntity = {
    id: 'inside-target',
    type: 'creature',
    label: 'Inside Runner',
    position: { x: 130, y: 140 }, // distance = sqrt(30^2 + 40^2) = 50 <= 50
    state: 'visible',
    interactionRadius: 10,
  };

  const outsideTarget: SpatialEntity = {
    id: 'outside-target',
    type: 'creature',
    label: 'Outside Runner',
    position: { x: 131, y: 140 }, // distance > 50
    state: 'visible',
    interactionRadius: 10,
  };

  const nonThreatSource: SpatialEntity = {
    id: 'neutral-source',
    type: 'creature',
    role: 'neutral',
    threatRadius: 50,
    label: 'Neutral',
    position: { x: 100, y: 100 },
    state: 'active',
    interactionRadius: 10,
  };

  assert.strictEqual(isEntityThreatened(threat, insideTarget), true);
  assert.strictEqual(isEntityThreatened(threat, outsideTarget), false);
  assert.strictEqual(isEntityThreatened(nonThreatSource, insideTarget), false);
  assert.strictEqual(isEntityThreatened(undefined, insideTarget), false);
  assert.strictEqual(isEntityThreatened(threat, undefined), false);
});

test('8. Terminal target (discovered or escaped) is not threatened', () => {
  const threat: SpatialEntity = {
    id: 'threat-source',
    type: 'creature',
    role: 'threat',
    threatRadius: 50,
    label: 'Chaser',
    position: { x: 100, y: 100 },
    state: 'active',
    interactionRadius: 10,
  };

  const discoveredTarget: SpatialEntity = {
    id: 'discovered-target',
    type: 'object',
    label: 'Discovered Item',
    position: { x: 110, y: 110 },
    state: 'discovered',
    interactionRadius: 10,
  };

  const escapedTarget: SpatialEntity = {
    id: 'escaped-target',
    type: 'creature',
    label: 'Escaped Runner',
    position: { x: 110, y: 110 },
    state: 'escaped',
    interactionRadius: 10,
  };

  assert.strictEqual(isEntityThreatened(threat, discoveredTarget), false);
  assert.strictEqual(isEntityThreatened(threat, escapedTarget), false);
});

test('9. Entity inside threat radius moves outside → transitions to escaped in same transition', () => {
  // Threat at (0, 0) with threatRadius 15
  // Runner at (10, 0) (distance 10 <= 15)
  // Target waypoint at (100, 0)
  // Step size is 10 → Runner moves from (10, 0) to (20, 0)
  // New distance is 20 > 15 → Runner escapes!
  const state = createBaseState({
    threat: {
      id: 'threat',
      type: 'creature',
      role: 'threat',
      threatRadius: 15,
      label: 'Chaser',
      position: { x: 0, y: 0 },
      state: 'active',
      interactionRadius: 10,
    },
    runner: {
      id: 'runner',
      type: 'creature',
      role: 'neutral',
      label: 'Runner',
      position: { x: 10, y: 0 },
      state: 'visible',
      interactionRadius: 10,
    },
    waypoint: {
      id: 'waypoint',
      type: 'object',
      label: 'Safe Waypoint',
      position: { x: 100, y: 0 },
      state: 'visible',
      interactionRadius: 10,
    },
  });

  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'runner',
    targetId: 'waypoint',
  };

  const result = applyGameplayConsequence(consequence, state);
  assert.ok(result.accepted);
  assert.strictEqual(result.state.version, 1);

  const movedRunner = result.state.world.entities['runner']!;
  assert.strictEqual(movedRunner.position.x, 20);
  assert.strictEqual(movedRunner.position.y, 0);
  assert.strictEqual(movedRunner.state, 'escaped');
});

test('10. Entity starting outside threat radius does NOT become escaped when moving', () => {
  // Threat at (0, 0) with threatRadius 15
  // Runner at (30, 0) (distance 30 > 15, already outside)
  // Waypoint at (100, 0)
  // Runner moves to (40, 0)
  const state = createBaseState({
    threat: {
      id: 'threat',
      type: 'creature',
      role: 'threat',
      threatRadius: 15,
      label: 'Chaser',
      position: { x: 0, y: 0 },
      state: 'active',
      interactionRadius: 10,
    },
    runner: {
      id: 'runner',
      type: 'creature',
      label: 'Runner',
      position: { x: 30, y: 0 },
      state: 'visible',
      interactionRadius: 10,
    },
    waypoint: {
      id: 'waypoint',
      type: 'object',
      label: 'Waypoint',
      position: { x: 100, y: 0 },
      state: 'visible',
      interactionRadius: 10,
    },
  });

  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'runner',
    targetId: 'waypoint',
  };

  const result = applyGameplayConsequence(consequence, state);
  assert.ok(result.accepted);
  const movedRunner = result.state.world.entities['runner']!;
  assert.strictEqual(movedRunner.position.x, 40);
  assert.strictEqual(movedRunner.state, 'visible');
});

test('11. Entity remaining inside threat radius does NOT become escaped', () => {
  // Threat at (0, 0) with threatRadius 50
  // Runner at (10, 0) (distance 10 <= 50)
  // Waypoint at (100, 0)
  // Runner moves to (20, 0) (distance 20 <= 50)
  const state = createBaseState({
    threat: {
      id: 'threat',
      type: 'creature',
      role: 'threat',
      threatRadius: 50,
      label: 'Chaser',
      position: { x: 0, y: 0 },
      state: 'active',
      interactionRadius: 10,
    },
    runner: {
      id: 'runner',
      type: 'creature',
      label: 'Runner',
      position: { x: 10, y: 0 },
      state: 'visible',
      interactionRadius: 10,
    },
    waypoint: {
      id: 'waypoint',
      type: 'object',
      label: 'Waypoint',
      position: { x: 100, y: 0 },
      state: 'visible',
      interactionRadius: 10,
    },
  });

  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'runner',
    targetId: 'waypoint',
  };

  const result = applyGameplayConsequence(consequence, state);
  assert.ok(result.accepted);
  const movedRunner = result.state.world.entities['runner']!;
  assert.strictEqual(movedRunner.position.x, 20);
  assert.strictEqual(movedRunner.state, 'visible');
});

test('12. Escape does not cause an additional version increment and leaves previous state immutable', () => {
  const state = createBaseState({
    threat: {
      id: 'threat',
      type: 'creature',
      role: 'threat',
      threatRadius: 15,
      label: 'Chaser',
      position: { x: 0, y: 0 },
      state: 'active',
      interactionRadius: 10,
    },
    runner: {
      id: 'runner',
      type: 'creature',
      label: 'Runner',
      position: { x: 10, y: 0 },
      state: 'visible',
      interactionRadius: 10,
    },
    waypoint: {
      id: 'waypoint',
      type: 'object',
      label: 'Waypoint',
      position: { x: 100, y: 0 },
      state: 'visible',
      interactionRadius: 10,
    },
  });

  const initialVersion = state.version;
  const initialRunnerState = state.world.entities['runner']!.state;
  const initialRunnerPos = state.world.entities['runner']!.position;

  const result = applyGameplayConsequence(
    { type: 'move_entity', entityId: 'runner', targetId: 'waypoint' },
    state,
  );

  assert.ok(result.accepted);
  // Exactly one version increment for the movement transition
  assert.strictEqual(result.state.version, initialVersion + 1);
  assert.strictEqual(result.state.world.entities['runner']!.state, 'escaped');

  // Previous state unchanged and immutable
  assert.strictEqual(state.version, initialVersion);
  assert.strictEqual(state.world.entities['runner']!.state, initialRunnerState);
  assert.deepStrictEqual(state.world.entities['runner']!.position, initialRunnerPos);
  assert.ok(Object.isFrozen(state));
  assert.ok(Object.isFrozen(result.state));
});

test('13. Batch movement applies the same escape rule atomically', () => {
  const state = createBaseState({
    threat: {
      id: 'threat',
      type: 'creature',
      role: 'threat',
      threatRadius: 15,
      label: 'Chaser',
      position: { x: 0, y: 0 },
      state: 'active',
      interactionRadius: 10,
    },
    runner1: {
      id: 'runner1',
      type: 'creature',
      label: 'Runner 1',
      position: { x: 10, y: 0 }, // inside threat (10 <= 15), moves to 20 -> escapes
      state: 'visible',
      interactionRadius: 10,
    },
    runner2: {
      id: 'runner2',
      type: 'creature',
      label: 'Runner 2',
      position: { x: 50, y: 0 }, // outside threat (50 > 15), moves to 60 -> remains visible
      state: 'visible',
      interactionRadius: 10,
    },
    waypoint: {
      id: 'waypoint',
      type: 'object',
      label: 'Waypoint',
      position: { x: 100, y: 0 },
      state: 'visible',
      interactionRadius: 10,
    },
  });

  const consequences: MoveEntityConsequence[] = [
    { type: 'move_entity', entityId: 'runner1', targetId: 'waypoint' },
    { type: 'move_entity', entityId: 'runner2', targetId: 'waypoint' },
  ];

  const result = applyConsequenceBatch(consequences, state);
  assert.ok(result.accepted);
  assert.strictEqual(result.state.version, 1);

  assert.strictEqual(result.state.world.entities['runner1']!.state, 'escaped');
  assert.strictEqual(result.state.world.entities['runner1']!.position.x, 20);

  assert.strictEqual(result.state.world.entities['runner2']!.state, 'visible');
  assert.strictEqual(result.state.world.entities['runner2']!.position.x, 60);
});

test('14. isLumiThreatened evaluates threat proximity against playerPos correctly', () => {
  const threat: SpatialEntity = {
    id: 'threat-1',
    type: 'creature',
    role: 'threat',
    threatRadius: 25,
    label: 'Chaser',
    position: { x: 200, y: 200 },
    state: 'active',
    interactionRadius: 10,
  };

  const stateNear = createBaseState({ 'threat-1': threat });
  // Lumi starts at (200, 200), distance 0 <= 25 -> threatened
  assert.strictEqual(isLumiThreatened(stateNear, threat), true);
  assert.strictEqual(isLumiThreatened({ x: 200, y: 200 }, threat), true);
  assert.strictEqual(isLumiThreatened({ x: 220, y: 200 }, threat), true); // distance 20 <= 25

  // Outside threat radius: (230, 200) distance 30 > 25 -> not threatened
  assert.strictEqual(isLumiThreatened({ x: 230, y: 200 }, threat), false);

  // Non-threat role -> not threatened
  const neutral: SpatialEntity = { ...threat, role: 'neutral' };
  assert.strictEqual(isLumiThreatened({ x: 200, y: 200 }, neutral), false);
  assert.strictEqual(isLumiThreatened({ x: 200, y: 200 }, undefined), false);
});

test('15. Player movement: inside threat -> outside emits pet_escaped_threat event and updates playerPos', () => {
  const threat: SpatialEntity = {
    id: 'threat-zone',
    type: 'hazard',
    role: 'threat',
    threatRadius: 20,
    label: 'Quicksand',
    position: { x: 200, y: 200 },
    state: 'active',
    interactionRadius: 10,
  };
  const state = createBaseState({ 'threat-zone': threat });
  const gameCore = new GameCore(state);

  // Initial state: Lumi at (200, 200), inside threat radius
  assert.strictEqual(isLumiThreatened(gameCore.getState(), threat), true);

  // Player decides to move Lumi to (230, 200) (distance 30 > 20)
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 230, y: 200 },
  });

  assert.ok(transition.accepted);
  assert.strictEqual(transition.state.version, 1);
  assert.strictEqual(transition.state.world.playerPos.x, 230);
  assert.strictEqual(isLumiThreatened(transition.state, threat), false);

  // Emits move event and escape event
  assert.strictEqual(transition.events.length, 2);
  assert.strictEqual(transition.events[0]?.type, 'pet_moved');
  assert.strictEqual(transition.events[1]?.type, 'pet_escaped_threat');
  if (transition.events[1]?.type === 'pet_escaped_threat') {
    assert.strictEqual(transition.events[1].threatEntityId, 'threat-zone');
  }

  // Previous state remains immutable
  assert.strictEqual(state.version, 0);
  assert.strictEqual(state.world.playerPos.x, 200);
});

test('16. Player movement: inside threat -> still inside does not emit escape event', () => {
  const threat: SpatialEntity = {
    id: 'threat-zone',
    type: 'hazard',
    role: 'threat',
    threatRadius: 50,
    label: 'Danger Area',
    position: { x: 200, y: 200 },
    state: 'active',
    interactionRadius: 10,
  };
  const state = createBaseState({ 'threat-zone': threat });
  const gameCore = new GameCore(state);

  // Move from (200, 200) to (210, 200) -> distance 10 <= 50 (still inside)
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 210, y: 200 },
  });

  assert.ok(transition.accepted);
  assert.strictEqual(isLumiThreatened(transition.state, threat), true);
  assert.strictEqual(transition.events.length, 1);
  assert.strictEqual(transition.events[0]?.type, 'pet_moved');
});

test('17. Player movement: starting outside -> moving outside does not emit escape event', () => {
  const threat: SpatialEntity = {
    id: 'threat-zone',
    type: 'hazard',
    role: 'threat',
    threatRadius: 15,
    label: 'Small Danger',
    position: { x: 100, y: 100 },
    state: 'active',
    interactionRadius: 10,
  };
  // Lumi starts at (200, 200), distance to (100, 100) is > 100 > 15 (outside)
  const state = createBaseState({ 'threat-zone': threat });
  const gameCore = new GameCore(state);

  // Move to (250, 250) (still outside)
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'move',
    position: { x: 250, y: 250 },
  });

  assert.ok(transition.accepted);
  assert.strictEqual(transition.events.length, 1);
  assert.strictEqual(transition.events[0]?.type, 'pet_moved');
});

test('18. MoveEntityConsequence can target player directly without making player a SpatialEntity', () => {
  const threat: SpatialEntity = {
    id: 'stalker',
    type: 'creature',
    role: 'threat',
    threatRadius: 20,
    label: 'Stalker',
    position: { x: 250, y: 200 },
    state: 'active',
    interactionRadius: 10,
  };
  const state = createBaseState({ 'stalker': threat });
  const gameCore = new GameCore(state);

  // Lumi is at (200, 200). Stalker moves toward 'player'
  const consequence: MoveEntityConsequence = {
    type: 'move_entity',
    entityId: 'stalker',
    targetId: 'player',
  };

  const result = gameCore.applyConsequence(consequence);
  assert.ok(result.accepted);
  assert.strictEqual(result.state.world.entities['stalker']?.position.x, 240); // 10 units closer to 200
});
