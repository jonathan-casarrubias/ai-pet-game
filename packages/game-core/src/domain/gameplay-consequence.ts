import { freezeGameState, type GameState, type Position, type SpatialEntity } from './game-state.js';

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

export type MoveEntityConsequence = Readonly<{
  type: 'move_entity';
  entityId: string;
  targetId: string;
}>;

export type GameplayConsequence =
  | ChangeEntityStateConsequence
  | SpawnEntityConsequence
  | RecordDiscoveryConsequence
  | MoveEntityConsequence;

const CHASE_STEP_SIZE = 10;

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

export function isEntityThreatened(
  source: SpatialEntity | undefined | null,
  target: SpatialEntity | undefined | null,
): boolean {
  if (source === undefined || source === null || target === undefined || target === null) {
    return false;
  }

  if (source.role !== 'threat') {
    return false;
  }

  if (
    typeof source.threatRadius !== 'number' ||
    !Number.isFinite(source.threatRadius) ||
    source.threatRadius < 0
  ) {
    return false;
  }

  if (target.state === 'discovered' || target.state === 'escaped') {
    return false;
  }

  const dx = target.position.x - source.position.x;
  const dy = target.position.y - source.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= source.threatRadius;
}

export function isLumiThreatened(
  stateOrPos: GameState | Position,
  threat: SpatialEntity | undefined | null,
): boolean {
  if (threat === undefined || threat === null) {
    return false;
  }

  if (threat.role !== 'threat') {
    return false;
  }

  if (
    typeof threat.threatRadius !== 'number' ||
    !Number.isFinite(threat.threatRadius) ||
    threat.threatRadius < 0
  ) {
    return false;
  }

  const lumiPos: Position =
    'world' in stateOrPos ? stateOrPos.world.playerPos : stateOrPos;

  const dx = lumiPos.x - threat.position.x;
  const dy = lumiPos.y - threat.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= threat.threatRadius;
}

function checkEscapeTransition(
  entity: SpatialEntity,
  newPos: { x: number; y: number },
  threatSources: Iterable<SpatialEntity>,
): SpatialEntity['state'] {
  if (entity.state === 'discovered' || entity.state === 'escaped') {
    return entity.state;
  }

  for (const other of threatSources) {
    if (
      other.id !== entity.id &&
      other.role === 'threat' &&
      typeof other.threatRadius === 'number' &&
      Number.isFinite(other.threatRadius) &&
      other.threatRadius >= 0
    ) {
      const beforeDist = Math.sqrt(
        (entity.position.x - other.position.x) ** 2 +
        (entity.position.y - other.position.y) ** 2,
      );
      const afterDist = Math.sqrt(
        (newPos.x - other.position.x) ** 2 +
        (newPos.y - other.position.y) ** 2,
      );
      if (beforeDist <= other.threatRadius && afterDist > other.threatRadius) {
        return 'escaped';
      }
    }
  }

  return entity.state;
}

function getTargetPosition(
  targetId: string,
  state: GameState,
): Position | undefined {
  if (
    targetId === 'player' ||
    targetId === 'lumi' ||
    targetId === state.player.id ||
    targetId === state.pet.id
  ) {
    return state.world.playerPos;
  }

  return state.world.entities[targetId]?.position;
}

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

  if (consequence.type === 'move_entity') {
    return validateMoveEntity(consequence, state);
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

  const validRoles: NonNullable<SpatialEntity['role']>[] = ['neutral', 'threat', 'helper'];
  if (entity.role !== undefined && !validRoles.includes(entity.role)) {
    return { valid: false, reason: 'Invalid entity role' };
  }

  if (entity.threatRadius !== undefined) {
    if (typeof entity.threatRadius !== 'number' || !Number.isFinite(entity.threatRadius)) {
      return { valid: false, reason: 'Threat radius must be finite' };
    }
    if (entity.threatRadius < 0) {
      return { valid: false, reason: 'Threat radius cannot be negative' };
    }
  }

  if (entity.role === 'threat' && entity.threatRadius === undefined) {
    return { valid: false, reason: 'Threat entity requires threat radius' };
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

  const bounds = state.world.bounds;
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

function validateMoveEntity(
  consequence: MoveEntityConsequence,
  state: GameState,
): ConsequenceValidationResult {
  const { entityId, targetId } = consequence;

  if (typeof entityId !== 'string' || entityId.trim().length === 0) {
    return { valid: false, reason: 'Invalid entity ID' };
  }

  if (typeof targetId !== 'string' || targetId.trim().length === 0) {
    return { valid: false, reason: 'Invalid target ID' };
  }

  const entity = state.world.entities[entityId];
  if (entity === undefined) {
    return { valid: false, reason: 'Entity not found' };
  }

  const targetPos = getTargetPosition(targetId, state);
  if (targetPos === undefined) {
    return { valid: false, reason: 'Target entity not found' };
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
      escapedThreats: state.escapedThreats,
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
      escapedThreats: state.escapedThreats,
      world: {
        ...state.world,
        entities: updatedEntities,
      },
    });

    return Object.freeze({ accepted: true, state: nextState });
  }

  if (consequence.type === 'move_entity') {
    return applyMoveEntity(consequence, state);
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
    escapedThreats: state.escapedThreats,
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
  const movedIds = new Set<string>();

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
    } else if (c.type === 'move_entity') {
      if (movedIds.has(c.entityId)) {
        return Object.freeze({
          accepted: false,
          state,
          reason: 'Duplicate move_entity entity ID in batch',
        });
      }
      movedIds.add(c.entityId);
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
    } else if (c.type === 'move_entity') {
      const entity = workingEntities[c.entityId]!;
      const targetPos = getTargetPosition(c.targetId, state)!;
      const dx = targetPos.x - entity.position.x;
      const dy = targetPos.y - entity.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let newX: number;
      let newY: number;

      if (distance <= CHASE_STEP_SIZE) {
        newX = targetPos.x;
        newY = targetPos.y;
      } else {
        newX = entity.position.x + (dx / distance) * CHASE_STEP_SIZE;
        newY = entity.position.y + (dy / distance) * CHASE_STEP_SIZE;
      }

      const bounds = state.world.bounds;
      newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
      newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));

      const newPos = { x: newX, y: newY };
      const nextState = checkEscapeTransition(entity, newPos, Object.values(state.world.entities));

      workingEntities[c.entityId] = {
        ...entity,
        position: newPos,
        state: nextState,
      };
    }
  }

  // Atomically create next state with exactly ONE version bump for the entire batch
  const nextState = freezeGameState({
    ...state,
    version: state.version + 1,
    discoveries: workingDiscoveries,
    escapedThreats: state.escapedThreats,
    world: {
      ...state.world,
      entities: workingEntities,
    },
  });

  return Object.freeze({ accepted: true, state: nextState });
}

function applyMoveEntity(
  consequence: MoveEntityConsequence,
  state: GameState,
): ConsequenceApplicationResult {
  const { entityId, targetId } = consequence;
  const entity = state.world.entities[entityId]!;
  const targetPos = getTargetPosition(targetId, state)!;

  const dx = targetPos.x - entity.position.x;
  const dy = targetPos.y - entity.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  let newX: number;
  let newY: number;

  if (distance <= CHASE_STEP_SIZE) {
    newX = targetPos.x;
    newY = targetPos.y;
  } else {
    newX = entity.position.x + (dx / distance) * CHASE_STEP_SIZE;
    newY = entity.position.y + (dy / distance) * CHASE_STEP_SIZE;
  }

  const bounds = state.world.bounds;
  newX = Math.max(bounds.minX, Math.min(bounds.maxX, newX));
  newY = Math.max(bounds.minY, Math.min(bounds.maxY, newY));

  const newPos = { x: newX, y: newY };
  const nextState = checkEscapeTransition(entity, newPos, Object.values(state.world.entities));

  const updatedEntity: SpatialEntity = {
    ...entity,
    position: newPos,
    state: nextState,
  };

  const updatedEntities: Record<string, SpatialEntity> = {
    ...state.world.entities,
    [entityId]: updatedEntity,
  };

  const nextGameState = freezeGameState({
    ...state,
    version: state.version + 1,
    escapedThreats: state.escapedThreats,
    world: {
      ...state.world,
      entities: updatedEntities,
    },
  });

  return Object.freeze({ accepted: true, state: nextGameState });
}
