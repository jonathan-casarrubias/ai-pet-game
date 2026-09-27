export type ContextualElement = Readonly<{
  id: string;
  category: string;
  attributes: readonly string[];
}>;

const supportedContextualElementCategories = new Set([
  'object',
  'creature',
  'plant',
  'phenomenon',
  'artifact',
]);

const supportedContextualElementAttributes = new Set(['visible', 'glowing']);

export function isSupportedContextualElement(
  element: unknown,
): element is ContextualElement {
  if (typeof element !== 'object' || element === null) {
    return false;
  }

  const candidate = element as {
    id?: unknown;
    category?: unknown;
    attributes?: unknown;
  };

  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.category === 'string' &&
    supportedContextualElementCategories.has(candidate.category) &&
    Array.isArray(candidate.attributes) &&
    candidate.attributes.every(
      (attribute) =>
        typeof attribute === 'string' &&
        supportedContextualElementAttributes.has(attribute),
    )
  );
}

export function canObserveContextualElement(
  element: unknown,
): boolean {
  return isSupportedContextualElement(element) &&
    element.attributes.includes('visible');
}
