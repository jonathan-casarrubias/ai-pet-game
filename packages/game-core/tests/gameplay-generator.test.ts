
import test from 'node:test';
import assert from 'node:assert/strict';

import { GameCore } from '../src/game-core.js';
import {
  createGameplayProposal,
  createInitialGameState,
  DeterministicGameplayGenerator,
} from '../src/index.js';

test('runs the complete gameplay generation and exploration flow', async () => {
  const gameCore = new GameCore(
    createInitialGameState(
      { id: 'player-1' },
      { id: 'pet-1', name: 'Sprout' },
    ),
  );

  const capabilityContext = {
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
  };

  const controlledContext = gameCore.createControlledGenerationContext(
    'initial-adventure',
    capabilityContext,
  );

  assert.ok(controlledContext);

  const generator = new DeterministicGameplayGenerator();

  const proposal = await generator.generate(controlledContext);

  assert.equal(proposal.generationPurpose, 'initial-adventure');
  assert.equal(proposal.sourceStateVersion, 0);
  assert.deepEqual(proposal.capabilityIds, ['observe', 'explore']);
  assert.equal(proposal.activityId, 'explore');
  assert.equal(proposal.contextualElements[0]?.id, 'blue-stone');
  assert.equal(
    proposal.narrative,
    'Sprout notices the blue-stone.',
  );

  const accepted = gameCore.acceptGameplayProposal(
    controlledContext,
    proposal,
  );

  assert.ok(accepted);
  assert.equal(accepted.activityId, 'explore');
  assert.deepEqual(
    accepted.gameplayContext.applicableCapabilityIds,
    ['observe', 'explore'],
  );

  const stateBeforeExploration = gameCore.getState();

  const transition = gameCore.evaluate(
    {
      playerId: 'player-1',
      type: 'explore',
      elementId: 'blue-stone',
    },
    capabilityContext,
  );

  assert.equal(transition.accepted, true);
  assert.equal(transition.previousState, stateBeforeExploration);
  assert.equal(transition.state.version, stateBeforeExploration.version + 1);
  assert.equal(transition.state.pet.interactionCount, 1);
  assert.deepEqual(transition.state.discoveries, ['blue-stone']);

  assert.equal(transition.events.length, 1);
  assert.deepEqual(transition.events[0], {
    type: 'discovery_made',
    capabilityId: 'explore',
    playerId: 'player-1',
    petId: 'pet-1',
    elementId: 'blue-stone',
    interactionCount: 1,
  });

  assert.deepEqual(gameCore.getState().discoveries, ['blue-stone']);
  assert.equal(gameCore.getState().version, 1);
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
