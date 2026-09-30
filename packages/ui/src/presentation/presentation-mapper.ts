/**
 * Presentation Mapper -- derives PresentationModel from authoritative GameState.
 * No game rules live here -- only presentation derivation logic.
 */
import type { GameState, GenerateContext } from '../api/runtime-client';
import type { PresentationModel, PetVisualState, SceneEntity } from './presentation-model';

export function mapGameStateToPresentationModel(
  state: GameState,
  opts: {
    isGenerating?: boolean;
    lastError?: string | null;
    activeNarrative?: string | null;
    statusMessage?: string | null;
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

  const entities: SceneEntity[] = Object.values(state.world.entities).map((entity) => {
    const distance = Math.hypot(
      state.world.playerPos.x - entity.position.x,
      state.world.playerPos.y - entity.position.y,
    );
    return {
      id: entity.id,
      label: entity.label,
      type: entity.type,
      role: entity.role ?? 'neutral',
      state: entity.state,
      position: entity.position,
      interactionRadius: entity.interactionRadius,
      isNearby: distance <= entity.interactionRadius,
      isEscapedThreat: state.escapedThreats.includes(entity.id),
    };
  });

  return {
    petVisualState,
    petName: state.pet.name,
    petInteractionCount: state.pet.interactionCount,
    playerPosition: state.world.playerPos,
    worldBounds: state.world.bounds,
    entities,
    discoveries: state.discoveries,
    activeNarrative: opts.acceptedContext?.narrative ?? opts.activeNarrative ?? null,
    statusMessage: opts.statusMessage ?? null,
    isGenerating,
    lastError,
  };
}
