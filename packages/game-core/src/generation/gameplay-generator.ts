import type { ControlledGenerationContext } from '../context/controlled-generation-context.js';
import type { GameplayProposal } from '../context/gameplay-proposal.js';

export interface GameplayGenerator {
  generate(
    context: ControlledGenerationContext,
  ): Promise<GameplayProposal>;
}