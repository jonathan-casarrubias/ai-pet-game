import type { ContextualElement } from './contextual-element.js';

export type GenerationPurpose = string;

export type RelevantGenerationState = Readonly<{
  pet: Readonly<{
    name: string;
    interactionCount: number;
  }>;
  discoveryCount: number;
  recentDiscoveries: readonly string[];
}>;

export type GenerationGameplayContext = Readonly<{
  contextualElements: readonly ContextualElement[];
  applicableCapabilityIds: readonly string[];
}>;

export type GenerationBoundaries = Readonly<{
  safety: 'game-core-enforced';
  domain: 'game-core-enforced';
  data: 'purpose-scoped';
}>;

export type ControlledGenerationContext = Readonly<{
  generationPurpose: GenerationPurpose;
  sourceStateVersion: number;
  relevantState: RelevantGenerationState;
  gameplayContext: GenerationGameplayContext;
  boundaries: GenerationBoundaries;
}>;

const generationBoundaries: GenerationBoundaries = Object.freeze({
  safety: 'game-core-enforced',
  domain: 'game-core-enforced',
  data: 'purpose-scoped',
});

export function createControlledGenerationContext(
  generationPurpose: GenerationPurpose,
  sourceStateVersion: number,
  relevantState: RelevantGenerationState,
  gameplayContext: GenerationGameplayContext,
): ControlledGenerationContext {
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
    gameplayContext: Object.freeze({
      contextualElements: Object.freeze(
        gameplayContext.contextualElements.map((element) =>
          Object.freeze({
            id: element.id,
            category: element.category,
            attributes: Object.freeze([...element.attributes]),
          }),
        ),
      ),
      applicableCapabilityIds: Object.freeze([
        ...gameplayContext.applicableCapabilityIds,
      ]),
    }),
    boundaries: generationBoundaries,
  });
}
