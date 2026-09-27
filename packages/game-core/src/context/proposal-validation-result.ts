import type { AcceptedGameplayContext } from './gameplay-proposal.js';
import type { ProposalRejection } from './proposal-rejection.js';

export type ProposalValidationResult =
  | Readonly<{
      valid: true;
      context: AcceptedGameplayContext;
    }>
  | Readonly<{
      valid: false;
      rejection: ProposalRejection;
    }>;
