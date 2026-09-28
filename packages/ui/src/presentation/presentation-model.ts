/**
 * Presentation Model -- bridge between authoritative GameState and rendering.
 *
 * Derived from accepted gameplay; NOT authoritative state.
 * The renderer reads this model to determine what to draw.
 */

export type PetVisualState = 'idle' | 'excited' | 'curious' | 'happy' | 'celebrating';
export type ObjectVisualState = 'hidden' | 'appearing' | 'visible' | 'glowing' | 'discovered';
export type SceneBackground = 'meadow' | 'cave' | 'forest' | 'beach';

export type SceneObject = {
  readonly id: string;
  readonly label: string;
  readonly visualState: ObjectVisualState;
  readonly isInteractable: boolean;
};

export type PresentationModel = {
  readonly background: SceneBackground;
  readonly petVisualState: PetVisualState;
  readonly petName: string;
  readonly petInteractionCount: number;
  readonly objects: readonly SceneObject[];
  readonly discoveries: readonly string[];
  readonly activeNarrative: string | null;
  readonly isGenerating: boolean;
  readonly lastError: string | null;
};

export function createInitialPresentationModel(petName: string): PresentationModel {
  return {
    background: 'meadow',
    petVisualState: 'idle',
    petName,
    petInteractionCount: 0,
    objects: [
      { id: 'blue-stone', label: 'Mysterious Stone', visualState: 'glowing', isInteractable: true },
    ],
    discoveries: [],
    activeNarrative: null,
    isGenerating: false,
    lastError: null,
  };
}
