import type { AcceptedGameplayContext } from './gameplay-proposal.js';

export type ProposalResolutionResult =
  | Readonly<{
      acceptedFrom: 'original';
      context: AcceptedGameplayContext;
    }>
  | Readonly<{
      acceptedFrom: 'corrected';
      context: AcceptedGameplayContext;
    }>
  | Readonly<{
      acceptedFrom: 'fallback';
      context: AcceptedGameplayContext;
    }>;
