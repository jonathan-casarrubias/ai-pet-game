import type { GameplayContext } from './gameplay-context.js';

export type GenerationPurpose = string;

export type GenerationBoundaries = Readonly<{
  safety: 'game-core-enforced';
  domain: 'game-core-enforced';
  data: 'purpose-scoped';
}>;

export type ControlledGenerationContext = Readonly<{
  generationPurpose: GenerationPurpose;
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
  gameplayContext: GameplayContext,
): ControlledGenerationContext {
  return Object.freeze({
    generationPurpose,
    gameplayContext,
    boundaries: generationBoundaries,
  });
}
