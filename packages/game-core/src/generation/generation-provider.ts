import type { GenerationRequest } from './generation-request.js';
import type { GenerationResult } from './generation-result.js';

export interface GenerationProvider {
  generate(request: GenerationRequest): Promise<GenerationResult>;
}
