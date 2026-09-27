# Game Core Domain Boundaries

Game Core is the authoritative domain component of the AI Pet Game. It defines what the game allows, evaluates inputs against the current game state, determines valid outcomes, and produces the state changes that may be persisted. It is the source of truth for game rules and state transitions, not a presentation, transport, persistence, or AI runtime.

## Authority and domain flow

The conceptual flow is:

```text
Player/client intent
        ↓
API/application transport boundary
        ↓
Game Core evaluates intent and current state
        ↓
Optional controlled context → AI → untrusted proposal
        ↓
Game Core validates proposal and determines outcome
        ↓
Authoritative state transition and domain events
        ↓
Persistence stores the accepted result
        ↓
API returns a client-safe representation
```

These concepts must remain distinct:

- **Player/client intent:** A request to perform a supported interaction. It is not proof that the action is valid and it does not directly change game state.
- **AI proposal:** A bounded creative suggestion produced from controlled context. It is untrusted input and has no authority over rules, rewards, progression, or state.
- **Authoritative domain decision:** Game Core's validated determination of whether an operation is allowed and what outcome and state transition follow.
- **Persisted state:** A stored representation of accepted authoritative results. Persistence records state; it does not decide what the state means or how it changes.

## Game Core responsibilities

### Authoritative game state

Game Core owns the meaning and validity of authoritative game state. Conceptual state may include:

- Pet state and identity.
- Personality and gameplay-related state.
- Progression and meaningful discoveries.
- Current or completed adventures and quests.
- Rewards, inventory, and other accepted game outcomes when those concepts are implemented.
- Structured game events and memory derived from meaningful play.

Game Core decides which state is authoritative, which values may change, and which changes are valid. Presentational state, temporary client state, raw conversation history, and AI-generated content are not authoritative merely because they exist or are displayed.

### State transitions

Game Core converts valid domain inputs into accepted or rejected outcomes. A state transition may update the pet, progression, personality, adventure state, rewards, or structured memory only when the applicable game rules allow it.

State transitions must be coherent and atomic from the domain's perspective: a rejected action or proposal must not partially apply progression, rewards, personality changes, events, or other authoritative effects. Persistence of a result happens after Game Core determines the accepted transition.

### Game rules and validation

Game Core owns the rules that determine:

- Whether a player intent is supported in the current state.
- Whether a proposed narrative, adventure, quest, or mini-game variation is within the game's defined boundaries.
- Whether a transition, progression change, reward, or personality effect is allowed.
- Whether a result is safe and compatible with the child-oriented game world.

Validation is not limited to whether data has the expected shape. A proposal or intent can be structurally valid and still be invalid for the current state, unsupported by the game, unsafe, or inconsistent with progression. Game Core makes the authoritative decision in those cases.

### Progression and rewards

Game Core determines how meaningful accepted play affects progression and rewards at a conceptual level. It may record discoveries, completed adventures, access to future bounded experiences, personality development, inventory changes, or other game-defined consequences.

The exact progression model, reward values, currencies, levels, experience, and unlock mechanics are not defined here. The boundary is the important point: AI and clients may present or suggest content, but only Game Core can grant an accepted reward or progression result.

### Pet personality and gameplay-related behavior

Personality is structured game state and a gameplay concern, not only a model prompt or presentation style. Game Core owns the authoritative personality state and the rules by which meaningful gameplay may influence it.

Game Core may use personality and structured gameplay history to determine valid reactions, narrative context, adventure presentation, or other supported behavior. AI may express personality through bounded content, but it cannot independently rewrite personality or infer an authoritative change from its own output.

### Adventures and quests

Game Core defines the valid boundaries for adventures and quests. It determines whether an adventure or quest can begin, continue, complete, or produce an outcome in the current state.

AI may propose a variation inside a predefined, supported concept. Game Core decides whether the proposal is compatible with the current adventure, rules, safety constraints, progression, and available outcomes. It may accept, reject, or replace the proposal with a safe bounded alternative. AI cannot invent unsupported mechanics, rewards, or state transitions.

### Mini-game rules and accepted results

Game Core owns the domain rules and valid results of mini-games. The client presents the interaction and collects input, while Game Core determines whether the reported interaction produces an accepted game outcome.

The rendering technology is outside this boundary. A React Native presentation or a future alternative presentation must not become the authority for success, rewards, progression, or other game effects. AI may provide bounded narrative or content variation around a supported mini-game, but it cannot define a new mini-game or bypass its rules.

### Structured events and game memory

Game Core may produce structured domain events that describe meaningful accepted facts, such as a completed adventure, discovery, accepted outcome, progression change, or personality-related change when those concepts are implemented.

Game memory should represent meaningful structured gameplay information rather than an unrestricted conversation transcript. It may include discoveries, completed adventures, structured preferences demonstrated through play, progression, personality-related signals, and other explicitly defined game-domain facts.

Events and memory do not replace state validation or create a separate source of truth. They are derived from accepted Game Core decisions and remain bounded by the domain model. The existence of a domain event does not require a general event platform or other infrastructure.

## Inputs and domain outcomes

Game Core receives domain-level inputs, not framework or infrastructure objects. An input may represent player/client intent, the relevant authoritative state, and an optional bounded AI proposal prepared through the AI integration boundary.

Game Core produces domain outcomes conceptually containing:

- An accepted or rejected decision.
- The valid gameplay result, if any.
- The authoritative state transition, if any.
- Structured domain events or memory updates, if applicable.
- Bounded narrative or presentation content that the client may render after acceptance.

These are domain outcomes, not API responses or persistence records. The API maps them to transport responses, and persistence stores the accepted authoritative state through its own boundary.

## Interaction with adjacent components

### Clients

Clients present the game, collect player input, and render accepted outcomes. They may maintain temporary or derived presentation state, but they do not decide whether actions are valid, award rewards, update progression, modify personality, or apply AI output directly.

### API and application layer

The API receives requests, performs transport-level handling, coordinates application operations, and maps domain outcomes to responses. It may load state and arrange calls across boundaries, but it does not define gameplay rules or create alternate state transitions.

The API must delegate authoritative decisions to Game Core. A trusted client, a well-formed request, or a successful provider response does not bypass Game Core validation.

### AI integration

Game Core identifies when an allowed AI capability may enrich an interaction and determines the controlled context that may be exposed. The AI integration invokes the selected provider or model and returns a bounded proposal or a failure.

AI proposes; Game Core decides. All gameplay-affecting AI output is untrusted, even when it is structured or appears consistent. Game Core validates capability, state compatibility, rules, progression, rewards, and applicable safety constraints before accepting any proposal. A failed or rejected proposal must result in safe bounded behavior or no authoritative mutation.

### Persistence

Persistence loads and stores authoritative game-domain data through a persistence boundary. PostgreSQL hosted on Neon is the selected persistence mechanism, but it does not define game rules, validate gameplay, grant rewards, or determine state transitions.

Game Core evaluates the operation first. Persistence stores accepted results and provides data needed for later domain evaluation. A database write is not itself a valid gameplay decision, and a stored value must not be treated as permission to bypass domain rules.

## Deterministic and safe behavior

Game Core behavior should be deterministic and testable wherever practical. Fundamental rules, valid transitions, progression constraints, rewards, and state integrity must not depend on model variability or client behavior.

When AI is unavailable, malformed, unsafe, or incompatible with the current state, Game Core must preserve a valid bounded game behavior. A feature may use a predefined or deterministic fallback, return a safe unavailable result, or leave state unchanged. No rejected proposal may cause partial mutation.

Child safety is part of domain validation. Game Core must not accept gameplay-affecting content or transitions that violate the bounded game world, introduce unsupported mechanics, encourage unsafe behavior, create emotional dependency, encourage secrecy, request unnecessary personal information, or otherwise conflict with established safety constraints.

## Explicit non-responsibilities

Game Core is explicitly not responsible for:

- Rendering screens, animations, audio, input controls, or other UI behavior.
- Managing React Native or React component state, lifecycle, navigation, or mobile APIs.
- Handling HTTP routing, middleware, request serialization, authentication, authorization, or API error mapping.
- Running Cloudflare Workers or depending on Express or another backend framework.
- Connecting directly to PostgreSQL or Neon, managing database sessions, or defining migrations and schema details.
- Invoking Ollama, an AI provider, a model, or an AI SDK directly as a domain dependency.
- Treating raw conversation history as authoritative game memory.
- Defining arbitrary mechanics, rewards, progression, or facts generated by AI.
- Replacing domain validation with client checks, API checks, database constraints, or prompt instructions.
- Defining infrastructure, deployment configuration, remote runtime behavior, or operational concerns.

These responsibilities belong to surrounding application, integration, presentation, persistence, or infrastructure boundaries. They may depend on Game Core's domain concepts, but Game Core must not depend on them in return.

## Framework and infrastructure independence

Game Core must remain independent of:

- React Native and React.
- Express and HTTP frameworks.
- Cloudflare Workers and other runtime-specific APIs.
- PostgreSQL, Neon, database clients, and persistence implementations.
- Ollama, any AI provider or model, and any AI SDK.
- UI lifecycle, navigation, mobile APIs, network clients, and infrastructure services.

Its inputs, decisions, state transitions, and domain outcomes must be expressible without those technologies. This allows the same authoritative game behavior to serve the current mobile client and possible future clients or game technologies without moving rules into presentation or infrastructure code.

The stable boundary is therefore: clients present and collect intent, the API transports and orchestrates, AI proposes, Game Core decides, and persistence stores accepted authoritative results.
