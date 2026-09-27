# Capability Model

This document defines the conceptual model of a Game Core capability within the Generative Capability Space. It explains how capabilities can be composed into novel gameplay while Game Core remains authoritative over rules, state, validation, and outcomes.

This is foundational design documentation, not an implementation specification. It does not define interfaces, schemas, runtime classes, APIs, prompts, validation algorithms, persistence structures, or concrete gameplay mechanics.

## Purpose and Central Principle

The AI Pet Game uses **bounded generation, not bounded selection**. Game Core defines the capabilities, rules, constraints, invariants, state boundaries, progression boundaries, and safety boundaries that define what the game can validly do. AI generates concrete gameplay experiences by composing applicable capabilities within that space.

The goal is not to create a finite catalog of adventures, quests, branches, or experiences for AI to select from. The goal is to define reusable capabilities that can be combined with player and world context to produce gameplay that was never manually authored as a complete experience.

The conceptual relationship is:

```text
Game Core capability space
        +
Player and world context
        ↓
AI composes applicable capabilities
        ↓
Generated capability sequence
        ↓
Game Core validates the sequence
        ↓
Game Core authorizes and applies accepted consequences
        ↓
New authoritative state and history
```

AI generates the proposed gameplay. Game Core determines whether it belongs to the valid capability space and whether its consequences may become authoritative.

## What Is a Capability?

A **capability** is a fundamental, composable ability that the game, world, player, Pet, or another entity can perform or support and that Game Core understands how to validate and execute when applicable.

A capability describes a possible unit of valid game behavior. It is small enough to participate in different contexts and combinations, but meaningful enough that Game Core can determine whether it is applicable and what rules govern it.

Conceptual examples might include:

- Moving through an available space.
- Exploring a relevant part of the world.
- Interacting with an entity or object.
- Inspecting or investigating something.
- Picking up, placing, pushing, or combining something when supported.
- Avoiding, following, hiding, or reacting under valid conditions.

These examples illustrate the scale and purpose of a capability. They are not a final list of capabilities or a prescribed product catalog.

A capability is not:

- A complete adventure.
- A quest or objective.
- A predefined gameplay experience.
- A branch in a decision tree.
- A scenario catalog entry.
- A hard-coded sequence of actions.
- A narrative description of what happened.
- An authoritative outcome by itself.

Capabilities are the reusable building blocks of valid gameplay. Complete experiences emerge from their composition, context, presentation, player actions, and accepted consequences.

## Capability and Related Concepts

The following concepts must remain distinct.

### Capability

A capability describes **what an entity or the game world can do**. It is a reusable unit of possible behavior whose applicability and effects are governed by Game Core.

### Complete experience

A complete experience is the concrete gameplay that a player encounters. It may include a situation, a sequence of capabilities, player choices or actions, narrative framing, and accepted consequences. It is generated for a context and does not need to have existed as a predefined object beforehand.

### Adventure

An adventure is a bounded game-world experience or framing that may combine narrative, interaction, exploration, discovery, and supported gameplay. It is a higher-level domain concept, not a one-to-one replacement for a capability.

### Quest

A quest is a bounded objective or supported unit of activity within an adventure or other game experience. A capability may contribute to satisfying a quest-like objective, but a capability is not itself a complete quest.

### Branch

A branch is a path in a manually authored decision structure. The capability model is not based on enumerating branches or storing one branch for every possible player trajectory. A generated sequence may diverge from another sequence without being selected from a predefined branch tree.

### Sequence

A sequence is an ordered composition of capabilities for a particular context. A sequence may be generated dynamically and may not have been authored or named in advance.

### Narrative context

Narrative context is the framing, expression, or situation that helps the player understand an experience. It may be generated around capabilities and accepted outcomes, but it does not define the capabilities, rules, or authoritative state.

### Outcome

An outcome is the accepted consequence determined by Game Core after evaluating player input, current state, rules, constraints, and any AI-generated proposal. A capability may contribute to an outcome, but AI-generated intent or narrative does not make an outcome authoritative.

Keeping these concepts separate prevents a capability from becoming a disguised quest catalog entry or a narrative statement from becoming an implicit state transition.

## Conceptual Capability Boundaries

The conceptual boundary of a capability includes the information needed to understand its valid role in the game without defining a concrete data structure.

### What the capability enables

A capability establishes the kind of action, interaction, or world behavior that may occur. It gives Game Core a stable meaning for the behavior so that generated gameplay can be evaluated consistently.

### What it applies to

A capability has conceptual applicability to particular authoritative entities, permitted generated contextual elements, world elements, relationships, or gameplay contexts. It is not assumed to apply to every entity or every state.

Game Core may support categories of contextual elements without defining every concrete instance in advance. A generated element can participate in a capability when its category, relevant properties, relationships, contextual relevance, and safety boundaries are valid. The generated instance remains non-authoritative unless an accepted Game Core transition establishes it as authoritative state.

### Required conditions

A capability may require conditions before it can be used. Conditions may arise from current state, world state, entity relationships, progression, prior accepted outcomes, available resources, or other game-defined boundaries.

### Resulting effects

A capability may have possible state effects or consequences when Game Core accepts its use. Those effects are governed by rules and constraints; they are not direct authority granted to AI.

### Possible outcomes

A capability may lead to different valid outcomes depending on the current state, player action, sequence context, or accepted rules. The capability does not need to prescribe one fixed result for every situation.

### Constraints

A capability participates in constraints that limit how, when, and with whom it may be used. Constraints prevent a generated proposal from using a valid capability in an invalid context.

### Relationships to other capabilities

A capability may enable, require, follow, precede, exclude, or otherwise relate to other capabilities. These relationships guide valid composition without requiring every resulting combination to be authored as a complete experience.

These dimensions are conceptual responsibilities. They do not imply a final capability schema, interface, registry, or runtime representation.

## Capability Composition

The generative model depends on composability:

```text
Predefined capabilities
        +
Player and world context
        +
AI composition
        ↓
Generated sequence
        ↓
Concrete gameplay experience
```

Individual capabilities are predefined building blocks. Their combinations and sequences do not need to be predefined. A valid sequence may combine capabilities in a way the development team never explicitly authored.

The difference is important:

- **Predefined capabilities** are the stable abilities the game understands.
- **Predefined sequences** are manually authored ordered combinations. They may be useful in some bounded or deterministic situations, but they are not the required generative architecture.
- **Generated sequences** are ordered combinations produced for the current context by AI and then evaluated by Game Core.

The system must not require a new authored experience every time two or more capabilities are combined. If every valid combination must first become a named, stored, or manually designed experience, the system has become a catalog rather than a generative capability space.

Composition does not mean that every combination is valid. Composition remains bounded by applicability, relationships, rules, constraints, invariants, progression boundaries, and safety requirements.

This document does not define a formal composition algorithm.

## Applicability

Applicability is the conceptual determination of whether a capability can be used in a particular context. Game Core determines applicability from the authoritative domain situation rather than from the AI's confidence or narrative justification.

Applicability may depend on:

- Current authoritative game state.
- Current world state.
- Available authoritative entities, permitted generated contextual elements, and world elements.
- Relationships between the entities involved.
- Current interaction, adventure, or activity context.
- Progression and availability boundaries.
- Capability prerequisites or exclusions.
- Prior accepted outcomes.
- Relevant constraints and rules.
- Child-safety and real-world boundaries.

Applicability prevents nonsensical combinations without requiring Game Core to contain a catalog of complete experiences. Game Core needs to know whether a capability is valid now and how it may participate in a transition; it does not need to know every complete sequence in which that capability might appear.

Applicability also includes contextual relevance. A generated entity or environmental element must belong to a supported category and fit the current world, gameplay situation, relationships, constraints, progression, and safety boundaries. A valid category does not make every generated instance valid in every context.

AI may generate a proposal that uses a capability in an inapplicable context. That proposal is untrusted and must be rejected or corrected rather than expanding the capability's authority.

The eventual representation of applicability conditions is intentionally undefined.

## Generated Gameplay Sequences

AI may conceptually generate a sequence of capabilities for the current player and world context:

```text
Controlled context
        ↓
AI composes applicable capabilities
        ↓
Generated sequence
        ↓
Narrative and interaction experience
        ↓
Game Core validation
        ↓
Accepted gameplay and consequences
```

The phrase “composes applicable capabilities” does not mean that AI selects from a predefined experience catalog. AI may compose or arrange building blocks that are relevant to the context, but the resulting sequence can be new. The object of generation is the concrete gameplay sequence, not a choice among complete authored experiences.

A generated sequence may include novel combinations, ordering, contextual relationships, or consequences that were not previously named or stored. Game Core validates the sequence against the capability space rather than checking whether it matches an expected authored sequence.

### Player-specific sequences

Two players can use the same underlying Game Core capability model and still receive materially different generated experiences. The currently applicable capability space does not have to be identical for every player. Age or developmental band, progression, structured history, accepted actions, discoveries, behavior, curiosity, game-domain personality state, preferred interaction complexity, previous outcomes, and current state may influence which capabilities, entity categories, interaction complexity, and other boundaries are currently available to generation.

The relationship is not:

```text
player personality → predefined experience branch
```

It is:

```text
shared Game Core capability model
        +
player-specific applicable capability space
        +
player-specific structured context
        ↓
AI-generated sequence for this player at this moment
        ↓
Game Core validation
```

The same capability model may therefore produce different situations, sequences, challenges, discoveries, or consequences for different players, and the currently applicable capability space may differ, without requiring a manually authored branch or content catalog for each player history. A broader or more complex applicable space for one player remains bounded by Game Core rules and safety constraints.

Personality remains structured game-domain state, not a psychological diagnosis or unrestricted profile of the child. It may be relevant context, but it does not map a player to a fixed experience.

## Game Core Validation

Game Core validates generated gameplay against the generative capability space. It does not ask whether the sequence matches a previously authored experience because a valid sequence may be novel.

Conceptually, validation evaluates:

- Whether each referenced capability exists within the supported capability space.
- Whether generated contextual elements belong to supported categories and have valid contextual relevance.
- Whether each capability applies to the relevant entities and context.
- Whether the capabilities can be composed together.
- Whether the ordering or sequence is valid.
- Whether the sequence is compatible with current game state and world state.
- Whether the applicable rules are respected.
- Whether constraints are satisfied.
- Whether state invariants remain true.
- Whether progression boundaries are respected.
- Whether the proposed consequences are valid.
- Whether the sequence can produce valid state transitions.
- Whether child-safety and other safety boundaries remain satisfied.

Validation may determine that a sequence is invalid even when each individual capability appears valid in isolation. Conversely, a sequence may be accepted even though it was never manually authored, provided it belongs to the valid generative space.

Validation should be deterministic wherever practical. AI variability may affect the proposal, but it must not change the meaning of authoritative rules or allow invalid state transitions.

## State Effects and Authority

Capabilities can have consequences without giving AI authority over state.

The conceptual authority flow is:

```text
AI proposes or generates gameplay
        ↓
Game Core validates capabilities and sequence
        ↓
Game Core determines the accepted outcome
        ↓
Game Core executes or authorizes valid consequences
        ↓
Authoritative state and domain events change
```

AI does not execute capabilities against authoritative state. It does not grant rewards, update progression, create authoritative memory, modify personality, emit authoritative events, or declare completion merely by proposing or describing those effects.

AI may propose a novel context-scoped entity or environmental element, but generation alone does not create an authoritative entity. Game Core independently determines whether a valid transition establishes that element as a discovered or persistent part of the game state.

When Game Core accepts a generated sequence, it determines which state transition and domain consequences follow under the current rules. A rejected sequence must not partially mutate state. Persistence records accepted results after Game Core determines them, and clients present the accepted result.

## Novelty and Emergence

Novel gameplay means that a valid experience can emerge from the composition and context of known capabilities without having been explicitly authored as a complete experience beforehand.

Novelty may take several conceptual forms:

### Novel composition

Known capabilities are combined in a combination that was not previously named or designed as an experience.

### Novel sequence

Known capabilities are arranged in an order that was not previously authored, while still respecting applicability, rules, and constraints.

### Novel contextual combination

Known capabilities interact with a particular player, world state, authoritative or generated contextual element, entity relationship, discovery, or previous outcome in a way that produces a new gameplay situation. The contextual element may be a novel instance of a supported category and does not need to have existed beforehand.

### Novel narrative framing

The same or related gameplay is expressed through new narrative context. This can enrich the experience, but narrative novelty alone is not sufficient to satisfy the product thesis.

### Novel progression trajectory

Accepted gameplay history leads to a player-specific sequence of future experiences and consequences that was not manually authored as a progression path.

Novelty does not mean that AI may invent arbitrary runtime mechanics, redefine rules, or escape the capability space. The innovation is in the emergence of valid combinations, sequences, contexts, and trajectories from the capabilities and boundaries the game defines.

## Rejection and Correction

The Capability Model participates in the established correction loop:

```text
AI generates proposal
        ↓
Game Core validates capability use and sequence
        ↓
Valid ─────────────→ accepted gameplay

Invalid
        ↓
structured rejection feedback
        ↓
AI corrects the proposal
        ↓
Game Core revalidates
```

A capability-level validation failure means that some part of the generated gameplay does not belong to the valid capability space for the current context. Examples include an unavailable capability, an inapplicable entity relationship, an invalid composition, an ordering conflict, a violated constraint, an invalid consequence, or a state transition that would break an invariant.

Rejection feedback should explain, at a conceptual level:

- What capability or sequence relationship failed.
- Where in the generated gameplay the failure occurred.
- Why the capability use or composition was invalid.
- Which applicable condition, rule, constraint, invariant, progression boundary, or safety boundary was violated.
- What relevant condition must be satisfied for a corrected proposal to become valid.

The exact rejection schema is not defined here. Game Core explains the violated boundary but does not author the replacement gameplay. AI remains responsible for generating the corrected proposal, which must be validated again.

Correction attempts must be strictly bounded. Game Core must never accept invalid gameplay merely to terminate the loop. If the maximum number of attempts is reached without a valid proposal, a future-defined recovery or fallback mechanism must be used. This document does not define that mechanism.

## What This Model Is Not

The Capability Model is not:

- One capability equal to one quest.
- One capability combination equal to one predefined adventure.
- A finite experience catalog.
- An AI experience selector.
- A decision tree containing all valid gameplay.
- A mapping from personality directly to a predefined experience.
- A manually authored progression tree as the primary model.
- A requirement that every valid capability combination be manually authored.
- A disguised library of named experiences from which AI chooses.

The purpose of the model is to define the **space of possible gameplay**, not every possible gameplay instance.

## Architectural Boundaries

The Capability Model preserves the existing boundaries:

### Game Core

Game Core defines and enforces capabilities, rules, constraints, invariants, applicability, valid transitions, progression boundaries, safety requirements, and accepted consequences. It remains framework-independent and authoritative.

### AI

AI generates novel gameplay proposals from controlled context and applicable capability concepts. It is untrusted, provider-independent, and unable to mutate authoritative state or redefine the capability space.

### Application and orchestration

The surrounding application boundary may determine when an AI capability is useful, assemble controlled context, invoke AI, and route proposals for validation. It does not become a second game engine or accept AI output as authoritative.

### Persistence

Persistence records accepted authoritative state and domain history. It does not define capability meaning, validate generated gameplay, or replace Game Core rules.

### Client

The client presents accepted gameplay and collects player input. It does not determine applicability, validate capability composition, or apply AI-generated consequences directly.

## Safety and Determinism

The capability space is bounded by child-safety requirements as well as gameplay rules. AI cannot use a novel composition to introduce unsafe interactions, emotional dependency, secrecy, manipulation, unnecessary personal-data requests, unrestricted external access, or undefined real-world behavior.

AI also cannot use a generated sequence to:

- Redefine fundamental game rules.
- Introduce unsupported runtime capabilities.
- Violate state invariants.
- Grant arbitrary rewards or progression.
- Create authoritative memory or personality changes directly.
- Bypass Game Core validation.
- Turn the game into unrestricted conversation.

Game rules, applicability, validation, and accepted state transitions should be deterministic and testable wherever practical. AI may remain probabilistic in generation, but probabilistic output must remain inside the boundaries that Game Core enforces.

## Relationship to Existing Documents

The conceptual hierarchy is:

```text
ADR-007
    ↓
Generative Capability Space
    ↓
Capability Model
```

- **ADR-007: AI-Driven Player Experience Through Bounded Generation** establishes the product and architectural decision that gameplay is AI-generated through bounded generation rather than AI-assisted branching or finite experience selection.
- **[Generative Capability Space](generative-capability-space.md)** explains the conceptual space in which generation occurs: capabilities, rules, constraints, invariants, state, world state, and safety boundaries define what can validly exist.
- **This Capability Model** defines the conceptual building blocks and composition principles that make that generative space possible. It explains what a capability is, how capabilities can be composed and applied, and how generated sequences can be validated without becoming an experience catalog.

This document elaborates the two preceding documents; it does not replace or redefine them. All three documents preserve Game Core authority, AI as an untrusted generator or proposer, bounded generation, framework and provider independence, child safety, structured game memory, and personality as a game-domain concept.

None of these documents defines implementation schemas, concrete runtime mechanisms, or a final list of capabilities.

## Explicit Non-Goals

This document does not define:

- TypeScript interfaces.
- JSON schemas.
- Runtime classes.
- Validation algorithms.
- AI prompts.
- Model or provider selection.
- LangChain or LangGraph.
- Retrieval-augmented generation.
- Vector databases.
- Agents.
- APIs or WebSockets.
- Persistence schemas or database implementation.
- Mobile or UI implementation.
- Concrete mini-games.
- Concrete quests or adventures.
- A gameplay catalog.
- A finite list of capabilities intended to represent the final product.
- A manually authored experience library.
- A fallback implementation.

Examples in this document clarify the conceptual model only. They do not establish final mechanics, a final capability inventory, or a prescribed gameplay sequence.

## Design Principles

1. **A capability is a reusable ability, not a complete experience.**
2. **Capabilities are predefined; complete combinations and sequences do not need to be.**
3. **AI generates gameplay from applicable capabilities; it does not select from a finite experience catalog.**
4. **Game Core validates generated gameplay against the capability space, not against an expected authored experience.**
5. **Applicability prevents invalid combinations without requiring a catalog of complete experiences.**
6. **Only Game Core-authorized consequences become authoritative state.**
7. **Novel composition and emergence are allowed within rules, constraints, invariants, progression boundaries, and safety boundaries.**
8. **Generated gameplay is untrusted until validated.**
9. **Rejection should enable correction without creating an unbounded retry loop.**
10. **The same Game Core capability model should support materially different player trajectories through contextual and player-specific capability boundaries.**
