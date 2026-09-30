import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GameCore,
  freezeGameState,
  type SpatialEntity,
} from '@ai-pet-game/game-core';
import { createApp } from '../src/app.js';
import { SessionStore } from '../src/session-store.js';
import { FakeGenerationProvider, startTestServer } from './test-helpers.js';

function seedEntity(
  sessionStore: SessionStore,
  sessionId: string,
  entity: SpatialEntity,
): void {
  const session = sessionStore.getSession(sessionId);
  assert.ok(session);

  const state = session.gameCore.getState();
  Object.defineProperty(session, 'gameCore', {
    value: new GameCore(
      freezeGameState({
        ...state,
        world: {
          ...state.world,
          entities: {
            ...state.world.entities,
            [entity.id]: entity,
          },
        },
      }),
    ),
  });
}

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

test('POST /sessions/:sessionId/actions moves the player through Game Core', async () => {
  const sessionStore = new SessionStore(new FakeGenerationProvider());
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId, state } = await createRes.json() as any;
    const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'move',
        position: { x: 215, y: 200 },
        playerId: state.player.id,
      }),
    });

    assert.strictEqual(actionRes.status, 200);
    const actionData = await actionRes.json() as any;
    assert.strictEqual(actionData.accepted, true);
    assert.deepStrictEqual(actionData.state.world.playerPos, { x: 215, y: 200 });
    assert.strictEqual(actionData.state.version, 1);
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions rejects malformed move positions', async () => {
  const sessionStore = new SessionStore(new FakeGenerationProvider());
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId } = await createRes.json() as any;
    const payloads = [
      { type: 'move' },
      { type: 'move', position: { x: '215', y: 200 } },
      { type: 'move', position: { x: 215 } },
    ];

    for (const payload of payloads) {
      const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(actionRes.status, 400);
      const actionData = await actionRes.json() as any;
      assert.strictEqual(actionData.error, 'INVALID_ACTION');
    }
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions delegates out-of-bounds movement to Game Core', async () => {
  const sessionStore = new SessionStore(new FakeGenerationProvider());
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId, state } = await createRes.json() as any;
    const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'move',
        position: { x: -1, y: 200 },
        playerId: state.player.id,
      }),
    });

    assert.strictEqual(actionRes.status, 400);
    const actionData = await actionRes.json() as any;
    assert.strictEqual(actionData.accepted, false);
    assert.strictEqual(actionData.rejectionReason, 'invalid_intent');
    assert.deepStrictEqual(actionData.state.world.playerPos, { x: 200, y: 200 });
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions accepts an in-range interaction through Game Core', async () => {
  const sessionStore = new SessionStore(new FakeGenerationProvider());
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId, state } = await createRes.json() as any;
    seedEntity(sessionStore, sessionId, {
      id: 'ancient-stone',
      type: 'object',
      label: 'Ancient Stone',
      position: { x: 210, y: 200 },
      state: 'visible',
      interactionRadius: 20,
    });
    const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'interact',
        entityId: 'ancient-stone',
        playerId: state.player.id,
      }),
    });

    assert.strictEqual(actionRes.status, 200);
    const actionData = await actionRes.json() as any;
    assert.strictEqual(actionData.accepted, true);
    assert.strictEqual(actionData.state.version, 1);
    assert.strictEqual(actionData.events[0].type, 'entity_interacted');
    assert.strictEqual(actionData.events[0].entityId, 'ancient-stone');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions delegates out-of-range interaction to Game Core', async () => {
  const sessionStore = new SessionStore(new FakeGenerationProvider());
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId, state } = await createRes.json() as any;
    seedEntity(sessionStore, sessionId, {
      id: 'distant-stone',
      type: 'object',
      label: 'Distant Stone',
      position: { x: 300, y: 200 },
      state: 'visible',
      interactionRadius: 20,
    });
    const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'interact',
        entityId: 'distant-stone',
        playerId: state.player.id,
      }),
    });

    assert.strictEqual(actionRes.status, 400);
    const actionData = await actionRes.json() as any;
    assert.strictEqual(actionData.accepted, false);
    assert.strictEqual(actionData.rejectionReason, 'inapplicable_action');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions delegates unknown and inactive interactions to Game Core', async () => {
  const sessionStore = new SessionStore(new FakeGenerationProvider());
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId, state } = await createRes.json() as any;
    seedEntity(sessionStore, sessionId, {
      id: 'discovered-stone',
      type: 'object',
      label: 'Discovered Stone',
      position: { x: 210, y: 200 },
      state: 'discovered',
      interactionRadius: 20,
    });

    for (const entityId of ['missing-stone', 'discovered-stone']) {
      const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'interact',
          entityId,
          playerId: state.player.id,
        }),
      });
      assert.strictEqual(actionRes.status, 400);
      const actionData = await actionRes.json() as any;
      assert.strictEqual(actionData.accepted, false);
      assert.strictEqual(actionData.rejectionReason, 'inapplicable_action');
    }
  } finally {
    await testServer.close();
  }
});

test('POST /sessions/:sessionId/actions rejects malformed interact entity IDs', async () => {
  const sessionStore = new SessionStore(new FakeGenerationProvider());
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const { sessionId } = await createRes.json() as any;
    const payloads = [
      { type: 'interact' },
      { type: 'interact', entityId: '' },
      { type: 'interact', entityId: '   ' },
    ];

    for (const payload of payloads) {
      const actionRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.strictEqual(actionRes.status, 400);
      const actionData = await actionRes.json() as any;
      assert.strictEqual(actionData.error, 'INVALID_ACTION');
    }
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