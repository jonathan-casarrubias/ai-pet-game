import type { ContextualElement } from '../context/contextual-element.js';

export type GenerationRequest = Readonly<{
  generationPurpose: string;
  sourceStateVersion: number;
  relevantState: Readonly<{
    pet: Readonly<{
      name: string;
      interactionCount: number;
    }>;
    discoveryCount: number;
    recentDiscoveries: readonly string[];
  }>;
  contextualElements: readonly ContextualElement[];
  applicableCapabilityIds: readonly string[];
}>;

export function createGenerationRequest(
  generationPurpose: string,
  sourceStateVersion: number,
  relevantState: GenerationRequest['relevantState'],
  contextualElements: readonly ContextualElement[],
  applicableCapabilityIds: readonly string[],
): GenerationRequest {
  return Object.freeze({
    generationPurpose,
    sourceStateVersion,
    relevantState: Object.freeze({
      pet: Object.freeze({
        name: relevantState.pet.name,
        interactionCount: relevantState.pet.interactionCount,
      }),
      discoveryCount: relevantState.discoveryCount,
      recentDiscoveries: Object.freeze([...relevantState.recentDiscoveries]),
    }),
    contextualElements: Object.freeze(contextualElements),
    applicableCapabilityIds: Object.freeze([...applicableCapabilityIds]),
  });
}
