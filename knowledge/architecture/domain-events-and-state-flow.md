# Domain Events and State Flow

This document defines the conceptual relationship between player intent, Game Core state transitions, domain events, persistence, and client-visible results. It clarifies how authoritative game facts are created without introducing a specific event infrastructure or changing the established authority boundaries.

## Main state flow

An interaction follows this conceptual path:

```text
Player/client intent
        ↓
API/application handling
        ↓
Load relevant authoritative state
        ↓
Game Core evaluates intent against state and rules
        ↓
Optional controlled context → AI proposal
        ↓
Structural, semantic, safety, and Game Core validation
        ↓
Accepted authoritative state transition
        ↓
Domain event(s), when meaningful facts occurred
        ↓
Persistence of accepted state and applicable events
        ↓
Client-safe result
```

AI is optional in this flow. A valid deterministic Game Core path must remain possible when AI is not needed or when AI generation fails.

The concepts in the flow are distinct:

- **Player/client intent:** A request or input expressing what the player is trying to do. It is not an accepted action or a state change.
- **API/application handling:** Transport validation, orchestration, state loading, integration coordination, and response mapping. It does not define gameplay.
- **Game Core evaluation:** The authoritative interpretation of the intent against current state and game rules.
- **AI proposal:** A bounded, untrusted suggestion produced from controlled context. It is never an authoritative event or state change.
- **State transition:** The Game Core-approved change from one valid authoritative state to another.
- **Domain event:** A structured fact that Game Core determined occurred as a consequence of an accepted transition.
- **Persisted state:** The stored representation of accepted authoritative state and applicable domain history.
- **Client-safe result:** A representation of the accepted outcome suitable for presentation. It does not create authority merely by being displayed.

## Domain events

A domain event is a conceptual statement that something meaningful and authoritative happened in the game domain. It is produced only from an accepted Game Core decision.

An event may describe a meaningful result involving an Adventure, Quest, Mini-game, Discovery, learning or discovery outcome, progression, reward, personality change, pet evolution, or structured game memory when those concepts are implemented. The exact event vocabulary is intentionally undefined.

Domain events are facts, not commands. They describe an outcome that Game Core has already accepted; they do not instruct another component to decide whether that outcome should happen. An event must not be used to bypass Game Core validation or to make a client, AI capability, or persistence layer authoritative.

### What a domain event is not

- A player request or client input.
- An AI proposal, generated line of dialogue, or narrative claim.
- A state mutation before Game Core acceptance.
- A database write or database record by itself.
- A presentation update, animation, local score, or UI flag.
- A command telling Game Core to grant a reward or apply progression.
- A replacement for current authoritative state.

The same accepted transition may produce multiple meaningful facts, while some internal state changes may not require an externally meaningful event. Whether a change produces an event is a domain decision, not an automatic consequence of every assignment or persistence operation.

## State transitions

Game Core evaluates a domain input against the current authoritative state and applicable rules. If the input is valid, Game Core determines the accepted outcome and the resulting state transition. If it is invalid, Game Core rejects it without applying an unauthorized change.

An accepted transition may change concepts such as:

- Pet or personality state.
- Adventure or Quest progress.
- Mini-game or discovery outcomes.
- Progression and rewards.
- Structured game memory.
- Other explicitly defined game-domain state.

The transition is the authoritative mechanism through which state changes. A client-side result, AI-generated narrative, database update, or event consumer cannot create an alternate transition.

When a transition produces meaningful domain facts, Game Core creates the corresponding event(s) as part of the same conceptual decision. The event describes the accepted transition; it does not authorize it after the fact.

## Event lifecycle

The lifecycle of a domain event is conceptual:

1. **Creation:** Game Core identifies a meaningful fact while determining an accepted state transition.
2. **Validation and acceptance:** The event is checked for consistency with the accepted outcome and domain rules. It cannot be accepted independently from the transition that caused it.
3. **Application:** The accepted state transition and its event facts become the authoritative result of the domain operation.
4. **Persistence:** The application persists the accepted state and applicable event history through the persistence boundary.
5. **Consumption:** Other parts of the system may use the event to update bounded derived information, memory, narrative context, or other supported behavior when appropriate.

Consumption must not reinterpret an event as permission to invent a new rule. If a consumer needs to cause another gameplay transition, it must provide a new input to the appropriate Game Core decision path.

This lifecycle does not require a queue, broker, event bus, or general event platform. The MVP may use direct request handling and persistence while preserving the same conceptual ownership.

## Atomicity and consistency

An accepted game action must not produce partially applied domain state. From the domain perspective, the accepted state transition and any event facts that describe that transition form one coherent result.

This means:

- A rejected action produces no authoritative transition and no authoritative event describing success.
- A rejected or invalid AI proposal cannot produce a progression, reward, personality change, discovery, or event.
- A client cannot observe a completed result that the authoritative state does not support.
- A meaningful event must not describe a state change that Game Core did not accept.
- Persistence failure must not be hidden by reporting durable success before the required accepted result is safely stored according to the implemented consistency behavior.

The exact mechanism for coordinating state and event persistence is not defined here. The requirement is conceptual consistency: consumers must not be given an authoritative fact that contradicts the accepted state, and accepted state must not be presented as complete when required persistence has failed.

Not every persisted value needs to be an event, and not every event needs to become a separate user-facing presentation. The state snapshot and event history have related but distinct purposes: state represents the current authoritative condition, while events describe meaningful facts that occurred.

## Ordering, idempotency, and duplicate handling

Retries and distributed execution can produce repeated requests or repeated processing. Conceptual sources include:

- A player or client resending an action after a timeout.
- The API retrying an operation whose result is uncertain.
- An event being delivered more than once to a consumer.
- A consumer restarting after partially handling work.
- A delayed operation arriving after a newer state has already been accepted.

The domain and application boundaries should therefore preserve these expectations:

- Repeating the same logical player operation must not unintentionally grant duplicate rewards, progression, discoveries, personality changes, or events.
- A consumer must be safe to run again when the same domain event is observed more than once.
- A retry must either produce the same accepted result, be recognized as already applied, or be rejected as stale or invalid; it must not silently create a second outcome.
- Causally related transitions must be processed in an order consistent with the authoritative state on which they depend.
- No global ordering should be assumed for unrelated game operations unless a future domain decision explicitly requires one.

These are domain-level expectations, not a prescription for particular database constraints, queues, or infrastructure. The implementation must establish enough identity, state awareness, and validation to prevent duplicate or out-of-order processing from corrupting game state.

## Event ownership

Responsibilities remain separated:

- **Game Core decides whether something happened.** It evaluates intent, proposals, current state, and rules.
- **Game Core creates authoritative domain events.** Events are derived from accepted decisions and transitions.
- **Persistence stores accepted state and applicable event history.** It does not determine whether an event is valid or whether a reward should be granted.
- **Consumers use events for supported follow-up behavior.** They may derive context or request another Game Core operation, but they do not become alternate game authorities.
- **The API/application layer coordinates the flow.** It transports inputs and results without defining the domain outcome.
- **Clients observe and present results.** They collect intent but do not create authoritative events.
- **AI proposes content or bounded variation.** It does not create authoritative events, even when its output describes an event or outcome.

The authority hierarchy is unchanged by event processing: Game Core decides, persistence records, clients present, and AI proposes.

## Relationship with game concepts

Authoritative domain events may arise when Game Core accepts meaningful changes involving:

- **Adventures:** An Adventure becomes available, progresses, reaches a defined outcome, or changes the game state.
- **Quests:** A Quest is accepted, progresses, completes, fails, is abandoned, or is interrupted when those concepts are defined.
- **Mini-games:** A playable result is validated and accepted, rejected, failed, abandoned, or interrupted according to domain rules.
- **Discoveries:** A meaningful game-world fact or realization is established through accepted play.
- **Learning or discovery outcomes:** Play produces an accepted outcome intended to support incidental learning or understanding.
- **Progression:** Accepted play changes the pet's or player's progression within defined rules.
- **Rewards:** Game Core grants an accepted consequence for a valid outcome.
- **Personality changes:** Accepted gameplay creates a valid personality-related signal or state change.
- **Structured game memory:** A meaningful accepted fact becomes part of bounded game history.
- **Pet evolution:** Accepted changes alter the pet's state, behavior, personality, history, or available bounded experiences.

These relationships are conceptual. No exact event names, reward rules, progression formulas, lifecycle statuses, or mechanics are defined here.

## Relationship with AI proposals

An AI proposal is not a domain event. It is untrusted input that may contribute to a future Game Core decision if it passes validation.

```text
AI proposal
        ↓
Structural validation
        ↓
Semantic and safety validation
        ↓
Game Core domain validation
        ↓
Accepted game decision
        ↓
Authoritative state transition
        ↓
Domain event(s), when meaningful facts occurred
```

An AI proposal can be rejected at any stage without producing an authoritative domain event. A model-generated statement such as “the pet discovered something” remains narrative or proposal content until Game Core determines that a discovery actually occurred.

AI may also be unavailable, malformed, unsafe, or incompatible with the current state. The game may use a deterministic or predefined fallback, preserve state, or return a safe unavailable result. No fallback may create an event for an outcome that Game Core did not accept.

## Player interaction flow

The player interaction model distinguishes:

1. **Player intent:** The player attempts an interaction through the client.
2. **Accepted game action:** Game Core validates the intent and accepts it within the current state and rules.
3. **State transition:** Game Core determines the authoritative change, if any.
4. **Domain event:** Game Core records a meaningful fact resulting from the accepted transition, if applicable.
5. **Persisted authoritative state:** The application stores the accepted state and applicable domain history.
6. **Client presentation:** The API returns a safe representation and the client presents the accepted result.

The client may display narrative before, during, or after this flow, but presentation does not establish that the action happened. A local completion flag, animation, score, or AI-generated explanation cannot substitute for Game Core acceptance.

## Synchronous and asynchronous behavior

Some operations may be completed synchronously: the request is evaluated, the accepted transition is determined, the required state is persisted, and a client-safe result is returned in the same conceptual flow.

Some resulting work may be processed asynchronously when a concrete feature benefits from it. For example, a meaningful accepted event may later be consumed to derive bounded context or perform a non-authoritative follow-up operation.

Asynchronous processing must preserve the same rules:

- Game Core decides the authoritative transition before downstream processing treats it as fact.
- An asynchronous consumer cannot bypass Game Core to create a new state change.
- Retries and duplicate delivery must not duplicate gameplay effects.
- A delayed or failed consumer must not rewrite the meaning of the original event.
- Whether a client can be told that an operation is complete before all follow-up work finishes is feature-specific, but durable authoritative success must not be claimed before required persistence has succeeded.

The MVP does not require a particular asynchronous architecture.

## Failure and retry semantics

- **Game Core rejects input:** Return a safe rejection or bounded result; apply no authoritative transition or success event.
- **AI is unavailable:** Use the supported deterministic or predefined fallback, or leave state unchanged. Do not bypass rules.
- **AI produces invalid output:** Reject it after the applicable validation layer and do not create an event from its claims.
- **Persistence fails:** Do not report durable success unless the accepted state and required event information are safely stored according to the implemented consistency behavior.
- **An event consumer fails:** Preserve the accepted source state and event; retry or safely defer the consumer without reapplying the original gameplay outcome.
- **A request is retried:** Recognize the same logical operation or re-evaluate it against current state so that duplicate processing cannot grant duplicate effects.

Failures must remain visible at the boundary that owns them. No layer may compensate for failure by inventing a state transition or event.

## Causation and correlation

At a conceptual level, **causation** describes what directly caused an operation or event. A player intent may cause an accepted action; an accepted action may cause a state transition; the transition may cause one or more domain events.

**Correlation** describes which operations belong to the same broader interaction or gameplay flow. An Adventure may involve several related actions, proposals, transitions, and events even though each has its own immediate cause.

These relationships support reasoning about gameplay history, debugging, retries, and related client experiences. They do not require a particular field layout, identifier scheme, or transport protocol.

## Domain events and integration events

A **domain event** is an internal game-domain fact: Game Core determined that a meaningful outcome occurred. It is defined by game meaning and authority.

An **integration event** is a message intentionally shaped for another system or external boundary. It may be derived from a domain event when a concrete integration requires it, but it is not automatically part of the MVP architecture.

For the MVP:

- Domain events may remain within the application and persistence boundaries.
- No external event bus or distributed event architecture is required.
- An integration event must not become a second source of game rules.
- External consumers must not be allowed to mutate authoritative state directly.

The distinction prevents infrastructure messaging concerns from leaking into Game Core while preserving a clear path for future integrations if justified.

## Determinism, testing, and auditability

Authoritative transitions and domain events support deterministic and inspectable gameplay:

- The same valid domain input and current state should produce a predictable rule-based decision wherever practical.
- AI variation should not change the authority of the resulting state transition.
- Tests can verify accepted and rejected transitions without relying on live clients, databases, or models.
- Domain events provide a meaningful record of accepted facts for debugging and behavioral inspection.
- Causal relationships help explain how a player interaction led to a state change and outcome.
- Persisted state and event history can support future reconstruction or replay-oriented capabilities if a later requirement justifies them.

This document does not define an event-sourcing or replay architecture. Auditability means that accepted domain behavior should remain understandable from authoritative state, accepted outcomes, and meaningful event facts.

## Architectural principles

1. **Game Core decides what happened.**
2. **Accepted state transitions create authoritative facts.**
3. **AI proposes; it does not create authoritative events.**
4. **Clients request and observe; they do not directly mutate authoritative state.**
5. **Persistence records accepted results; it does not define game rules.**
6. **Invalid or rejected actions and proposals do not partially mutate state.**
7. **Domain events describe facts that already happened; they are not commands.**
8. **Event processing respects consistency, ordering, and idempotency expectations.**
9. **Retries and duplicate delivery must not duplicate gameplay effects.**
10. **Asynchronous processing may coordinate follow-up work but cannot bypass Game Core authority.**
11. **Infrastructure choices must not leak into Game Core.**
12. **The architecture remains game-first: AI enriches bounded gameplay rather than replacing it.**
