# Controlled Generation Context

This document defines the conceptual meaning and boundaries of the Controlled
Generation Context used between Game Core and AI. It elaborates the existing
Game Core authority, generative capability space, generated gameplay context,
and controlled proposal architecture.

This is a conceptual design document. It does not define TypeScript
interfaces, JSON schemas, APIs, prompts, model providers, orchestration
frameworks, serialization formats, validation algorithms, or persistence
structures.

## Core Definition

The **Controlled Generation Context** is the scoped, non-authoritative
information package that Game Core constructs for a specific gameplay
generation purpose and provides to AI.

Game Core decides which information crosses this boundary. AI receives the
information selected for the current purpose and may generate a bounded
gameplay proposal from it. AI does not decide what it can query, request, or
obtain from Game Core.

The relationship is:

```text
Authoritative Game Core state and rules
                 +
        Generation purpose
                 +
      Relevant capability space
                 +
     Relevant gameplay and world context
                 +
        Safety and domain boundaries
                 ↓
    Controlled Generation Context
                 ↓
                  AI
                 ↓
   Untrusted Generated Gameplay Proposal
                 ↓
     Game Core validation and decision
```

The package provides information for generation. It does not transfer
authority, expose unrestricted Game Core access, or create a second state
model. Information may originate from authoritative state while remaining a
read-only representation for AI. Any AI output remains untrusted until Game
Core validates it.

## Purpose of the Boundary

The boundary gives AI enough relevant information to generate meaningful
gameplay while keeping Game Core responsible for rules, capabilities,
constraints, safety, state, validation, and accepted consequences.

The Controlled Generation Context supports:

- bounded generation within the Game Core capability space;
- data minimization through purpose-specific selection;
- player-specific generation from relevant structured context;
- provider and model replacement;
- deterministic Game Core validation; and
- independent operation of Game Core when AI is unavailable.

The context is a representation selected for one generation request. It does
not become an ongoing authority when it is created, serialized, transmitted,
or consumed by a model.

## Five Conceptual Components

The Controlled Generation Context contains five conceptual components. Their
concrete representation is an implementation concern. The components define
what information may be relevant and why it is exposed.

### 1. Generation Purpose

The **Generation Purpose** explains why Game Core is requesting generation at
the current point in gameplay. Game Core determines the purpose from the
authoritative gameplay situation and the product flow.

The purpose is semantic context for the request. It gives the selected state,
capabilities, and constraints a reason and scope. It is not an unrestricted
instruction supplied by AI, and AI cannot replace it with a broader request
for information or behavior.

Conceptual purposes may include:

- generating initial gameplay;
- generating subsequent gameplay;
- evolving current gameplay;
- generating gameplay after a discovery; and
- generating gameplay after completion.

These examples do not define a fixed enumeration or a catalog of generation
modes. The purpose identifies the current domain need so Game Core can select
relevant information and validate the resulting proposal appropriately.

### 2. Relevant Authoritative State

**Relevant Authoritative State** is the deliberately selected subset of
authoritative Game Core state needed for the generation purpose.

The source remains the authoritative Game Core state. The AI receives a
bounded representation of selected facts, and the representation does not
become a new state store. Game Core remains responsible for the meaning,
validity, and evolution of those facts.

The selected state may include, when relevant:

- player progression and availability boundaries;
- relevant Pet state;
- relevant world state;
- authoritative entities and their relevant relationships;
- accepted discoveries;
- relevant accepted outcomes and gameplay history;
- structured game-domain memory; and
- structured game-domain personality state.

The selection must be proportional to the generation purpose. The Controlled
Generation Context must never be an indiscriminate copy of `GameState`, the
entire Game Core, a persistence record, or the complete player history.
Irrelevant internal state remains inside its owning boundary.

Relevant structured history is domain information selected by Game Core. Raw
conversation history is not the default source of memory and does not become
authoritative merely because it is available to an AI system. Game Core
decides which accepted history, discoveries, preferences demonstrated through
play, previous outcomes, or personality signals are relevant.

State represented in the context remains authoritative in origin. The
representation gives AI information to use while generating; it does not give
AI permission to mutate, reinterpret, correct, or extend that state.

### 3. Relevant Capability Space

The **Relevant Capability Space** is the subset of the Game Core capability
space that is relevant and permitted for the generation purpose and current
authoritative situation.

It may describe:

- capabilities that Game Core supports;
- capabilities applicable to the current state and context;
- supported categories and properties of contextual elements;
- valid capability relationships and combinations;
- relevant rules and constraints;
- progression and availability boundaries; and
- supported consequence categories that Game Core can evaluate.

The capability space is defined by Game Core. AI may compose supported
capabilities into novel gameplay and may arrange them into sequences that were
not authored in advance. AI cannot invent capabilities, redefine capability
semantics, broaden applicability, alter effects, weaken constraints, or grant
itself access to a capability because the capability would make a proposal
interesting.

The relevant space may vary by player context, progression, accepted history,
current world situation, and generation purpose. This variation changes the
bounded information supplied for generation; it does not create a separate
rules authority or an experience catalog.

The capability information is derived by Game Core. Caller or AI declarations
do not make a capability supported or applicable. A contextual element cannot
declare its own authoritative capabilities.

### 4. Relevant Gameplay and World Context

**Relevant Gameplay and World Context** describes the bounded situation in
which the generated gameplay may occur. It contains the situation-specific
information needed to make a proposal coherent and usable.

It may include:

- a current `GameplayContext` or information derived from it;
- relevant authoritative entities and relationships;
- context-scoped contextual elements;
- supported categories and properties for novel contextual elements;
- the current interaction situation;
- relevant interaction possibilities; and
- contextual conditions or consequence categories that Game Core can later
  evaluate.

The context may distinguish authoritative existing entities from novel,
context-scoped elements. A novel element may be an object, creature, plant,
phenomenon, artifact, or another category supported by Game Core. Its
presence in the Controlled Generation Context or in an AI proposal does not
make it an authoritative or persistent entity. A later accepted Game Core
transition is required to establish an authoritative discovery, entity,
relationship, or other domain fact.

`GameplayContext` and Controlled Generation Context have related but distinct
roles. `GameplayContext` is a derived interaction snapshot for a player and
current authoritative state. Controlled Generation Context is the AI-facing
package that may include selected gameplay context together with relevant
state, capabilities, purpose, and boundaries. Neither object replaces
`GameState`, and neither object can mutate it.

The gameplay and world information describes the situation available for
generation. It does not prescribe a rigid script, complete adventure, quest
tree, or required sequence of player actions. A proposal may describe
possible interactions, while actual player actions remain independent inputs
to Game Core.

### 5. Safety, Domain, and Data Boundaries

**Safety, Domain, and Data Boundaries** are the constraints that define what
generation may contain and what information may cross the boundary.

They may include:

- target-age and child-safety requirements;
- supported world and content boundaries;
- applicable capability restrictions;
- progression and availability limits;
- contextual exclusions;
- real-world and fictional-world boundaries;
- restrictions on sensitive or unnecessary personal information; and
- restrictions on unrestricted external information.

These boundaries are authoritative Game Core and product constraints. AI must
follow them as supplied and cannot reinterpret, relax, or omit them to expand
generation.

Data minimization applies to the boundary itself. The context must exclude
secrets, credentials, unnecessary personal information, unrestricted raw
conversation history, unrestricted database access, and unrelated internal
state. A generation purpose does not justify exposing information that is not
needed for that purpose.

## Authority and Provenance

The Controlled Generation Context can contain information with different
origins. Its contents must remain distinguishable by responsibility even when
they are transported together.

| Information | Authority and meaning |
| --- | --- |
| Selected authoritative state | Facts originate in Game Core state. AI may use the representation and cannot mutate or redefine the facts. |
| Derived capability information | Game Core determines supported and applicable capabilities, rules, and effects. AI may compose them and cannot expand or alter them. |
| Relevant gameplay and world context | A bounded view of the current situation. Contextual elements remain non-authoritative unless an accepted transition establishes them. |
| Generation purpose | A Game Core determined reason for the request. It scopes selection and validation. |
| Safety, domain, and data boundaries | Binding constraints defined by Game Core and the product architecture. AI cannot weaken them. |

The package itself is not authoritative state. Its authority remains with the
Game Core sources from which selected information was derived. An AI response
does not gain authority by repeating context values, referring to them as
facts, or returning them in structured form.

## Game Core Responsibilities

Game Core owns the construction and semantic meaning of the Controlled
Generation Context. Conceptually, Game Core is responsible for:

1. determining whether generation is needed;
2. determining the generation purpose;
3. selecting relevant authoritative state and structured history;
4. evaluating the relevant capability space;
5. selecting relevant gameplay and world context;
6. applying safety, domain, progression, and data boundaries;
7. binding the context to the current authoritative situation; and
8. validating the AI-generated proposal before it can be used or affect
   gameplay.

The context construction decision must be grounded in the current
authoritative state. An outdated context must not be used to establish
current gameplay without revalidation. After an accepted state transition,
Game Core determines whether the existing situation remains valid or whether
a new context must be constructed.

Game Core remains responsible for independently validating player actions.
An accepted generation proposal does not pre-accept any player action, and an
interaction described by AI does not become an action merely because it was
presented to the player.

## AI Responsibilities and Limits

AI consumes the Controlled Generation Context as bounded input and may:

- generate a novel gameplay situation within the supplied boundaries;
- compose relevant capabilities;
- describe contextual interactions;
- provide narrative or descriptive framing;
- propose context-scoped elements from supported categories; and
- describe possible consequence categories for Game Core to evaluate.

AI must not:

- query Game Core for omitted information;
- request unrestricted state, history, or database access;
- execute game actions;
- mutate authoritative state;
- establish facts, discoveries, rewards, progression, memory, or personality;
- define or change game rules;
- invent fundamental capabilities or unsupported mechanics;
- declare contextual elements persistent or authoritative;
- fabricate accepted player actions; or
- bypass safety, domain, progression, or validation boundaries.

AI output is a Generated Gameplay Proposal under the existing controlled
proposal contract. It is untrusted input to Game Core. The proposal may be
rejected, safely transformed, or accepted for use after semantic and safety
validation. Acceptance of a proposal does not make every statement in it
true, and it does not itself perform a state transition.

## Relationship to Existing Domain Concepts

### `GameState`

`GameState` describes what is authoritatively true. It remains the source from
which relevant state is selected and the basis against which AI output and
player actions are validated. Controlled Generation Context never becomes a
parallel or copied authoritative state model.

### `GameplayContext`

`GameplayContext` describes the bounded interaction snapshot available to the
player for a current player and state version. It may provide relevant
gameplay situation and derived applicable capabilities to the Controlled
Generation Context. The AI-facing context may contain additional selected
state, purpose, and boundaries required for generation.

### `CapabilityContext` and `CapabilitySpace`

`CapabilityContext` is a lower-level input used to evaluate capability
applicability. `CapabilitySpace` and Game Core own capability definitions and
applicability decisions. Controlled Generation Context may expose the results
that are relevant for generation, while preserving the lower-level
evaluation boundary inside Game Core.

### `ContextualElement`

A `ContextualElement` is a context-scoped representation that Game Core can
validate against supported categories, properties, relationships, and
capabilities. Its presence in a gameplay or generation context does not make
it authoritative. A novel element remains ephemeral until an accepted Game
Core transition establishes a domain fact.

### `GameplayProposal`

`GameplayProposal` is the untrusted AI output that responds to the Controlled
Generation Context. The two concepts are opposite sides of the generation
boundary: Game Core constructs the input context, AI produces a proposal, and
Game Core validates the proposal. The proposal cannot redefine the context's
authority or create an alternate state path.

### Player actions

Player actions are independent inputs to Game Core. A Controlled Generation
Context and a Generated Gameplay Proposal may describe possible interactions,
but they cannot fabricate, accept, or execute a player action. Game Core
validates the actual action against current state and capability boundaries.

## Construction and Lifecycle

The conceptual lifecycle is:

```text
Current authoritative Game Core state
                 ↓
Determine whether generation is needed
                 ↓
Determine generation purpose
                 ↓
Select relevant state, history, capabilities, and context
                 ↓
Apply safety, domain, and data boundaries
                 ↓
Construct Controlled Generation Context
                 ↓
AI generates an untrusted proposal
                 ↓
Game Core validates the proposal
                 ├── rejected or safely handled
                 └── accepted for bounded gameplay use
                              ↓
                    Player action or gameplay flow
                              ↓
                    Game Core validates and transitions state
                              ↓
                    Reuse, evolve, complete, end, or regenerate
```

Construction is a Game Core domain responsibility. An application or
transport layer may carry the package to an AI integration, but it must not
select additional state, reinterpret capabilities, or become an alternate
source of domain rules.

Each generation remains grounded in the current authoritative state and the
purpose for which it was requested. When an accepted action changes relevant
state, the previous generation context may become stale. Game Core decides
whether it can continue, must evolve, or requires regeneration from updated
state and history.

The context does not need to be persistent. If the product later persists
accepted events or state, persistence remains a storage mechanism for
authoritative Game Core data and does not become the authority for generation
selection or validation.

## Invariants

The following invariants preserve the boundary:

1. Game Core determines why generation is requested.
2. Game Core determines what information crosses the boundary.
3. The context is scoped to a generation purpose and current authoritative
   situation.
4. The context contains only relevant, bounded information.
5. The context is not an authoritative state model.
6. A context cannot mutate `GameState`.
7. AI cannot query for information omitted from the context.
8. AI cannot redefine rules, capabilities, applicability, constraints, or
   effects.
9. Applicable capabilities are derived by Game Core rather than declared by
   AI or contextual elements.
10. Generated contextual elements remain non-authoritative by default.
11. AI output is untrusted until Game Core validates it.
12. A valid proposal does not automatically accept a player action.
13. Only an accepted Game Core transition establishes authoritative
    consequences.
14. A stale context or proposal cannot bypass current state validation.
15. Safety, domain, progression, and data boundaries apply to every
    generation request and cannot be relaxed by AI.

## Explicit Non-Goals

The Controlled Generation Context is not:

- a second `GameState`;
- a complete copy of authoritative state;
- a database query interface or repository;
- an unrestricted AI prompt or conversation transcript;
- a model, provider, agent, or orchestration abstraction;
- a GameplayProposal or AI response;
- a generated script or decision tree;
- a complete adventure or quest definition;
- a player action or accepted action result;
- a reward, progression, memory, or personality record;
- an entity catalog or registry;
- a source of new Game Core rules;
- a permission to create authoritative or persistent entities; or
- an API, UI, transport, or persistence contract.

The document does not define a concrete schema, generation algorithm,
prompting strategy, model integration, retry policy, fallback implementation,
or proposal validation implementation. Those decisions must preserve the
conceptual boundary defined here and the existing architectural decisions.

## Relationship to Existing Architecture

This document clarifies the existing architecture without redefining it:

- **[ADR-001 — Game Core Authority](../decisions/ADR-001-game-core-authority.md):**
  Game Core remains authoritative over state, rules, validation, transitions,
  progression, rewards, and accepted consequences.
- **[ADR-006 — AI and Game Core Contract](../decisions/ADR-006-ai-game-core-contract.md):**
  Controlled Generation Context is the controlled input to the structured,
  untrusted proposal contract. Only Game Core may validate and accept
  gameplay-affecting output.
- **[ADR-007 — Bounded Generation](../decisions/ADR-007-ai-driven-player-experience.md):**
  The context supports bounded generation within a capability space rather
  than selection from a finite experience catalog.
- **`ai-game-core-generative-contract.md`:** This document gives the
  Controlled Generation Context its own focused conceptual boundary while
  preserving the existing proposal, validation, safety, and provider
  independence principles.
- **`generative-capability-space.md`:** The context exposes relevant portions
  of the valid generative space without turning capabilities or combinations
  into a complete experience catalog.
- **`capability-model.md`:** Capabilities remain reusable, composable, and
  Game Core-defined. AI can compose them but cannot alter their meaning or
  effects.
- **`generated-gameplay-context-and-state.md`:** Context describes the
  current bounded situation while state describes authoritative truth.
  Controlled Generation Context carries selected information across the AI
  boundary while preserving that distinction.
- **`gameplay-proposal-model.md`:** AI output remains a structured proposal
  that requires Game Core validation before it can contribute to gameplay.
- **`world-and-content-structure.md`:** Generated contextual elements may be
  novel and context-scoped, while authoritative world content and lifecycle
  changes remain Game Core decisions.

## Design Principles

- **Game Core selects the context; AI generates within it.**
- **Purpose scopes information selection.**
- **Relevant state informs generation without transferring authority.**
- **Capabilities are exposed as Game Core-defined boundaries.**
- **Contextual elements may be novel while remaining non-authoritative.**
- **Player actions remain independent Game Core inputs.**
- **AI output remains untrusted until validation.**
- **Only accepted Game Core transitions establish consequences.**
- **Data minimization and child safety apply at the boundary.**
- **Provider or model replacement preserves the same semantic contract.**
