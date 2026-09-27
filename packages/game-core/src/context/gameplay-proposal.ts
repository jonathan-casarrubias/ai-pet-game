import type { ContextualElement } from './contextual-element.js';

export type GameplayProposal = Readonly<{
  generationPurpose: string;
  sourceStateVersion: number;
  contextualElements: readonly ContextualElement[];
  capabilityIds: readonly string[];
  narrative: string;
}>;

export type AcceptedGameplayContext = Readonly<{
  gameplayContext: Readonly<{
    playerId: string;
    sourceStateVersion: number;
    contextualElements: readonly ContextualElement[];
    applicableCapabilityIds: readonly string[];
  }>;
  narrative: string;
}>;

export function createGameplayProposal(
  generationPurpose: string,
  sourceStateVersion: number,
  contextualElements: readonly ContextualElement[],
  capabilityIds: readonly string[],
  narrative: string,
): GameplayProposal {
  return Object.freeze({
    generationPurpose,
    sourceStateVersion,
    contextualElements: Object.freeze(
      contextualElements.map((element) =>
        Object.freeze({
          id: element.id,
          category: element.category,
          attributes: Object.freeze([...element.attributes]),
        }),
      ),
    ),
    capabilityIds: Object.freeze([...capabilityIds]),
    narrative,
  });
}

export function createAcceptedGameplayContext(
  gameplayContext: Readonly<{
    playerId: string;
    sourceStateVersion: number;
    contextualElements: readonly ContextualElement[];
    applicableCapabilityIds: readonly string[];
  }>,
  narrative: string,
): AcceptedGameplayContext {
  return Object.freeze({
    gameplayContext: Object.freeze({
      playerId: gameplayContext.playerId,
      sourceStateVersion: gameplayContext.sourceStateVersion,
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
    narrative,
  });
}