# AI Capability Orchestration

This document defines the conceptual orchestration model for bounded AI capabilities in the AI Pet Game. Orchestration coordinates application logic, Game Core, and AI capabilities without becoming an authority over gameplay or an autonomous agent system.

## Orchestration model

AI orchestration is the controlled coordination of Game Core/application logic with a bounded AI capability. It determines whether AI is useful, selects an allowed capability, assembles controlled context, invokes that capability, routes the result through validation, and returns accepted content or safe fallback behavior.

The orchestrator is not an independent authority. It must not:

- Define game rules.
- Decide authoritative outcomes.
- Modify Game Core state directly.
- Invent new capabilities.
- Bypass validation.
- Become a second game engine.

The conceptual responsibility is:

```text
Player intent
        ↓
Game Core/application evaluation
        ↓
AI needed and capability identified, if applicable
        ↓
Minimum controlled context
        ↓
Bounded AI capability
        ↓
Validation
        ↓
Accepted content or safe fallback
        ↓
Game Core transition, where applicable
```

The exact boundary between Game Core and application orchestration may evolve. The authority hierarchy must not: Game Core decides, persistence records, clients present, and AI proposes or narrates.

## AI is not the default path

Not every player interaction should invoke AI. Game Core or application logic may handle an interaction entirely through deterministic behavior when:

- No creative generation is required.
- The result is already defined.
- The action is purely mechanical.
- Deterministic behavior provides the better result.
- AI would add no meaningful player value.
- The interaction concerns an authoritative state transition.

AI may be useful for contextual Pet dialogue, narrative variation, bounded Adventure or Quest variation, contextual framing of supported Activities, or another explicitly supported creative capability.

Minimizing unnecessary AI use improves predictability, safety, latency, cost, and testability. It also prevents the product from treating every player question as a general-purpose conversation request. The game should use AI where it enriches the core loop, not where deterministic Game Core behavior is already sufficient.

## Capability selection

Capability selection is a deterministic, bounded application/game decision. It considers:

- Player intent.
- Current authoritative game state.
- Current world and content context.
- Active Adventure, Quest, Activity, or Mini-game.
- Relevant Pet personality state.
- Relevant structured game memory.
- Progression and content availability.
- Whether the requested behavior is supported.
- Whether AI provides meaningful value.
- Applicable child-safety and real-world boundaries.

The selected capability must exist as an explicitly supported game capability. The model itself must not decide what capability it has, expand its scope, or turn an allowed request into an unrelated operation.

If no capability is appropriate, the interaction should remain on a deterministic or authored path, be handled as an ordinary Game Core input, or receive a safe bounded response. The absence of an AI invocation is a valid result.

## Capability categories

The following categories are established by the AI content and narrative model. Their exact contracts remain implementation concerns.

### Pet dialogue

**Selection:** Use when the current interaction benefits from child-appropriate Pet expression or contextual response.

**Context:** Current interaction, bounded world situation, selected personality context, relevant memory, and applicable narrative and safety boundaries.

**Result:** Primarily narrative dialogue or presentation content.

**Validation:** Structural, semantic, and safety validation apply. Dialogue must not be interpreted as an implicit gameplay command. If it includes a gameplay-affecting proposal, that proposal requires the stronger validation path.

**Fallback:** Authored or deterministic dialogue, a simpler bounded response, or no generated content.

Pet dialogue cannot infer the child's identity, create memory, change personality, grant a reward, or declare an outcome merely by stating that it happened.

### Narrative variation

**Selection:** Use when an existing Place, Experience, Adventure, Quest, Discovery, or accepted outcome benefits from varied presentation.

**Context:** The relevant supported content, current state, player intent, progression or availability, selected personality and memory, and presentation constraints.

**Result:** Narrative framing, descriptive variation, tone, or other presentation content.

**Validation:** Structural, semantic, and safety validation must ensure compatibility with the established world and current state. It does not independently change authoritative state.

**Fallback:** Authored or deterministic presentation that preserves the same world meaning and outcome.

Narrative variation may make an experience feel different while preserving its identity, supported capabilities, and domain rules.

### Adventure variation

**Selection:** Use when an already supported Adventure can benefit from bounded narrative or content variation.

**Context:** Current Adventure state, supported Adventure definition, player intent, relevant Area or Experience, permitted variation, progression, memory, personality, and safety limits.

**Result:** A narrative response or a bounded gameplay-affecting proposal within the existing Adventure capability.

**Validation:** Any proposal must pass structural, semantic, safety, and Game Core domain validation. Game Core retains authority over lifecycle, objectives, activities, completion, rewards, progression, and state transitions.

**Fallback:** A predefined Adventure path, deterministic variation, safe bounded content, or no state change.

The capability cannot invent an Adventure type, completion condition, mechanic, or consequence.

### Quest variation

**Selection:** Use when a predefined Quest concept permits bounded variation in content or narrative.

**Context:** Current Quest state, supported objective and rules, player intent, relevant Adventure or Area, permitted variation, memory, personality, and safety boundaries.

**Result:** Narrative variation or a bounded proposal for an existing Quest concept.

**Validation:** Game Core validates compatibility with the Quest, current state, objectives, completion conditions, failure semantics, and allowed consequences.

**Fallback:** Authored or deterministic Quest content, a safe bounded response, or no Quest transition.

The capability cannot invent arbitrary objectives, completion rules, rewards, or progression.

### Mini-game framing or bounded variation

**Selection:** Use when a supported Activity or Mini-game benefits from contextual framing or explicitly permitted content variation.

**Context:** Supported Mini-game definition, current Adventure or Quest context, player intent, allowed inputs and outcomes, Pet/world context, and safety constraints.

**Result:** Narrative framing or a bounded proposal around an existing Mini-game concept.

**Validation:** Any gameplay-affecting proposal must be checked against the supported Mini-game rules and accepted result boundaries. The client presents and collects input; Game Core determines the result.

**Fallback:** Deterministic or authored framing, the standard supported activity, or no activity change.

The capability cannot define new mechanics, change rules, determine scores, grant rewards, or declare completion.

### Contextual adaptation

**Selection:** Use when a supported narrative experience should reflect relevant current state, memory, personality, progression, or prior accepted gameplay.

**Context:** Only the selected facts relevant to the current capability and player interaction.

**Result:** Adapted narrative expression or bounded supported content variation.

**Validation:** The result must remain child-safe, world-consistent, and within the selected capability. It must not become unrestricted profiling or a new authority over game state.

**Fallback:** Neutral, authored, or deterministic expression that does not depend on unavailable context.

Contextual adaptation must not silently expand into personality inference, unrestricted behavioral surveillance, or a new gameplay capability.

## Decision flow

The conceptual decision flow is:

```text
Player intent
        ↓
Game Core/application evaluation
        ↓
Determine whether AI is needed or useful
        ↓
Identify an explicitly supported capability
        ↓
Construct minimum controlled context
        ↓
Invoke the bounded capability
        ↓
Receive narrative response or gameplay-affecting proposal
        ↓
Apply appropriate validation
        ↓
Accepted result or safe fallback
        ↓
Game Core determines and applies any authoritative transition
```

AI may be invoked before or during a supported interaction when the application flow requires creative content, but the orchestrator must never treat invocation itself as a gameplay decision. A provider response is not an accepted result. Only Game Core can determine whether an accepted state transition and domain event follow.

## Controlled context selection

Context selection is capability-specific and is itself a safety boundary. The orchestrator should provide only what is necessary for the selected capability, such as:

- Relevant current game state.
- Relevant world and content definitions.
- Player intent.
- Current Adventure, Quest, Activity, or Mini-game context.
- Selected Pet personality state.
- Relevant structured game memory.
- Progression and content availability.
- Applicable narrative and child-safety constraints.

The orchestrator should avoid sending:

- Complete database records.
- Unrestricted game state.
- Raw conversation history by default.
- Secrets or credentials.
- Infrastructure details.
- Unnecessary child information.
- Unrelated gameplay history.

Context should be minimal, structured, relevant, and safe. The existence of information in persistence does not make it appropriate for AI context. The model must not be allowed to discover additional context by querying the game, database, or external services.

## Narrative versus gameplay orchestration

Orchestration must preserve the distinction between narrative and gameplay-affecting output.

### Narrative capability

A narrative capability produces presentation or content: dialogue, storytelling, tone, description, or framing. It does not independently alter authoritative state.

Generated text saying that a Quest is complete, a reward was earned, or the Pet evolved must remain a narrative claim unless Game Core independently determines that fact through valid rules.

### Gameplay-affecting capability

A gameplay-affecting capability produces a bounded proposal for an already supported world or gameplay concept. It requires stronger validation and may be considered by Game Core as an input to a decision.

The orchestrator must not convert narrative output into a gameplay proposal after the fact merely because the text contains an apparent command or claim. The proposal must be represented and validated through the established contract.

## Validation orchestration

The orchestrator routes output through the applicable validation sequence:

1. **Structural validation:** Confirms that the result can be interpreted as the expected kind of output for the selected capability.
2. **Semantic or content validation:** Confirms that it is relevant, coherent, bounded, and compatible with the controlled context.
3. **Safety validation:** Confirms child-appropriateness, privacy boundaries, real-world boundaries, and absence of manipulation, dependency, secrecy, or unsafe behavior.
4. **Game Core/domain validation:** Determines whether a gameplay-affecting proposal is compatible with current state, rules, capabilities, progression, rewards, personality, memory, discoveries, and valid transitions.

Not every narrative response requires the same domain evaluation as a gameplay proposal, but every result must satisfy the boundaries applicable to its capability. Validation must not be weakened because:

- The provider or model is trusted.
- The output appears correct.
- The capability is usually safe.
- The same content worked previously.
- The output is structurally valid.

AI output remains untrusted in every case.

## Fallback orchestration

Fallback behavior is part of the capability's design. It should be deterministic where possible, authored where appropriate, bounded, child-safe, and consistent with the current game state.

Conceptual failures include:

- **AI unavailable:** Continue through a deterministic or authored path, or leave state unchanged.
- **Timeout:** Return the supported fallback without waiting indefinitely or inventing an outcome.
- **Malformed output:** Reject the result and use safe bounded behavior.
- **Unsafe output:** Reject it and preserve valid state.
- **Unsupported proposal:** Discard it; do not expand the capability.
- **Capability mismatch:** Do not reinterpret the output as another capability.
- **Validation rejection:** Use the defined fallback or no-op.
- **Provider or model failure:** Degrade the AI-assisted experience without corrupting the game.

Fallback must never silently invent mechanics, convert rejected content into accepted state, grant a reward, complete a Quest, alter personality, create memory, or evolve the Pet.

## Capability isolation

Each capability must have a clearly bounded purpose. A capability should not silently expand into another capability or assume authority that belongs elsewhere.

Examples of prohibited expansion include:

- Pet dialogue becoming personality inference.
- Narrative variation becoming Quest completion.
- Quest variation becoming reward assignment.
- Mini-game framing becoming rule definition.
- Contextual adaptation becoming unrestricted player profiling.

Capability isolation makes context, output, validation, fallback, and ownership understandable. It also limits the impact of a failure in one capability and keeps provider changes from changing the domain model.

## Orchestration and Game Core authority

Responsibilities remain distinct:

### Game Core

Game Core:

- Owns rules and authoritative state.
- Evaluates valid transitions.
- Owns progression, rewards, personality, memory, Pet evolution, and accepted outcomes.
- Validates gameplay-affecting proposals.
- Creates authoritative domain events from accepted transitions.

### Orchestration

The application/orchestration boundary:

- Determines whether and how AI may assist.
- Selects an explicitly supported capability.
- Prepares minimum controlled context.
- Invokes the capability.
- Routes output through validation.
- Coordinates fallback behavior.
- Maps the result to the surrounding application flow.

Orchestration must not decide the authoritative outcome or apply state changes directly.

### AI capability

The AI capability generates bounded narrative content or a structured proposal within the selected scope. It does not define rules, access unrestricted state, or mutate authoritative state.

### Persistence

Persistence records accepted authoritative state and applicable domain history. It does not select capabilities, validate AI meaning, or define gameplay rules.

### Client

The client presents accepted results and collects player interaction. It does not force AI invocation, select authoritative outcomes, or apply AI output directly to game state.

## Orchestration and the core gameplay loop

Orchestration supports the existing loop:

```text
Curiosity
    → interaction
    → Pet or narrative response
    → Adventure or Quest
    → Activity or Discovery
    → accepted outcome
    → progression, personality, memory, or Pet evolution
    → new curiosity
```

It should help the game move from curiosity toward meaningful play when AI adds value. It must not become a separate AI-driven loop in which the player remains in indefinite conversation without supported activities, discovery, or accepted consequences.

If AI does not contribute meaningful value to the current interaction, deterministic behavior should be preferred where appropriate. Orchestration exists to support the game loop, not to maximize the number of model calls or the amount of generated text.

## Orchestration and player agency

Orchestration should respond to supported player intent rather than redirecting the child toward whatever interaction a model prefers. It must not:

- Force an AI interaction.
- Force a Quest or Activity.
- Override explicit player choices.
- Create hidden consequences.
- Use AI to pressure continued play.
- Treat refusal or interruption as emotional failure.

AI may suggest supported possibilities, but Game Core determines whether they are valid. A player may decline an activity or stop an interaction without the orchestrator inventing punishment, guilt, or a negative Pet reaction.

## Orchestration and safety

Capability selection and context selection must respect the child-protection model. Safety is considered before and during invocation, not only after generation.

The orchestrator must preserve:

- Child safety.
- Data minimization.
- No emotional dependency or exclusivity.
- No secrecy or manipulation.
- No sensitive profiling.
- Real-world boundaries.
- Controlled world and content boundaries.
- Safe fallback behavior.

If a capability would require unsafe context, unsupported world access, unnecessary personal information, or an unbounded interaction model, it should not be selected. A post-generation safety check is necessary but not sufficient; unsafe requests should be constrained before they reach the capability where possible.

## Orchestration and personality

Personality is authoritative Game Core state. Orchestration may select relevant personality context for a capability when it serves the current interaction, but it must not expose more than necessary or turn personality into a child profile.

Personality may influence Pet expression and supported variation. AI does not infer, redefine, or persist personality state. Personality context must not silently expand the selected capability or authorize new mechanics, rewards, progression, or world behavior.

The exact personality traits remain intentionally undefined and require separate design and safety review.

## Orchestration and memory

Only relevant structured game memory should enter controlled context. Raw conversation transcripts should not become orchestration context by default.

Memory used for orchestration should be:

- Accepted by Game Core.
- Relevant to the current capability.
- Minimal and bounded.
- Safe for the child-facing experience.
- Consistent with current authoritative state.

AI output does not automatically become memory. Any memory change must result from a Game Core decision and valid state transition. Orchestration must not turn memory into unrestricted behavioral history or allow the model to repair, reinterpret, or expand authoritative memory.

## Orchestration and determinism

Determinism matters at the points that define game behavior:

- Capability selection should be deterministic and bounded.
- Game rules should be deterministic wherever practical.
- Validation should be deterministic wherever practical.
- Authoritative outcomes must follow Game Core rules.
- Fallback behavior should be predictable and safe.

AI may remain probabilistic in narrative generation, but variability must remain inside the selected capability. The same authoritative state and valid domain input must not produce different authoritative outcomes merely because the model used different wording.

## Provider and model independence

Orchestration operates independently of a specific model, provider, SDK, or inference runtime. Changing the provider or model may affect expression, latency, availability, or integration behavior, but must not change:

- Capability boundaries.
- Game Core authority.
- Validation responsibilities.
- Safety constraints.
- Accepted domain rules.
- Fallback ownership.

Ollama remains a local development option only. It is not part of the domain model and must not become a dependency of Game Core or the conceptual orchestration boundary.

## Failure boundaries

AI failure must degrade the AI-assisted experience, not corrupt the game. Conceptually:

- AI unavailable → deterministic or authored fallback.
- Invalid proposal → rejection and fallback.
- Unsafe content → rejection and fallback.
- Timeout → bounded fallback.
- Provider failure → fallback or no-op.
- Missing context → bounded or neutral behavior.
- Capability mismatch → rejection without reinterpretation.

No AI failure may directly produce partial authoritative state mutation. Progression, rewards, memory, personality, Pet evolution, Adventures, Quests, Activities, and domain events change only through accepted Game Core decisions.

## Extensibility

A new AI capability should require an explicit:

- Product and game purpose.
- Supported scope.
- Allowed controlled context.
- Allowed output category.
- Validation responsibility.
- Safety boundary.
- Fallback behavior.
- Relationship to Game Core authority.

Adding a capability must not automatically grant AI new authority. The capability should be understandable as a bounded extension of the existing game, not as a generic runtime mechanism for arbitrary model behavior. This document does not define a plugin system or generic runtime registry.

## Observability as a conceptual concern

Orchestration should make it possible to understand, at a conceptual level:

- Which capability was selected.
- Why AI was invoked rather than a deterministic path being used.
- What categories of controlled context were provided.
- Whether output was accepted, rejected, or replaced by fallback.
- Which broad failure or validation outcome occurred.

This supports debugging, safety review, testing, and product evaluation without making orchestration a second authority. No logging infrastructure, telemetry provider, tracing system, or event schema is defined here.

## Product-drift guardrails

Orchestration should prevent drift toward:

- A general-purpose chatbot.
- An autonomous AI agent.
- An AI companion whose primary purpose is conversation.
- Model-driven game logic.
- Unrestricted AI roleplay.
- An infinite procedural world.
- Unrestricted child profiling.

Warning signs include invoking AI for every interaction, allowing the model to select its own capability, passing unrestricted history as context, treating generated claims as state, or continuing conversation when the game could offer meaningful supported play.

The orchestration model is successful when it makes AI useful inside the core loop while keeping the game understandable and valid without AI.

## Non-goals

This document does not define:

- TypeScript interfaces.
- JSON schemas.
- Concrete prompts or prompt templates.
- LangChain or LangGraph.
- Autonomous agents.
- AI SDKs.
- Model or provider configuration.
- API endpoints.
- Database schemas.
- Queues or infrastructure.
- Exact validation algorithms.
- Exact fallback implementations.
- Personality traits.
- Exact game content.
- Exact gameplay mechanics.

## Architectural principles

1. **Orchestration selects bounded AI assistance; it does not decide gameplay.**
2. **AI is optional and should not be the default path for every interaction.**
3. **Capability selection is deterministic, explicit, and bounded.**
4. **Controlled context is minimal, relevant, structured, and child-safe.**
5. **Narrative output is not an implicit gameplay command.**
6. **Gameplay-affecting proposals remain untrusted and require layered validation.**
7. **Game Core owns authoritative rules, state, transitions, and outcomes.**
8. **Fallback behavior preserves a valid game when AI is unavailable or rejected.**
9. **Personality and memory enrich context without becoming profiling or unrestricted history.**
10. **Provider and model changes must not alter authority or domain rules.**
11. **Orchestration strengthens the curiosity-to-play-to-discovery loop rather than replacing it.**
