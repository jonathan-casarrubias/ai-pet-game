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

export type GameplayConsequence =
  | ChangeEntityStateConsequence
  | SpawnEntityConsequence;

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

// Aquí ya estamos en SpawnEntityConsequence

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

