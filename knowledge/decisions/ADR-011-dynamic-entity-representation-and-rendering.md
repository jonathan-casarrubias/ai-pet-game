# ADR-011 — Dynamic Entity Representation and Rendering

**Status:** Accepted
**Date:** 2026-09-28

## Context

The AI Pet Game is designed to generate gameplay dynamically rather than relying on a predefined catalog of specific game entities.

The Game Core must remain content-agnostic. It must be able to represent and validate entities such as objects, creatures, hazards, threats, helpers, and other future entity concepts without containing hardcoded knowledge of specific content such as:

* blue rocks
* ants
* sharks
* wolves
* zombies
* fish
* leaves
* fairies
* or other specific game entities

The frontend currently contains entity-specific presentation logic, including hardcoded rendering for the blue rock introduced during the first playable adventure prototype.

This creates an architectural inconsistency:

```text
AI / Generation
      ↓
Generic Game Core
      ↓
Generic Runtime
      ↓
Hardcoded UI entities
```

If new AI-generated entities require frontend code changes, the system is not actually capable of dynamically generating new gameplay content.

The architecture therefore requires a clear separation between:

1. **Gameplay semantics** — authoritative Game Core information describing what an entity is allowed to do and how it participates in gameplay.
2. **Presentation semantics** — runtime-provided information that allows the UI to visually represent an entity without knowing that entity in advance.

## Decision

The system will use a **Dynamic Entity Representation and Rendering** architecture.

### 1. Game Core entities are content-agnostic

Game Core entities must represent generic gameplay concepts rather than specific game content.

Game Core may know generic classifications such as:

```text
object
creature
hazard
```

and generic gameplay roles such as:

```text
neutral
threat
helper
```

when those concepts are required by gameplay rules.

Game Core must not contain entity-specific knowledge such as:

```text
shark = threat
wolf = threat
fish = neutral
fairy = helper
blue-rock = object
```

unless such knowledge is explicitly required by a future domain rule and formally introduced through an architectural decision.

### 2. Gameplay role and entity type are separate concepts

Entity type and gameplay role represent different dimensions.

For example:

```text
type: creature
role: threat
```

may represent a shark, wolf, zombie, or another generated creature.

Similarly:

```text
type: creature
role: helper
```

may represent a generated companion or guide.

And:

```text
type: object
role: neutral
```

may represent a leaf, rock, lantern, or other generated object.

The Game Core validates the generic role and its allowed consequences. It does not need to understand the real-world meaning of the generated entity.

### 3. AI may select entity content and generic gameplay role

The AI generation layer may propose new entity content and generic gameplay roles as part of bounded gameplay generation.

For example:

```text
creature + threat + shark
creature + helper + forest spirit
object + neutral + fallen leaf
```

The AI proposal remains untrusted.

Game Core remains responsible for validating the proposal against the authoritative rules, capabilities, state, and supported generic gameplay semantics.

The AI must not directly execute behavior, mutate authoritative state, reference frontend components, or select executable UI assets.

### 4. Presentation is separate from gameplay semantics

Entities exposed to the frontend must contain sufficient presentation information for the UI to represent them dynamically.

The presentation representation must be separated conceptually from authoritative gameplay semantics.

For example, an entity may eventually expose information conceptually equivalent to:

```text
gameplay:
  type: creature
  role: threat

presentation:
  category: creature
  archetype: shark
```

The exact presentation schema is intentionally left open until the implementation requires it.

This ADR does not mandate a specific asset system, image-generation system, animation system, or rendering technology.

### 5. The frontend must not hardcode specific entity identities

The frontend must not contain entity-specific branching such as:

```ts
if (entity.id === 'blue-rock') ...
if (entity.label === 'shark') ...
if (entity.type === 'creature' && entity.label === 'wolf') ...
```

Nor should new generated entities require adding new entity-specific React components merely to make them visible.

The frontend must instead use generic rendering mechanisms driven by runtime-provided entity presentation information.

Conceptually:

```text
Dynamic Entity
      ↓
Presentation Information
      ↓
Generic Entity Renderer
      ↓
Visual Representation
```

### 6. AI must not control executable frontend behavior

AI-generated presentation information must remain declarative.

The AI must not provide:

* React components
* executable rendering code
* arbitrary asset paths
* arbitrary URLs
* JavaScript
* executable UI instructions
* implementation-specific frontend behavior

The presentation contract must describe an entity rather than instruct the frontend how to execute code.

### 7. Existing hardcoded entities are prototype debt

The blue-rock rendering currently present in the UI is considered prototype implementation debt from the first playable vertical slice.

It must not become a pattern for future entities.

Future gameplay blocks must not introduce additional hardcoded entity-specific frontend renderers as a shortcut.

The existing blue-rock implementation will be migrated to the dynamic entity representation during the Visual Gameplay Integration portion of the roadmap.

### 8. Dynamic rendering is a product-level architectural requirement

Dynamic entity representation is not merely a frontend refactoring concern.

A successful architecture must allow the following scenario:

```text
AI generates a previously unknown entity
            ↓
Game Core validates the entity
            ↓
Runtime exposes the entity
            ↓
Frontend receives its presentation information
            ↓
Frontend renders it
```

without requiring a developer to add a new hardcoded entity implementation to the frontend.

This is a core validation criterion for the AI-generated adventure architecture.

## Consequences

### Positive

* AI-generated gameplay can introduce new entities without frontend code changes.
* Game Core remains independent of specific game content.
* The UI becomes reusable across different generated adventures.
* Entity-specific gameplay knowledge does not leak into presentation code.
* New visual technologies can be introduced without changing Game Core.
* Future generated or procedurally created visual assets can be integrated without redesigning gameplay semantics.
* The architecture better supports substantially different player experiences.

### Negative

* A generic presentation contract is more complex than hardcoded rendering.
* The frontend requires a generic entity rendering system.
* Presentation information must be validated and constrained.
* Some generated entities may not have an exact pre-existing visual asset.
* The system will require a strategy for mapping generated presentation descriptors to available visual representations.

These trade-offs are accepted because dynamic entity generation is a fundamental product requirement rather than an optional optimization.

## Scope

This ADR defines the architectural boundary and invariants for dynamic entity representation.

It does **not** define:

* the final presentation schema
* an asset catalog
* image-generation infrastructure
* animation generation
* procedural graphics
* a specific renderer implementation
* a specific visual asset storage mechanism
* multiplayer representation
* persistence of visual assets

Those decisions should be made only when required by the corresponding implementation block.

## Relationship to Other ADRs

This ADR extends the consequences of:

* **ADR-001 — Game Core Authoritative**
* **ADR-002 — AI Bounded Narrative/Creative Engine**
* **ADR-003 — Game Core UI-Independent**
* **ADR-006 — AI/Core Controlled Proposal Contract**
* **ADR-007 — Bounded Generation, Not Bounded Selection**
* **ADR-008 — Provider-Agnostic AI Model Capabilities**
* **ADR-009 — MVP Runtime and Anonymous In-Memory Game Sessions**
* **ADR-010 — First Playable AI Adventure**

In particular:

* ADR-001 requires Game Core to remain authoritative.
* ADR-002 allows AI to generate novel gameplay within constraints.
* ADR-003 prevents Game Core from depending on the UI.
* ADR-006 requires AI-generated gameplay proposals to be validated by Game Core.
* ADR-007 allows the AI to generate novel content rather than selecting only from a predefined catalog.
* ADR-011 extends these principles through the runtime and presentation boundary.

## Architectural Invariants

The following invariants are mandatory:

1. **Game Core must not contain hardcoded knowledge of specific entity identities.**
2. **The frontend must not contain hardcoded knowledge of specific entity identities.**
3. **AI-generated entities must be represented through generic contracts.**
4. **Gameplay semantics and presentation semantics must remain separate.**
5. **AI-generated presentation information must be declarative, never executable.**
6. **Game Core remains authoritative over gameplay state and consequences.**
7. **The frontend renders runtime-provided entities rather than maintaining its own authoritative entity catalog.**
8. **Adding a new AI-generated entity must not require adding a new entity-specific frontend implementation.**
9. **Specific visual technologies and asset strategies remain implementation concerns until explicitly decided.**

## Validation Criterion

The architecture should ultimately demonstrate the following:

> A gameplay generation provider can produce an entity that did not previously exist in the application's source code, Game Core can validate and incorporate that entity, and the frontend can render it without adding entity-specific frontend code.
