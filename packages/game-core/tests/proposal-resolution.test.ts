import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createGameplayProposal,
  createInitialGameState,
  GameCore,
  type ContextualElement,
  type ControlledGenerationContext,
  type CorrectionAttempt,
  type ProposalCorrector,
} from '../src/index.js';

function createGameCore(): GameCore {
  return new GameCore(
    createInitialGameState(
      { id: 'player-1' },
      { id: 'pet-1', name: 'Sprout' },
    ),
  );
}

function createControlledContext(
  gameCore: GameCore,
  generationPurpose: string,
  contextualElement?: ContextualElement,
): ControlledGenerationContext | undefined {
  return gameCore.createControlledGenerationContext(generationPurpose, {
    gameState: gameCore.getState(),
    playerContext: { playerId: 'player-1', progressionLevel: 0 },
    contextualElement: contextualElement ?? {
      id: 'blue-stone',
      category: 'object',
      attributes: ['visible', 'glowing'],
    },
  });
}

test('resolveGameplayProposal accepts a valid original proposal', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  const proposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    controlledContext.gameplayContext.applicableCapabilityIds,
    'Sprout notices the blue-stone.',
    'explore',
  );

  const stateBefore = gameCore.getState();
  let correctorCalled = false;
  const corrector: ProposalCorrector = {
    correct: () => {
      correctorCalled = true;
      return proposal;
    },
  };

  const result = gameCore.resolveGameplayProposal(controlledContext, proposal, corrector);

  assert.strictEqual(result.acceptedFrom, 'original');
  assert.ok(result.context);
  assert.strictEqual(result.context.narrative, 'Sprout notices the blue-stone.');
  assert.deepStrictEqual(result.context.gameplayContext.applicableCapabilityIds, ['observe', 'explore']);
  assert.strictEqual(correctorCalled, false, 'corrector should not be called for valid proposals');
  assert.strictEqual(gameCore.getState(), stateBefore, 'state should not be mutated');
  assert.strictEqual(gameCore.getState().version, 0);
});

test('resolveGameplayProposal accepts a corrected proposal', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  // Original proposal with invalid capability
  const originalProposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    ['fly'], // invalid capability
    'Sprout tries to fly.',
  );

  // Corrector returns a valid proposal
  const correctedProposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    controlledContext.gameplayContext.applicableCapabilityIds,
    'Sprout observes the blue-stone.',
  );

  const stateBefore = gameCore.getState();
  let correctionCallCount = 0;
  let receivedAttempt: CorrectionAttempt | null = null as CorrectionAttempt | null;
  const corrector: ProposalCorrector = {
    correct: (attempt) => {
      correctionCallCount++;
      receivedAttempt = attempt;
      return correctedProposal;
    },
  };

  const result = gameCore.resolveGameplayProposal(controlledContext, originalProposal, corrector);

  assert.strictEqual(result.acceptedFrom, 'corrected');
  assert.ok(result.context);
  assert.strictEqual(correctionCallCount, 1);
  assert.ok(receivedAttempt);
  assert.strictEqual(receivedAttempt.controlledContext, controlledContext);
  assert.strictEqual(receivedAttempt.original, originalProposal);
  assert.strictEqual(receivedAttempt.rejection.code, 'INVALID_CAPABILITY');
  assert.strictEqual(gameCore.getState(), stateBefore);
  assert.strictEqual(gameCore.getState().version, 0);
});

test('resolveGameplayProposal falls back when corrected proposal is also rejected', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  // Original proposal with invalid capability
  const originalProposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    ['fly'],
    'Sprout tries to fly.',
  );

  // Corrector also returns an invalid proposal
  const badCorrectedProposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    ['swim'], // also invalid
    'Sprout tries to swim.',
  );

  const stateBefore = gameCore.getState();
  let correctionCallCount = 0;
  const corrector: ProposalCorrector = {
    correct: () => {
      correctionCallCount++;
      return badCorrectedProposal;
    },
  };

  const result = gameCore.resolveGameplayProposal(controlledContext, originalProposal, corrector);

  assert.strictEqual(result.acceptedFrom, 'fallback');
  assert.ok(result.context);
  assert.strictEqual(correctionCallCount, 1);
  assert.strictEqual(gameCore.getState(), stateBefore);
  assert.strictEqual(gameCore.getState().version, 0);
  // Fallback should have valid capabilities
  assert.deepStrictEqual(
    result.context.gameplayContext.applicableCapabilityIds,
    ['observe', 'explore'],
  );
});

test('exactly one correction attempt is made', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  const originalProposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    ['fly'],
    'Sprout tries to fly.',
  );

  let correctionCallCount = 0;
  const corrector: ProposalCorrector = {
    correct: () => {
      correctionCallCount++;
      // Always return invalid
      return createGameplayProposal(
        controlledContext.generationPurpose,
        controlledContext.sourceStateVersion,
        controlledContext.gameplayContext.contextualElements,
        ['swim'],
        'Sprout tries to swim.',
      );
    },
  };

  const result = gameCore.resolveGameplayProposal(controlledContext, originalProposal, corrector);

  assert.strictEqual(correctionCallCount, 1, 'corrector should be called exactly once');
  assert.strictEqual(result.acceptedFrom, 'fallback');
});

test('rejects proposal with invalid generation purpose', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  const proposal = createGameplayProposal(
    'wrong-purpose', // mismatched purpose
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    controlledContext.gameplayContext.applicableCapabilityIds,
    'Some narrative.',
  );

  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.rejection.code, 'INVALID_PURPOSE');
  assert.ok(result.rejection.message.length > 0);
  assert.ok(result.rejection.applicableCapabilityIds.length > 0);
});

test('rejects proposal with stale state version', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  const proposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion + 1, // stale version
    controlledContext.gameplayContext.contextualElements,
    controlledContext.gameplayContext.applicableCapabilityIds,
    'Some narrative.',
  );

  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.rejection.code, 'STALE_STATE_VERSION');
});

test('rejects proposal with unsupported contextual element', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  const proposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    [{ id: 'unknown', category: 'unsupported', attributes: [] }],
    controlledContext.gameplayContext.applicableCapabilityIds,
    'Some narrative.',
  );

  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.rejection.code, 'UNSUPPORTED_CONTEXTUAL_ELEMENT');
});

test('rejects proposal with invalid capability', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  const proposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    ['fly'],
    'Some narrative.',
  );

  const result = gameCore.validateGameplayProposal(controlledContext, proposal);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.rejection.code, 'INVALID_CAPABILITY');
});

test('fallback uses only applicable capabilities', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  const fallbackProposal = gameCore.produceFallback(controlledContext, {
    code: 'INVALID_CAPABILITY',
    message: 'Test rejection',
    applicableCapabilityIds: controlledContext.gameplayContext.applicableCapabilityIds,
  });

  assert.ok(fallbackProposal);
  assert.deepStrictEqual(
    fallbackProposal.capabilityIds,
    controlledContext.gameplayContext.applicableCapabilityIds,
  );
  assert.ok(
    fallbackProposal.capabilityIds.every((id) =>
      controlledContext.gameplayContext.applicableCapabilityIds.includes(id),
    ),
  );
});

test('fallback preserves generation purpose and state version', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  const fallbackProposal = gameCore.produceFallback(controlledContext, {
    code: 'INVALID_CAPABILITY',
    message: 'Test rejection',
    applicableCapabilityIds: controlledContext.gameplayContext.applicableCapabilityIds,
  });

  assert.strictEqual(fallbackProposal.generationPurpose, controlledContext.generationPurpose);
  assert.strictEqual(fallbackProposal.sourceStateVersion, controlledContext.sourceStateVersion);
});

test('fallback does not contain undefined in narrative', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  const fallbackProposal = gameCore.produceFallback(controlledContext, {
    code: 'INVALID_CAPABILITY',
    message: 'Test rejection',
    applicableCapabilityIds: controlledContext.gameplayContext.applicableCapabilityIds,
  });

  assert.ok(!fallbackProposal.narrative.includes('undefined'));
  assert.ok(fallbackProposal.narrative.length > 0);
});

test('fallback with discoveries does not contain undefined', () => {
  const gameCore = createGameCore();
  // Simulate state with discoveries
  gameCore.evaluate({ playerId: 'player-1', type: 'explore', elementId: 'blue-stone' });

  const controlledContext = gameCore.createControlledGenerationContext('subsequent-adventure', {
    gameState: gameCore.getState(),
    playerContext: { playerId: 'player-1', progressionLevel: 0 },
    contextualElement: { id: 'blue-stone', category: 'object', attributes: ['visible', 'glowing'] },
  });
  assert.ok(controlledContext);

  const fallbackProposal = gameCore.produceFallback(controlledContext, {
    code: 'INVALID_CAPABILITY',
    message: 'Test rejection',
    applicableCapabilityIds: controlledContext.gameplayContext.applicableCapabilityIds,
  });

  assert.ok(!fallbackProposal.narrative.includes('undefined'));
  assert.ok(fallbackProposal.narrative.includes('blue-stone'));
});

test('malicious corrector cannot bypass Game Core validation', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  // Original invalid proposal
  const originalProposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    ['fly'],
    'Sprout tries to fly.',
  );

  // Malicious corrector tries to introduce another invalid capability
  const maliciousCorrector: ProposalCorrector = {
    correct: () => {
      return createGameplayProposal(
        controlledContext.generationPurpose,
        controlledContext.sourceStateVersion,
        controlledContext.gameplayContext.contextualElements,
        ['teleport'], // also invalid
        'Sprout teleports.',
      );
    },
  };

  const result = gameCore.resolveGameplayProposal(controlledContext, originalProposal, maliciousCorrector);

  assert.strictEqual(result.acceptedFrom, 'fallback');
  assert.ok(result.context);
  // Fallback should have valid capabilities only
  assert.deepStrictEqual(
    result.context.gameplayContext.applicableCapabilityIds,
    ['observe', 'explore'],
  );
  // Malicious capability must not appear
  assert.ok(!result.context.gameplayContext.applicableCapabilityIds.includes('teleport'));
});

test('resolveGameplayProposal does not mutate authoritative state', () => {
  const gameCore = createGameCore();
  const controlledContext = createControlledContext(gameCore, 'initial-adventure');
  assert.ok(controlledContext);

  const proposal = createGameplayProposal(
    controlledContext.generationPurpose,
    controlledContext.sourceStateVersion,
    controlledContext.gameplayContext.contextualElements,
    ['fly'],
    'Sprout tries to fly.',
  );

  const stateSnapshot = {
    version: gameCore.getState().version,
    interactionCount: gameCore.getState().pet.interactionCount,
    discoveries: [...gameCore.getState().discoveries],
  };

  const corrector: ProposalCorrector = {
    correct: () => proposal, // returns same invalid proposal
  };

  gameCore.resolveGameplayProposal(controlledContext, proposal, corrector);

  assert.strictEqual(gameCore.getState().version, stateSnapshot.version);
  assert.strictEqual(gameCore.getState().pet.interactionCount, stateSnapshot.interactionCount);
  assert.deepStrictEqual([...gameCore.getState().discoveries], stateSnapshot.discoveries);
});
