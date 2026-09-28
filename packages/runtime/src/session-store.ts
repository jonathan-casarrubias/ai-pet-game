import {
  GameCore,
  OllamaGenerationProvider,
  ProviderGameplayGenerator,
  createInitialGameState,
  createGameplayProposal,
  type GenerationProvider,
  type GameplayGenerator,
  type ProposalCorrector,
  type CorrectionAttempt,
  type GameplayProposal,
  type GameState,
} from '@ai-pet-game/game-core';

export class DefaultProposalCorrector implements ProposalCorrector {
  public correct(attempt: CorrectionAttempt): GameplayProposal {
    const { controlledContext, original } = attempt;
    const applicable = controlledContext.gameplayContext.applicableCapabilityIds;
    const activityId =
      original.activityId && applicable.includes(original.activityId)
        ? original.activityId
        : applicable[0];

    return createGameplayProposal(
      controlledContext.generationPurpose,
      controlledContext.sourceStateVersion,
      controlledContext.gameplayContext.contextualElements,
      applicable,
      original.narrative,
      activityId,
    );
  }
}

export interface Session {
  readonly id: string;
  readonly gameCore: GameCore;
  readonly generator: GameplayGenerator;
  readonly provider: GenerationProvider;
  readonly corrector: ProposalCorrector;
  readonly createdAt: Date;
  lastAccessedAt: Date;
}

export interface SessionCreationOptions {
  petName?: string;
  provider?: GenerationProvider;
  generator?: GameplayGenerator;
  corrector?: ProposalCorrector;
}

export class SessionStore {
  private readonly sessions = new Map<string, Session>();
  private readonly defaultProvider: GenerationProvider | undefined;

  public constructor(defaultProvider?: GenerationProvider) {
    this.defaultProvider = defaultProvider;
  }

  public createSession(options?: SessionCreationOptions): Session {
    const id = crypto.randomUUID();
    const playerId = crypto.randomUUID();
    const petId = crypto.randomUUID();
    const petName = options?.petName?.trim() || 'Lumi';

    const initialState: GameState = createInitialGameState(
      { id: playerId },
      { id: petId, name: petName },
    );

    const gameCore = new GameCore(initialState);
    const provider =
      options?.provider ??
      this.defaultProvider ??
      new OllamaGenerationProvider();
    const generator =
      options?.generator ?? new ProviderGameplayGenerator(provider);
    const corrector = options?.corrector ?? new DefaultProposalCorrector();

    const session: Session = {
      id,
      gameCore,
      generator,
      provider,
      corrector,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };

    this.sessions.set(id, session);
    return session;
  }

  public getSession(id: string): Session | undefined {
    const session = this.sessions.get(id);
    if (session) {
      session.lastAccessedAt = new Date();
    }
    return session;
  }

  public deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  public clear(): void {
    this.sessions.clear();
  }
}