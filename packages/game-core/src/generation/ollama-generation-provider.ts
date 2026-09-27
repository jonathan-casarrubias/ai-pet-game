import type { GenerationProvider } from './generation-provider.js';
import type { GenerationRequest } from './generation-request.js';
import type { GenerationResult, GenerationError } from './generation-result.js';

const DEFAULT_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'qwen3:8b';

export type OllamaConfig = Readonly<{
  baseUrl: string;
  model: string;
}>;

export function createOllamaConfig(
  overrides?: Partial<OllamaConfig>,
): OllamaConfig {
  const baseUrl =
    overrides?.baseUrl ??
    process.env['OLLAMA_BASE_URL'] ??
    DEFAULT_BASE_URL;
  const model =
    overrides?.model ??
    process.env['OLLAMA_MODEL'] ??
    DEFAULT_MODEL;

  return Object.freeze({ baseUrl, model });
}

export class OllamaGenerationProvider implements GenerationProvider {
  private readonly config: OllamaConfig;

  public constructor(config?: OllamaConfig) {
    this.config = createOllamaConfig(config);
  }

  public async generate(
    request: GenerationRequest,
  ): Promise<GenerationResult> {
    const prompt = buildPrompt(request);

    try {
      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        return errorResult('GENERATION_FAILED', `Ollama HTTP ${response.status}`);
      }

      const body = await response.json();

      if (
        body === null ||
        body === undefined ||
        typeof body !== 'object' ||
        typeof body.response !== 'string' ||
        body.response.trim().length === 0
      ) {
        return errorResult('INVALID_OUTPUT', 'Ollama returned no narrative content');
      }

      const parsed = parseModelOutput(body.response);

      if (!parsed.success) {
        return parsed;
      }

      return {
        success: true,
        narrative: parsed.narrative,
        ...(parsed.activityId !== undefined ? { activityId: parsed.activityId } : {}),
      };
    } catch (cause) {
      return errorResult('PROVIDER_UNAVAILABLE', String(cause));
    }
  }
}

type ParsedModelOutput =
  | Readonly<{ success: true; narrative: string; activityId?: string }>
  | Readonly<{ success: false; error: GenerationError }>;

function parseModelOutput(raw: string): ParsedModelOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return errorResult('INVALID_OUTPUT', 'Qwen3 response is not valid JSON');
  }

  if (parsed === null || typeof parsed !== 'object') {
    return errorResult('INVALID_OUTPUT', 'Qwen3 response is not a JSON object');
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.narrative !== 'string' || obj.narrative.trim().length === 0) {
    return errorResult('INVALID_OUTPUT', 'Qwen3 response missing non-empty narrative');
  }

  if (obj.activityId !== undefined && typeof obj.activityId !== 'string') {
    return errorResult('INVALID_OUTPUT', 'Qwen3 activityId is not a string');
  }

  return {
    success: true,
    narrative: obj.narrative.trim(),
    ...(obj.activityId !== undefined ? { activityId: obj.activityId } : {}),
  };
}

function buildPrompt(request: GenerationRequest): string {
  const {
    generationPurpose,
    relevantState,
    contextualElements,
    applicableCapabilityIds,
  } = request;

  const petName = relevantState.pet.name;
  const discoveryCount = relevantState.discoveryCount;
  const recentDiscoveries = relevantState.recentDiscoveries;

  const elementsDescription =
    contextualElements.length === 0
      ? 'no specific contextual element'
      : contextualElements
          .map((el) => `"${el.id}" (${el.category})`)
          .join(', ');

  const discoveriesContext =
    discoveryCount === 0
      ? 'This is the first discovery.'
      : `Previous discoveries: ${recentDiscoveries.join(', ')}.`;

  const capabilitiesContext =
    applicableCapabilityIds.length > 0
      ? `Allowed activityId values: ${JSON.stringify(applicableCapabilityIds)}.`
      : 'No activity types are available.';

  return [
    'You are generating a short gameplay proposal for a child\'s virtual pet game.',
    'Return ONLY a single JSON object with no surrounding text or markdown.',
    '',
    `Pet name: "${petName}".`,
    `Generation purpose: "${generationPurpose}".`,
    `Contextual element: ${elementsDescription}.`,
    discoveriesContext,
    capabilitiesContext,
    '',
    'RULES:',
    '- Output ONLY valid JSON: {"narrative": "...", "activityId": "..."}',
    '- "activityId" is optional; omit it if no activity is appropriate.',
    '- "narrative" must be one concise child-friendly sentence (max 20 words).',
    '- Do NOT invent new activity IDs or capabilities.',
    '- Do NOT invent game mechanics, rewards, or state mutations.',
    '- This output is an untrusted proposal; Game Core will validate it.',
    '',
    'JSON:',
  ].join('\n');
}

function errorResult(
  code: GenerationError['code'],
  message: string,
): GenerationResult {
  return {
    success: false,
    error: { code, message },
  };
}
