import { canObserveContextualElement } from '../context/contextual-element.js';
import type { CapabilityDefinition } from './capability.js';

export const exploreCapability: CapabilityDefinition = Object.freeze({
  id: 'explore',
  isApplicable: ({ contextualElement }) =>
    contextualElement !== undefined &&
    canObserveContextualElement(contextualElement),
});
