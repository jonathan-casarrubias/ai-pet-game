import { freezeGameState, type GameState, type SpatialEntity } from './game-state.js';
import type { WorldBounds } from './game-state.js';

export type ChangeEntityStateConsequence = Readonly<{
  type: 'change_entity_state';
  entityId: string;
  state: SpatialEntity['state'];
}>;

export type SpawnEntityConsequence = Readonly<{
  type: 'spawn_entity';
  entity: SpatialEntity;
}>;

export type RecordDiscoveryConsequence = Readonly<{
  type: 'record_discovery';
  entityId: string;
}>;

export type GameplayConsequence =
  | ChangeEntityStateConsequence
  | SpawnEntityConsequence
  | RecordDiscoveryConsequence;

export type ConsequenceApplicationResult = Readonly<
  | {
      accepted: true;
      state: GameState;
    }
  | {
      accepted: false;
      state: GameState;
      reason: string;
    }
>;

export type ConsequenceValidationResult = Readonly<{
  valid: boolean;
  reason?: string;
}>;

export function validateGameplayConsequence(
  consequence: GameplayConsequence,
  state: GameState,
): ConsequenceValidationResult {
  if (consequence.type === 'change_entity_state') {
    return validateChangeEntityState(consequence, state);
  }

  if (consequence.type === 'spawn_entity') {
    return validateSpawnEntity(consequence, state);
  }

  if (consequence.type === 'record_discovery') {
    return validateRecordDiscovery(consequence, state);
  }

  return { valid: false, reason: 'Unknown consequence type' };
}

function validateChangeEntityState(
  consequence: ChangeEntityStateConsequence,
  state: GameState,
): ConsequenceValidationResult {
  const { entityId, state: targetState } = consequence;

  if (typeof entityId !== 'string' || entityId.trim().length === 0) {
    return { valid: false, reason: 'Invalid entity ID' };
  }

  const entity = state.world.entities[entityId];

  if (entity === undefined) {
    return { valid: false, reason: 'Entity not found' };
  }

  if (typeof targetState !== 'string') {
    return { valid: false, reason: 'Invalid target state' };
  }

  const validStates: SpatialEntity['state'][] = [
    'visible',
    'glowing',
    'discovered',
    'active',
    'escaped',
  ];

  if (!validStates.includes(targetState)) {
    return { valid: false, reason: 'Invalid target state' };
  }

  if (entity.state === targetState) {
    return { valid: false, reason: 'State unchanged' };
  }

  if (entity.state === 'discovered' || entity.state === 'escaped') {
    return { valid: false, reason: 'Cannot transition from terminal state' };
  }

  return { valid: true };
}

function validateSpawnEntity(
  consequence: SpawnEntityConsequence,
  state: GameState,
): ConsequenceValidationResult {
  const { entity } = consequence;

  if (entity === undefined || entity === null || typeof entity !== 'object') {
    return { valid: false, reason: 'Invalid entity object' };
  }

  if (typeof entity.id !== 'string' || entity.id.trim().length === 0) {
    return { valid: false, reason: 'Empty or invalid entity ID' };
  }

  if (state.world.entities[entity.id] !== undefined) {
    return { valid: false, reason: 'Entity ID already exists' };
  }

  const validTypes: SpatialEntity['type'][] = ['object', 'creature', 'hazard'];
  if (!validTypes.includes(entity.type)) {
    return { valid: false, reason: 'Invalid entity type' };
  }

  const validStates: SpatialEntity['state'][] = [
    'visible',
    'glowing',
    'discovered',
    'active',
    'escaped',
  ];
  if (!validStates.includes(entity.state)) {
    return { valid: false, reason: 'Invalid entity state' };
  }

  if (
    typeof entity.position !== 'object' ||
    entity.position === null ||
    typeof entity.position.x !== 'number' ||
    typeof entity.position.y !== 'number' ||
    !Number.isFinite(entity.position.x) ||
    !Number.isFinite(entity.position.y)
  ) {
    return { valid: false, reason: 'Invalid position values' };
  }

  const bounds: WorldBounds = state.world.bounds;
  if (
    entity.position.x < bounds.minX ||
    entity.position.x > bounds.maxX ||
    entity.position.y < bounds.minY ||
    entity.position.y > bounds.maxY
  ) {
    return { valid: false, reason: 'Position outside world bounds' };
  }

  if (typeof entity.interactionRadius !== 'number' || !Number.isFinite(entity.interactionRadius)) {
    return { valid: false, reason: 'Interaction radius must be finite' };
  }

  if (entity.interactionRadius < 0) {
    return { valid: false, reason: 'Interaction radius cannot be negative' };
  }

  if (typeof entity.label !== 'string') {
    return { valid: false, reason: 'Invalid entity label' };
  }

  return { valid: true };
}

function validateRecordDiscovery(
  consequence: RecordDiscoveryConsequence,
  state: GameState,
): ConsequenceValidationResult {
  const { entityId } = consequence;

  if (typeof entityId !== 'string' || entityId.trim().length === 0) {
    return { valid: false, reason: 'Invalid entity ID' };
  }

  if (state.world.entities[entityId] === undefined) {
    return { valid: false, reason: 'Entity not found' };
  }

  if (state.discoveries.includes(entityId)) {
    return { valid: false, reason: 'Discovery already recorded' };
  }

  return { valid: true };
}

export function applyGameplayConsequence(
  consequence: GameplayConsequence,
  state: GameState,
): ConsequenceApplicationResult {
  const validation = validateGameplayConsequence(consequence, state);
  if (!validation.valid) {
    return Object.freeze({
      accepted: false,
      state,
      reason: validation.reason ?? 'Invalid consequence',
    });
  }

  if (consequence.type === 'record_discovery') {
    const nextState = freezeGameState({
      ...state,
      version: state.version + 1,
      discoveries: [...state.discoveries, consequence.entityId],
      world: state.world,
    });

    return Object.freeze({ accepted: true, state: nextState });
  }

  if (consequence.type === 'change_entity_state') {
    const currentEntity = state.world.entities[consequence.entityId]!;
    const updatedEntity: SpatialEntity = {
      ...currentEntity,
      state: consequence.state,
    };

    const updatedEntities: Record<string, SpatialEntity> = {
      ...state.world.entities,
      [consequence.entityId]: updatedEntity,
    };

    const nextState = freezeGameState({
      ...state,
      version: state.version + 1,
      world: {
        ...state.world,
        entities: updatedEntities,
      },
    });

    return Object.freeze({ accepted: true, state: nextState });
  }

  // SpawnEntityConsequence
  const spawnedEntity: SpatialEntity = {
    ...consequence.entity,
    position: {
      ...consequence.entity.position,
    },
  };

  const nextState = freezeGameState({
    ...state,
    version: state.version + 1,
    world: {
      ...state.world,
      entities: {
        ...state.world.entities,
        [spawnedEntity.id]: spawnedEntity,
      },
    },
  });

  return Object.freeze({ accepted: true, state: nextState });
}


export type BatchConsequenceApplicationResult = Readonly<
  | {
      accepted: true;
      state: GameState;
    }
  | {
      accepted: false;
      state: GameState;
      reason: string;
    }
>;

export function applyConsequenceBatch(
  consequences: readonly GameplayConsequence[],
  state: GameState,
): BatchConsequenceApplicationResult {
  if (consequences.length === 0) {
    return Object.freeze({ accepted: true, state });
  }

  // 1. Atomicity: Validate ALL consequences individually against the same pre-application state
  for (let i = 0; i < consequences.length; i++) {
    const c = consequences[i]!;
    const validation = validateGameplayConsequence(c, state);
    if (!validation.valid) {
      return Object.freeze({
        accepted: false,
        state,
        reason: validation.reason ?? 'Invalid consequence in batch',
      });
    }
  }

  // 2. Conflict validation: Reject duplicate entity IDs within the same batch
  const spawnedIds = new Set<string>();
  const discoveredIds = new Set<string>();

  for (let i = 0; i < consequences.length; i++) {
    const c = consequences[i]!;
    if (c.type === 'spawn_entity') {
      if (spawnedIds.has(c.entity.id)) {
        return Object.freeze({
          accepted: false,
          state,
          reason: 'Duplicate spawn_entity ID in batch',
        });
      }
      spawnedIds.add(c.entity.id);
    } else if (c.type === 'record_discovery') {
      if (discoveredIds.has(c.entityId)) {
        return Object.freeze({
          accepted: false,
          state,
          reason: 'Duplicate record_discovery entity ID in batch',
        });
      }
      discoveredIds.add(c.entityId);
    }
  }

  // 3. Accumulate changes onto working state structures without intermediate version bumps
  let workingEntities: Record<string, SpatialEntity> = { ...state.world.entities };
  let workingDiscoveries: string[] = [...state.discoveries];

  for (let i = 0; i < consequences.length; i++) {
    const c = consequences[i]!;
    if (c.type === 'record_discovery') {
      workingDiscoveries.push(c.entityId);
    } else if (c.type === 'change_entity_state') {
      const current = workingEntities[c.entityId]!;
      workingEntities[c.entityId] = {
        ...current,
        state: c.state,
      };
    } else if (c.type === 'spawn_entity') {
      const spawned: SpatialEntity = {
        ...c.entity,
        position: { ...c.entity.position },
      };
      workingEntities[spawned.id] = spawned;
    }
  }

  // Atomically create next state with exactly ONE version bump for the entire batch
  const nextState = freezeGameState({
    ...state,
    version: state.version + 1,
    discoveries: workingDiscoveries,
    world: {
      ...state.world,
      entities: workingEntities,
    },
  });

  return Object.freeze({ accepted: true, state: nextState });
}
