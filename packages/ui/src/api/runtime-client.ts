/**
 * Typed HTTP client for the Slice #6 MVP Runtime.
 *
 * This is the only place in the UI that knows about HTTP transport.
 * Components never call fetch directly.
 */

export type Player = { id: string };

export type Pet = {
  id: string;
  name: string;
  interactionCount: number;
};

export type GameState = {
  player: Player;
  pet: Pet;
  version: number;
  discoveries: string[];
};

export type SessionCreatedResponse = {
  sessionId: string;
  state: GameState;
};

export type StateResponse = { state: GameState };

export type DomainEvent = { type: string; [key: string]: unknown };

export type ActionResponse = {
  accepted: boolean;
  rejectionReason?: string;
  state: GameState;
  events: DomainEvent[];
};

export type GenerateContext = {
  narrative: string;
  activityId?: string;
  contextualElements: unknown[];
  applicableCapabilityIds: string[];
};

export type GenerateResponse = {
  accepted?: boolean;
  resolution?: { acceptedFrom: string };
  proposal?: { narrative: string; activityId?: string };
  acceptedContext?: GenerateContext;
  context?: GenerateContext;
  state: GameState;
};

export type RuntimeClientConfig = { baseUrl: string };

export class RuntimeClient {
  private readonly baseUrl: string;

  public constructor(config: RuntimeClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
  }

  public async createSession(petName?: string): Promise<SessionCreatedResponse> {
    const res = await fetch(`${this.baseUrl}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(petName ? { petName } : {}),
    });
    if (!res.ok) throw new Error(`Failed to create session: ${res.status}`);
    return res.json() as Promise<SessionCreatedResponse>;
  }

  public async getState(sessionId: string): Promise<StateResponse> {
    const res = await fetch(`${this.baseUrl}/sessions/${sessionId}/state`);
    if (!res.ok) throw new Error(`Failed to get state: ${res.status}`);
    return res.json() as Promise<StateResponse>;
  }

  public async generate(
    sessionId: string,
    elementId: string,
    purpose = 'adventure_narrative',
  ): Promise<GenerateResponse> {
    const res = await fetch(`${this.baseUrl}/sessions/${sessionId}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        purpose,
        elementId,
        contextualElement: {
          id: elementId,
          category: 'object',
          attributes: ['visible', 'glowing', 'mysterious'],
        },
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string; message?: string };
      throw new Error(body.message ?? body.error ?? `Generation failed: ${res.status}`);
    }
    return res.json() as Promise<GenerateResponse>;
  }

  public async submitAction(
    sessionId: string,
    action: { type: string; elementId?: string },
  ): Promise<ActionResponse> {
    const res = await fetch(`${this.baseUrl}/sessions/${sessionId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action),
    });
    if (!res.ok) throw new Error(`Action failed: ${res.status}`);
    return res.json() as Promise<ActionResponse>;
  }
}
