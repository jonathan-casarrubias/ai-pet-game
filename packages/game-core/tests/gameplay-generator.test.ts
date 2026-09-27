import assert from "assert";
import { GameCore } from "../src/game-core.js";
import { createInitialGameState, DeterministicGameplayGenerator } from "../src/index.js";

const gameCore = new GameCore(
  createInitialGameState(
    { id: 'player-1' },
    { id: 'pet-1', name: 'Sprout' },
  ),
);

const context = gameCore.createControlledGenerationContext(
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

assert.ok(context);

const generator = new DeterministicGameplayGenerator();

const proposal = await generator.generate(context);

const accepted = gameCore.acceptGameplayProposal(
  context,
  proposal,
);

assert.ok(accepted);
assert.equal(
  accepted.narrative,
  'Sprout notices the blue-stone.',
);