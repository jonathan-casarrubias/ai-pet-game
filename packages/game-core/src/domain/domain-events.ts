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
    }>
  | Readonly<{
      type: 'pet_moved';
      playerId: string;
      petId: string;
      position: { x: number; y: number };
    }>
  | Readonly<{
      type: 'pet_escaped_threat';
      playerId: string;
      petId: string;
      threatEntityId: string;
    }>
  | Readonly<{
      type: 'entity_interacted';
      playerId: string;
      petId: string;
      entityId: string;
    }>
  | Readonly<{
      type: 'blue_stone_discovered';
      playerId: string;
      petId: string;
      entityId: 'blue-stone';
    }>;

export function freezeDomainEvent(event: DomainEvent): DomainEvent {
  return Object.freeze(event);
}
