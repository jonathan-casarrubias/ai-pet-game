import test from 'node:test';
import assert from 'node:assert/strict';

import {
  OllamaGenerationProvider,
  createOllamaConfig,
  type GenerationRequest,
  type GenerationResult,
} from '../src/index.js';

const BASE_URL = 'http://localhost:9999';
const MODEL = 'qwen3:8b';

function buildRequest(): GenerationRequest {
  return {
    generationPurpose: 'initial-adventure',
    sourceStateVersion: 0,
    relevantState: {
      pet: { name: 'Lumi', interactionCount: 0 },
      discoveryCount: 0,
      recentDiscoveries: [],
      escapedThreats: [],
    },
    contextualElements: [{ id: 'blue-stone', category: 'object', attributes: ['visible'] }],
    applicableCapabilityIds: ['observe', 'explore'],
  };
}

test('createOllamaConfig uses defaults when no overrides', () => {
  const config = createOllamaConfig();
  assert.strictEqual(config.baseUrl, 'http://localhost:11434');
  assert.strictEqual(config.model, 'qwen3:8b');
});

test('createOllamaConfig accepts explicit overrides', () => {
  const config = createOllamaConfig({ baseUrl: 'http://example.com', model: 'test-model' });
  assert.strictEqual(config.baseUrl, 'http://example.com');
  assert.strictEqual(config.model, 'test-model');
});

test('createOllamaConfig reads environment variables', async () => {
  const origBaseUrl = process.env['OLLAMA_BASE_URL'];
  const origModel = process.env['OLLAMA_MODEL'];
  try {
    process.env['OLLAMA_BASE_URL'] = 'http://env-host:1234';
    process.env['OLLAMA_MODEL'] = 'env-model';
    const config = createOllamaConfig();
    assert.strictEqual(config.baseUrl, 'http://env-host:1234');
    assert.strictEqual(config.model, 'env-model');
  } finally {
    if (origBaseUrl === undefined) delete process.env['OLLAMA_BASE_URL'];
    else process.env['OLLAMA_BASE_URL'] = origBaseUrl;
    if (origModel === undefined) delete process.env['OLLAMA_MODEL'];
    else process.env['OLLAMA_MODEL'] = origModel;
  }
});

async function withMockedFetch(
  provider: OllamaGenerationProvider,
  request: GenerationRequest,
  mockResponse: Response,
  captures: { url: string; body: string; method: string },
): Promise<GenerationResult> {
  const originalFetch = globalThis.fetch;
  captures.url = '';
  captures.body = '';
  captures.method = '';
  globalThis.fetch = async (url: string | URL | RequestInfo, init?: RequestInit) => {
    captures.url = url.toString();
    captures.method = init?.method ?? 'GET';
    if (init?.body) captures.body = init.body.toString();
    return mockResponse;
  };
  try {
    return await provider.generate(request);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test('OllamaGenerationProvider calls POST /api/generate with stream:false', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: '{"narrative":"hello"}' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(result.success);
  const body = JSON.parse(captures.body);
  assert.strictEqual(body.model, MODEL);
  assert.strictEqual(body.stream, false);
  assert.strictEqual(captures.url, `${BASE_URL}/api/generate`);
  assert.strictEqual(captures.method, 'POST');
});

test('OllamaGenerationProvider includes bounded request data in prompt', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: '{"narrative":"hello"}' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  await withMockedFetch(provider, request, mockResponse, captures);
  const body = JSON.parse(captures.body);
  assert.ok(body.prompt.includes('Lumi'));
  assert.ok(body.prompt.includes('initial-adventure'));
  assert.ok(body.prompt.includes('blue-stone'));
  assert.ok(body.prompt.includes('explore'));
  assert.ok(body.prompt.includes('observe'));
  assert.ok(!body.prompt.includes('version'), 'should not include game state version in prompt');
});

test('valid JSON response produces successful GenerationResult', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: JSON.stringify({ narrative: 'Lumi explores.' }) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(result.success);
  assert.strictEqual(result.narrative, 'Lumi explores.');
});

test('valid JSON response with activityId is preserved', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: JSON.stringify({ narrative: 'Lumi explores.', activityId: 'explore' }) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(result.success);
  assert.strictEqual(result.narrative, 'Lumi explores.');
  assert.strictEqual(result.activityId, 'explore');
});

test('valid JSON response without activityId omits it', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: JSON.stringify({ narrative: 'Lumi observes.' }) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(result.success);
  assert.strictEqual(result.activityId, undefined);
});

test('malformed JSON response returns INVALID_OUTPUT', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: 'not-json-at-all' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(!result.success);
  assert.strictEqual(result.error.code, 'INVALID_OUTPUT');
});

test('missing narrative field returns INVALID_OUTPUT', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: JSON.stringify({ activityId: 'explore' }) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(!result.success);
  assert.strictEqual(result.error.code, 'INVALID_OUTPUT');
});

test('empty narrative returns INVALID_OUTPUT', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: JSON.stringify({ narrative: '' }) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(!result.success);
  assert.strictEqual(result.error.code, 'INVALID_OUTPUT');
});

test('non-object JSON response returns INVALID_OUTPUT', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: JSON.stringify('just-a-string') }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(!result.success);
  assert.strictEqual(result.error.code, 'INVALID_OUTPUT');
});

test('activityId that is not a string returns INVALID_OUTPUT', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: JSON.stringify({ narrative: 'Hello', activityId: 123 }) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(!result.success);
  assert.strictEqual(result.error.code, 'INVALID_OUTPUT');
});

test('non-OK HTTP response returns GENERATION_FAILED', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response('Internal Server Error', { status: 500 });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(!result.success);
  assert.strictEqual(result.error.code, 'GENERATION_FAILED');
});

test('fetch failure returns PROVIDER_UNAVAILABLE', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('ECONNREFUSED'); };
  try {
    const result = await provider.generate(request);
    assert.ok(!result.success);
    assert.strictEqual(result.error.code, 'PROVIDER_UNAVAILABLE');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Ollama response missing "response" field returns INVALID_OUTPUT', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ other: 'field' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(!result.success);
  assert.strictEqual(result.error.code, 'INVALID_OUTPUT');
});

test('Ollama response with empty "response" string returns INVALID_OUTPUT', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: '' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(!result.success);
  assert.strictEqual(result.error.code, 'INVALID_OUTPUT');
});

test('provider does not infer activityId from narrative text', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({ response: JSON.stringify({ narrative: 'Lumi explore the blue stone.' }) }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(result.success);
  assert.strictEqual(result.activityId, undefined, 'activityId must not be inferred from narrative text');
});

test('Qwen3 thinking field is ignored and not exposed', async () => {
  const provider = new OllamaGenerationProvider({ baseUrl: BASE_URL, model: MODEL });
  const request = buildRequest();
  const captures = { url: '', body: '', method: '' };
  const mockResponse = new Response(JSON.stringify({
    response: JSON.stringify({ narrative: 'Lumi explores.', activityId: 'explore' }),
    thinking: 'I am thinking about the stone...',
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
  const result = await withMockedFetch(provider, request, mockResponse, captures);
  assert.ok(result.success);
  assert.strictEqual(result.narrative, 'Lumi explores.');
  assert.strictEqual(result.activityId, 'explore');
  assert.ok(!('thinking' in result));
});
