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

export type CapabilityContext = Readonly<{
  gameState: GameState;
  playerContext: Readonly<{
    playerId: string;
    progressionLevel: number;
  }>;
}>;

export type CapabilityDefinition = Readonly<{
  id: string;
  isApplicable: (context: CapabilityContext) => boolean;
}>;

export type CapabilityApplicability =
  | Readonly<{
      applicable: true;
      capability: CapabilityDefinition;
    }>
  | Readonly<{
      applicable: false;
      capabilityId: string;
      reason: 'unavailable' | 'inapplicable';
    }>;

export class CapabilitySpace {
  #capabilities: readonly CapabilityDefinition[];

  public constructor(capabilities: readonly CapabilityDefinition[]) {
    const capabilityIds = new Set<string>();

    this.#capabilities = Object.freeze(
      capabilities.map((capability) => {
        if (capabilityIds.has(capability.id)) {
          throw new Error(`Duplicate capability id: ${capability.id}`);
        }

        capabilityIds.add(capability.id);
        return Object.freeze({ ...capability });
      }),
    );
  }

  public getSupportedCapabilities(): readonly CapabilityDefinition[] {
    return this.#capabilities;
  }

  public find(capabilityId: string): CapabilityDefinition | undefined {
    return this.#capabilities.find((capability) => capability.id === capabilityId);
  }

  public evaluateApplicability(
    capabilityId: string,
    context: CapabilityContext,
  ): CapabilityApplicability {
    const capability = this.find(capabilityId);

    if (capability === undefined) {
      return {
        applicable: false,
        capabilityId,
        reason: 'unavailable',
      };
    }

    if (!capability.isApplicable(context)) {
      return {
        applicable: false,
        capabilityId,
        reason: 'inapplicable',
      };
    }

    return {
      applicable: true,
      capability,
    };
  }
}

export type PlayerIntent = Readonly<{
  playerId: string;
  type: string;
  question?: string;
}>;

export type DomainEvent =
  | Readonly<{
      type: 'pet_greeted';
      playerId: string;
      petId: string;
      interactionCount: number;
    }>
  | Readonly<{
      type: 'pet_question_asked';
      playerId: string;
      petId: string;
      interactionCount: number;
    }>;

export type StateTransition = Readonly<{
  accepted: boolean;
  previousState: GameState;
  state: GameState;
  events: readonly DomainEvent[];
  rejectionReason?: 'invalid_intent' | 'unsupported_intent' | 'player_mismatch';
}>;

const supportedIntentTypes = ['greet_pet', 'ask_pet_question'];

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

export class GameCore {
  #state: GameState;

  public constructor(initialState: GameState) {
    this.#state = freezeGameState(initialState);
  }

  public getState(): GameState {
    return this.#state;
  }

  public evaluate(intent: PlayerIntent): StateTransition {
    const previousState = this.#state;

    if (!isValidIntent(intent)) {
      return createRejectedTransition(previousState, 'invalid_intent');
    }

    if (intent.playerId !== previousState.player.id) {
      return createRejectedTransition(previousState, 'player_mismatch');
    }

    if (!supportedIntentTypes.includes(intent.type)) {
      return createRejectedTransition(previousState, 'unsupported_intent');
    }

    const nextState = freezeGameState({
      player: previousState.player,
      pet: {
        ...previousState.pet,
        interactionCount: previousState.pet.interactionCount + 1,
      },
      version: previousState.version + 1,
    });
    const event = freezeDomainEvent(
      intent.type === 'ask_pet_question'
        ? {
            type: 'pet_question_asked',
            playerId: previousState.player.id,
            petId: previousState.pet.id,
            interactionCount: nextState.pet.interactionCount,
          }
        : {
            type: 'pet_greeted',
            playerId: previousState.player.id,
            petId: previousState.pet.id,
            interactionCount: nextState.pet.interactionCount,
          },
    );
    const transition = freezeTransition({
      accepted: true,
      previousState,
      state: nextState,
      events: [event],
    });

    this.#state = nextState;
    return transition;
  }
}

function isValidIntent(intent: PlayerIntent): boolean {
  if (
    typeof intent !== 'object' ||
    intent === null ||
    typeof intent.playerId !== 'string' ||
    typeof intent.type !== 'string'
  ) {
    return false;
  }

  return (
    intent.type !== 'ask_pet_question' ||
    (typeof intent.question === 'string' && intent.question.trim().length > 0)
  );
}

function createRejectedTransition(
  state: GameState,
  rejectionReason: NonNullable<StateTransition['rejectionReason']>,
): StateTransition {
  return freezeTransition({
    accepted: false,
    previousState: state,
    state,
    events: [],
    rejectionReason,
  });
}

function freezeDomainEvent(event: DomainEvent): DomainEvent {
  return Object.freeze(event);
}

function freezeGameState(state: GameState): GameState {
  return Object.freeze({
    player: Object.freeze({ ...state.player }),
    pet: Object.freeze({ ...state.pet }),
    version: state.version,
  });
}

function freezeTransition(transition: StateTransition): StateTransition {
  return Object.freeze({
    ...transition,
    events: Object.freeze([...transition.events]),
  });
}
