export type ProposalRejectionCode =
  | 'INVALID_PURPOSE'
  | 'STALE_STATE_VERSION'
  | 'PET_MISMATCH'
  | 'UNSUPPORTED_CONTEXTUAL_ELEMENT'
  | 'INVALID_CAPABILITY'
  | 'INVALID_CONSEQUENCE';

export type ProposalRejection = Readonly<{
  code: ProposalRejectionCode;
  message: string;
  applicableCapabilityIds: readonly string[];
}>;

export function createProposalRejection(
  code: ProposalRejectionCode,
  message: string,
  applicableCapabilityIds: readonly string[],
): ProposalRejection {
  return Object.freeze({
    code,
    message,
    applicableCapabilityIds: Object.freeze([...applicableCapabilityIds]),
  });
}
