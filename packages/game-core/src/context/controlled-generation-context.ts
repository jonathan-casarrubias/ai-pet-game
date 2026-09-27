import type { GameplayContext } from './gameplay-context.js';

export type GenerationPurpose = string;

export type RelevantGenerationState = Readonly<{
  pet: Readonly<{
    name: string;
    interactionCount: number;
  }>;
}>;

export type GenerationBoundaries = Readonly<{
  safety: 'game-core-enforced';
  domain: 'game-core-enforced';
  data: 'purpose-scoped';
}>;

export type ControlledGenerationContext = Readonly<{
  generationPurpose: GenerationPurpose;
  relevantState: RelevantGenerationState;
  gameplayContext: GameplayContext;
  boundaries: GenerationBoundaries;
}>;

const generationBoundaries: GenerationBoundaries = Object.freeze({
  safety: 'game-core-enforced',
  domain: 'game-core-enforced',
  data: 'purpose-scoped',
});

export function createControlledGenerationContext(
  generationPurpose: GenerationPurpose,
  relevantState: RelevantGenerationState,
  gameplayContext: GameplayContext,
): ControlledGenerationContext {
  return Object.freeze({
    generationPurpose,
    relevantState: Object.freeze({
      pet: Object.freeze({
        name: relevantState.pet.name,
        interactionCount: relevantState.pet.interactionCount,
      }),
    }),
    gameplayContext,
    boundaries: generationBoundaries,
  });
}