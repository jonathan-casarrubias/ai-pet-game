# Adventures, Quests, and Mini-games

This document defines the conceptual relationships between Adventures, Quests, and Mini-games in the AI Pet Game. It provides stable guidance for future Game Core and client work without defining exact content, mechanics, schemas, or implementation contracts.

## Core distinctions

### Adventure

An Adventure is a bounded game-world experience that combines narrative context, player interaction, exploration, discovery, and supported gameplay. It gives a meaningful shape to part of the core gameplay loop and provides continuity across one or more activities.

An Adventure is not merely a story. It has game-domain meaning: it may become available, be entered, progress through supported activities, and produce an accepted outcome. Its narrative gives the player context and motivation, while Game Core determines what actions, progress, and results are valid.

An Adventure may contain or reference Quests and Mini-games, but the exact relationship is open. Not every Adventure needs to contain every concept, and a supported interaction may produce a bounded outcome without completing a full Adventure.

### Quest

A Quest is a bounded objective or supported unit of activity within an Adventure or another established game experience. It gives gameplay direction without being reduced to a task string or a piece of narrative text.

A Quest has conceptual meaning in the domain: it can be available, accepted or started, progressed, completed, failed, abandoned, or interrupted when the game rules recognize those conditions. Game Core determines what counts as progress and what outcome follows.

The exact Quest types, structures, conditions, and relationship to Adventures remain open. AI may propose variation within an existing supported Quest concept, but it cannot create an objective or completion rule outside Game Core's defined capabilities.

### Mini-game

A Mini-game is a bounded playable activity that presents an interaction, challenge, or decision within an Adventure, Quest, or another supported experience. It is a gameplay concept with rules and valid results, not merely a UI component.

Game Core owns the domain rules that determine what inputs are meaningful and which results are accepted. The mobile client presents the activity, captures player input, and reports the relevant interaction through the application boundary. A client-side score, animation, or visual completion signal is not authoritative until Game Core validates the result.

The exact Mini-games and mechanics are intentionally undefined. The domain boundary must remain usable by different presentation technologies without moving authoritative rules into a client implementation.

## Narrative, objectives, and playable mechanics

These concepts are related but distinct:

- **Narrative structure:** The setting, sequence, context, characters, presentation, and meaning through which an Adventure or Quest is experienced. AI may enrich or vary narrative within bounded rules.
- **Gameplay objective:** The supported purpose or condition that the player is trying to accomplish within an Adventure, Quest, or Mini-game. Game Core determines whether the objective is valid and whether it has been met.
- **Playable mechanics:** The rules by which player input produces an in-game result. Game Core owns the valid domain behavior; the client owns the presentation and input experience.

Narrative can explain an objective, and a Mini-game can provide a way to pursue it, but narrative text does not define the objective and a visual interaction does not define the authoritative result. AI-generated narrative is not automatically a game rule.

## Relationships between the concepts

The conceptual relationship is:

```text
Curiosity and player intent
        ↓
Interaction or question
        ↓
Adventure or Quest becomes available or begins
        ↓
Narrative context and supported player activity
        ↓
Optional Mini-game and/or other bounded activity
        ↓
Discovery, learning, or other accepted outcome
        ↓
Progression, reward, personality, and structured memory effects
        ↓
New curiosity
```

An Adventure provides a broader bounded experience. A Quest provides an objective or unit of progress within that experience. A Mini-game provides a playable activity that may help the player pursue a Quest or participate in an Adventure. These are domain relationships, not requirements for a fixed hierarchy or a particular screen flow.

## Adventure lifecycle

The lifecycle is conceptual rather than a final set of statuses:

1. **Available or eligible:** Game Core determines that the Adventure can be presented or entered in the current state.
2. **Introduced:** The client and narrative may present the Adventure as a response to curiosity, interaction, progression, or another supported trigger. Presentation alone does not start it.
3. **Started:** A valid player intent causes Game Core to accept entry into the Adventure.
4. **Active:** The Adventure provides supported narrative, Quest, Mini-game, or other bounded activities. Game Core evaluates each transition and outcome.
5. **Completed:** Game Core determines that the Adventure's defined completion conditions have been satisfied and produces the accepted outcome.
6. **Failed:** If the design defines failure for the Adventure, Game Core determines that the relevant failure condition has occurred and applies only the valid failure outcome.
7. **Abandoned or interrupted:** If the player leaves or execution stops before a terminal outcome, Game Core determines whether the Adventure is abandoned, paused, resumable, or otherwise unresolved. A client interruption is not automatically completion or failure.

An invalid attempt to start, continue, or complete an Adventure is rejected without applying an unauthorized transition. The exact lifecycle, resumability, and terminal conditions remain open design decisions.

## Quest lifecycle

A Quest follows a similar conceptual lifecycle within an Adventure or supported game context:

1. **Available:** The Quest is recognized as valid for the current Adventure and state.
2. **Accepted or started:** Game Core accepts the player's intent to undertake it, when the design distinguishes acceptance from availability.
3. **In progress:** Player interactions, narrative decisions, Mini-games, or other supported activities contribute to the Quest according to Game Core rules.
4. **Completed:** Game Core validates that the Quest's objective or conditions have been met.
5. **Failed:** If defined by the game, Game Core determines that the Quest can no longer produce its intended success outcome.
6. **Abandoned or interrupted:** Leaving or losing continuity may produce a domain-recognized state, leave the Quest unresolved, or preserve it for later. The client cannot decide which interpretation applies.

Quest completion is an authoritative Game Core decision. A client message, local flag, narrative statement, or AI proposal cannot establish completion by itself.

## Mini-game lifecycle and authority

A Mini-game may be offered as part of an Adventure or Quest, entered after valid player intent, and presented by the mobile client. Its conceptual lifecycle is:

```text
Supported Mini-game is selected by Game Core
        ↓
Client presents the playable interaction
        ↓
Client reports supported player input or result data
        ↓
Game Core validates the domain result
        ↓
Accepted result, rejection, failure, abandonment, or interruption
```

The client may manage temporary input, animation, timing of presentation, and local interaction state. It must not independently award progression, mark a Quest complete, grant rewards, update personality, create discoveries, or persist a final result.

Game Core may define a Mini-game outcome without depending on how the client rendered the activity. This allows the same domain behavior to support the current mobile presentation and possible future clients or game technologies.

## Player intent and gameplay input

Player intent is an input to Game Core, not an authoritative action. The player may express intent to begin an Adventure or Quest, make a supported choice, participate in a Mini-game, submit an interaction, or leave an experience.

The API/application layer transports and coordinates that intent. Game Core evaluates it against the current authoritative state and applicable rules. The client may also report observations from a playable presentation, but those reports remain untrusted until Game Core validates them.

The distinction is important:

- The player can request an outcome but cannot grant it.
- The client can present a completed-looking activity but cannot declare authoritative completion.
- AI can describe or propose a variation but cannot make it valid.
- Game Core determines the accepted transition and outcome.

## Outcomes, discoveries, and evolution

Accepted Adventure, Quest, and Mini-game results may produce domain consequences when the established game rules support them. Conceptual consequences include:

- A discovery or learning outcome.
- Progression or access to a future bounded experience.
- A reward or optional inventory change.
- A personality-related gameplay signal or accepted personality change.
- A structured memory fact.
- A domain event describing a meaningful accepted result.

These consequences are not automatic merely because an activity was displayed or because AI narrated them. Game Core determines whether the outcome occurred and which consequences apply. Completion does not imply a particular reward, progression change, or personality update unless those effects are defined by the applicable game rules.

Structured memory should record meaningful accepted gameplay facts, such as completed experiences or discoveries, rather than raw narrative or unrestricted conversation. A domain event may describe the accepted fact, but neither events nor memory replace Game Core authority.

## AI-bounded variation

AI may enrich an Adventure, Quest, or Mini-game only within a capability explicitly defined by Game Core. Conceptual uses include:

- Varying narrative presentation for an existing Adventure or Quest.
- Suggesting content variation within a predefined Quest or Adventure concept.
- Suggesting permitted content or presentation variation within an existing Mini-game type.
- Adapting bounded expression to the pet's personality and relevant structured memory.

AI must not:

- Invent arbitrary mechanics or new Mini-game rules.
- Create unsupported Adventure or Quest types.
- Define objectives, completion conditions, failure conditions, or state transitions.
- Grant rewards, progression, inventory, discoveries, or personality changes.
- Decide that an Adventure, Quest, or Mini-game is complete.
- Treat generated narrative as authoritative factual or gameplay state.

AI output is always untrusted. Before it can affect gameplay, it must pass structural, semantic, safety, and Game Core domain validation through the established proposal contract. Game Core may accept the bounded proposal, reject it, or use a deterministic or predefined fallback.

## Failure and invalid gameplay behavior

The game must preserve safe bounded behavior when a proposal or playable interaction cannot be accepted:

- **Invalid player intent or input:** Reject it without an unauthorized state transition.
- **Malformed or unavailable AI output:** Use a supported fallback or leave state unchanged; do not invent a mechanic or outcome.
- **Unsafe or semantically invalid AI output:** Discard it and use safe bounded behavior where available.
- **Domain-invalid proposal:** Do not apply its suggested objective, rule, reward, progression, or completion state.
- **Client interruption:** Preserve only the state Game Core has accepted; do not infer completion from a disconnected or incomplete presentation.
- **Abandonment:** Treat it according to explicit game rules when they exist; otherwise keep the domain state safe and unresolved rather than guessing.
- **Failure:** Apply only a defined Game Core failure outcome. Failure must not be fabricated by the client or AI.

Rejected or failed operations must not partially apply rewards, progression, personality, discoveries, memory, events, or Adventure/Quest completion.

## Framework-independent Mini-game boundary

At the Game Core level, a Mini-game is defined by its supported domain intent, rules, valid inputs, and accepted results. Its rendering, controls, animations, and device behavior belong to the client or another presentation boundary.

The boundary is therefore:

```text
Game Core defines domain rules and accepted results
        ↓
Client presents a playable implementation
        ↓
Client reports player input or observed interaction
        ↓
Game Core validates and records the domain outcome
```

The Game Core must not depend on React Native, React, UI lifecycle, navigation, mobile APIs, or a particular future game technology. A client implementation may change while preserving the same conceptual rules and outcomes. The exact adapter or presentation contract is intentionally not defined here.

## Responsibilities by boundary

### Game Core

Game Core owns:

- The valid concepts and relationships for Adventures, Quests, and Mini-games.
- Eligibility, lifecycle transitions, objectives, rules, and authoritative outcomes.
- Validation of player intent, reported playable results, and AI proposals.
- Completion, failure, abandonment, interruption, and invalid-state semantics when defined.
- Progression, rewards, personality effects, discoveries, memory, and events resulting from accepted gameplay.
- Determining the actual result independently of narrative wording or client presentation.

### Mobile client

The client presents narrative, Adventure and Quest context, and Mini-game interactions. It collects player intent and playable input, maintains temporary presentation state, and renders accepted outcomes.

The client does not define domain rules, determine authoritative completion, grant rewards, update personality, or apply AI output directly to game state.

### AI capability and integration

AI generates bounded narrative or content proposals within a capability selected by the application and Game Core. It may vary expression and supported content, but it cannot invent mechanics, objectives, rewards, progression, completion rules, or state transitions.

AI output is untrusted and must pass the proposal contract before contributing to a Game Core decision.

### API and application layer

The API/application layer transports player intent, coordinates state loading and integrations, invokes AI capabilities when appropriate, and maps domain outcomes to client responses. It does not create alternate Adventure, Quest, or Mini-game rules.

### Persistence

Persistence stores and retrieves accepted Adventure, Quest, Mini-game, progression, reward, memory, and event state when those concepts are implemented. It does not define gameplay rules, validate client completion, or convert AI narrative into authoritative state.

## Open design decisions

This document intentionally leaves open:

- The exact Adventure and Quest types, structures, and relationships.
- Whether a given Adventure contains Quests, Mini-games, both, or neither.
- The exact Mini-game concepts, inputs, rules, scoring, and outcomes.
- The exact lifecycle states, resumability, and semantics of failure, abandonment, and interruption.
- Which accepted outcomes create discoveries, learning outcomes, rewards, progression, personality changes, memory, or events.
- The exact AI capabilities and permitted variation for each Adventure, Quest, or Mini-game concept.
- The exact fallback behavior for each feature when AI is unavailable or rejected.

These decisions must be made through future game-design and implementation work. They must preserve the established authority model: clients present and collect input, AI proposes bounded variation, Game Core decides valid gameplay, and persistence stores accepted results.
