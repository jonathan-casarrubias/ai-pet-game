import type { ContextualElement } from './contextual-element.js';
import type { GameplayConsequence } from '../domain/gameplay-consequence.js';

export type GameplayProposal = Readonly<{
  generationPurpose: string;
  sourceStateVersion: number;
  contextualElements: readonly ContextualElement[];
  capabilityIds: readonly string[];
  narrative: string;
  activityId?: string;
  consequences?: readonly GameplayConsequence[];
}>;

export type AcceptedGameplayContext = Readonly<{
  gameplayContext: Readonly<{
    playerId: string;
    sourceStateVersion: number;
    contextualElements: readonly ContextualElement[];
    applicableCapabilityIds: readonly string[];
  }>;
  narrative: string;
  activityId?: string;
  consequences?: readonly GameplayConsequence[];
}>;

export function createGameplayProposal(
  generationPurpose: string,
  sourceStateVersion: number,
  contextualElements: readonly ContextualElement[],
  capabilityIds: readonly string[],
  narrative: string,
  activityId?: string,
  consequences?: readonly GameplayConsequence[],
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
    ...(activityId !== undefined ? { activityId } : {}),
    ...(consequences !== undefined
      ? { consequences: Object.freeze(
          consequences.map((c) => {
            if (c.type === 'change_entity_state') {
              return Object.freeze({ ...c });
            }
            if (c.type === 'spawn_entity') {
              return Object.freeze({
                ...c,
                entity: Object.freeze(c.entity),
              });
            }
            if (c.type === 'move_entity') {
              return Object.freeze({ ...c });
            }
            return Object.freeze(c);
          }),
        )}
      : {}),
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
  activityId?: string,
  consequences?: readonly GameplayConsequence[],
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
    ...(activityId !== undefined ? { activityId } : {}),
    ...(consequences !== undefined
      ? { consequences: Object.freeze(
          consequences.map((c) => {
            if (c.type === 'change_entity_state') {
              return Object.freeze({ ...c });
            }
            if (c.type === 'spawn_entity') {
              return Object.freeze({
                ...c,
                entity: Object.freeze(c.entity),
              });
            }
            if (c.type === 'move_entity') {
              return Object.freeze({ ...c });
            }
            return Object.freeze(c);
          }),
        )}
      : {}),
  });
}
