import {
  createInitialGameState,
  GameCore,
  type PlayerIntent,
} from '../src';

const initialState = createInitialGameState(
  { id: 'player-1' },
  { id: 'pet-1', name: 'Sprout' },
);

test('evaluates a valid player intent and produces an authoritative transition', () => {
  const gameCore = new GameCore(initialState);

  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'greet_pet',
  });

  assert(transition.accepted, 'valid intent should be accepted');
  assertEqual(transition.previousState.version, 0);
  assertEqual(transition.state.version, 1);
  assertEqual(transition.state.pet.interactionCount, 1);
  assertEqual(gameCore.getState().version, 1);
  assertEqual(gameCore.getState().pet.interactionCount, 1);
});

test('produces a domain event for an accepted pet interaction', () => {
  const gameCore = new GameCore(initialState);

  const transition = gameCore.evaluate({
    playerId: 'player-1',
    type: 'greet_pet',
  });

  assertEqual(transition.events.length, 1);
  assertDeepEqual(transition.events[0], {
    type: 'pet_greeted',
    playerId: 'player-1',
    petId: 'pet-1',
    interactionCount: 1,
  });
});

test('does not allow callers to mutate authoritative state directly', () => {
  const gameCore = new GameCore(initialState);
  const state = gameCore.getState();

  try {
    (state.pet as { interactionCount: number }).interactionCount = 99;
  } catch {}

  assertEqual(gameCore.getState().pet.interactionCount, 0);
  assert(
    !('applyTransition' in gameCore),
    'GameCore should expose evaluation, not a caller-controlled transition method',
  );
});

test('rejects an unsupported intent without partially mutating state', () => {
  const gameCore = new GameCore(initialState);
  const unsupportedIntent = {
    playerId: 'player-1',
    type: 'open_inventory',
  } as PlayerIntent;

  const transition = gameCore.evaluate(unsupportedIntent);

  assert(!transition.accepted, 'unsupported intent should be rejected');
  assertEqual(transition.rejectionReason, 'unsupported_intent');
  assertEqual(transition.events.length, 0);
  assertEqual(transition.state.version, 0);
  assertEqual(transition.state.pet.interactionCount, 0);
  assertEqual(gameCore.getState().version, 0);
  assertEqual(gameCore.getState().pet.interactionCount, 0);
});

test('rejects an intent for another player without changing state', () => {
  const gameCore = new GameCore(initialState);

  const transition = gameCore.evaluate({
    playerId: 'player-2',
    type: 'greet_pet',
  });

  assert(!transition.accepted, 'intent for another player should be rejected');
  assertEqual(transition.rejectionReason, 'player_mismatch');
  assertEqual(gameCore.getState().version, 0);
  assertEqual(gameCore.getState().pet.interactionCount, 0);
});

function test(name: string, callback: () => void): void {
  callback();
  console.log(`✓ ${name}`);
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(actual: T, expected: T): void {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`,
    );
  }
}
