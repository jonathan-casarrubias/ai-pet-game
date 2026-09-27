# Generative Capability Space

This document describes the conceptual model for supporting genuinely AI-generated gameplay while preserving Game Core authority, bounded AI, and child safety. It elaborates the product direction established by [ADR-007: AI-Driven Player Experience Through Bounded Generation](../decisions/ADR-007-ai-driven-player-experience.md).

It is foundational design documentation, not an implementation specification. It does not define concrete interfaces, schemas, APIs, prompts, models, providers, validation algorithms, persistence structures, or gameplay mechanics.

## Central Principle

We do not design every gameplay experience or every concrete entity that may appear within one. We design the capabilities, rules, constraints, invariants, supported entity and contextual-element categories, and boundaries that make many different experiences possible.

The game therefore uses **bounded generation, not bounded selection**. AI generates concrete gameplay within a generative capability space defined and enforced by Game Core. The generated gameplay may be novel: it does not need to have been previously authored, named, stored, or implemented as a predefined experience.

This is generative gameplay, not AI-assisted branching. The development team authors the system that makes experiences possible; AI generates the concrete experiences that emerge within that system; Game Core determines which generated results are allowed to become authoritative gameplay.

## Conceptual Model

The relationship can be represented as:

```text
Capabilities
      +
Rules
      +
Constraints
      +
Invariants
      +
Current Game State
      +
World State
      +
Safety Boundaries
      ↓
Generative Capability Space
      ↓
Controlled AI Context
      ↓
AI generates novel gameplay
      ↓
Game Core validates
      ↓
Accepted gameplay becomes authoritative
      ↓
New game state / history
      ↓
Future generation
```

The diagram describes responsibilities and information flow, not a runtime architecture or implementation contract. The capability space is the set of gameplay that can validly exist under the current game definitions and state. It includes the supported categories, properties, relationships, capabilities, interactions, transformations, and contextual conditions that Game Core knows how to validate; it is not a list of every concrete entity or experience that will happen.

## Capability

A **capability** is a fundamental, composable capability of the game world that Game Core understands how to validate and execute.

A capability describes something the player, Pet, entity, or world can do or participate in. Conceptual examples might include moving, exploring, interacting, picking something up, following, avoiding, hiding, combining, discovering, or triggering a reaction. These examples are illustrative only and do not establish a final capability model.

A capability is not:

- A complete adventure.
- A quest.
- A predefined gameplay experience.
- A branch in a decision tree.
- An entry in a scenario or experience catalog.
- A hard-coded sequence of actions.

Capabilities should be designed so they can participate in many different generated experiences. The development team should build reusable pieces of valid game behavior that can be recombined, rather than manually authoring every possible gameplay experience.

The same principle applies to contextual elements. AI may generate a novel context-scoped entity or environmental element when it belongs to a supported category and is relevant to the current situation. The concrete instance does not need to have existed in persistent state or in a predefined catalog. It remains non-authoritative unless an accepted Game Core transition establishes it as part of authoritative state.

## Foundational Concepts

The generative architecture depends on keeping several concepts distinct.

### Capability

A capability describes **what the game, world, player, Pet, or entity can do**.

It provides a possible operation or interaction that may participate in generated gameplay. A capability is available only where the rest of the game model permits it.

### Rule

A rule describes **how the game behaves when something occurs**.

Rules give meaning to actions and outcomes. They determine how a valid interaction affects the game and how the game responds to an accepted event.

### Constraint

A constraint describes **what conditions must be satisfied for an action, interaction, or generated element to be valid**.

Constraints limit when a capability may be used, what it may involve, or which circumstances are acceptable. They prevent a generated proposal from treating every capability as applicable everywhere.

### Invariant

An invariant describes **what must always remain true for authoritative game state to be valid**.

Invariants protect the integrity of Game Core state across transitions. They are not suggestions to AI and are not relaxed merely because a generated experience is novel.

Confusing these concepts makes the generative architecture harder to reason about. If a capability is treated as a complete experience, or a constraint is treated as a rule, it becomes unclear what AI may generate, what Game Core must validate, and what state must remain true. Keeping the concepts separate allows the game to remain expressive without making authority ambiguous.

## Generative Space Versus Experience Catalog

Game Core must define a **generative capability space**, not a catalog of experiences.

The purpose of the capability space is to define what can validly exist, not to enumerate what will happen. Game Core defines the space of possible gameplay, not the gameplay itself.

The following are rejected as the core architecture:

- Predefined lists of complete experiences.
- AI selecting from an experience catalog.
- Decision trees containing all possible experiences.
- Manually authored progression paths as the primary model.
- One predefined quest for each possible personality or context combination.
- An experience selector whose purpose is to choose among enumerated gameplays.

These approaches make AI an intelligent selector inside a traditional branching game. They do not provide the intended generative capability space because the concrete experience must already exist before AI can select it.

The valid question is not, “Which authored experience should AI choose?” It is, “What gameplay can AI generate now that is valid within the current capability space and player context?”

## Composability

Capabilities must be composable in ways that allow novel combinations and sequences. Part of the game's generative diversity should come from combining valid capabilities rather than from maintaining an exhaustive list of authored experiences.

The conceptual distinction is:

- Individual capabilities are predefined.
- Combinations of capabilities do not need to be predefined.
- Sequences of capabilities do not need to be predefined.
- Concrete experiences do not need to be predefined.

For example, a generated experience may combine several individually supported forms of movement, investigation, interaction, and discovery in a sequence that the development team never explicitly authored. The combination is still bounded because each capability and its relationship to state must remain valid.

This document does not define a composition algorithm. It establishes only that the generative model must allow valid combinations and sequences to emerge without requiring a manually authored experience for each one.

## Capability Applicability and Boundaries

AI cannot arbitrarily combine every capability with every entity, location, action, or state. Capabilities conceptually have applicability conditions and must respect the current world and game state.

The generative space therefore includes more than a set of capabilities. It also includes the rules and constraints governing when those capabilities are valid. Applicability may depend on factors such as:

- The current authoritative game state.
- The current world state.
- The authoritative entities and any generated contextual elements involved.
- The available capabilities of those entities.
- The current interaction or gameplay context.
- Relevant progression or availability boundaries.
- Child-safety and real-world boundaries.

This is how the system remains open to novel generation without becoming unrestricted. AI may discover new combinations inside the space, but it may not declare that an inapplicable capability is valid simply because it produces an interesting narrative.

The same boundary applies to generated contextual elements. Game Core may permit novel instances of supported entity or environmental categories, but it must be able to validate their relevant properties, relationships, capabilities, contextual relevance, constraints, and safety. A category being supported does not make every generated instance valid in every context.

The eventual representation of applicability conditions is intentionally undefined.

## Controlled AI Context

AI should not receive unrestricted access to the entire Game Core or all persisted information. Instead, the system should provide a **controlled AI context** containing the information relevant to generating gameplay at that moment.

Conceptually, this context may include:

- Relevant current game state.
- Relevant world state.
- Applicable capabilities.
- Applicable rules and constraints.
- Safety boundaries.
- Structured player history.
- Relevant discoveries.
- Game-domain personality state.
- Previous accepted outcomes.
- Other relevant structured game memory.

The controlled context may distinguish authoritative existing entities from categories of contextual elements that AI may generate for the current situation. This gives AI room to create novel instances without granting it permission to create authoritative world state.

The context should be sufficient for meaningful generation while remaining minimal, relevant, structured, bounded, and safe for a child-oriented game. It should not expose unrelated internal state merely because that state exists in persistence.

Controlled context does not grant authority. It is a selected view into the current domain, not permission for AI to query the game, inspect unrestricted history, or redefine omitted information. The exact context representation is intentionally left open.

## Player-Specific Generation

Two players can share the same underlying Game Core capability definitions while receiving materially different generated experiences. The currently applicable capability space may itself differ by controlled context, including age or developmental band, progression, gameplay history, discoveries, curiosity patterns, game-domain personality, preferred interaction complexity, previous outcomes, and current world situation. These differences are contextual boundaries, not predefined experience branches.

Relevant differences may include:

- Gameplay history.
- Accepted actions.
- Discoveries.
- Behavior demonstrated through play.
- Curiosity.
- Structured game memory.
- Game-domain personality state.
- Previous accepted outcomes.
- Current state.

Player context should influence both generation and the currently applicable capability space without becoming a predefined experience mapping. The model is not:

```text
personality → predefined experience
```

It is:

```text
shared Game Core capability model
        +
player-specific applicable capability space
        +
player-specific context
        ↓
AI-generated gameplay for this player at this moment
        ↓
Game Core validation
```

This should support materially different gameplay trajectories without requiring manually authored branches for every possible history or personality context.

Personality remains a structured game-domain concept, not a psychological diagnosis or unrestricted profile of the child. It may inform controlled context when relevant, but it does not define a fixed experience mapping.

For example, the same underlying Game Core may expose a simpler applicable capability space for a younger player and a broader or more complex space for an older player, while keeping both spaces bounded by the same authoritative rules and safety requirements. Progression can expand or change the space from which gameplay is generated rather than merely unlocking a predefined experience branch.

## Game Core as the Generative Boundary

The responsibilities are distinct:

### Game Core

Game Core defines and enforces the boundaries of valid gameplay. It owns capabilities, rules, constraints, invariants, supported entity and contextual-element categories, authoritative state, valid transitions, progression boundaries, safety requirements, and accepted outcomes.

### AI

AI generates a concrete gameplay experience within the controlled context and generative capability space. It may produce a proposal containing a novel situation, context-scoped entity or environmental element, interaction, sequence, combination, consequence, or narrative context, subject to the boundaries supplied by the game. Such generated elements are not authoritative merely because they appear in an accepted context.

### Accepted game state

Only a Game Core-approved result becomes authoritative state or an authoritative gameplay outcome. AI output is untrusted input until that decision is made.

Game Core does not need to know the future experience in advance. It needs to determine whether a generated proposal can validly exist in the current state under the defined capabilities, rules, constraints, invariants, progression boundaries, and safety requirements.

Game Core validates whether a generated experience belongs to the valid generative space. It does not compare the generation against an expected predefined experience.

## Validation of Generated Gameplay

Generated gameplay is untrusted input. A valid-looking AI response is not automatically authoritative.

Conceptually, Game Core evaluates whether a generated proposal respects:

- Available capabilities.
- Capability applicability.
- Supported categories and contextual relevance of generated entities or world elements.
- Rules.
- Constraints.
- Current game state.
- Valid state transitions.
- State invariants.
- Progression boundaries.
- Safety boundaries.

Structural validity, coherence, or child-appropriate wording does not make a proposal an accepted gameplay result. Only Game Core acceptance can make the resulting gameplay authoritative, produce an authoritative state transition, or establish an accepted consequence.

## Structured Rejection and Correction

The conceptual correction flow is:

```text
AI generates proposal
        ↓
Game Core validates
        ↓
Valid ─────────────→ accepted gameplay

Invalid
        ↓
structured rejection feedback
        ↓
AI corrects proposal
        ↓
Game Core revalidates
```

Rejection should provide enough actionable information for AI to address the identified validation failure. Conceptually, the feedback should communicate:

- What failed.
- Where it failed.
- Why it failed.
- What relevant condition was violated.
- What must be true for the correction to become valid.

The exact rejection representation is not defined here.

Game Core should explain the violated boundary, but it should not take over AI's generative responsibility by authoring the replacement gameplay. The correction remains a new AI-generated proposal that must be validated again.

## Bounded Correction Attempts

The correction loop must be bounded. There must be a strict maximum number of generation and validation attempts. The system must never allow an unbounded retry loop.

The intended conceptual flow is:

```text
Attempt 1
   ↓
Rejected
   ↓
Structured feedback
   ↓
Attempt 2
   ↓
Accepted
```

The second attempt is expected to address the explicitly identified validation failure, but Game Core must never accept invalid gameplay merely to terminate the correction loop.

If the second attempt, or any attempt within the allowed maximum, remains invalid, the correction loop must stop and use a future-defined recovery or fallback mechanism. That mechanism is outside the scope of this document.

## Bounded Generation Versus Unrestricted Generation

Bounded does not mean finite catalog.

Bounded means that AI has high creative freedom within a space whose capabilities, rules, constraints, state invariants, progression boundaries, and safety requirements are defined and enforced by Game Core.

AI cannot:

- Redefine fundamental rules.
- Invent unsupported runtime capabilities.
- Violate state invariants.
- Directly mutate authoritative state.
- Grant arbitrary rewards.
- Bypass progression rules.
- Create authoritative memory directly.
- Modify personality directly.
- Bypass safety boundaries.
- Access unrestricted external information during normal gameplay.

AI may generate novel combinations and sequences of supported capabilities. Novelty is allowed; authority is not delegated.

## Emergent Gameplay and Progression

The architecture should permit experiences and gameplay trajectories that were never explicitly authored. The development team authors the system that makes them possible.

The resulting gameplay emerges from:

```text
game capabilities
        +
current state
        +
world state
        +
player context
        +
AI generation
        +
Game Core validation
```

Progression should similarly be able to emerge from accepted gameplay history rather than requiring a predefined progression tree. Accepted actions, discoveries, decisions, behavior, curiosity, structured memory, personality-related game state, and previous outcomes may influence future controlled context and therefore future generated gameplay.

This document does not define the final progression system, progression formulas, or progression state. It establishes only that future progression design should not assume that every valid trajectory must be manually authored in advance.

## Relationship to Existing Architecture

This document elaborates the conceptual model established by the existing architectural decisions and the product direction defined by ADR-007. It does not replace or redefine them.

- **ADR-001: Game Core authority.** Game Core remains the authoritative source of game state, rules, transitions, validation, progression, rewards, and accepted outcomes. Generative gameplay does not delegate authority to AI.
- **ADR-002: Bounded AI.** AI remains bounded by the game world, capabilities, rules, constraints, state, and safety boundaries. This document clarifies that boundedness means bounded generation, not merely selection from a finite catalog.
- **ADR-006: Controlled AI/Game Core contract.** The flow remains controlled context → structured AI proposal → validation → accepted authoritative result. A proposal may describe novel gameplay, but novelty does not make it authoritative.
- **ADR-007: AI-driven player experience.** This document elaborates the product-level decision that gameplay is AI-generated through bounded generation rather than produced through AI-assisted branching.

The authority hierarchy remains:

```text
Game Core decides
Persistence records
Clients present
AI proposes and generates within the controlled space
```

## Explicit Non-Goals

This document does not define:

- TypeScript interfaces.
- Proposal schemas.
- Rejection schemas.
- Validation algorithms.
- Capability data structures.
- Prompts or prompt templates.
- Models or providers.
- AI frameworks.
- Retrieval-augmented generation.
- Vector databases.
- Agents.
- LangChain or LangGraph.
- Persistence schemas.
- APIs.
- WebSockets.
- Concrete gameplay mechanics.
- Specific adventures.
- Specific quests.
- A gameplay catalog.
- A manually authored experience library.
- The final progression system.
- The final personality system.
- A fallback or recovery implementation.

The document also does not establish any specific capability examples as final product mechanics. Examples illustrate the conceptual model only.

## Design Principles

1. **We do not author every experience. We author the rules and capabilities that make experiences possible.**
2. **Bounded generation, not bounded selection.**
3. **Game Core defines the generative boundary; AI generates within it.**
4. **Novelty is allowed; authority is not delegated.**
5. **Generated gameplay is untrusted until validated.**
6. **Game Core validates whether gameplay belongs to the valid generative space; it does not compare it with an expected predefined experience.**
7. **Rejection should enable correction, not create an infinite retry loop.**
8. **The same Game Core capability model should support materially different player trajectories through contextual and player-specific capability boundaries.**
9. **Player context influences generation without becoming a predefined experience mapping.**
10. **Safety boundaries remain authoritative even when gameplay is novel.**
