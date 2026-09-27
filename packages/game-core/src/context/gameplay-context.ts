import type { ContextualElement } from './contextual-element.js';

export type GameplayContext = Readonly<{
  playerId: string;
  sourceStateVersion: number;
  contextualElements: readonly ContextualElement[];
  applicableCapabilityIds: readonly string[];
}>;

export function createGameplayContext(
  playerId: string,
  sourceStateVersion: number,
  contextualElements: readonly ContextualElement[],
  applicableCapabilityIds: readonly string[],
): GameplayContext {
  const frozenContextualElements = Object.freeze(
    contextualElements.map((element) =>
      Object.freeze({
        id: element.id,
        category: element.category,
        attributes: Object.freeze([...element.attributes]),
      }),
    ),
  );

  return Object.freeze({
    playerId,
    sourceStateVersion,
    contextualElements: frozenContextualElements,
    applicableCapabilityIds: Object.freeze([...applicableCapabilityIds]),
  });
}
