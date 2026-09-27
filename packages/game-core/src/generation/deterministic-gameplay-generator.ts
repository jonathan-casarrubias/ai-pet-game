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
    const hasExploreCapability = context.gameplayContext.applicableCapabilityIds.includes('explore');
    const activityId = hasExploreCapability ? 'explore' : undefined;
    const discoveryCount = context.relevantState.discoveryCount;
    const petName = context.relevantState.pet.name;

    let narrative: string;

    if (contextualElement === undefined) {
      narrative = `${petName} is ready for a new adventure.`;
    } else if (discoveryCount === 0) {
      narrative = `${petName} notices the ${contextualElement.id} and feels curious about it.`;
    } else {
      narrative = `${petName} remembers discovering the ${contextualElement.id} before and wonders what else it might reveal.`;
    }

    return createGameplayProposal(
      context.generationPurpose,
      context.sourceStateVersion,
      context.gameplayContext.contextualElements,
      context.gameplayContext.applicableCapabilityIds,
      narrative,
      activityId,
    );
  }
}
