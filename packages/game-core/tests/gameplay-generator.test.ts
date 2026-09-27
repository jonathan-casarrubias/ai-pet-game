import test from 'node:test';
import assert from 'node:assert/strict';

import { GameCore } from '../src/game-core.js';
import {
  createGameplayProposal,
  createInitialGameState,
  DeterministicGameplayGenerator,
  type ContextualElement,
} from '../src/index.js';

test('runs the complete gameplay generation and exploration flow with history-dependent subsequent generation', async () => {
  // 1. GameCore starts with a valid GameState (no discoveries).
  const gameCore = new GameCore(
    createInitialGameState(
      { id: 'player-1' },
      { id: 'pet-1', name: 'Sprout' },
    ),
  );
  assert.strictEqual(gameCore.getState().version, 0);
  assert.deepStrictEqual(gameCore.getState().discoveries, []);

  // 2. Create a valid runtime CapabilityContext with a contextual element.
  const capabilityContext: ContextualElement = {
    id: 'blue-stone',
    category: 'object',
    attributes: ['visible', 'glowing'],
  };

  // 3. Initial ControlledGenerationContext (before any discoveries).
  const initialControlledContext = gameCore.createControlledGenerationContext(
    'initial-adventure',
    {
      gameState: gameCore.getState(),
      playerContext: {
        playerId: 'player-1',
        progressionLevel: 0,
      },
      contextualElement: capabilityContext,
    },
  );
  assert.ok(initialControlledContext);
  assert.strictEqual(initialControlledContext.sourceStateVersion, 0);
  assert.strictEqual(initialControlledContext.relevantState.discoveryCount, 0);

  // 4. DeterministicGameplayGenerator generates an initial GameplayProposal.
  const generator = new DeterministicGameplayGenerator();
  const initialProposal = await generator.generate(initialControlledContext);
  assert.strictEqual(initialProposal.generationPurpose, 'initial-adventure');
  assert.strictEqual(initialProposal.sourceStateVersion, 0);
  assert.deepEqual(initialProposal.capabilityIds, ['observe', 'explore']);
  assert.strictEqual(initialProposal.activityId, 'explore');

  // The initial narrative reflects no prior discovery history.
  assert.strictEqual(
    initialProposal.narrative,
    'Sprout notices the blue-stone and feels curious about it.',
  );

  // 5. GameCore accepts the proposal.
  const acceptedInitial = gameCore.acceptGameplayProposal(
    initialControlledContext,
    initialProposal,
  );
  assert.ok(acceptedInitial);
  assert.strictEqual(acceptedInitial.activityId, 'explore');

  // 6. Execute the player's explore action against the proposed contextual element.
  const transition = gameCore.evaluate(
    {
      playerId: 'player-1',
      type: 'explore',
      elementId: 'blue-stone',
    },
    {
      gameState: gameCore.getState(),
      playerContext: {
        playerId: 'player-1',
        progressionLevel: 0,
      },
      contextualElement: capabilityContext,
    },
  );

  // 8. GameCore accepts the action.
  assert.ok(transition.accepted);

  // 9. The resulting transition increments GameState.version.
  assert.strictEqual(transition.previousState.version, 0);
  assert.strictEqual(transition.state.version, 1);

  // 10. pet.interactionCount is incremented.
  assert.strictEqual(transition.previousState.pet.interactionCount, 0);
  assert.strictEqual(transition.state.pet.interactionCount, 1);

  // 11. GameState.discoveries contains the discovered elementId.
  assert.deepStrictEqual(transition.state.discoveries, ['blue-stone']);

  // 12. Exactly the corresponding discovery_made domain event is emitted.
  assert.strictEqual(transition.events.length, 1);
  assert.deepStrictEqual(transition.events[0], {
    type: 'discovery_made',
    capabilityId: 'explore',
    playerId: 'player-1',
    petId: 'pet-1',
    elementId: 'blue-stone',
    interactionCount: 1,
  });

  // Verify authoritative state after the action.
  assert.strictEqual(gameCore.getState().version, 1);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 1);
  assert.deepStrictEqual(gameCore.getState().discoveries, ['blue-stone']);
  assert.strictEqual(gameCore.getState(), transition.state);

  // 9. Create a NEW ControlledGenerationContext from the updated Game Core state.
  const updatedCapabilityContext = {
    gameState: gameCore.getState(),
    playerContext: {
      playerId: 'player-1',
      progressionLevel: 0,
    },
    contextualElement: capabilityContext,
  };
  const updatedControlledContext = gameCore.createControlledGenerationContext(
    'subsequent-adventure',
    updatedCapabilityContext,
  );
  assert.ok(updatedControlledContext);
  assert.strictEqual(updatedControlledContext.sourceStateVersion, 1);
  assert.strictEqual(updatedControlledContext.relevantState.discoveryCount, 1);

  // 11. The generator receives the new context.
  const subsequentProposal = await generator.generate(updatedControlledContext);

  // 12. The subsequent proposal is accepted by Game Core.
  const acceptedSubsequent = gameCore.acceptGameplayProposal(
    updatedControlledContext,
    subsequentProposal,
  );
  assert.ok(acceptedSubsequent);

  // 13. The subsequent proposal's narrative is different from the initial because discovery exists.
  assert.notEqual(subsequentProposal.narrative, initialProposal.narrative);

  // 14. The subsequent narrative explicitly reflects the prior discovery.
  assert.strictEqual(
    subsequentProposal.narrative,
    'Sprout remembers discovering the blue-stone before and wonders what else it might reveal.',
  );

  // 15. The authoritative state is still owned and mutated only by Game Core.
  assert.strictEqual(gameCore.getState().version, 1);
  assert.strictEqual(gameCore.getState().pet.interactionCount, 1);
  assert.deepStrictEqual(gameCore.getState().discoveries, ['blue-stone']);
});

test('rejects a gameplay proposal containing an unsupported capability', () => {
  const gameCore = new GameCore(
    createInitialGameState(
      { id: 'player-1' },
      { id: 'pet-1', name: 'Sprout' },
    ),
  );

  const controlledContext = gameCore.createControlledGenerationContext(
    'initial-adventure',
    {
      gameState: gameCore.getState(),
      playerContext: {
        playerId: 'player-1',
        progressionLevel: 0,
      },
      contextualElement: {
        id: 'blue-stone',
        category: 'object',
        attributes: ['visible', 'glowing'],
      },
    },
  );

  assert.ok(controlledContext);

  const proposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    ['fly'],
    'Sprout suddenly takes flight.',
    'fly',
  );

  const stateBeforeAcceptance = gameCore.getState();

  const accepted = gameCore.acceptGameplayProposal(
    controlledContext,
    proposal,
  );

  assert.equal(accepted, undefined);
  assert.equal(gameCore.getState(), stateBeforeAcceptance);
  assert.equal(gameCore.getState().version, 0);
  assert.equal(gameCore.getState().pet.interactionCount, 0);
  assert.deepEqual(gameCore.getState().discoveries, []);
});
