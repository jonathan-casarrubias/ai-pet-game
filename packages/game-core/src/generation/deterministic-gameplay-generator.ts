import type { ControlledGenerationContext } from '../context/controlled-generation-context.js';
import {
  createGameplayProposal,
  type GameplayProposal,
} from '../context/gameplay-proposal.js';
import type { GameplayGenerator } from './gameplay-generator.js';

export class DeterministicGameplayGenerator implements GameplayGenerator {
  public async generate(
    context: ControlledGenerationContext,
  ): Promise<GameplayProposal> {
    const contextualElement = context.gameplayContext.contextualElements[0];

    const narrative =
      contextualElement === undefined
        ? `${context.relevantState.pet.name} is ready for a new adventure.`
        : `${context.relevantState.pet.name} notices the ${contextualElement.id}.`;

    return createGameplayProposal(
      context.generationPurpose,
      context.sourceStateVersion,
      context.gameplayContext.contextualElements,
      context.gameplayContext.applicableCapabilityIds,
      narrative,
    );
  }
}