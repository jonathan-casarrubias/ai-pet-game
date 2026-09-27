export type PlayerIntent = Readonly<{
  playerId: string;
  type: string;
  question?: string;
}>;

export type ObservePlayerAction = Readonly<{
  playerId: string;
  type: 'observe';
  elementId: string;
}>;

export type PlayerAction = PlayerIntent | ObservePlayerAction;

const supportedIntentTypes = ['greet_pet', 'ask_pet_question'] as const;

export function isSupportedIntentType(
  type: string,
): type is (typeof supportedIntentTypes)[number] {
  return supportedIntentTypes.includes(
    type as (typeof supportedIntentTypes)[number],
  );
}

export function isValidPlayerAction(action: PlayerAction): boolean {
  if (
    typeof action !== 'object' ||
    action === null ||
    typeof action.playerId !== 'string' ||
    typeof action.type !== 'string'
  ) {
    return false;
  }

  return action.type === 'observe'
    ? 'elementId' in action &&
        typeof action.elementId === 'string' &&
        action.elementId.trim().length > 0
    : action.type !== 'ask_pet_question' ||
        (typeof action.question === 'string' &&
          action.question.trim().length > 0);
}

export function isObservePlayerAction(
  action: PlayerAction,
): action is ObservePlayerAction {
  return action.type === 'observe' && 'elementId' in action;
}
