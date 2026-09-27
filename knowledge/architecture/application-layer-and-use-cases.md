# Application Layer and Use Cases

## Purpose

The application layer sits between transport/API concerns and the framework-independent Game Core. It coordinates meaningful application flows while preserving the distinction between coordination and game authority.

The application layer may receive a player or client intent, assemble the context required for that interaction, invoke the appropriate domain and integration boundaries, and return a client-safe result. It does not own game rules, authoritative state, progression, rewards, personality, memory, Pet evolution, or accepted gameplay outcomes. Those responsibilities remain with Game Core as established by the project ADRs and domain-boundary documentation.

The application layer is therefore an orchestration boundary, not a second game engine. It should remain small enough to explain in terms of use cases and coordination responsibilities rather than becoming a parallel domain model.

## Use-case concept

A use case is an application-level flow representing a meaningful interaction or request. It describes how an intent moves through the system, which boundaries are consulted, and how an accepted result is returned. A use case may coordinate Game Core, persistence, AI Capability Orchestration, and other approved integrations when the interaction requires them.

A use case does not redefine domain rules. It does not decide whether a Quest is complete, whether a reward is granted, whether progression occurs, or whether Pet evolution is accepted. It asks Game Core to evaluate those questions through the established domain boundaries and uses the resulting authoritative decision to coordinate the rest of the flow.

Use cases should represent product-relevant interactions without requiring every transport operation or infrastructure concern to become a separate game concept. The same conceptual use case may be reached through different clients or transport mechanisms while preserving the same Game Core authority.

## Responsibility boundaries

The system responsibilities are separated as follows:

- **Client:** Collects player intent, presents safe results, and provides the player-facing experience. The client does not determine authoritative outcomes or reproduce Game Core rules.
- **API and transport:** Receives and transports requests, applies transport-level validation and access boundaries, and returns application results. It does not become the source of gameplay rules.
- **Application/use-case layer:** Coordinates a use-case flow, selects the necessary domain and integration boundaries, controls the movement of context, handles application-level failures and retries, and prepares a client-safe result.
- **Game Core:** Owns authoritative rules, state, transitions, validation, progression, rewards, personality, structured memory, Pet evolution, domain events, and accepted outcomes.
- **AI Capability Orchestration:** Determines whether bounded AI assistance is useful or necessary, selects an approved capability, assembles controlled context, and routes AI output through the required validation boundaries. It does not become authoritative.
- **AI capabilities:** Generate bounded narrative content or structured gameplay-affecting proposals within the supported world and capability boundaries. Their output is untrusted.
- **Persistence:** Loads and records accepted authoritative state and domain history. Persistence does not define gameplay rules or replace Game Core.
- **External integrations:** Provide approved supporting capabilities at explicit boundaries. They do not receive authority over Game Core state merely because a use case invokes them.

These responsibilities are complementary. Coordination may cross boundaries, but authority must not move with it.

## Intent flow

The conceptual flow for a player-facing interaction is:

```text
Player/client intent
        ↓
Transport/API
        ↓
Application/use case
        ↓
Game Core evaluation
        ↓
Optional AI assistance
        ↓
Validation
        ↓
Game Core transition
        ↓
Domain events
        ↓
Persistence
        ↓
Client-safe result
```

This is a coordination flow, not a requirement that every use case invoke every step. AI may be unnecessary. A request may be rejected before a transition. Some interactions may use deterministic behavior only. Where AI produces a gameplay-affecting proposal, Game Core remains responsible for evaluating and accepting or rejecting it; the application layer only coordinates that exchange.

Transport, application coordination, AI generation, persistence, and client presentation are not authoritative. Game Core evaluation and accepted transitions are authoritative. Domain events describe accepted domain outcomes; they do not authorize them.

## Interaction with Game Core

Application code may invoke Game Core to evaluate an intent, validate a bounded proposal, apply an accepted transition, and obtain domain events or other results defined by the domain boundary. It must not reproduce those rules in application conditionals, transport handlers, persistence logic, or AI orchestration.

Application code must not mutate authoritative state outside Game Core. It may coordinate multiple domain operations when that coordination is supported by the established Game Core boundaries, but it must not combine partial operations into an alternative interpretation of the game rules.

When a request is invalid, unsupported, or rejected by Game Core, the application layer should preserve that decision and return an appropriate safe result. It must not reinterpret rejection as success merely to keep a narrative or client flow moving.

## Interaction with AI Capability Orchestration

The application layer coordinates the broader use case. AI Capability Orchestration determines whether and how a bounded AI capability may assist within that use case.

The distinction is important:

- The application layer knows the purpose and sequence of the use case.
- AI Capability Orchestration selects an approved capability and controlled context.
- An AI capability produces narrative output or a bounded proposal.
- Validation determines whether the output is acceptable for its intended boundary.
- Game Core determines whether any gameplay-affecting result is an accepted domain outcome.

The application layer must not send arbitrary interactions to a general-purpose model or treat model output as a shortcut around Game Core. It should invoke AI only when the selected use case has a meaningful, supported need for bounded creative assistance. If deterministic behavior is sufficient, it is preferred.

The detailed capability model, context restrictions, safety boundaries, and fallback expectations are owned by the AI knowledge documents. This document preserves their application-level relationship without redefining those contracts.

## Persistence interaction

Persistence supports a use case by loading the state and history needed for evaluation and recording accepted authoritative results afterward. The application layer may coordinate this loading and recording, but it must not derive gameplay rules from database structure or treat stored values as authoritative merely because they exist.

Accepted Game Core state and domain history are the source material for persistence. A persistence failure must not be converted into an unrecorded claim that a transition succeeded. Conversely, persistence must not independently grant progression, rewards, memory, personality changes, Pet evolution, or other outcomes.

## Transaction and atomicity concepts

A use case may span a Game Core transition, domain events, persistence, and optional AI interaction. These steps must be coordinated so that AI generation or an external failure cannot create partial authoritative state.

AI generation occurs before acceptance of any gameplay-affecting result and is not itself a domain transition. A generated proposal can be discarded, rejected, or replaced by a bounded fallback without implying that the proposed outcome occurred. The authoritative transition is accepted only through Game Core, after applicable validation.

The application boundary should preserve the conceptual consistency of an accepted result and its recorded state and domain history. The concrete transaction or delivery mechanism is an implementation concern and is intentionally not defined here. The architectural requirement is that a failure must not leave the system claiming an outcome that Game Core did not accept.

## Idempotency and retries

Transport and application boundaries may receive duplicate requests, repeated delivery, or retryable failures. The application layer is responsible for coordinating retries in a way that preserves Game Core correctness and does not cause unintended repeated application of an interaction.

This is distinct from domain rules. Game Core defines whether a transition is valid and what its consequences are; application coordination handles whether an already attempted request should be retried, recognized, or safely returned without repeating an accepted outcome. Persistence and event-handling retries must follow the same principle: repetition at an integration boundary must not silently create additional authoritative outcomes.

No specific idempotency mechanism is prescribed by this conceptual document.

## Error and failure boundaries

Use cases should distinguish failures rather than treating all failures as generic gameplay outcomes:

- **Invalid client input:** The request cannot be meaningfully evaluated and should be rejected at the transport or application boundary.
- **Authentication or authorization failure:** The request is not permitted to proceed; it must not reach an authoritative transition.
- **Unsupported use case:** The requested interaction is not part of the supported product capabilities; no replacement mechanic should be invented.
- **Domain rejection:** Game Core determines that the intent or proposal is invalid under current game rules; authoritative state remains unchanged.
- **AI failure:** AI is unavailable, times out, produces malformed or unsafe output, or exceeds its capability; use a deterministic/authored fallback or no-op where appropriate.
- **Persistence failure:** Accepted state cannot be safely recorded; the application must not report durable success without preserving the required consistency.
- **External integration failure:** The integration cannot complete its supporting role; the use case should degrade or fail without transferring authority to that integration.
- **Unexpected application failure:** Coordination cannot be completed safely; the use case should fail without inventing an authoritative result.

Safe application results may communicate that an interaction could not proceed, but they must not conceal a rejected transition as an accepted one. Failure behavior should preserve child safety, world consistency, and the distinction between presentation and authoritative state.

## Determinism and dependency direction

Application coordination should be predictable. It must not allow model output, provider behavior, transport behavior, or persistence representation to redefine authoritative outcomes. Capability selection, use-case routing, validation boundaries, and transition requests should be deterministic where practical; AI may remain variable only within bounded narrative or proposal capabilities.

The conceptual dependency direction is:

```text
Transport/API → Application/use cases → Game Core
                           ↘ AI orchestration
                           ↘ Persistence
                           ↘ External integrations
```

Game Core remains independent of transport frameworks, application infrastructure, databases, AI providers, runtimes, and clients. The application layer depends on Game Core boundaries rather than making Game Core depend on application concerns.

## Testing implications

Use-case behavior should be testable as coordination distinct from the systems it coordinates. Conceptually, tests may verify that an application flow:

- accepts and normalizes supported intent at the appropriate boundary
- invokes Game Core rather than duplicating its rules
- invokes AI orchestration only when the use case requires meaningful bounded assistance
- supplies only the required controlled context
- routes outputs through the appropriate validation boundary
- preserves accepted and rejected Game Core results
- coordinates persistence only for accepted authoritative outcomes
- handles retries and failures without creating duplicate or partial state
- returns a client-safe result without exposing internal authority or sensitive context

These concerns are separate from Game Core domain tests, transport/API tests, persistence integration tests, and AI capability tests. The separation makes it possible to verify coordination without making domain correctness depend on a model, database, or framework.

## Security and child-safety implications

The application boundary is an important safety boundary. It should validate and normalize incoming intent, prevent clients from bypassing Game Core, and control what context reaches AI capabilities and external integrations.

Use-case coordination must preserve the established child-safety model: no unrestricted chatbot behavior, emotional dependency, secrecy, manipulation, unsafe gameplay, unrestricted external information, or unnecessary propagation of personal or sensitive child information. The application layer should pass only the minimum relevant context required for the selected use case and capability. It must not use broad database access, raw conversation history, or unrelated gameplay history as a shortcut for personalization.

Safety validation applies before and after AI assistance as appropriate. A safe client request does not make every generated result safe, and a valid narrative result does not authorize a gameplay transition.

## Relationship to the core gameplay loop

Application use cases coordinate the existing loop:

```text
Curiosity
→ interaction
→ Pet/narrative response
→ Adventure/Quest
→ activity/discovery
→ accepted outcome
→ progression/memory/personality/evolution
→ new curiosity
```

They may move a player intent from interaction toward a supported Adventure, Quest, activity, discovery, or accepted outcome. They may coordinate Pet presentation, bounded AI assistance, persistence, and the return of accepted consequences.

The application layer does not define the mechanics of the loop. Game Core defines what the interaction means, which transitions are valid, and which consequences are accepted. The application layer should support movement toward meaningful gameplay rather than creating a separate AI-driven loop of indefinite conversation.

## Product-drift guardrails

Application design should be questioned if it begins to:

- implement gameplay rules outside Game Core
- become an autonomous AI agent runtime
- accumulate a second domain model or business-rule repository
- let persistence determine what the game means
- place gameplay decisions in transport handlers
- route every interaction through AI by default
- treat model output as authoritative
- keep the player in conversation when supported gameplay is available

The application layer should remain a narrow coordination boundary. It exists to connect player intent, Game Core, bounded AI assistance, persistence, and client-safe results—not to become a hidden game engine or an alternative authority hierarchy.

## Non-goals

This document does not define:

- concrete API contracts, endpoints, or transport protocols
- request/response DTOs or JSON schemas
- TypeScript interfaces, classes, or source-code structure
- Express middleware or framework implementation
- authentication or authorization implementation
- database schemas, ORM details, or persistence technology behavior
- Cloudflare or other runtime implementation details
- queues, infrastructure, or speculative microservices
- AI SDKs, LangChain, LangGraph, model/provider configuration, or prompts
- exact AI validation algorithms or fallback implementations
- game mechanics, domain rules, progression systems, rewards, personality traits, memory schemas, or Pet evolution rules

Those concerns belong to their respective architectural, AI, or game-design boundaries and must not be redefined by the application layer.

## Architectural principles

- The application layer coordinates use cases; Game Core owns game authority.
- Clients express intent and present results; they do not determine outcomes.
- Transport carries requests; it does not implement gameplay.
- AI orchestration selects bounded assistance; AI does not become an authority.
- AI output is untrusted and must pass through the applicable validation boundaries.
- Persistence records accepted state and history; it does not define rules.
- Optional AI failure must degrade the assisted experience without corrupting the game.
- Application coordination must not reproduce or replace Game Core domain logic.
- Use-case flows should preserve determinism, retry safety, child safety, and player agency.
- The core gameplay loop remains game-first and valid without AI.
- Game Core remains framework- and infrastructure-independent.
