export type Player = Readonly<{
  id: string;
}>;

export type Pet = Readonly<{
  id: string;
  name: string;
  interactionCount: number;
}>;

export type GameState = Readonly<{
  player: Player;
  pet: Pet;
  version: number;
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
  });
}

export function freezeGameState(state: GameState): GameState {
  return Object.freeze({
    player: Object.freeze({ ...state.player }),
    pet: Object.freeze({ ...state.pet }),
    version: state.version,
  });
}
