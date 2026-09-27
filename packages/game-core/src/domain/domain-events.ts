export type DomainEvent =
  | Readonly<{
      type: 'pet_greeted';
      playerId: string;
      petId: string;
      interactionCount: number;
    }>
  | Readonly<{
      type: 'pet_question_asked';
      playerId: string;
      petId: string;
      interactionCount: number;
    }>
  | Readonly<{
      type: 'contextual_element_observed';
      capabilityId: 'observe';
      playerId: string;
      elementId: string;
    }>
  | Readonly<{
      type: 'discovery_made';
      capabilityId: 'explore';
      playerId: string;
      petId: string;
      elementId: string;
      interactionCount: number;
    }>;

export function freezeDomainEvent(event: DomainEvent): DomainEvent {
  return Object.freeze(event);
}
