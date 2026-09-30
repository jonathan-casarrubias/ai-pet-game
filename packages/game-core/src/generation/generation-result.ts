import type { GameplayConsequence } from '../domain/gameplay-consequence.js';

export type GenerationError =
  | Readonly<{
      code: 'PROVIDER_UNAVAILABLE';
      message: string;
    }>
  | Readonly<{
      code: 'GENERATION_FAILED';
      message: string;
    }>
  | Readonly<{
      code: 'INVALID_OUTPUT';
      message: string;
    }>;

export type GenerationResult =
  | Readonly<{
      success: true;
      narrative: string;
      activityId?: string;
      consequences?: readonly GameplayConsequence[];
    }>
  | Readonly<{
      success: false;
      error: GenerationError;
    }>;
