import type { ControlledGenerationContext } from '../context/controlled-generation-context.js';
import {
  createGameplayProposal,
  type GameplayProposal,
} from '../context/gameplay-proposal.js';
import type { GameplayGenerator } from './gameplay-generator.js';
import type { GenerationProvider } from './generation-provider.js';
import { createGenerationRequest } from './generation-request.js';

export class ProviderGameplayGenerator implements GameplayGenerator {
  public constructor(private readonly provider: GenerationProvider) {}

  public async generate(
    context: ControlledGenerationContext,
  ): Promise<GameplayProposal> {
    const request = createGenerationRequest(
      context.generationPurpose,
      context.sourceStateVersion,
      context.relevantState,
      context.gameplayContext.contextualElements,
      context.gameplayContext.applicableCapabilityIds,
    );

    const result = await this.provider.generate(request);

    if (!result.success) {
      throw new Error(
        `Generation provider failed: ${result.error.code} - ${result.error.message}`,
      );
    }

    return createGameplayProposal(
      context.generationPurpose,
      context.sourceStateVersion,
      context.gameplayContext.contextualElements,
      context.gameplayContext.applicableCapabilityIds,
      result.narrative,
      result.activityId,
    );
  }
}
