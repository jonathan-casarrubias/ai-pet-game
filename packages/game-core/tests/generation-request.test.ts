import test from 'node:test';
import assert from 'node:assert/strict';

import { createGenerationRequest } from '../src/index.js';

test('GenerationRequest preserves generationPurpose', () => {
  const request = createGenerationRequest(
    'initial-adventure',
    0,
    {
      pet: { name: 'Lumi', interactionCount: 0 },
      discoveryCount: 0,
      recentDiscoveries: [],
      escapedThreats: [],
    },
    [],
    [],
  );
  assert.strictEqual(request.generationPurpose, 'initial-adventure');
});

test('GenerationRequest preserves sourceStateVersion', () => {
  const request = createGenerationRequest(
    'purpose',
    5,
    {
      pet: { name: 'Lumi', interactionCount: 0 },
      discoveryCount: 0,
      recentDiscoveries: [],
      escapedThreats: [],
    },
    [],
    [],
  );
  assert.strictEqual(request.sourceStateVersion, 5);
});

test('GenerationRequest preserves pet name and interactionCount', () => {
  const request = createGenerationRequest(
    'purpose',
    0,
    {
      pet: { name: 'Lumi', interactionCount: 3 },
      discoveryCount: 0,
      recentDiscoveries: [],
      escapedThreats: [],
    },
    [],
    [],
  );
  assert.strictEqual(request.relevantState.pet.name, 'Lumi');
  assert.strictEqual(request.relevantState.pet.interactionCount, 3);
});

test('GenerationRequest preserves discoveryCount', () => {
  const request = createGenerationRequest(
    'purpose',
    0,
    {
      pet: { name: 'Lumi', interactionCount: 0 },
      discoveryCount: 4,
      recentDiscoveries: [],
      escapedThreats: [],
    },
    [],
    [],
  );
  assert.strictEqual(request.relevantState.discoveryCount, 4);
});

test('GenerationRequest copies recentDiscoveries without aliasing', () => {
  const discoveries = ['blue-stone'];
  const request = createGenerationRequest(
    'purpose',
    0,
    {
      pet: { name: 'Lumi', interactionCount: 0 },
      discoveryCount: 1,
      recentDiscoveries: discoveries,
      escapedThreats: [],
    },
    [],
    [],
  );
  assert.deepStrictEqual(request.relevantState.recentDiscoveries, ['blue-stone']);
  // Mutating the input must not affect the request.
  discoveries.push('new-element');
  assert.deepStrictEqual(request.relevantState.recentDiscoveries, ['blue-stone']);
});

test('GenerationRequest preserves contextual elements', () => {
  const elements = [{ id: 'blue-stone', category: 'object', attributes: ['visible'] }];
  const request = createGenerationRequest(
    'purpose',
    0,
    {
      pet: { name: 'Lumi', interactionCount: 0 },
      discoveryCount: 0,
      recentDiscoveries: [],
      escapedThreats: [],
    },
    elements,
    [],
  );
  // Array is frozen - cannot mutate its length
  assert.throws(() => {
    (request.contextualElements as unknown[]).push({ id: 'other', category: 'object', attributes: [] });
  });
  assert.deepStrictEqual(request.contextualElements, elements);
});

test('GenerationRequest preserves applicableCapabilityIds', () => {
  const ids = ['explore', 'observe'];
  const request = createGenerationRequest(
    'purpose',
    0,
    {
      pet: { name: 'Lumi', interactionCount: 0 },
      discoveryCount: 0,
      recentDiscoveries: [],
      escapedThreats: [],
    },
    [],
    ids,
  );
  assert.deepStrictEqual(request.applicableCapabilityIds, ['explore', 'observe']);
  ids.push('fly');
  assert.deepStrictEqual(request.applicableCapabilityIds, ['explore', 'observe']);
});

test('GenerationRequest is frozen and immutable', () => {
  const request = createGenerationRequest(
    'purpose',
    1,
    {
      pet: { name: 'Lumi', interactionCount: 2 },
      discoveryCount: 3,
      recentDiscoveries: ['a'],
      escapedThreats: [],
    },
    [{ id: 'e', category: 'object', attributes: ['visible'] }],
    ['explore'],
  );
  assert.ok(Object.isFrozen(request));
  assert.ok(Object.isFrozen(request.relevantState));
  assert.ok(Object.isFrozen(request.relevantState.pet));
  assert.ok(Object.isFrozen(request.contextualElements));
  assert.ok(Object.isFrozen(request.applicableCapabilityIds));
});
