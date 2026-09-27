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

    let narrative: string;

    if (contextualElement === undefined) {
      narrative = `${context.relevantState.pet.name} is ready for a new adventure.`;
    } else if (context.generationPurpose === 'initial_gameplay') {
      narrative = `${context.relevantState.pet.name} notices the ${contextualElement.id} and feels curious about it.`;
    } else if (context.generationPurpose === 'subsequent_gameplay') {
      narrative = `${context.relevantState.pet.name} remembers the ${contextualElement.id} and wonders what else it might reveal.`;
    } else {
      narrative = `${context.relevantState.pet.name} notices the ${contextualElement.id}.`;
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
