import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { SessionStore } from '../src/session-store.js';
import { FakeGenerationProvider, startTestServer } from './test-helpers.js';

test('POST /sessions/:sessionId/actions handles greet_pet', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId, state } = await createRes.json() as any;

    const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'greet_pet',
        playerId: state.player.id,
      }),
    });

    assert.strictEqual(actionRes.status, 200);
    const actionData = await actionRes.json() as any;

    assert.strictEqual(actionData.accepted, true);
    assert.strictEqual(actionData.state.version, 1);
    assert.strictEqual(actionData.state.pet.interactionCount, 1);
    assert.strictEqual(actionData.events.length, 1);
    assert.strictEqual(actionData.events[0].type, 'pet_greeted');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions handles ask_pet_question', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId, state } = await createRes.json() as any;

    const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'ask_pet_question',
        question: 'Where should we go today?',
        playerId: state.player.id,
      }),
    });

    assert.strictEqual(actionRes.status, 200);
    const actionData = await actionRes.json() as any;

    assert.strictEqual(actionData.accepted, true);
    assert.strictEqual(actionData.state.version, 1);
    assert.strictEqual(actionData.state.pet.interactionCount, 1);
    assert.strictEqual(actionData.events.length, 1);
    assert.strictEqual(actionData.events[0].type, 'pet_question_asked');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions handles observe', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId, state } = await createRes.json() as any;

    const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'observe',
        elementId: 'blue-stone',
        playerId: state.player.id,
      }),
    });

    assert.strictEqual(actionRes.status, 200);
    const actionData = await actionRes.json() as any;

    assert.strictEqual(actionData.accepted, true);
    assert.strictEqual(actionData.state.version, 1);
    assert.strictEqual(actionData.events.length, 1);
    assert.strictEqual(actionData.events[0].type, 'contextual_element_observed');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions handles explore with authoritative state mutation', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId, state } = await createRes.json() as any;

    const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'explore',
        elementId: 'glowing-crystal',
        playerId: state.player.id,
      }),
    });

    assert.strictEqual(actionRes.status, 200);
    const actionData = await actionRes.json() as any;

    // Verify authoritative Game Core mutation
    assert.strictEqual(actionData.accepted, true);
    assert.strictEqual(actionData.state.version, 1);
    assert.strictEqual(actionData.state.pet.interactionCount, 1);
    assert.deepStrictEqual(actionData.state.discoveries, ['glowing-crystal']);
    assert.strictEqual(actionData.events.length, 1);
    assert.strictEqual(actionData.events[0].type, 'discovery_made');
    assert.strictEqual(actionData.events[0].elementId, 'glowing-crystal');

    // Verify subsequent GET returns the mutated authoritative state
    const stateRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/state');
    const stateData = await stateRes.json() as any;
    assert.strictEqual(stateData.state.version, 1);
    assert.strictEqual(stateData.state.pet.interactionCount, 1);
    assert.deepStrictEqual(stateData.state.discoveries, ['glowing-crystal']);
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions rejects player mismatch with 400', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId } = await createRes.json() as any;

    const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'greet_pet',
        playerId: 'wrong-player-id',
      }),
    });

    assert.strictEqual(actionRes.status, 400);
    const data = await actionRes.json() as any;
    assert.strictEqual(data.accepted, false);
    assert.strictEqual(data.rejectionReason, 'player_mismatch');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions rejects invalid payload with 400', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId } = await createRes.json() as any;

    const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing type
        somethingElse: 123,
      }),
    });

    assert.strictEqual(actionRes.status, 400);
    const data = await actionRes.json() as any;
    assert.strictEqual(data.error, 'INVALID_ACTION');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions returns 404 for nonexistent session', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const actionRes = await fetch(testServer.baseUrl + '/sessions/unknown-session/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'greet_pet',
      }),
    });

    assert.strictEqual(actionRes.status, 404);
    const data = await actionRes.json() as any;
    assert.strictEqual(data.error, 'SESSION_NOT_FOUND');
  } finally {
    await testServer.close();
  }
});