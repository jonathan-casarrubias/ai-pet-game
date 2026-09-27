# Generated Gameplay Context and State

This document defines the conceptual relationship between authoritative Game Core state and the generated gameplay context through which a player interacts with the game. It extends the [Generative Capability Space](generative-capability-space.md), [Capability Model](capability-model.md), and [Generated Gameplay Sequences and Player Actions](generated-sequence-and-player-actions.md).

This is conceptual design documentation. It does not define schemas, interfaces, runtime classes, APIs, prompts, validation algorithms, persistence structures, or a formal context state machine.

## Central Distinction

The core distinction is:

> **State describes what is true. Context describes the current bounded situation through which the player interacts with that state.**

Authoritative state belongs to Game Core. A generated gameplay context is an ephemeral or evolving construct produced from controlled authoritative context and the generative capability space. It helps organize the current interaction, but it is not a new source of truth.

The conceptual loop is:

```text
Player / World Context
        ↓
Controlled AI Context
        ↓
AI Generation
        ↓
Generated Gameplay Context
        ↓
Player Action
        ↓
Game Core Validation
        ↓
State Transition
        ↓
Updated Authoritative State
        ↓
Updated Gameplay Context
        ↓
AI Generation when appropriate
        ↓
...
```

The loop is not a requirement that every action invoke AI. A context may continue through deterministic Game Core behavior, transform after an accepted action, end safely, or lead to another AI generation step when a new context is needed.

## What Is a Generated Gameplay Context?

A **Generated Gameplay Context** is the current bounded gameplay situation presented to the player, produced from the applicable Game Core capability space and controlled authoritative context.

It may conceptually include:

- Relevant authoritative entities, generated contextual elements, and their relationships.
- The current situation or circumstance.
- Currently relevant capabilities.
- Generated narrative framing or descriptive information.
- Applicable interaction possibilities.
- Contextual constraints.
- Possible categories of consequences for Game Core to evaluate.
- Information needed for the player to understand the current situation.

The context is not authoritative merely because it is coherent, structured, or presented to the player. It is a bounded interpretation and organization of the current situation that enables meaningful player interaction.

A generated context is therefore:

- More specific than the general capability space.
- More temporary than authoritative Game Core state.
- More interactive than narrative or dialogue alone.
- Less rigid than a script.
- Less predetermined than a branch or experience catalog.
- Subject to change when accepted player actions change the relevant state or situation.

The context can be novel. It does not need to have been previously authored, named, stored, or implemented as a complete gameplay experience.

## Context Compared with Related Concepts

### Game Core state

Game Core state describes the authoritative condition of the game and player. It includes only facts, values, relationships, progression, personality, memory, rewards, and other concepts recognized by the domain rules.

State answers: **What is true?**

### World or gameplay state

World or gameplay state describes the relevant current condition of the game world, entities, active interactions, and supported gameplay. When recognized by Game Core, it is authoritative domain state. Presentation-only details and unaccepted AI claims are not authoritative world state.

### Authoritative existing entities

Authoritative existing entities are entities already established by Game Core state. They may include the player, Pet, inventory items, known locations, persistent relationships, or previously established or discovered objects. Their identity, properties, relationships, availability, and capabilities are determined by Game Core.

### Generated contextual elements

Generated contextual elements are novel concrete elements that AI may propose for the current gameplay context when they belong to categories that Game Core supports and can validate. They may be objects, creatures, environmental elements, phenomena, artifacts, or other permitted contextual elements. They do not need to have existed previously in persistent state or in a predefined catalog.

Generated contextual elements are context-scoped and non-authoritative by default. Their category, relevant properties, relationships, capabilities, contextual relevance, constraints, and safety must be valid for the current situation. A generated element becomes authoritative or persistent only through an accepted Game Core transition; AI generation and context acceptance do not establish it as authoritative state.

### Potentially persistent entities

A generated contextual element may become an authoritative or persistent entity when an accepted Game Core transition establishes it as such. The transition may follow a player action or another valid domain outcome, but the proposal cannot declare that persistence has occurred.

### Generated gameplay context

Generated context describes the current bounded situation through which the player can act. It may organize relevant state and capabilities, but it does not establish new facts merely by describing them.

Context answers: **What situation is currently being offered for interaction?**

### Capability

A capability is a reusable ability that the game, player, Pet, world, or entity can perform or support. A context may make some capabilities relevant, but the context is not itself a capability.

### Complete adventure

An adventure is a higher-level bounded game-world experience. A generated context may occur within an adventure or provide a portion of an adventure, but it is not required to be a predefined adventure object.

### Quest

A quest is a bounded objective or supported activity. A context may provide circumstances in which an objective can be pursued, but it is not automatically a quest and does not independently define completion conditions.

### Rigid script

A rigid script is a fixed sequence of required steps. A generated context must not require the player to perform AI-assumed actions in a predetermined order.

### Predefined branch

A predefined branch is a manually authored path among fixed alternatives. A context may evolve differently after different accepted actions, but the divergence should emerge from state and subsequent generation rather than from a catalog of predefined branches.

### Narrative or dialogue

Narrative and dialogue communicate or frame the context. They may be AI-generated, but they do not independently establish state, consequences, discoveries, progression, rewards, or player actions.

### Player history

Player history is structured information derived from accepted gameplay. It may influence future context generation, but it is not the current context itself and raw conversation is not automatically authoritative history.

These distinctions prevent context from becoming an alternative state store, an experience catalog, or an implicit command system.

## Authoritative and Contextual Information

The system separates what is authoritative from what is generated or contextual.

### Authoritative

Game Core owns the meaning and validity of:

- Game state.
- World and gameplay state recognized by the domain.
- Rules.
- Capabilities and their valid boundaries.
- Constraints.
- State invariants.
- Accepted player actions.
- State transitions.
- Accepted consequences.
- Progression.
- Rewards.
- Structured game memory and domain events.
- Authoritative personality and Pet state.

These concepts change only through valid Game Core decisions.

### Generated or contextual

AI may generate or organize:

- Narrative framing.
- A generated situation.
- Novel context-scoped entities or environmental elements from supported categories.
- A proposed composition of capabilities.
- Contextual interaction possibilities.
- Descriptive information.
- A bounded interpretation of the current situation.
- Proposed categories of consequences for Game Core evaluation.

These are untrusted or derived representations. They cannot override authoritative state, invent a rule, grant a reward, declare progression, create authoritative memory, establish an entity as persistent, or turn a proposed action into a player action. AI may propose or describe possible consequence categories as part of the generated context, but it does not determine which consequence actually occurs. Game Core independently evaluates the player's actual action against authoritative state, capabilities, rules, constraints, and invariants; only the resulting accepted Game Core transition establishes the actual consequence.

Generated context may be regenerated or transformed without changing authoritative state. Conversely, an accepted player action may change authoritative state and require the current context to be updated, transformed, or replaced.

## Context Generation

AI receives a controlled representation of information relevant to generating the current gameplay context. It does not receive unrestricted access to the entire internal Game Core or all persisted information.

The controlled context may conceptually include:

- Relevant current authoritative state.
- Relevant world or gameplay situation.
- Relevant authoritative existing entities and supported categories for generated contextual elements.
- Structured player and gameplay history.
- Relevant discoveries.
- Game-domain personality state.
- Previous accepted outcomes.
- Applicable capabilities.
- Player-specific capability, complexity, progression, and safety boundaries.
- Progression and availability boundaries.
- Contextual rules and constraints.
- Safety requirements.

Game Core and the surrounding application boundary determine what is relevant and safe to expose. The selected context should be minimal, purposeful, structured, and sufficient for meaningful generation.

Controlled context is not:

- Unrestricted access to the entire Game Core.
- Direct database access.
- Unrestricted raw conversation history.
- Permission to query omitted state.
- Permission to redefine world facts.
- Permission to access unrestricted external information.
- Authority to execute actions or mutate state.

The exact representation of controlled context is intentionally undefined. Its stable requirement is that AI receives enough information to generate a useful bounded situation while preserving Game Core authority and data minimization.

## Context Proposal and Acceptance

A generated context follows the established untrusted-proposal boundary:

```text
Controlled authoritative context
        ↓
AI generates context proposal
        ↓
Structural validation
        ↓
Semantic and capability validation
        ↓
Safety validation
        ↓
Game Core acceptance or rejection
        ↓
Context becomes usable for player interaction
```

The generated context is not usable as an authoritative gameplay situation until it passes the applicable validation boundaries. A proposal can be coherent or child-appropriate and still be invalid because it uses an unavailable capability, violates a constraint, conflicts with current state, or implies an unsupported consequence.

Only an accepted context may be presented as the current supported gameplay situation. Acceptance establishes that the generated context is valid for interaction; it does not establish every entity, possibility, description, or potential consequence contained in the proposal as authoritative fact. In particular, a novel generated contextual element remains context-scoped unless an accepted Game Core transition establishes it as authoritative or persistent. Acceptance of the context does not itself mutate authoritative state or grant the consequences suggested by AI.

## Player Action and Context Evolution

Once a context is usable, the player supplies an action through the client. The action is an external domain input, not an AI-generated fact.

The lifecycle is:

```text
Generated Gameplay Context
        ↓
Player Action
        ↓
Game Core Validation
        ↓
Accepted or rejected action
        ↓
Authoritative state transition, if accepted
        ↓
Updated Gameplay Context
```

Game Core validates the action against the current authoritative state, relevant context, applicable capabilities, rules, constraints, invariants, progression boundaries, and safety requirements.

An accepted player action may:

- Continue the current context.
- Change the current situation.
- Make some capabilities relevant or irrelevant.
- Reveal something meaningful.
- Change relationships between entities.
- Produce an accepted consequence.
- Complete the current context.
- Pause or end the current context.
- Create conditions for future generation.

The precise lifecycle and transition model remain future design work. The stable principle is that an accepted action changes authoritative state only through Game Core, and the context must reflect the resulting valid situation rather than an AI assumption about what happened.

## State and Context Are Not the Same

The distinction can be summarized as:

```text
State describes what is true.
Context describes the current bounded situation through which the player acts.
```

These concepts have different lifetimes and responsibilities:

- A context may be regenerated, transformed, paused, or discarded without changing authoritative state.
- A state transition may change the context without requiring immediate AI generation.
- An accepted state transition may make the current context invalid or incomplete.
- A current context may remain valid across multiple actions while state changes within its supported rules.
- AI-generated description may change while the underlying authoritative situation remains the same.
- A context may end while the resulting state and history remain authoritative and persist.

Not every context change is a state mutation. Not every state mutation requires an immediate AI call. The system should preserve this distinction so narrative or contextual variability cannot silently become authoritative gameplay.

## When a New Context Is Generated

The current context can continue when it remains valid after an accepted action and still provides a meaningful bounded situation for the player. A new context may be generated when:

- The current context remains valid but the game intentionally wants a new generated situation.
- The accepted action transforms the situation enough that the existing context no longer describes it well.
- The current context reaches a natural completion.
- New authoritative state makes a different capability composition relevant.
- A discovery, progression change, relationship change, or previous outcome opens a new gameplay possibility.
- The player reaches a point where another bounded situation is needed.
- The game intentionally pauses before generating the next context.

The decision to continue, transform, end, or generate again belongs to the domain and application flow. AI does not decide on its own that a new context is authoritative or that the player must continue.

AI should not be invoked merely because a context changed. Deterministic Game Core behavior remains appropriate when no creative generation is needed or when the current context can continue safely and understandably without AI.

## Context Lifetime

A generated context may conceptually have the following lifecycle states:

- **Continue:** The context remains valid and supports further player action.
- **Evolve:** The context is updated to reflect accepted state or situation changes.
- **Transform:** The current situation becomes a materially different bounded context.
- **Complete:** The context reaches its valid conclusion and produces any accepted consequence.
- **Pause:** Interaction temporarily stops while authoritative state remains valid.
- **End:** The context is closed without requiring another generated context immediately.

These are conceptual lifecycle conditions, not a formal state machine or implementation contract. A context can be replaced by a later context without becoming a permanent record of every generated detail.

The authoritative facts that matter for future play are accepted state, structured history, domain events, discoveries, progression, personality-related state, and other Game Core-recognized consequences—not every generated phrase or intermediate contextual description.

## Context Evolution and Emergence

Novel experiences can emerge without predefined branches through the interaction of generation, player behavior, and state evolution:

```text
AI generates a context from current state and capabilities
        ↓
Player performs a valid action not explicitly anticipated by the wording
        ↓
Game Core accepts the action
        ↓
Authoritative state changes
        ↓
The relevant capabilities and relationships change
        ↓
A later context reflects the new state
        ↓
Future gameplay evolves from the player's behavior
```

The new context does not need to correspond to a predefined branch or previously authored experience. Its novelty comes from:

```text
Capability composition
        +
Player behavior
        +
State evolution
        +
Subsequent generation
```

This is the mechanism by which two players can share the same underlying Game Core capability model while following materially different gameplay trajectories. The currently applicable capability space may differ by controlled player and world context without becoming a predefined branch or content catalog.

## Separate Validation Paths

Generated context and player action have different validation paths.

### Generated context

```text
AI proposal
        ↓
Structural validation
        ↓
Semantic and capability validation
        ↓
Safety validation
        ↓
Game Core acceptance or rejection
        ↓
Usable gameplay context
```

This path checks whether the proposed situation belongs to the generative capability space and is compatible with controlled current state.

### Player action

```text
Player input
        ↓
Game Core validation
        ↓
Accepted or rejected
        ↓
Authoritative transition if accepted
```

This path checks what the player actually attempted against the current state and applicable context.

The paths must remain separate. A valid generated context does not make any player action automatically valid. A valid player action does not retroactively validate an invalid AI proposal. AI must not use the context proposal to fabricate the action or bypass the action-validation path.

## AI Must Remain Untrusted

AI must not:

- Declare that a player action happened.
- Declare authoritative state.
- Grant rewards.
- Declare progression.
- Override rules or invariants.
- Invent capabilities outside the capability space.
- Convert a suggested action into a player action.
- Force the player to follow the generated context.
- Create authoritative memory or personality changes directly.
- Treat generated narrative as proof of an outcome.

AI can generate a context, but only Game Core can determine whether that context is valid, whether a player action is accepted, and which consequences become real.

## Player Agency and Child Safety

The generated context should provide meaningful, understandable possibilities without making AI's preferred path mandatory. The player may choose, attempt a supported alternative, pause, decline, or stop.

The system must not use the Pet or generated context to shame, guilt, threaten, manipulate, or pressure a child into continuing. Declining or stopping must not create hidden punishment, emotional dependency, secrecy, or unsafe consequences.

Generated context must remain appropriate for the target age range and bounded game world. Novel generation cannot justify unrestricted external information, unnecessary personal-data requests, unsafe real-world behavior, or undefined mechanics.

Player agency does not mean that every arbitrary action is valid. It means that the child supplies the attempt and Game Core responds safely and consistently according to authoritative rules.

## Determinism and System Boundaries

Game Core validation, state transitions, applicability, invariants, and accepted consequences should be deterministic and testable wherever practical. AI may remain probabilistic in generating context, but the meaning of authoritative state and accepted player action must not depend on model wording or provider-specific behavior.

The model remains independent of:

- UI frameworks.
- API and transport frameworks.
- Persistence implementations.
- AI providers and models.
- Prompt formats and orchestration technologies.

These surrounding systems may transport, present, or invoke context, but Game Core remains responsible for authoritative domain validation and state transitions.

## Relationship to Existing Documents

This document completes the conceptual loop established by the existing architecture:

- **ADR-001:** Game Core remains the authority over state, rules, transitions, progression, rewards, and accepted consequences.
- **ADR-002:** AI remains a bounded narrative and creative engine and cannot define rules or mutate state directly.
- **ADR-006:** AI produces controlled, typed, untrusted proposals. Only Game Core can accept a generated context, player action, or resulting consequence as authoritative.
- **ADR-007:** Gameplay is generated through bounded generation rather than selected from a finite experience catalog.
- **Generative Capability Space:** Defines the boundaries within which gameplay can validly exist.
- **Capability Model:** Defines the reusable capabilities, composition principles, and applicability concepts used to generate gameplay.
- **Generated Sequence and Player Actions:** Defines the generated sequence as a bounded gameplay context in which player actions shape what happens next.

This document adds the distinction between authoritative state and the current generated context, including how the context is created, used, evolved, and replaced. It does not replace or redefine the existing decisions and design documents.

## Explicit Non-Goals

This document does not define:

- TypeScript interfaces or runtime classes.
- Context, state, action, proposal, or rejection schemas.
- A formal context lifecycle state machine.
- Validation algorithms.
- AI prompts, models, providers, or frameworks.
- A finite catalog of contexts, sequences, branches, or experiences.
- Concrete adventures, quests, activities, or mini-games.
- Persistence schemas or database implementation.
- APIs, WebSockets, or UI behavior.
- Final personality, memory, progression, reward, or consequence algorithms.
- Fallback or recovery implementation.

## Design Principles

1. **State describes what is true; context describes the current bounded situation through which the player acts.**
2. **Generated context is ephemeral or evolving, not a new source of truth.**
3. **AI generates context; the player supplies actions; Game Core validates both separately.**
4. **Only accepted Game Core transitions change authoritative state.**
5. **A context may continue, evolve, transform, complete, pause, or end.**
6. **Not every context change requires state mutation or immediate AI generation.**
7. **Player behavior can change future context without requiring predefined branches.**
8. **AI-generated narrative and contextual possibilities cannot override authoritative state.**
9. **Generated contexts and player actions remain untrusted until they pass their applicable validation paths.**
10. **Novelty emerges from capability composition, player behavior, state evolution, and subsequent generation within bounded safety and authority limits.**
