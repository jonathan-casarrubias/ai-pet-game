/**
 * Presentation Model -- bridge between authoritative GameState and rendering.
 *
 * Derived from accepted gameplay; NOT authoritative state.
 * The renderer reads this model to determine what to draw.
 */

export type PetVisualState = 'idle' | 'excited' | 'curious' | 'happy' | 'celebrating';

export type SceneEntity = {
  readonly id: string;
  readonly label: string;
  readonly type: 'object' | 'creature' | 'hazard';
  readonly role: 'neutral' | 'threat' | 'helper';
  readonly state: 'visible' | 'glowing' | 'discovered' | 'active' | 'escaped';
  readonly position: { readonly x: number; readonly y: number };
  readonly interactionRadius: number;
  readonly isNearby: boolean;
  readonly isEscapedThreat: boolean;
};

export type PresentationModel = {
  readonly petVisualState: PetVisualState;
  readonly petName: string;
  readonly petInteractionCount: number;
  readonly playerPosition: { readonly x: number; readonly y: number };
  readonly worldBounds: {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
  };
  readonly entities: readonly SceneEntity[];
  readonly discoveries: readonly string[];
  readonly activeNarrative: string | null;
  readonly statusMessage: string | null;
  readonly isGenerating: boolean;
  readonly lastError: string | null;
};
