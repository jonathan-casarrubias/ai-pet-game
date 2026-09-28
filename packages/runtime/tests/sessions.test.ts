import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { SessionStore } from '../src/session-store.js';
import { FakeGenerationProvider, startTestServer } from './test-helpers.js';

test('POST /sessions creates anonymous session with default Lumi pet', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const res = await fetch(testServer.baseUrl + '/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json() as any;

    assert.ok(data.sessionId);
    assert.strictEqual(typeof data.sessionId, 'string');
    assert.ok(data.state);
    assert.strictEqual(data.state.version, 0);
    assert.strictEqual(data.state.pet.name, 'Lumi');
    assert.strictEqual(data.state.pet.interactionCount, 0);
    assert.deepStrictEqual(data.state.discoveries, []);
    assert.ok(data.state.player.id);
  } finally {
    await testServer.close();
  }
});

test('POST /sessions accepts custom petName', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const res = await fetch(testServer.baseUrl + '/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petName: 'Sprout' }),
    });

    assert.strictEqual(res.status, 201);
    const data = await res.json() as any;

    assert.strictEqual(data.state.pet.name, 'Sprout');
  } finally {
    await testServer.close();
  }
});

test('POST /sessions produces distinct session IDs for separate sessions', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const res1 = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const data1 = await res1.json() as any;

    const res2 = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const data2 = await res2.json() as any;

    assert.notStrictEqual(data1.sessionId, data2.sessionId);
  } finally {
    await testServer.close();
  }
});

test('GET /sessions/:sessionId/state returns current state for existing session', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const createRes = await fetch(testServer.baseUrl + '/sessions', { method: 'POST' });
    const createData = await createRes.json() as any;
    const sessionId = createData.sessionId;

    const stateRes = await fetch(testServer.baseUrl + '/sessions/' + sessionId + '/state');
    assert.strictEqual(stateRes.status, 200);

    const stateData = await stateRes.json() as any;
    assert.ok(stateData.state);
    assert.strictEqual(stateData.state.version, 0);
    assert.strictEqual(stateData.state.pet.name, 'Lumi');
    assert.strictEqual(stateData.state.player.id, createData.state.player.id);
  } finally {
    await testServer.close();
  }
});

test('GET /sessions/:sessionId/state returns 404 for unknown session', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    const res = await fetch(testServer.baseUrl + '/sessions/non-existent-session-id/state');
    assert.strictEqual(res.status, 404);

    const data = await res.json() as any;
    assert.strictEqual(data.error, 'SESSION_NOT_FOUND');
  } finally {
    await testServer.close();
  }
});