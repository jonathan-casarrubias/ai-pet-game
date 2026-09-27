import type { ControlledGenerationContext } from '../context/controlled-generation-context.js';
import type { GameplayProposal } from '../context/gameplay-proposal.js';
import type { ProposalRejection } from '../context/proposal-rejection.js';

export type CorrectionAttempt = Readonly<{
  controlledContext: ControlledGenerationContext;
  original: GameplayProposal;
  rejection: ProposalRejection;
}>;

export interface ProposalCorrector {
  correct(attempt: CorrectionAttempt): GameplayProposal;
}
