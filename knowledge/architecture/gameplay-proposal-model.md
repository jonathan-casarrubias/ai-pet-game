# Gameplay Proposal Model

This document defines the conceptual semantics of a **Generated Gameplay Proposal**. It describes the information AI communicates to Game Core when proposing a concrete gameplay situation, and the boundaries Game Core applies before that proposal can become an Accepted Gameplay Context.

This is foundational conceptual design documentation. It does not define implementation interfaces, schemas, APIs, prompts, models, providers, frameworks, persistence, validation algorithms, or concrete gameplay mechanics.

## Purpose

The proposal model answers a specific question:

> What information does a Gameplay Proposal need to communicate so that Game Core can determine whether AI-generated gameplay can become a valid Gameplay Context?

The answer must be sufficient for meaningful domain validation without turning the proposal into a second game engine, a generated script, a hidden decision tree, or a duplicate of authoritative Game Core state.

The proposal therefore communicates a candidate gameplay situation and the intended composition of supported capabilities. It gives Game Core enough semantic information to evaluate whether that situation can validly exist now. It does not decide that the situation is true, that the player acted, or that any consequence occurred.

## Central Principle

The conceptual flow is:

```text
Controlled Generation Context
        ↓
AI
        ↓
Gameplay Proposal
        ↓
Game Core validation
        ↓
Accepted Gameplay Context
```

The proposal is an untrusted candidate. Game Core determines whether it belongs within the generative capability space defined by the game's capabilities, rules, constraints, invariants, authoritative state, progression boundaries, and safety requirements. The currently applicable space may be contextual and player-specific; its boundaries may vary with controlled player and world context without becoming a predefined experience branch or catalog.

The central distinction is:

1. **AI proposes** a possible gameplay situation, capability composition, interaction context, descriptive framing, and possible categories of consequences.
2. **Game Core validates** whether the proposal is structurally and semantically compatible with the authoritative domain.
3. **Game Core derives or establishes** the valid gameplay context, player-action results, state transitions, consequences, progression, rewards, discoveries, and memory.
4. **Descriptions remain descriptive** unless and until Game Core independently establishes the corresponding fact through an authoritative transition.

A proposal must never become a second source of truth merely because it is coherent, detailed, or accepted for interaction.

## What a Gameplay Proposal Represents

A **Gameplay Proposal** is AI's candidate description of a bounded gameplay situation that could be made usable by Game Core. It communicates how supported capabilities might be composed in the current context and what kinds of interaction may be meaningful.

The proposal may describe:

- the situation AI believes would be relevant to the current generation purpose;
- authoritative existing entities, generated contextual elements, and their relationships;
- supported capabilities that AI intends to compose;
- the contextual role and intended relationship of those capabilities;
- interaction possibilities that the player may understand or attempt;
- contextual constraints that should apply to the situation;
- possible or expected categories of consequences;
- conditions under which the situation might continue, evolve, transform, complete, pause, or end; and
- narrative or descriptive framing that makes the situation understandable and engaging.

These are semantic categories, not a prescribed set of fields. Their purpose is to communicate meaning that Game Core can evaluate, not to define an implementation payload.

The proposal is a candidate for an Accepted Gameplay Context. It is not itself an accepted context, an action result, or a state transition.

## What a Gameplay Proposal Does Not Represent

A Gameplay Proposal is not:

- authoritative Game Core state;
- a complete adventure, quest, or manually authored experience;
- a rigid script of actions the player must follow;
- a predefined branch or decision tree;
- a catalog entry selected by AI;
- an accepted player action;
- an executed capability;
- an actual consequence;
- a reward, progression change, discovery, personality change, or memory event;
- a new fundamental capability;
- an authoritative entity merely because it is described;
- a replacement for Game Core rules, constraints, invariants, or validation; or
- unrestricted narrative authority over the game world.

For example, AI may propose that the player encounters an unusual stone near a stream and that observing it may reveal something interesting. That proposal does not establish that the stone exists, that the player observed it, that a discovery occurred, that a reward was earned, that progression changed, that a capability executed successfully, or that any state transition happened. Game Core must determine those matters independently.

## Conceptual Information Categories

The following categories describe the minimum semantic areas a proposal may need to communicate. They are intentionally conceptual. Some information is proposed by AI, some is checked against authoritative state, some is derived by Game Core, and some is purely descriptive.

### Generation purpose and context relationship

The proposal should be understandable in relation to the reason generation was requested. It may be intended to introduce a new gameplay situation, continue an existing context, transform a context after a meaningful action, respond to a newly relevant capability, or create a subsequent situation after completion.

It should also communicate how it relates to the current gameplay context, if one exists. A proposal may continue, evolve, transform, or replace the current situation, but it cannot assume that the previous context remains valid merely because AI refers to it.

Game Core validates that the proposed relationship is compatible with the current authoritative state and current context lifecycle. Generation purpose and context relationship help explain relevance; they do not authorize a transition.

### Gameplay situation

The proposal should communicate the concrete situation AI is proposing for the player to encounter or interact with. This is the bounded circumstance in which supported capabilities may become meaningful.

The situation may include a current tension, opportunity, discovery possibility, environmental circumstance, or interaction framing. It should describe enough context for Game Core to determine whether the proposed situation can validly exist now, without asserting that descriptive details are authoritative facts.

Game Core checks whether the situation contradicts authoritative state, requires unsupported mechanics, assumes unavailable entities, or violates world, progression, or safety boundaries.

### Relevant entities and relationships

The proposal may refer to authoritative existing entities, such as the player, Pet, inventory items, known locations, persistent relationships, or previously established or discovered objects. It may also propose novel context-scoped elements, such as a creature, object, environmental element, phenomenon, or artifact, when the element belongs to a category that Game Core supports and can validate.

The proposal may communicate the relationships that make an interaction meaningful, such as proximity, availability, ownership, visibility, or another domain-relevant relationship. A generated contextual element does not need to have existed previously in persistent state or in a predefined catalog.

These references do not create authoritative entities or relationships. Game Core determines whether an existing reference is grounded in authoritative state, whether a novel contextual element belongs to a supported category, whether its relevant properties and relationships are valid and relevant to the current context, and whether it satisfies capabilities, constraints, progression, and safety boundaries. A generated contextual element remains non-authoritative by default and may become authoritative or persistent only through an accepted Game Core transition.

This distinction allows novel contextual elements without allowing AI to silently create authoritative world state by describing it.

For example, AI may propose a previously nonexistent glowing seed in a relevant exploration context. If the Game Core supports the category and the applicable capabilities, the seed may be valid for contextual interactions such as observing, inspecting, comparing, or collecting. If the player later collects it, Game Core independently determines whether that accepted transition establishes the seed as an authoritative discovered or persistent entity.

### Capability composition

The proposal should communicate which Game Core-defined capabilities it intends to compose and the role each capability plays in the proposed situation. It may also express an intended ordering, dependency, relationship, or combination among those capabilities.

The composition explains what the gameplay could involve; it does not execute the capabilities or guarantee that the player will use them. Game Core checks that each referenced capability exists, is applicable, and can participate in the proposed composition under the current state and rules.

The composition may be novel. Individual capabilities are predefined building blocks, but the particular combination or sequence need not have been authored previously. The proposal must not invent capabilities, redefine their semantics, alter their effects or constraints, or introduce unsupported mechanics.

### Contextual applicability

The proposal may communicate why the capabilities and interactions are relevant to the current situation. This can include contextual conditions, relationships, or circumstances that make one capability meaningful in relation to another.

AI may propose an applicability rationale, but it does not determine applicability. Game Core independently evaluates whether the relevant entities, state, relationships, progression, rules, constraints, and safety boundaries actually permit the proposed use.

This allows the proposal to express meaningful composition without allowing AI to declare that any capability is valid merely because the narrative makes it sound plausible.

### Interaction possibilities

The proposal may describe the interaction possibilities exposed by the situation, including what the player might notice, attempt, investigate, combine, avoid, or otherwise engage with. These possibilities help make the generated context coherent and understandable.

They are not a finite list of all valid player actions, and they do not form a hidden decision tree. Game Core remains responsible for determining which actual player actions are recognized, applicable, and valid. The proposal must leave room for valid actions that AI did not explicitly anticipate.

### Player-action possibilities

The proposal may communicate categories or examples of actions that could be meaningful in context. It must not claim that the player has performed any action, predict the player's behavior as fact, or encode an expected action as accepted.

Player action is an independent input to Game Core:

```text
Gameplay Proposal
        ↓
Player chooses or attempts an action
        ↓
Game Core validates the actual action
        ↓
Authoritative transition or rejection
```

An accepted proposal does not pre-accept any action. A player may attempt an action outside the proposal's described possibilities, and Game Core must evaluate that attempt against authoritative capabilities, rules, constraints, and state.

### Contextual constraints

The proposal may communicate constraints that are relevant to the proposed situation, such as a contextual limitation, condition, or safety-sensitive exclusion. These constraints can help explain how the generated context is intended to behave.

AI cannot create, weaken, or override Game Core constraints. Game Core determines whether proposed contextual constraints are compatible with authoritative rules and whether mandatory constraints have been respected. A proposal must not use a locally described constraint to redefine a fundamental game rule or state invariant.

### Possible consequence categories

The proposal may describe possible or expected categories of consequences to make the situation coherent. For example, it may suggest that an interaction could reveal something, change a relationship, open a future possibility, or contribute to progression.

These are not actual consequences. The proposal cannot grant a reward, establish a discovery, record an event, change progression, change personality, or declare a state transition. Game Core independently evaluates the actual player action and determines whether any consequence occurs and what that consequence is.

The distinction is:

- **Possible consequence:** a category that could plausibly result if valid conditions are met.
- **Proposed consequence:** an outcome AI suggests as part of the gameplay context, still untrusted.
- **Expected consequence:** a contextual expectation that may help the player understand the situation, still not authoritative.
- **Actual consequence:** the result established only by an accepted Game Core transition.

Game Core validates that possible or proposed consequence categories are within valid consequence boundaries and do not promise unsupported rewards or progression.

### Continuation, evolution, and completion conditions

The proposal may communicate the intended lifecycle of the gameplay situation. It may describe conditions under which the context could continue, evolve, transform, complete, pause, or end.

These are intended conditions, not authoritative lifecycle events. Game Core determines whether the relevant conditions actually occur after considering player actions, state transitions, invariants, progression, and safety requirements. A proposal cannot force completion, keep an invalid context alive, or cause a new context to begin merely by declaring that a condition has been met.

The lifecycle information gives Game Core semantic guidance about how the proposed situation is intended to behave without defining a formal state machine or a predefined branch structure.

### Narrative and descriptive framing

The proposal may include narrative framing, descriptions, explanations, tone, and information intended to be communicated to the player. This information helps make the gameplay context understandable, engaging, age-appropriate, and coherent.

Narrative framing is not automatically authoritative. Describing an entity does not establish its existence; describing a discovery does not establish that it occurred; and describing a possible result does not establish that it will happen. Game Core must separately establish any gameplay fact that affects authoritative state.

### Information revealed to the player

The proposal may communicate what the player is intended to perceive or understand about the current situation. This can include a description of an opportunity, a contextual clue, or an explanation of possible interaction.

Information presentation must remain consistent with authoritative state and safety boundaries. AI cannot reveal information that Game Core has not permitted the player to receive, expose unnecessary sensitive information, or turn narrative framing into an authoritative discovery. Whether something is actually discovered or learned through play remains a Game Core matter.

## Capability Composition Semantics

Capability composition is the proposal's description of how reusable Game Core capabilities might work together in this gameplay situation. Conceptually, the proposal may communicate:

- which supported capabilities are involved;
- the role each capability plays in the situation;
- the intended ordering or relationship among capabilities;
- the contextual reason the combination is relevant; and
- the possible interaction or continuation implications of the composition.

This is not a predefined sequence catalog. A proposal may express a combination or ordering that the development team never manually authored, provided the combination belongs within the capability space and respects applicability, rules, constraints, invariants, progression, and safety boundaries.

Game Core validates the composition rather than comparing it with an expected authored experience. It determines whether the capabilities exist, whether they apply to the referenced entities and state, whether their relationships are valid, and whether the resulting transitions and consequences are supported.

## Player Interaction Semantics

The proposal establishes a bounded gameplay context, not a script. It may make some interactions meaningful or salient, but it must not prescribe that the player follow a particular path.

Player agency is preserved because:

- the player chooses or attempts actions independently of AI;
- Game Core validates each actual action;
- a valid action need not have been explicitly anticipated by AI;
- an accepted action may change, transform, complete, pause, or invalidate the context; and
- subsequent generation is grounded in the resulting authoritative state rather than in AI's earlier expectation.

The proposal therefore communicates opportunities and contextual meaning, not a complete set of branches. The resulting experience can evolve from player behavior without requiring a manually authored progression tree.

## Consequence Semantics

The proposal may communicate what kinds of outcomes are plausible or contextually expected, but it cannot determine actual consequences. This preserves the distinction between AI's creative contribution and Game Core authority.

Game Core derives or establishes the actual result of a player action, including whether the action succeeds, what state transition occurs, whether a reward or progression change is valid, whether a discovery becomes authoritative, and what structured memory or event is recorded.

The proposal may be rejected if it promises consequences outside the valid generative space or implies authority that belongs only to Game Core. An accepted proposal still does not pre-authorize the consequences it describes.

## Context Lifecycle Semantics

A proposal may communicate how the gameplay situation is intended to behave over time:

- **Continue:** the current situation remains relevant after an accepted interaction.
- **Evolve:** the same situation gains or loses relevant possibilities as state or player behavior changes.
- **Transform:** the situation changes into a meaningfully different context while retaining some relationship to the current one.
- **Complete:** the intended interaction has reached a contextual completion condition.
- **Pause:** interaction is temporarily suspended without establishing that the broader experience has ended.
- **End:** the current context is no longer usable or relevant.

These descriptions guide validation and contextual interpretation. Game Core determines which lifecycle condition actually occurs. The proposal cannot establish completion, pause, or termination by assertion, and it cannot require the system to generate a replacement context when authoritative state does not support one.

## Authoritative, Derived, and Descriptive Information

The proposal model is easiest to reason about by separating four roles.

### AI-proposed information

AI may propose a situation, capability composition, relevant interaction possibilities, contextual constraints, possible consequence categories, lifecycle intentions, and narrative framing. All such information is untrusted until Game Core evaluates it.

### Game Core-validated information

Game Core validates whether referenced capabilities, entities, relationships, compositions, applicability conditions, constraints, lifecycle intentions, consequence categories, and descriptive claims are compatible with the current authoritative state and generative boundaries.

Validation determines whether the proposal can be used as a gameplay context. It does not make every proposal statement a fact.

### Game Core-derived or established information

Game Core derives or establishes accepted player actions, valid state transitions, actual consequences, rewards, progression, discoveries, personality changes, structured memory, and recorded events. These are authoritative only when established through the Game Core domain.

### Descriptive or narrative information

Narrative framing, explanations, atmosphere, and contextual descriptions may help the player understand the situation. They remain descriptive unless Game Core independently establishes the corresponding gameplay fact.

This separation prevents a coherent AI response from smuggling state changes or world facts across the authority boundary.

## Validation Responsibilities

For each major proposal category, Game Core must be able to ask whether the proposal belongs within the current generative capability space. Conceptually, validation includes determining:

- whether referenced capabilities exist and retain their Game Core-defined meaning;
- whether generated contextual elements belong to supported categories and have valid properties, relationships, and contextual relevance;
- whether capabilities are applicable to the referenced state, entities, and relationships;
- whether the proposed composition and intended ordering are valid;
- whether referenced entities and relationships can be grounded in the current domain;
- whether the situation is compatible with current authoritative state and world constraints;
- whether contextual constraints are allowed and do not weaken mandatory rules;
- whether interaction possibilities remain within valid player-action boundaries;
- whether possible consequence categories remain within valid consequence boundaries;
- whether lifecycle intentions are compatible with context and progression;
- whether the proposal introduces unsupported mechanics or arbitrary state changes;
- whether the proposal violates invariants, progression boundaries, or safety requirements; and
- whether descriptive or player-facing information is appropriate to reveal.

Application or transport boundaries may reject malformed or structurally unusable input, but passing those checks does not make a proposal semantically valid or authoritative. Game Core remains the authoritative domain boundary for deciding whether generated gameplay can become an Accepted Gameplay Context.

An invalid proposal must not partially mutate authoritative state. If correction is permitted, rejection should communicate the violated boundary sufficiently for AI to propose a corrected candidate, while preserving bounded correction attempts and Game Core authority.

## Minimum Sufficient Semantic Contract

The proposal should contain enough meaning for Game Core to validate and use the gameplay context, but no more than is necessary to support that purpose.

The minimum sufficient semantic contract is therefore the ability to communicate:

1. **Why the proposal is being generated and how it relates to the current context.**
2. **What gameplay situation is being proposed.**
3. **Which entities, relationships, and capabilities are relevant.**
4. **How supported capabilities are intended to compose and why they are relevant.**
5. **Which interaction and player-action possibilities are meaningful without prescribing all valid actions.**
6. **Which contextual constraints, possible consequence categories, and lifecycle intentions apply.**
7. **Which narrative, descriptive, or player-facing framing makes the situation understandable.**

This does not mean every proposal must provide the same level of detail in every category. It means that the proposal must provide sufficient semantic information for the current generation purpose and no authority beyond that purpose.

Too little information prevents Game Core from determining whether the proposal is applicable, safe, coherent, and valid. Too much information risks turning the proposal into a generated script, hidden game engine, duplicate state store, or AI-controlled rules system. The correct boundary is a candidate context that describes intended gameplay without asserting the facts and consequences that only Game Core can establish.

## Relationship to Accepted Gameplay Context

The conceptual transformation is:

```text
Controlled Generation Context
        ↓
AI
        ↓
Gameplay Proposal
        ↓
Game Core validation
        ↓
Accepted Gameplay Context
```

A Gameplay Proposal is:

- untrusted;
- generated by AI;
- a candidate for validation; and
- capable of containing descriptions, possibilities, and intended capability composition.

An Accepted Gameplay Context is:

- accepted by Game Core for interaction;
- bounded by authoritative state and the capability space;
- usable by the gameplay system; and
- still not a new source of truth.

Acceptance establishes that the context is valid and usable for interaction. It does not establish every entity, possibility, description, player action, or potential consequence contained in the proposal as authoritative fact. Only subsequent accepted Game Core transitions establish authoritative state and actual consequences.

## Novelty and Bounded Generation

The proposal model supports the product principle of **bounded generation, not bounded selection**.

AI may propose novel combinations, relationships, orderings, and contextual framings of supported capabilities, including novel context-scoped elements from supported categories. The resulting gameplay need not have been previously authored, named, stored, or implemented as a predefined experience. Player-specific context, unexpected valid actions, changed state, discoveries, structured history, and subsequent generation can produce trajectories that were not designed in advance.

The proposal is not an experience catalog entry, and it is not a request for Game Core to select among predefined adventures. There is no requirement that every valid capability combination, sequence, or player trajectory be manually authored before it can occur.

Novelty remains bounded. AI cannot invent fundamental capabilities, redefine rules, bypass constraints, violate invariants, grant arbitrary rewards, establish progression, create authoritative memory, or introduce unsafe gameplay. Game Core decides whether the novel proposal belongs within the valid generative space.

## Safety Boundaries

Safety requirements are part of the authoritative generative boundary. A proposal must remain compatible with:

- age-appropriate content;
- child-safety requirements;
- no emotional dependency or secrecy;
- no coercion or manipulation;
- no unsafe real-world instructions;
- no adult content;
- no unnecessary sensitive child information; and
- no unrestricted external information during normal gameplay.

AI cannot use narrative framing or novel capability composition to bypass these boundaries. Game Core must reject or prevent any proposal that would create unsafe or inappropriate gameplay, and acceptance of a proposal cannot make an unsafe claim authoritative.

## Relationship to Existing Architecture

This document elaborates the existing architecture without redefining it.

- **ADR-001 — Game Core Authority:** Game Core remains authoritative over state, rules, validation, transitions, progression, rewards, and accepted consequences. The proposal model gives AI no alternate authority path.
- **ADR-002 — Bounded AI:** AI remains a bounded narrative and creative engine. This document defines the semantic information AI may propose without allowing it to invent mechanics or become a second game engine.
- **ADR-006 — AI/Game Core Contract:** The Gameplay Proposal is the conceptual untrusted proposal that crosses the controlled Game Core–AI boundary. It must be validated before it can be used, and only Game Core may accept and apply authoritative results.
- **ADR-007 — AI-Driven Player Experience:** AI generates concrete gameplay through bounded generation rather than selecting from a finite catalog. This model provides the semantic shape of the generated gameplay proposal.
- **`generative-capability-space.md`:** The proposal must remain within the generative capability space defined by capabilities, rules, constraints, invariants, state, progression boundaries, and safety boundaries.
- **`capability-model.md`:** The proposal composes reusable, applicable capabilities. It may express novel combinations and sequences without turning combinations into predefined experiences.
- **`generated-sequence-and-player-actions.md`:** The proposal describes a bounded gameplay context rather than a rigid script or predefined decision tree. Player actions remain independent and can shape what happens next.
- **`generated-gameplay-context-and-state.md`:** The proposal is not authoritative state, and an Accepted Gameplay Context is not a new source of truth. State transitions and consequences remain under Game Core authority.
- **`ai-game-core-generative-contract.md`:** This document elaborates the meaning of the Generated Gameplay Proposal within the controlled context, proposal, validation, and accepted-context relationship.

## Explicit Non-Goals

This document does not define:

- TypeScript interfaces, classes, or field-level contracts;
- JSON, DTOs, schemas, serialization, or payload formats;
- APIs, networking, WebSockets, REST, or GraphQL;
- prompts, models, providers, or AI configuration;
- LangChain, LangGraph, Vercel AI SDK, agents, or orchestration frameworks;
- validation algorithms or correction/retry implementation;
- database structures, persistence, or event-storage mechanisms;
- UI or player-facing rendering implementation;
- concrete gameplay mechanics, quests, adventures, or mini-games;
- a gameplay catalog or finite experience library; or
- the final representation of capabilities, entities, state, consequences, or lifecycle conditions.

It also does not define a new architectural authority. It is a conceptual semantic model for proposals under the approved Game Core–AI contract.

## Design Principles

- **AI proposes gameplay; Game Core determines whether it can become valid gameplay.**
- **A proposal communicates meaning, not authoritative state.**
- **Game Core validates the proposal against the generative capability space, not an authored experience catalog.**
- **Capabilities may be recombined; unsupported mechanics may not be invented.**
- **Player actions remain independent inputs to Game Core.**
- **Possible or expected consequences are not actual consequences.**
- **Only accepted Game Core transitions establish facts, state, and consequences.**
- **Narrative framing can explain a situation but cannot create world truth.**
- **The minimum sufficient contract is preferred over a generated script or duplicate game engine.**
- **Novelty is allowed within authoritative capability, rule, progression, and safety boundaries.**
