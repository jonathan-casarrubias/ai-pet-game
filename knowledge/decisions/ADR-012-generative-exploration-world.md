# ADR-012 — Generative Exploration World

**Status:** Accepted
**Date:** 2026-09-29

## Context

The AI Pet Game targets children approximately 3–9 years old and is designed as a virtual pet adventure with bounded AI conversations, adaptive personality, narrative adventures, mini-games, and incidental learning.

Current implementations (Slice #8) demonstrate a small vertical slice with spatial entities, player movement, threat/escape mechanics, and AI-generated consequences. However, the MVP prototype uses a fixed set of entities and a limited world representation.

The product vision requires a world that grows organically as players explore. The current bounded implementation is sufficient for validation, but the architecture must not constrain the conceptual size or content of the generated world to a predetermined finite set.

The distinction between **bounded implementation** and **unbounded generated content** is critical for the product's long-term viability and player engagement.

## Decision

The game world is **generative and emergent**, not predefined.

The implementation may support a simple exploration model in the current iteration, while the generated world content itself is not limited to a fixed catalog or predetermined sequence.

### 1. Implementation Scope Is Bounded; Generated World Content Is Not Predetermined

For the current iteration, the exploration model is intentionally simple:

**Web:**
- Arrow Up / Arrow Down for vertical exploration input
- Standard keyboard controls

**Mobile:**
- Swipe Up / Swipe Down for exploration progression

This interaction model provides:
- Limited movement mechanics
- Simple exploration progression
- No 360-degree navigation yet
- No physics engine
- No complex pathfinding
- No large-world streaming infrastructure

These are **implementation constraints for the current iteration only**. They do not constrain the conceptual size, content variety, or structure of the generated world.

### 2. The Generative World Model

World content emerges progressively from:

```text
Current GameState
        +
Player History
        +
Pet State / Personality
        +
Previous Discoveries
        +
Current Exploration Context
        ↓
   GenerationProvider
        ↓
  GameplayProposal
        ↓
 Game Core validation
        ↓
 authoritative GameState mutation
        ↓
 new exploration context
        ↓
 newly generated world content
```

The AI proposes content through the existing `GenerationProvider` → `GameplayProposal` → `Game Core validation` → `GameState mutation` pipeline.

The AI must never directly mutate authoritative world state. All content proposals pass through Game Core validation before affecting the game state.

### 3. World Content Types

Generated world content may include, subject to existing Game Core capabilities:

- Exploration spaces (locations, environments)
- Environmental elements (scenery, atmospheric features)
- Objects (items, collectibles, puzzles)
- Creatures (neutral, threat, helper roles)
- Hazards (obstacles, challenges)
- Helpers (guides, companions, allies)
- Discoveries (new content revealed through interaction)
- Encounters (narrative moments, events)
- Gameplay consequences (state changes, progression)

The specific schema for these concepts is deferred to implementation blocks as needed. The ADR establishes the architectural principle, not the concrete data model.

### 4. Player-Specific Worlds

Two players are not required to experience the same world. Generated content depends on bounded contextual information:

- Previous discoveries
- Exploration history
- Pet characteristics and personality
- Player actions and preferences
- Previous consequences
- Current gameplay state

This aligns with the existing history-aware generation architecture documented in ADR-007 (bounded generation, not bounded selection).

The goal is **meaningful gameplay divergence**, not merely random cosmetic variation. Different players should encounter different challenges, narratives, and discovery sequences based on their actions and the pet's evolving personality.

### 5. Current Exploration Model

The first implementation uses a deliberately simple exploration model:

```text
Player input
    ↓
Explore forward/backward
    ↓
Current exploration context
    ↓
Generated discovery/content
    ↓
Gameplay interaction
    ↓
Gameplay consequence
    ↓
Continue exploring
```

This model is sufficient for MVP validation while preserving the architectural flexibility for richer exploration models.

### 6. Future Evolution

The architecture must support progressive enrichment of the exploration model without requiring replacement of the generative world foundation.

Possible future evolution includes:

- 360-degree movement
- Lateral navigation
- Branching exploration paths
- Multiple connected generated locations
- Richer spatial navigation models
- Larger exploration spaces
- More sophisticated camera behavior

Future spatial complexity should **extend** the exploration model rather than require replacing the generative world architecture.

### 7. Visual Implications

The renderer must consume **runtime-generated world content** derived from authoritative `GameState`, not a hardcoded catalog of specific story entities.

This is consistent with ADR-011 (Dynamic Entity Representation and Rendering). The UI must not require entity-specific branching such as:

```ts
if (entity.id === "blue-stone") ...
```

instead, the visual layer should use generic presentation semantics driven by runtime-provided entity presentation information.

## Consequences

### Positive

- The world can grow organically as players explore without architectural limitations.
- Different players can have genuinely different experiences based on their history and choices.
- The architecture preserves Game Core authority over all state mutations.
- The AI remains bounded and untrusted, following the existing proposal validation contract.
- Future exploration models can be added incrementally without breaking the generative foundation.
- Content creation is decoupled from implementation constraints.

### Trade-offs

- A simple exploration model may feel limited compared to traditional open-world games.
- The generated world has no predetermined completion criteria at the architectural level.
- Testing requires understanding emergent behavior rather than fixed content paths.
- The initial MVP scope is intentionally small to validate the core concept.

These trade-offs are accepted because the product requires a fundamentally different approach to world design—one that grows with player interaction rather than delivering a fixed experience.

## Non-Goals

This ADR does NOT introduce:

- 360-degree movement
- Procedural terrain generation
- Infinite-world streaming infrastructure
- Physics engines
- Pathfinding systems
- Multiplayer features
- Persistence or database layer
- Authentication systems
- Cloud infrastructure dependencies
- A new game engine
- A new AI provider
- Unrestricted AI behavior
- Arbitrary AI-generated executable code

It also does not require the world to be literally infinite. The architectural principle is that the application does not predetermine the complete world size or content.

## Relationship to Existing ADRs

This ADR extends the consequences of:

- **ADR-001 — Game Core is authoritative**: Game Core validates all proposals and controls state mutations.
- **ADR-002 — AI is bounded**: AI proposes content but cannot create or mutate world state directly.
- **ADR-006 — AI/Core contract**: The controlled proposal contract governs all generative interactions.
- **ADR-007 — Bounded generation**: The AI generates novel content within constraints rather than selecting from a catalog.
- **ADR-008 — Provider-agnostic capabilities**: Any generation provider can produce world content through the same contract.
- **ADR-009 — MVP Runtime**: Anonymous in-memory sessions remain the deployment model.
- **ADR-010 — First Playable Adventure**: This ADR builds upon the adventure flow established in Block 9.
- **ADR-011 — Dynamic Entity Representation**: The UI renders runtime-generated content through generic presentation semantics.

## Architectural Invariants

1. **Game Core remains authoritative** over all state mutations.
2. **AI proposals are untrusted** and must pass validation before affecting game state.
3. **The world is not predetermined**—content emerges from player interaction and generation.
4. **Player-specific divergence is possible**—different players may experience different worlds.
5. **The exploration model is extendable**—future iterations can add complexity without architectural rework.
6. **Presentation is separate from gameplay semantics**—the renderer consumes generic presentation data.
7. **No hardcoded content catalogs**—the UI must not depend on specific entity identities.

## Validation Criterion

The architecture should ultimately demonstrate:

> A player can explore indefinitely, encountering new content that was not predefined by the application, with each discovery potentially leading to further unique content generation based on the player's history and the pet's evolving state.
