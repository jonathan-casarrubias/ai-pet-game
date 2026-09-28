import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialGameState,
  GameCore,
  type GenerationProvider,
  type GenerationRequest,
  type GenerationResult,
  ProviderGameplayGenerator,
  type ControlledGenerationContext,
  type ProposalCorrector,
  type ContextualElement,
  createGameplayProposal,
} from '../src/index.js';

function createSuccessProvider(
  narrative: string,
  activityId?: string,
): GenerationProvider {
  return {
    async generate(_request: GenerationRequest): Promise<GenerationResult> {
      if (activityId !== undefined) {
        return { success: true, narrative, activityId };
      }
      return { success: true, narrative };
    },
  };
}

function createFailureProvider(
  code: 'PROVIDER_UNAVAILABLE' | 'GENERATION_FAILED' | 'INVALID_OUTPUT',
): GenerationProvider {
  return {
    async generate(_request: GenerationRequest): Promise<GenerationResult> {
      return {
        success: false,
        error: { code, message: 'provider error' },
      };
    },
  };
}

function createContext(
  gameCore: GameCore,
  purpose: string,
  element?: ContextualElement,
): ControlledGenerationContext {
  const ctx = gameCore.createControlledGenerationContext(purpose, {
    gameState: gameCore.getState(),
    playerContext: { playerId: 'player-1', progressionLevel: 0 },
    contextualElement: element ?? { id: 'blue-stone', category: 'object', attributes: ['visible', 'glowing'] },
  });
  assert.ok(ctx);
  return ctx;
}

test('full AI flow: generation → proposal → resolution → player action → new state', async () => {
  const gameCore = new GameCore(
    createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }),
  );
  assert.strictEqual(gameCore.getState().version, 0);
  assert.deepStrictEqual(gameCore.getState().discoveries, []);

  const context = createContext(gameCore, 'initial-adventure');
  const provider = createSuccessProvider('Lumi finds a mysterious blue-stone.', 'explore');
  const generator = new ProviderGameplayGenerator(provider);

  const proposal = await generator.generate(context);
  assert.strictEqual(proposal.generationPurpose, 'initial-adventure');
  assert.strictEqual(proposal.sourceStateVersion, 0);
  assert.strictEqual(proposal.narrative, 'Lumi finds a mysterious blue-stone.');
  assert.strictEqual(proposal.activityId, 'explore');

  const corrector: ProposalCorrector = {
    correct: () => proposal,
  };
  const resolution = gameCore.resolveGameplayProposal(context, proposal, corrector);
  assert.strictEqual(resolution.acceptedFrom, 'original');
  assert.ok(resolution.context);

  const transition = gameCore.evaluate(
    { playerId: 'player-1', type: 'explore', elementId: 'blue-stone' },
    {
      gameState: gameCore.getState(),
      playerContext: { playerId: 'player-1', progressionLevel: 0 },
      contextualElement: { id: 'blue-stone', category: 'object', attributes: ['visible', 'glowing'] },
    },
  );
  assert.ok(transition.accepted);
  assert.strictEqual(transition.state.version, 1);
  assert.strictEqual(transition.state.pet.interactionCount, 1);
  assert.deepStrictEqual(transition.state.discoveries, ['blue-stone']);
  assert.strictEqual(transition.events.length, 1);
  assert.strictEqual(transition.events[0]!.type, 'discovery_made');
  assert.strictEqual(gameCore.getState().version, 1);
});

test('provider cannot mutate authoritative GameState', async () => {
  const gameCore = new GameCore(
    createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }),
  );
  const stateBefore = gameCore.getState();

  const provider = createSuccessProvider('Lumi explores.');
  const generator = new ProviderGameplayGenerator(provider);
  const context = createContext(gameCore, 'test');
  await generator.generate(context);

  assert.strictEqual(gameCore.getState(), stateBefore);
  assert.strictEqual(gameCore.getState().version, 0);
  assert.deepStrictEqual(gameCore.getState().discoveries, []);
});

test('generated invalid proposal triggers correction/fallback flow', async () => {
  const gameCore = new GameCore(
    createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }),
  );
  const context = createContext(gameCore, 'initial-adventure');
  const stateBefore = gameCore.getState();

  // Create an invalid proposal directly (not through provider)
  const invalidProposal = createGameplayProposal(
    context.generationPurpose,
    context.sourceStateVersion,
    context.gameplayContext.contextualElements,
    ['fly'], // invalid capability
    'Lumi flies.',
  );

  const corrector: ProposalCorrector = {
    correct: (attempt) => ({
      generationPurpose: attempt.controlledContext.generationPurpose,
      sourceStateVersion: attempt.controlledContext.sourceStateVersion,
      contextualElements: attempt.controlledContext.gameplayContext.contextualElements,
      capabilityIds: attempt.controlledContext.gameplayContext.applicableCapabilityIds,
      narrative: 'Lumi observes the blue-stone.',
    }),
  };

  const resolution = gameCore.resolveGameplayProposal(context, invalidProposal, corrector);
  assert.strictEqual(resolution.acceptedFrom, 'corrected');
  assert.ok(resolution.context);
  assert.strictEqual(gameCore.getState(), stateBefore);
});

test('correction/fallback preserves authority when both original and correction are invalid', async () => {
  const gameCore = new GameCore(
    createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }),
  );
  const context = createContext(gameCore, 'initial-adventure');
  const stateBefore = gameCore.getState();

  // Create an invalid proposal
  const invalidProposal = createGameplayProposal(
    context.generationPurpose,
    context.sourceStateVersion,
    context.gameplayContext.contextualElements,
    ['teleport'], // invalid capability
    'Lumi teleports.',
  );

  const corrector: ProposalCorrector = {
    correct: () => ({
      generationPurpose: context.generationPurpose,
      sourceStateVersion: context.sourceStateVersion,
      contextualElements: context.gameplayContext.contextualElements,
      capabilityIds: ['invalid-capability'], // also invalid
      narrative: 'Lumi does something else.',
    }),
  };

  const resolution = gameCore.resolveGameplayProposal(context, invalidProposal, corrector);
  assert.strictEqual(resolution.acceptedFrom, 'fallback');
  assert.ok(resolution.context);
  assert.deepStrictEqual(
    resolution.context.gameplayContext.applicableCapabilityIds,
    ['observe', 'explore'],
  );
  assert.strictEqual(gameCore.getState(), stateBefore);
});

test('provider failure is surfaced before any Game Core mutation', async () => {
  const gameCore = new GameCore(
    createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }),
  );
  const context = createContext(gameCore, 'initial-adventure');
  const stateBefore = gameCore.getState();

  const provider = createFailureProvider('PROVIDER_UNAVAILABLE');
  const generator = new ProviderGameplayGenerator(provider);

  await assert.rejects(
    generator.generate(context),
    /Generation provider failed/,
  );

  assert.strictEqual(gameCore.getState(), stateBefore);
});
