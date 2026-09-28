/**
 * Presentation Mapper -- derives PresentationModel from authoritative GameState.
 * No game rules live here -- only presentation derivation logic.
 */
import type { GameState, GenerateContext } from '../api/runtime-client';
import type { PresentationModel, PetVisualState, ObjectVisualState, SceneObject } from './presentation-model';

export function mapGameStateToPresentationModel(
  state: GameState,
  opts: {
    isGenerating?: boolean;
    lastError?: string | null;
    activeNarrative?: string | null;
    acceptedContext?: GenerateContext | null;
  } = {},
): PresentationModel {
  const { isGenerating = false, lastError = null } = opts;

  let petVisualState: PetVisualState = 'idle';
  if (isGenerating) {
    petVisualState = 'curious';
  } else if (opts.acceptedContext) {
    petVisualState = state.pet.interactionCount > 0 ? 'celebrating' : 'excited';
  } else if (state.pet.interactionCount > 0) {
    petVisualState = 'happy';
  }

  const blueStoneDiscovered = state.discoveries.includes('blue-stone');
  const blueStoneState: ObjectVisualState = blueStoneDiscovered ? 'discovered' : 'glowing';

  const objects: SceneObject[] = [
    {
      id: 'blue-stone',
      label: blueStoneDiscovered ? 'Blue Stone' : 'Mysterious Stone',
      visualState: blueStoneState,
      isInteractable: true,
    },
  ];

  if (opts.acceptedContext?.activityId && opts.acceptedContext.activityId !== 'blue-stone') {
    const alreadyPresent = objects.some((o) => o.id === opts.acceptedContext?.activityId);
    if (!alreadyPresent) {
      objects.push({
        id: opts.acceptedContext.activityId,
        label: opts.acceptedContext.activityId,
        visualState: 'appearing',
        isInteractable: false,
      });
    }
  }

  return {
    background: 'meadow',
    petVisualState,
    petName: state.pet.name,
    petInteractionCount: state.pet.interactionCount,
    objects,
    discoveries: state.discoveries,
    activeNarrative: opts.acceptedContext?.narrative ?? opts.activeNarrative ?? null,
    isGenerating,
    lastError,
  };
}
