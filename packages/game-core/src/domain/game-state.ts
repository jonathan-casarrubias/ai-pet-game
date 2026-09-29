export type Player = Readonly<{
  id: string;
}>;

export type Pet = Readonly<{
  id: string;
  name: string;
  interactionCount: number;
}>;

export type Position = Readonly<{
  x: number;
  y: number;
}>;

export type WorldBounds = Readonly<{
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}>;

export type EntityRole = 'neutral' | 'threat' | 'helper';

export type SpatialEntity = Readonly<{
  id: string;
  type: 'object' | 'creature' | 'hazard';
  role?: EntityRole;
  label: string;
  position: Position;
  state: 'visible' | 'glowing' | 'discovered' | 'active' | 'escaped';
  interactionRadius: number;
  threatRadius?: number;
}>;

export type WorldState = Readonly<{
  bounds: WorldBounds;
  playerPos: Position;
  entities: Readonly<Record<string, SpatialEntity>>;
}>;

export type GameState = Readonly<{
  player: Player;
  pet: Pet;
  version: number;
  discoveries: readonly string[];
  world: WorldState;
}>;

export function createInitialGameState(
  player: Player,
  pet: Omit<Pet, 'interactionCount'>,
): GameState {
  return freezeGameState({
    player: { id: player.id },
    pet: {
      id: pet.id,
      name: pet.name,
      interactionCount: 0,
    },
    version: 0,
    discoveries: [],
    world: Object.freeze({
      bounds: Object.freeze({ minX: 0, minY: 0, maxX: 400, maxY: 400 }),
      playerPos: Object.freeze({ x: 200, y: 200 }),
      entities: Object.freeze({}),
    }),
  });
}

export function freezeGameState(state: GameState): GameState {
  return Object.freeze({
    player: Object.freeze({ ...state.player }),
    pet: Object.freeze({ ...state.pet }),
    version: state.version,
    discoveries: Object.freeze([...state.discoveries]),
    world: Object.freeze({
      bounds: state.world.bounds,
      playerPos: Object.freeze({ ...state.world.playerPos }),
      entities: Object.freeze({
        ...Object.fromEntries(
          Object.entries(state.world.entities).map(([id, entity]) => [
            id,
            Object.freeze({ ...entity }),
          ])
        ),
      }),
    }),
  });
}
