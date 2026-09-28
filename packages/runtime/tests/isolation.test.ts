import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { SessionStore } from '../src/session-store.js';
import { FakeGenerationProvider, startTestServer } from './test-helpers.js';

test('Session isolation: mutating Session A leaves Session B completely unchanged', async () => {
  const fakeProvider = new FakeGenerationProvider();
  const sessionStore = new SessionStore(fakeProvider);
  const app = createApp(sessionStore);
  const testServer = await startTestServer(app);

  try {
    // 1. Create Session A
    const resA = await fetch(testServer.baseUrl + '/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petName: 'Lumi-A' }),
    });
    const sessionA = await resA.json() as any;

    // 2. Create Session B
    const resB = await fetch(testServer.baseUrl + '/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ petName: 'Sprout-B' }),
    });
    const sessionB = await resB.json() as any;

    assert.notStrictEqual(sessionA.sessionId, sessionB.sessionId);
    assert.strictEqual(sessionA.state.pet.name, 'Lumi-A');
    assert.strictEqual(sessionB.state.pet.name, 'Sprout-B');

    // 3. Mutate Session A multiple times (greet and explore)
    await fetch(testServer.baseUrl + '/sessions/' + sessionA.sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'greet_pet',
        playerId: sessionA.state.player.id,
      }),
    });

    await fetch(testServer.baseUrl + '/sessions/' + sessionA.sessionId + '/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'explore',
        elementId: 'star-flower',
        playerId: sessionA.state.player.id,
      }),
    });

    // 4. Verify Session A has mutated
    const stateResA = await fetch(testServer.baseUrl + '/sessions/' + sessionA.sessionId + '/state');
    const stateDataA = await stateResA.json() as any;
    assert.strictEqual(stateDataA.state.version, 2);
    assert.strictEqual(stateDataA.state.pet.interactionCount, 2);
    assert.deepStrictEqual(stateDataA.state.discoveries, ['star-flower']);

    // 5. Verify Session B remains completely untouched
    const stateResB = await fetch(testServer.baseUrl + '/sessions/' + sessionB.sessionId + '/state');
    const stateDataB = await stateResB.json() as any;
    assert.strictEqual(stateDataB.state.version, 0);
    assert.strictEqual(stateDataB.state.pet.interactionCount, 0);
    assert.deepStrictEqual(stateDataB.state.discoveries, []);
    assert.strictEqual(stateDataB.state.pet.name, 'Sprout-B');
    assert.strictEqual(stateDataB.state.player.id, sessionB.state.player.id);
  } finally {
    await testServer.close();
  }
});