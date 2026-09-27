import type {
  CapabilityApplicability,
  CapabilityContext,
  CapabilityDefinition,
} from './capability.js';
import { observeCapability } from './observe.js';

export class CapabilitySpace {
  #capabilities: readonly CapabilityDefinition[];

  public constructor(capabilities: readonly CapabilityDefinition[]) {
    const capabilityIds = new Set<string>();

    this.#capabilities = Object.freeze(
      capabilities.map((capability) => {
        if (capabilityIds.has(capability.id)) {
          throw new Error(`Duplicate capability id: ${capability.id}`);
        }

        capabilityIds.add(capability.id);
        return Object.freeze({ ...capability });
      }),
    );
  }

  public getSupportedCapabilities(): readonly CapabilityDefinition[] {
    return this.#capabilities;
  }

  public find(capabilityId: string): CapabilityDefinition | undefined {
    return this.#capabilities.find((capability) => capability.id === capabilityId);
  }

  public evaluateApplicability(
    capabilityId: string,
    context: CapabilityContext,
  ): CapabilityApplicability {
    const capability = this.find(capabilityId);

    if (capability === undefined) {
      return {
        applicable: false,
        capabilityId,
        reason: 'unavailable',
      };
    }

    if (!capability.isApplicable(context)) {
      return {
        applicable: false,
        capabilityId,
        reason: 'inapplicable',
      };
    }

    return {
      applicable: true,
      capability,
    };
  }
}

export function createDefaultCapabilitySpace(): CapabilitySpace {
  return new CapabilitySpace([observeCapability]);
}
