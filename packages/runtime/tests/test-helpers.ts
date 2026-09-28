import type {
  GenerationProvider,
  GenerationRequest,
  GenerationResult,
  GenerationError,
} from '@ai-pet-game/game-core';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { Express } from 'express';

export class FakeGenerationProvider implements GenerationProvider {
  public lastRequest: GenerationRequest | undefined;
  public cannedResult: GenerationResult | undefined;

  public constructor(defaultResult?: GenerationResult) {
    this.cannedResult = defaultResult;
  }

  public async generate(request: GenerationRequest): Promise<GenerationResult> {
    this.lastRequest = request;

    if (this.cannedResult) {
      return this.cannedResult;
    }

    const activityId = request.applicableCapabilityIds[0] ?? 'explore';

    return {
      success: true,
      narrative: request.relevantState.pet.name + ' is curious about the surroundings.',
      activityId,
    };
  }

  public setFailure(code: GenerationError['code'], message: string): void {
    this.cannedResult = {
      success: false,
      error: { code, message },
    };
  }

  public setSuccess(narrative: string, activityId?: string): void {
    this.cannedResult = {
      success: true,
      narrative,
      ...(activityId !== undefined ? { activityId } : {}),
    };
  }
}

export interface TestServer {
  readonly server: Server;
  readonly baseUrl: string;
  close(): Promise<void>;
}

export async function startTestServer(app: Express): Promise<TestServer> {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const address = server.address() as AddressInfo;
      const baseUrl = 'http://127.0.0.1:' + address.port;
      resolve({
        server,
        baseUrl,
        close: () =>
          new Promise<void>((closeResolve, closeReject) => {
            server.close((err) => {
              if (err) closeReject(err);
              else closeResolve();
            });
          }),
      });
    });
  });
}