import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGameplayProposal,
  type GameplayGenerator,
} from '@ai-pet-game/game-core';
import { createApp } from '../src/app.js';
import { SessionStore } from '../src/session-store.js';
import { FakeGenerationProvider, startTestServer } from './test-helpers.js';

test('POST /sessions/:sessionId/generate passes bounded context to provider and returns public response', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId } = await createRes.json() as any;

    const genRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purpose: 'initial-adventure',
        elementId: 'blue-stone',
      }),
    });

    assert.strictEqual(genRes.status, 200);
    const genData = await genRes.json() as any;

    // Verify provider received bounded info
    assert.ok(fakeProvider.lastRequest);
    assert.strictEqual(fakeProvider.lastRequest.generationPurpose, 'initial-adventure');
    assert.strictEqual(fakeProvider.lastRequest.sourceStateVersion, 0);
    assert.strictEqual(fakeProvider.lastRequest.relevantState.pet.name, 'Lumi');
    assert.strictEqual(fakeProvider.lastRequest.relevantState.discoveryCount, 0);
    assert.deepStrictEqual(fakeProvider.lastRequest.relevantState.recentDiscoveries, []);
    assert.strictEqual(fakeProvider.lastRequest.contextualElements.length, 1);
    assert.strictEqual(fakeProvider.lastRequest.contextualElements[0]?.id, 'blue-stone');
    assert.deepStrictEqual(fakeProvider.lastRequest.applicableCapabilityIds, ['observe', 'explore']);

    // Verify public response does not leak internal GenerationRequest or raw provider objects
    assert.ok(genData.resolution);
    assert.strictEqual(genData.resolution.acceptedFrom, 'original');
    assert.ok(genData.proposal);
    assert.strictEqual(genData.proposal.generationPurpose, 'initial-adventure');
    assert.ok(genData.proposal.narrative);
    assert.ok(genData.acceptedContext);
    assert.strictEqual(genData.acceptedContext.generationPurpose, 'initial-adventure');
    assert.ok(genData.acceptedContext.narrative);
    assert.strictEqual(genData.state.version, 0); // State not mutated by generation alone

    // Verify no internal provider leaks
    assert.strictEqual(genData.cannedResult, undefined);
    assert.strictEqual(genData.provider, undefined);
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/generate does not mutate authoritative GameState', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId } = await createRes.json() as any;

    await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elementId: 'blue-stone' }),
    });

    const stateRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/state');
    const { state } = await stateRes.json() as any;

    assert.strictEqual(state.version, 0);
    assert.strictEqual(state.pet.interactionCount, 0);
    assert.deepStrictEqual(state.discoveries, []);
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/generate applies accepted entity-spawn consequences', async () => {
  const spawnedEntity = {
    id: 'generated-creature-1',
    type: 'creature' as const,
    role: 'helper' as const,
    label: 'Mosswing',
    position: { x: 230, y: 180 },
    state: 'visible' as const,
    interactionRadius: 24,
  };
  const generator: GameplayGenerator = {
    async generate(context) {
      return createGameplayProposal(
        context.generationPurpose,
        context.sourceStateVersion,
        context.gameplayContext.contextualElements,
        context.gameplayContext.applicableCapabilityIds,
        'A small helper appears beside the trail.',
        undefined,
        [{ type: 'spawn_entity', entity: spawnedEntity }],
      );
    },
  };
  const sessionStore = new SessionStore();
  const session = sessionStore.createSession({ generator });
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const genRes = await fetch(testServer.baseUrl + '/sessions/' + session.id + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elementId: 'trail-marker' }),
    });

    assert.strictEqual(genRes.status, 200);
    const genData = await genRes.json() as any;
    assert.strictEqual(genData.state.version, 1);
    assert.deepStrictEqual(genData.state.world.entities[spawnedEntity.id], spawnedEntity);
    assert.deepStrictEqual(
      session.gameCore.getState().world.entities[spawnedEntity.id],
      spawnedEntity,
    );
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/generate returns 404 for unknown session', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const res = await fetch(testServer.baseUrl + '/sessions/unknown-id/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elementId: 'blue-stone' }),
    });

    assert.strictEqual(res.status, 404);
    const data = await res.json() as any;
    assert.strictEqual(data.error, 'SESSION_NOT_FOUND');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/generate maps PROVIDER_UNAVAILABLE to 503', async () => {
  const fakeProvider = new FakeGenerationProvider();
  fakeProvider.setFailure('PROVIDER_UNAVAILABLE', 'Connection refused');
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId } = await createRes.json() as any;

    const res = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elementId: 'blue-stone' }),
    });

    assert.strictEqual(res.status, 503);
    const data = await res.json() as any;
    assert.strictEqual(data.error, 'PROVIDER_UNAVAILABLE');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/generate maps GENERATION_FAILED to 500', async () => {
  const fakeProvider = new FakeGenerationProvider();
  fakeProvider.setFailure('GENERATION_FAILED', 'Model returned HTTP 500');
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId } = await createRes.json() as any;

    const res = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elementId: 'blue-stone' }),
    });

    assert.strictEqual(res.status, 500);
    const data = await res.json() as any;
    assert.strictEqual(data.error, 'GENERATION_FAILED');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/generate maps INVALID_OUTPUT to 500', async () => {
  const fakeProvider = new FakeGenerationProvider();
  fakeProvider.setFailure('INVALID_OUTPUT', 'Invalid JSON payload');
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId } = await createRes.json() as any;

    const res = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elementId: 'blue-stone' }),
    });

    assert.strictEqual(res.status, 500);
    const data = await res.json() as any;
    assert.strictEqual(data.error, 'GENERATION_FAILED');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/generate corrects or falls back on invalid proposal', async () => {
  const fakeGenerator: GameplayGenerator = {
    generate: async (context) => createGameplayProposal(
      context.generationPurpose,
      context.sourceStateVersion,
      context.gameplayContext.contextualElements,
      ['invalid-flying-capability'],
      'Lumi attempts an unsupported action.',
    ),
  };
  const sessionStore = new SessionStore();
  const session = sessionStore.createSession({ generator: fakeGenerator });
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const res = await fetch(testServer.baseUrl + '/sessions/' + session.id + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elementId: 'blue-stone' }),
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json() as any;

    // Proposal was invalid due to invalid capability; Game Core resolved via correction or fallback
    assert.ok(data.resolution.acceptedFrom === 'corrected' || data.resolution.acceptedFrom === 'fallback');
    assert.ok(data.acceptedContext.narrative);
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/generate rejects invalid contextual element with 400', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId } = await createRes.json() as any;

    const res = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contextualElement: {
          id: 'bad-element',
          category: 'invalid_category_not_supported',
          attributes: [],
        },
      }),
    });

    assert.strictEqual(res.status, 400);
    const data = await res.json() as any;
    assert.strictEqual(data.error, 'INVALID_CONTEXTUAL_ELEMENT');
  } finally {
    await testServer.close();
  }
});