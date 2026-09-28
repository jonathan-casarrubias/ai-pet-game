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
} from '../src/index.js';

function createTestContext(gameCore: GameCore): ControlledGenerationContext {
  const ctx = gameCore.createControlledGenerationContext('initial-adventure', {
    gameState: gameCore.getState(),
    playerContext: { playerId: 'player-1', progressionLevel: 0 },
    contextualElement: { id: 'blue-stone', category: 'object', attributes: ['visible', 'glowing'] },
  });
  assert.ok(ctx);
  return ctx;
}

function createFakeProvider(result: GenerationResult): GenerationProvider {
  return {
    async generate(_request: GenerationRequest): Promise<GenerationResult> {
      return result;
    },
  };
}

let capturedRequest: GenerationRequest | null = null;

function createCapturingProvider(): GenerationProvider {
  capturedRequest = null;
  return {
    async generate(request: GenerationRequest): Promise<GenerationResult> {
      capturedRequest = request;
      return { success: true, narrative: 'Lumi explores the blue-stone.' };
    },
  };
}

test('ProviderGameplayGenerator passes bounded GenerationRequest to provider', async () => {
  const gameCore = new GameCore(createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }));
  const context = createTestContext(gameCore);

  const provider = createCapturingProvider();
  const generator = new ProviderGameplayGenerator(provider);
  await generator.generate(context);

  assert.ok(capturedRequest);
  assert.strictEqual(capturedRequest!.generationPurpose, 'initial-adventure');
  assert.strictEqual(capturedRequest!.sourceStateVersion, 0);
  assert.strictEqual(capturedRequest!.relevantState.pet.name, 'Lumi');
  assert.strictEqual(capturedRequest!.relevantState.pet.interactionCount, 0);
  assert.strictEqual(capturedRequest!.relevantState.discoveryCount, 0);
  assert.deepStrictEqual(capturedRequest!.relevantState.recentDiscoveries, []);
  assert.deepStrictEqual(capturedRequest!.contextualElements, [
    { id: 'blue-stone', category: 'object', attributes: ['visible', 'glowing'] },
  ]);
  assert.deepStrictEqual(capturedRequest!.applicableCapabilityIds, ['observe', 'explore']);
});

test('ProviderGameplayGenerator preserves generationPurpose in GameplayProposal', async () => {
  const gameCore = new GameCore(createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }));
  const context = createTestContext(gameCore);
  const provider = createFakeProvider({ success: true, narrative: 'Hello.' });
  const generator = new ProviderGameplayGenerator(provider);
  const proposal = await generator.generate(context);
  assert.strictEqual(proposal.generationPurpose, 'initial-adventure');
});

test('ProviderGameplayGenerator preserves sourceStateVersion in GameplayProposal', async () => {
  const gameCore = new GameCore(createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }));
  const context = createTestContext(gameCore);
  const provider = createFakeProvider({ success: true, narrative: 'Hello.' });
  const generator = new ProviderGameplayGenerator(provider);
  const proposal = await generator.generate(context);
  assert.strictEqual(proposal.sourceStateVersion, 0);
});

test('ProviderGameplayGenerator preserves contextualElements from context', async () => {
  const gameCore = new GameCore(createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }));
  const context = createTestContext(gameCore);
  const provider = createFakeProvider({ success: true, narrative: 'Hello.' });
  const generator = new ProviderGameplayGenerator(provider);
  const proposal = await generator.generate(context);
  assert.deepStrictEqual(
    proposal.contextualElements,
    context.gameplayContext.contextualElements,
  );
});

test('ProviderGameplayGenerator preserves applicableCapabilityIds from context', async () => {
  const gameCore = new GameCore(createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }));
  const context = createTestContext(gameCore);
  const provider = createFakeProvider({ success: true, narrative: 'Hello.' });
  const generator = new ProviderGameplayGenerator(provider);
  const proposal = await generator.generate(context);
  assert.deepStrictEqual(proposal.capabilityIds, ['observe', 'explore']);
});

test('ProviderGameplayGenerator maps successful narrative from GenerationResult', async () => {
  const gameCore = new GameCore(createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }));
  const context = createTestContext(gameCore);
  const provider = createFakeProvider({ success: true, narrative: 'Lumi finds a mystery.' });
  const generator = new ProviderGameplayGenerator(provider);
  const proposal = await generator.generate(context);
  assert.strictEqual(proposal.narrative, 'Lumi finds a mystery.');
});

test('ProviderGameplayGenerator preserves activityId when provided by provider', async () => {
  const gameCore = new GameCore(createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }));
  const context = createTestContext(gameCore);
  const provider = createFakeProvider({ success: true, narrative: 'Lumi explores.', activityId: 'explore' });
  const generator = new ProviderGameplayGenerator(provider);
  const proposal = await generator.generate(context);
  assert.strictEqual(proposal.activityId, 'explore');
});

test('ProviderGameplayGenerator omits activityId when provider does not provide one', async () => {
  const gameCore = new GameCore(createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }));
  const context = createTestContext(gameCore);
  const provider = createFakeProvider({ success: true, narrative: 'Lumi observes.' });
  const generator = new ProviderGameplayGenerator(provider);
  const proposal = await generator.generate(context);
  assert.strictEqual(proposal.activityId, undefined);
});

test('ProviderGameplayGenerator surfaces provider failure as Error', async () => {
  const gameCore = new GameCore(createInitialGameState({ id: 'player-1' }, { id: 'pet-1', name: 'Lumi' }));
  const context = createTestContext(gameCore);
  const provider = createFakeProvider({
    success: false,
    error: { code: 'PROVIDER_UNAVAILABLE', message: 'Connection refused' },
  });
  const generator = new ProviderGameplayGenerator(provider);
  await assert.rejects(
    generator.generate(context),
    /Generation provider failed: PROVIDER_UNAVAILABLE/,
  );
});
