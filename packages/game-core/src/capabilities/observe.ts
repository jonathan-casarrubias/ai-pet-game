import { canObserveContextualElement } from '../context/contextual-element.js';
import type { CapabilityDefinition } from './capability.js';

export const observeCapability: CapabilityDefinition = Object.freeze({
  id: 'observe',
  isApplicable: ({ contextualElement }) =>
    contextualElement !== undefined &&
    canObserveContextualElement(contextualElement),
});
