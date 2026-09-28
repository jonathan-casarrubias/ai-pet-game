import assert from 'node:assert/strict';

import test from 'node:test';

import {
  createInitialGameState,
  freezeGameState,
  GameCore,
  type GameState,
  type InteractPlayerAction,
  type SpatialEntity,
} from '../src/index.js';

function makeWorldWithEntity(
  base: GameState,
  entityId: string,
  entityX: number,
  entityY: number,
  radius: number,
  state: SpatialEntity['state'] = 'visible',
): GameState {
  const entity: SpatialEntity = {
    id: entityId,
    type: 'object',
    label: entityId,
    position: { x: entityX, y: entityY },
    state,
    interactionRadius: radius,
  };
  return freezeGameState({
    ...base,
    world: {
      ...base.world,
      playerPos: { x: base.world.playerPos.x, y: base.world.playerPos.y },
      entities: { [entityId]: entity },
    },
  });
}

test('an entity with an interaction radius can be represented', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const state = makeWorldWithEntity(base, 'stone-1', 210, 200, 20);
  assert.ok(state.world.entities['stone-1'] !== undefined);
  assert.strictEqual(state.world.entities['stone-1'].interactionRadius, 20);
});

test('entity inside interaction radius is accepted', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const state = makeWorldWithEntity(base, 'stone-1', 210, 200, 20);
  const gameCore = new GameCore(state);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'stone-1',
  });
  assert.ok(transition.accepted);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('entity exactly on radius boundary is accepted', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  // player at (200,200), entity at (250,200), radius 50 -> distance exactly 50
  const state = makeWorldWithEntity(base, 'boundary-stone', 250, 200, 50);
  const gameCore = new GameCore(state);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'boundary-stone',
  });
  assert.ok(transition.accepted);
});

test('entity outside interaction radius is rejected', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  // player at (200,200), entity at (300,200), radius 50 -> distance 100
  const state = makeWorldWithEntity(base, 'far-stone', 300, 200, 50);
  const gameCore = new GameCore(state);
  const before = gameCore.getState();
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'far-stone',
  });
  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'inapplicable_action');
  assert.deepStrictEqual(transition.events, []);
  assert.strictEqual(gameCore.getState(), before);
});

test('nonexistent entity is rejected', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const gameCore = new GameCore(base);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'missing-entity',
  });
  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'inapplicable_action');
});

test('non-interactable entity is rejected', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const state = makeWorldWithEntity(base, 'old-stone', 210, 200, 20, 'discovered');
  const gameCore = new GameCore(state);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'old-stone',
  });
  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'inapplicable_action');
});

test('wrong player identity is rejected', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const state = makeWorldWithEntity(base, 'stone-1', 210, 200, 20);
  const gameCore = new GameCore(state);
  const transition = gameCore.evaluate(
    {
      playerId: 'player-2',
      type: 'interact',
      entityId: 'stone-1',
    } as unknown as InteractPlayerAction,
  );
  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'player_mismatch');
});

test('empty entityId is rejected', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const gameCore = new GameCore(base);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: '',
  } as unknown as InteractPlayerAction);
  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'invalid_intent');
});

test('whitespace-only entityId is rejected', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const gameCore = new GameCore(base);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: '   ',
  } as unknown as InteractPlayerAction);
  assert.ok(!transition.accepted);
  assert.strictEqual(transition.rejectionReason, 'invalid_intent');
});

test('accepted interaction increments version', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const state = makeWorldWithEntity(base, 'stone-1', 210, 200, 20);
  const gameCore = new GameCore(state);
  assert.strictEqual(gameCore.getState().version, 0);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'stone-1',
  });
  assert.ok(transition.accepted);
  assert.strictEqual(transition.previousState.version, 0);
  assert.strictEqual(transition.state.version, 1);
  assert.strictEqual(gameCore.getState().version, 1);
});

test('accepted interaction emits entity_interacted event', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const state = makeWorldWithEntity(base, 'stone-1', 210, 200, 20);
  const gameCore = new GameCore(state);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'stone-1',
  });
  assert.ok(transition.accepted);
  assert.deepStrictEqual(transition.events, [
    {
      type: 'entity_interacted',
      playerId: 'player-1',
      petId: 'pet-1',
      entityId: 'stone-1',
    },
  ]);
});

test('accepted interaction preserves the target entity', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const state = makeWorldWithEntity(base, 'stone-1', 210, 200, 20, 'visible');
  const gameCore = new GameCore(state);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'stone-1',
  });
  assert.ok(transition.accepted);
  const entity = transition.state.world.entities['stone-1'];
  assert.ok(entity !== undefined);
  assert.strictEqual(entity.state, 'visible');
  assert.strictEqual(entity.interactionRadius, 20);
  assert.strictEqual(entity.position.x, 210);
  assert.strictEqual(entity.position.y, 200);
});

test('unrelated GameState remains unchanged after interaction', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const state = makeWorldWithEntity(base, 'stone-1', 210, 200, 20);
  const gameCore = new GameCore(state);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'stone-1',
  });
  assert.ok(transition.accepted);
  assert.deepStrictEqual(transition.state.player, { id: 'player-1' });
  assert.deepStrictEqual(transition.state.pet, {
    id: 'pet-1',
    name: 'Lumi',
    interactionCount: 0,
  });
  assert.deepStrictEqual(transition.state.discoveries, []);
});

test('authoritative state remains immutable after interaction', () => {
  const base = createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Lumi' },
  );
  const state = makeWorldWithEntity(base, 'stone-1', 210, 200, 20);
  const gameCore = new GameCore(state);
  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'interact',
    entityId: 'stone-1',
  });
  assert.ok(transition.accepted);
  assert.ok(Object.isFrozen(transition.state));
  assert.ok(Object.isFrozen(transition.state.world));
  assert.ok(Object.isFrozen(transition.state.world.playerPos));
  assert.ok(Object.isFrozen(transition.state.world.bounds));
  assert.ok(Object.isFrozen(transition.state.world.entities['stone-1']));

  try {
    (transition.state.world.playerPos as { x: number }).x = 999;
  } catch {}
  assert.strictEqual(transition.state.world.playerPos.x, 200);
});
