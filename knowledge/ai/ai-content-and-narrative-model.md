# AI Content and Narrative Model

This document defines the conceptual model for AI-generated content and narrative inside the AI Pet Game's bounded fictional world. It clarifies what AI may generate, what remains authored or deterministic, and how generated content relates to Game Core authority and accepted gameplay.

## AI capability model

AI is a bounded content and narrative capability operating inside a predefined game world. It enriches Pet dialogue, narrative presentation, and supported gameplay variation; it is not an independent game system or an alternate source of world rules.

The model distinguishes:

- **World and game authority:** Game Core's authoritative definition of supported concepts, rules, state, transitions, and outcomes.
- **Content definitions:** Authored or otherwise explicitly supported world content, Experiences, Adventures, Quests, Activities, Mini-games, and allowed capabilities.
- **Deterministic game behavior:** Rule-based interpretation of player intent, gameplay input, progression, rewards, memory, personality, evolution, and valid outcomes.
- **AI-generated variation:** Untrusted narrative or bounded content variation produced for a capability and controlled context.
- **Authoritative game outcome:** The accepted result determined by Game Core after evaluating input, current state, rules, and any validated proposal.

AI can suggest how an existing game situation is expressed or varied. It cannot define the situation, decide what happened, or replace the game systems that give the situation meaning.

## Authored, deterministic, and AI-generated content

The world may combine three conceptual sources of content:

- **Authored content:** Deliberately designed world facts, content definitions, narrative foundations, supported activities, and gameplay structures.
- **Deterministic or procedural variation:** Rule-based variation within known content and capability boundaries.
- **AI-generated variation:** Model-produced dialogue, narrative, or bounded content proposals generated from controlled context.

These categories coexist because they serve different purposes. Authored content establishes identity and boundaries. Deterministic behavior provides repeatability, fallback, and testability. AI adds expressive variety and contextual responsiveness.

AI-generated content must always operate over concepts already supported by the game. It may vary expression or fill permitted creative space, but it must not become the mechanism that defines the world's existence, rules, capabilities, or authoritative state.

## Bounded AI capabilities

An AI capability is a named, limited purpose for using AI. Each capability has a supported scope, controlled context, allowed output, validation requirements, and safe fallback behavior.

### Pet dialogue

AI may generate bounded, child-appropriate Pet dialogue for the current interaction and world context. It may influence wording, tone, and narrative expression.

It must not decide that a gameplay action occurred, create a memory fact, grant a reward, change personality state, or make the Pet claim authority over the player's identity or private feelings. The result is primarily narrative unless a separate supported proposal is explicitly produced and validated.

### Narrative variation

AI may vary the presentation of an existing Place, Experience, Adventure, Quest, Discovery, or accepted outcome. It may adapt expression to selected personality, structured memory, current progression, and the current bounded situation.

It must preserve the underlying world and state. A narrative variation cannot add an unsupported location, mechanic, objective, reward, rule, or outcome. The result is primarily presentation and does not independently mutate authoritative state.

### Adventure variation

AI may propose bounded variation within an Adventure concept that Game Core already supports. Variation may affect narrative framing, content emphasis, or other explicitly allowed creative aspects.

It must not invent an Adventure type, define completion conditions, introduce unsupported activities, grant progression, or decide that an Adventure was completed. If the proposal can affect gameplay, it is untrusted gameplay-affecting input and requires Game Core validation.

### Quest variation

AI may propose bounded narrative or content variation within a predefined Quest concept. The Quest's objective, supported actions, completion conditions, failure semantics, and consequences remain Game Core responsibilities.

AI cannot invent arbitrary objectives or make a generated task authoritative merely by describing it. A Quest must already exist as a supported game concept before AI can vary its presentation or permitted content.

### Mini-game framing or bounded variation

AI may frame a supported Activity or Mini-game through narrative or provide variation explicitly permitted by that Mini-game capability. It may make an activity feel contextual and connected to the Pet or world.

It must not create a new mechanic, change the rules, determine the score or result, or declare completion. The client presents the activity and collects input; Game Core validates the result and determines the accepted outcome.

### Contextual adaptation

AI may adapt narrative expression to relevant current state, structured memory, personality, progression, and Adventure or Quest context. Adaptation should make the experience feel continuous without turning context into unrestricted model authority.

The capability may influence presentation or propose bounded variation, but the underlying world, rules, state, progression, rewards, memory, personality, and Pet evolution remain controlled by Game Core.

## Controlled context

Controlled context is the smallest sufficient, capability-specific view provided to an AI invocation. It is selected by Game Core and the application boundary before generation.

Depending on the capability, context may include:

- The current authoritative game situation.
- Relevant world and content definitions.
- Player intent and supported interaction context.
- Current Adventure, Quest, Activity, or Mini-game context.
- Selected Pet personality state.
- Relevant structured game memory.
- Relevant progression, availability, or accepted outcomes.
- Explicit narrative, content, and child-safety boundaries.

Context should be minimal, relevant, structured, bounded by the world, safe for children, and sufficient to preserve continuity. The AI should receive a purposeful view rather than every fact available in persistence.

Controlled context is not:

- Unrestricted database access.
- Raw access to all game state.
- An unrestricted conversation transcript.
- Permission to browse or retrieve unrestricted internet content.
- Secrets, credentials, infrastructure handles, or provider internals.
- Unnecessary personal or sensitive information about the child.

The AI must not infer that omitted information is available or use a proposal to request access to it. Context does not grant authority over the underlying facts.

## AI interaction flow

The conceptual flow is:

```text
Player intent
        ↓
Game Core/application evaluation and context selection
        ↓
Controlled AI capability
        ↓
Narrative response or structured gameplay proposal
        ↓
Structural, semantic, safety, and Game Core validation
        ↓
Accepted result or safe fallback
        ↓
Authoritative Game Core transition, where applicable
```

AI may be omitted when the interaction does not need it, and a valid deterministic path must remain possible where the feature supports one. AI output is always untrusted, including output that is structured, coherent, safe in isolation, or similar to a previously accepted response.

Only an accepted Game Core decision can change authoritative state, create an authoritative domain event, or produce a persisted gameplay consequence.

## Narrative response versus gameplay-affecting proposal

These outputs must remain distinct.

### Narrative response

A narrative response primarily affects presentation. It may include dialogue, storytelling, tone, descriptive framing, or variation in how an accepted situation is communicated.

It does not independently change authoritative game state. A line of dialogue cannot complete a Quest, grant a reward, create a Discovery, update personality, record memory, or evolve the Pet merely by stating that it happened.

### Gameplay-affecting proposal

A gameplay-affecting proposal suggests a bounded variation within an already supported world or gameplay capability. It must have an explicit meaning that Game Core can evaluate against current state and rules.

It is untrusted input, not an accepted outcome. It may contribute to a Game Core decision only after structural, semantic, safety, and domain validation. Game Core may accept it, reject it, replace it with a predefined alternative, or leave state unchanged.

The distinction prevents creative wording from becoming an implicit command and keeps the boundary clear between what the player sees and what the game has authoritatively decided.

## Explicit AI boundaries

AI cannot:

- Invent new game rules or redefine existing mechanics.
- Create unsupported mechanics, world systems, or capabilities.
- Redefine world structure or establish unsupported locations authoritatively.
- Invent or grant arbitrary rewards.
- Modify progression, unlocks, inventory, or achievements directly.
- Determine Pet evolution.
- Modify authoritative Pet personality state.
- Create authoritative memory entries.
- Declare a Discovery authoritative without Game Core acceptance.
- Complete Adventures, Quests, Activities, or Mini-games by itself.
- Directly mutate authoritative game state.
- Bypass Game Core validation.
- Treat unrestricted external information as game truth.

These restrictions preserve a simple product boundary: AI supplies bounded creative possibilities, while Game Core decides what the game contains, what happened, and what changes. Without this boundary, generated content could silently become a second game engine whose rules vary by model response.

## World consistency

AI-generated content must remain compatible with:

- Established world structure.
- Available Areas and Places.
- Supported Experiences.
- Adventures and Quests.
- Activities and Mini-games.
- Accepted Discoveries.
- Progression and content availability.
- Personality and structured memory context.
- Child-safety constraints.

AI may adapt expression without silently changing the underlying world. A generated description can make a Place feel different in the moment, but it must not contradict its authoritative identity or supported capabilities. A generated narrative can refer to a Discovery, but it cannot make the Discovery true without an accepted Game Core outcome.

World consistency also requires that variation remain compatible with Pet state, progression, rewards, memory, and prior accepted outcomes. The world should feel persistent even when the wording changes.

## Player agency

AI-generated content should support player agency within bounded possibilities. It may make choices understandable, frame supported opportunities, and respond to the player's intent in a way that feels contextual.

It must not:

- Manipulate the child.
- Create artificial urgency.
- Pressure the player to continue.
- Create emotional dependency or exclusivity.
- Override explicit player choices.
- Add hidden consequences outside defined game systems.
- Make the child responsible for the Pet's emotional wellbeing.

The player can request or choose an outcome, but cannot grant it. AI can suggest a supported possibility, but cannot force it into the world. Game Core evaluates the intent and determines the valid result.

## Validation and fallback

AI output passes through appropriate validation layers:

1. **Structural validation:** Determines whether the response can be interpreted as the expected kind of output for the capability.
2. **Semantic or content validation:** Determines whether the content is relevant, coherent, bounded, and compatible with the current context.
3. **Safety validation:** Checks child-appropriateness, prohibited dependency or manipulation, privacy boundaries, and other safety requirements.
4. **Game Core domain validation:** Determines whether a gameplay-affecting proposal is allowed by current state, supported capabilities, rules, progression, rewards, and valid transitions.

Not every narrative response requires the same gameplay validation as a proposal, but no output that could affect gameplay may bypass the applicable layers. Structural validity is not authority or correctness.

Invalid, unsafe, unavailable, or failed output must resolve to deterministic or authored behavior where available. The game must remain coherent when:

- AI is unavailable.
- Generation times out or returns no usable result.
- AI produces malformed or invalid content.
- Output falls outside supported capabilities.
- A proposal is rejected by validation.

Fallback behavior may provide predefined narrative, a simpler bounded response, a safe unavailable result, or no authoritative change. It must not invent replacement mechanics or pretend that a rejected proposal was accepted.

## Provider and model independence

This conceptual model is independent of any particular model, model vendor, inference provider, AI SDK, or orchestration framework. Ollama is a local development option only; it is not part of the domain model and must not become a Game Core dependency.

Changing a provider, model, local runtime, or SDK may change expression, latency, or integration behavior. It must not change the meaning of the world, the authority of Game Core, the validation responsibilities, or the requirement that AI output remain untrusted.

## Content lifecycle and evolution

AI capabilities may evolve as the game evolves. The game may add a supported capability, refine an existing content boundary, or change which variation is allowed. Such changes are deliberate product and Game Core decisions.

The conceptual lifecycle is:

1. A world or gameplay capability is defined by the game.
2. An AI capability is permitted to enrich a bounded portion of it.
3. Controlled context and allowed output are established for that capability.
4. AI generates narrative or a proposal within those boundaries.
5. Validation determines whether the output can be used.
6. Accepted domain behavior remains governed by Game Core.

Capabilities may be expanded or versioned by the game itself, but AI does not expand its own authority. Older, incomplete, or incompatible output should be rejected or handled through a safe fallback rather than interpreted permissively. The exact technical versioning mechanism is intentionally undefined.

## Relationship with game-domain concepts

AI-generated content relates to existing concepts as follows:

- **World:** AI expresses or varies supported world content; Game Core defines what the world contains and how it behaves.
- **Areas and Places:** AI may describe supported places; Game Core determines their identity, availability, and capabilities.
- **Experiences:** AI may frame or vary a supported opportunity; it cannot create an unsupported one.
- **Adventures:** AI may propose bounded narrative or content variation; Game Core owns lifecycle and outcomes.
- **Quests:** AI may vary a predefined Quest; Game Core owns objectives, completion, and consequences.
- **Activities and Mini-games:** AI may frame or vary supported content; Game Core owns rules and accepted results.
- **Discoveries:** AI may present a Discovery; Game Core decides whether the underlying Discovery occurred.
- **Personality:** AI may express selected authoritative personality context; Game Core owns personality state and evolution.
- **Structured game memory:** AI may receive selected memory as context; it cannot create authoritative memory by assertion.
- **Progression:** AI may narrate or propose bounded variation; Game Core decides advancement and availability.
- **Pet evolution:** AI may describe an accepted evolution; Game Core decides whether evolution occurs.
- **Domain events:** AI output is not an event; events originate from accepted Game Core transitions.
- **Accepted game outcomes:** AI may contribute a validated proposal, but only Game Core determines the accepted outcome.

In every case, narrative presentation and authoritative domain state remain separate.

## Product-drift guardrails

The AI layer must not turn the product into:

- An unrestricted chatbot.
- An AI companion whose primary purpose is conversation.
- An open-ended AI roleplay system.
- An infinite AI-generated world.
- A model-authoritative game.
- A prompt-driven personality system.
- A raw transcript-memory system.

These forms of drift weaken the core product loop:

```text
Curiosity → interaction → Pet or narrative → Adventure or Quest
    → activity or discovery → accepted outcome → progression and evolution
    → new curiosity
```

AI is valuable because it enriches this loop. If generated conversation can continue indefinitely without meaningful interaction, supported gameplay, discovery, or accepted consequences, the feature should be reviewed against the product's game-first direction.

## Non-goals

This document does not define:

- Concrete prompts.
- TypeScript contracts or interfaces.
- JSON schemas.
- Model selection.
- Provider configuration.
- Retrieval-augmented generation or other knowledge-retrieval architecture.
- Vector databases.
- LangChain or LangGraph.
- AI agents.
- API implementation.
- Database implementation.
- Exact game content.
- Exact gameplay mechanics.
- Final personality traits.

Personality traits and their safety implications require separate dedicated design and review. This document establishes only how AI may use authoritative personality context and express it within bounded content capabilities.

## Architectural principles

1. **AI is a bounded content capability inside the game world.**
2. **Authored and deterministic content establish the stable world and gameplay foundation.**
3. **AI provides variation and expression; it does not define the world or game rules.**
4. **Controlled context is minimal, relevant, structured, and child-safe.**
5. **Narrative responses are not authoritative state changes.**
6. **Gameplay-affecting proposals are untrusted and require validation.**
7. **Game Core decides outcomes, progression, rewards, memory, personality, and evolution.**
8. **Rejected or unavailable AI output produces safe bounded behavior without partial mutation.**
9. **The model, provider, SDK, and local runtime remain replaceable.**
10. **AI must enrich the curiosity-to-play-to-discovery loop rather than replace it.**
