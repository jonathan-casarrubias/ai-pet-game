# System Architecture Overview

This document provides the conceptual architecture of the AI Pet Game. It explains responsibility boundaries and dependency direction without defining implementation contracts or infrastructure details that have not yet been designed.

## 1. Architecture goals

The architecture should:

- Keep Game Core authoritative for game state, rules, validation, progression, rewards, and outcomes.
- Use AI to enrich bounded narrative and creative variation without making gameplay correctness depend on model behavior.
- Keep Game Core independent of React Native, Express, Cloudflare Workers, PostgreSQL/Neon, and AI providers.
- Preserve deterministic, testable domain behavior wherever practical.
- Keep the MVP small, remotely accessible, and coherent enough to demonstrate the core gameplay loop.
- Prefer clear boundaries and simple communication over premature distributed-system complexity.

The architecture is designed to support future clients and infrastructure evolution, but extensibility should not introduce abstractions without a concrete requirement.

## 2. High-level system components

The system has these conceptual components:

```text
Mobile client
    ↓ HTTP request / response
Backend API and application boundary
    ├── Game Core
    ├── AI integration boundary
    └── Persistence boundary
            ↓
       PostgreSQL / Neon
```

- **Mobile client:** presents the game, collects player input, and renders accepted outcomes.
- **Backend API/application:** receives requests, validates transport-level input, orchestrates operations, and maps outcomes to responses.
- **Game Core:** owns authoritative game state, rules, validation, transitions, progression, personality behavior, and gameplay outcomes.
- **AI integration:** invokes a selected provider or model for bounded capabilities and converts untrusted responses into proposals for validation.
- **Persistence:** stores and retrieves authoritative game data through PostgreSQL with Neon.
- **Infrastructure boundary:** hosts and connects these components without leaking runtime-specific concerns into Game Core.

The diagram describes responsibilities, not a final deployment topology or a set of API endpoints.

## 3. Mobile client responsibilities

The initial mobile client uses React Native and TypeScript as the presentation layer. It is responsible for:

- Presenting the pet, narrative, adventures, and mini-games.
- Collecting player input and sending supported actions to the backend.
- Rendering accepted Game Core outcomes.
- Handling presentation state, screen lifecycle, and device-specific concerns.

The mobile client is not authoritative over game state. It must not decide whether an action is valid, award progression, calculate authoritative rewards, rewrite personality, or accept AI output directly as gameplay. Client state may be derived or temporary; authoritative state is decided by Game Core and persisted through the application boundary.

## 4. Game Core responsibilities and framework independence

Game Core is the domain authority. It owns:

- Authoritative game state and state transitions.
- Game rules and valid gameplay outcomes.
- Validation of player actions and AI proposals.
- Progression, rewards, inventory, personality behavior, and meaningful game events where those concepts are defined.
- Deterministic behavior needed for reliable gameplay and testing.

Game Core must remain independent of React Native, React, Express, HTTP, Cloudflare Workers, PostgreSQL, Neon, database clients, AI providers, and provider SDKs. It communicates through domain-level inputs and outputs rather than presentation, transport, persistence, or infrastructure objects.

This independence allows the same domain behavior to serve the initial mobile client and possible future clients or game technologies, including Unity, without moving rules into presentation code.

## 5. Backend API responsibilities

The backend is initially a TypeScript application using Express on a Cloudflare Worker. The API/application boundary is responsible for:

- Routing and HTTP request/response handling.
- Transport-level parsing and validation.
- Authentication and authorization boundaries when required.
- Loading and persisting data through the persistence boundary.
- Constructing controlled AI requests and coordinating AI responses.
- Delegating authoritative decisions to Game Core.
- Mapping domain, dependency, and infrastructure outcomes to safe API responses.

The API transports and orchestrates; it does not define gameplay rules. Route handlers, middleware, serializers, SQL, or provider calls must not become alternate sources of authoritative decisions.

## 6. AI integration boundary

AI is a bounded narrative and creative capability behind an explicit integration boundary. A representative flow is:

```text
Game Core identifies allowed capability and context
    ↓
AI integration constructs a controlled request
    ↓
Selected provider/model generates a response
    ↓
AI integration parses the response as untrusted input
    ↓
Semantic and safety checks
    ↓
Game Core validates the proposal against state and rules
    ↓
Accepted outcome or safe rejection/fallback
```

The integration boundary is responsible for provider invocation, response handling, parsing, and bounded proposal production. It must not grant the AI direct access to persistence, unrestricted game state, arbitrary tools, or state mutation.

AI output that can affect gameplay is never authoritative merely because it is well-formed. Game Core must determine whether it is allowed in the current state and what outcome, if any, should be applied.

## 7. PostgreSQL/Neon persistence responsibility

PostgreSQL hosted by Neon is the project's persistence mechanism from the beginning. Persistence stores and retrieves authoritative game-domain data, such as data associated with the player, pet, progression, adventures, events, rewards, or inventory when those concepts are implemented.

Persistence does not own game rules, validate gameplay, award rewards, or determine state transitions. The application loads the relevant data, Game Core evaluates the operation, and the accepted result is persisted through the appropriate boundary. A successful database write is not evidence that the gameplay decision was valid.

The architecture does not introduce SQLite, MongoDB, or a generic alternative-database abstraction merely for theoretical portability.

## 8. Representative gameplay/request flow

An interaction may follow this conceptual path:

```text
Player interacts in mobile client
    ↓
API receives and validates transport input
    ↓
Application loads required authoritative state
    ↓
Game Core identifies the valid domain operation
    ↓
Game Core selects controlled context for an allowed AI capability, if needed
    ↓
AI integration returns a bounded, untrusted proposal or fails
    ↓
Game Core validates the proposal and determines the outcome
    ↓
Accepted state transition is persisted
    ↓
API returns the result
    ↓
Mobile client renders the accepted outcome
```

AI is optional in this flow. A valid deterministic Game Core path must remain available when no AI capability is needed or when AI generation fails. No layer may skip Game Core validation because a request came from a trusted client or because a provider returned structured data.

## 9. AI failure and safe fallback behavior

AI failures include provider unavailability, timeout, empty or malformed output, schema failure, semantic or safety rejection, and proposals incompatible with current state or rules.

Failures must resolve to safe bounded behavior appropriate to the feature. A feature may use a deterministic narrative or gameplay fallback, preserve the current state, or return a meaningful unavailable result. The exact fallback is feature-specific and is not defined here.

The essential guarantees are:

- AI failure does not make valid gameplay impossible.
- A rejected proposal does not partially mutate authoritative state.
- The game never presents an unaccepted proposal as an applied outcome.
- Rewards, progression, inventory, personality, and events change only through accepted Game Core decisions.

## 10. Events and asynchronous processing

Game Core may produce meaningful domain events when an implemented behavior genuinely needs them. Events describe domain facts or outcomes; they do not replace Game Core validation or become an excuse to introduce a general event platform.

HTTP is the initial communication mechanism, and the MVP should prefer direct, understandable request flows. Asynchronous processing may be introduced when a concrete operation benefits from it, but any asynchronous worker or handler must preserve the same authority boundaries:

- Game Core still decides valid state transitions.
- Persistence still stores accepted authoritative results.
- AI output remains untrusted.
- Failure and retry behavior must not duplicate or partially apply gameplay.

Do not introduce event buses, queues, CQRS, or complex event infrastructure without a concrete requirement.

## 11. HTTP-first communication and conditional realtime use

The initial architecture is HTTP-first. HTTP is sufficient for the MVP's request, gameplay, persistence, and response needs and keeps the system easy to test and demonstrate remotely.

WebSockets should be considered only when a concrete realtime interaction requires them. Durable Objects should be considered only when a concrete coordination or shared-state requirement requires them. Neither is part of the baseline architecture, and neither should be introduced to anticipate scale without evidence.

If realtime infrastructure is added later, it remains a transport or coordination concern. It must not move authoritative rules into the client, socket handler, Durable Object, or infrastructure layer.

## 12. Mini-game architectural boundary

Mini-games are gameplay modules with a separation between domain behavior and presentation technology:

```text
Game Core determines supported rules and valid outcomes
    ↓
Mobile client presents input and visual interaction
    ↓
Game Core accepts and records the resulting outcome
```

The initial implementation may use React Native for presentation, while a future implementation could use another technology such as Unity. This is a compatibility direction, not a requirement to build a framework or final mini-game interface now.

AI may provide bounded narrative or content variation around a supported mini-game. It cannot invent arbitrary mechanics or bypass the Game Core outcome rules.

## 13. Dependency direction

Dependencies should point toward stable domain concepts and explicit boundaries:

```text
Mobile client → API/application → Game Core
                              ↘ AI integration → provider/model
                              ↘ persistence → PostgreSQL/Neon
Infrastructure hosts and connects the outer layers
```

The important constraint is that Game Core does not point outward to the mobile framework, API framework, runtime, database, or AI provider. The API and integrations may depend on Game Core contracts, while the database and provider remain replaceable infrastructure concerns.

## 14. AI/provider independence

The architecture is independent of Ollama, OpenAI, Gemini/Vertex, Anthropic, DeepSeek, LangChain, Vercel AI SDK, or any other provider, model, SDK, or framework. Ollama may be used as a local development baseline, but it is not a domain dependency.

Changing the provider or model may change creative output and integration configuration. It must not require changing Game Core rules, authoritative state, or the conceptual proposal-validation boundary. Provider-specific types and behavior stay outside Game Core.

## 15. Major failure boundaries

Failures should remain visible at the boundary that owns them:

- **Mobile failure:** presentation or connectivity problems; the client must not invent authoritative outcomes.
- **API failure:** malformed request, access failure, orchestration error, or response-mapping problem.
- **Game Core rejection:** invalid action, incompatible proposal, or rule violation; no authoritative mutation is applied.
- **AI failure:** unavailable provider, malformed output, unsafe content, or rejected proposal; use a safe fallback or leave state unchanged.
- **Persistence failure:** accepted domain outcome cannot be stored safely; do not report durable success unless persistence actually succeeds according to the implemented consistency behavior.
- **Infrastructure failure:** runtime or dependency availability issue; preserve safe error handling without exposing internals.

Failures must not be hidden by duplicating decisions in another layer. In particular, the API and client must not compensate for a failed Game Core decision by applying their own state changes.

## 16. Testing implications

Testing should follow the narrowest boundary that proves the behavior:

- Test Game Core rules, validation, transitions, progression, personality behavior, and proposal acceptance or rejection without React Native, HTTP, databases, or live AI providers.
- Test AI context construction, parsing, safety checks, fallbacks, and untrusted output with deterministic providers or fixtures.
- Test API parsing, access boundaries, orchestration, response mapping, and delegation with deterministic fakes where real infrastructure is not the behavior under test.
- Test persistence for storage, retrieval, consistency, and failure behavior rather than for domain rules.
- Add integration or external-provider tests only when the real boundary is itself important.

Tests should verify no partial mutation after rejected actions or proposals and should inspect architectural boundaries when a change could introduce provider, database, UI, or runtime coupling into Game Core.

## 17. Scalability and evolution philosophy

The architecture starts as a small vertical slice: one backend Worker, HTTP communication, a clear Game Core boundary, PostgreSQL/Neon persistence, and replaceable AI integration. Scale should be added in response to concrete needs such as capacity, isolation, coordination, ownership, or operational constraints.

Possible future evolution includes additional Workers, realtime communication, or coordination infrastructure, but these are deliberate changes rather than defaults. Do not introduce microservices, Redis, vector databases, Durable Objects, WebSockets, CQRS, event buses, or similar systems merely because they may be useful at a larger scale.

Optimize first for clarity, correctness, determinism, testability, and a demonstrable product loop.

## 18. Security and child-safety boundaries

The architecture supports a child-oriented product and therefore limits both data exposure and behavioral scope:

- The mobile client receives only what it needs to present the game.
- The API validates external input and maintains authentication and authorization boundaries when implemented.
- Controlled AI context excludes secrets, infrastructure handles, unrestricted history, and unnecessary child or player information.
- AI cannot browse unrestricted external information during normal gameplay or directly access persistence.
- AI output is validated for capability, semantics, safety, and Game Core compatibility.
- No layer may use AI to create emotional dependency, encourage secrecy, request unnecessary personal information, introduce unsafe content, or bypass game boundaries.

The bounded game-world design is itself a safety boundary. Prompt instructions are not sufficient on their own; safety must be reinforced by limited context, structured output, validation, and safe fallbacks.

## 19. Core architecture principles

The system can be summarized by these principles:

1. **Game Core is authoritative.** It owns rules, state, validation, and outcomes.
2. **AI proposes; Game Core decides.** AI is a bounded creative layer and all gameplay-affecting output is untrusted.
3. **Clients present; they do not decide.** The mobile client renders accepted outcomes and collects input.
4. **The API orchestrates; it does not define gameplay.** Transport and application concerns remain separate from domain rules.
5. **Persistence stores; it does not govern.** PostgreSQL/Neon records authoritative data without replacing Game Core.
6. **Failures degrade safely.** AI or infrastructure failure must not corrupt state or make valid gameplay impossible.
7. **Domain code stays independent.** Game Core remains free of UI, HTTP, runtime, database, and provider dependencies.
8. **Infrastructure is replaceable and justified by need.** Complexity is introduced only for a concrete requirement.
9. **Determinism and testability come first.** Creative variation must not become a dependency for fundamental correctness.

## 20. Explicitly undefined implementation details

This overview intentionally does not define:

- API endpoints or final request/response contracts.
- Database tables, migrations, ORM choices, or repository interfaces.
- TypeScript interfaces or package-level implementation contracts.
- AI prompts, proposal schemas, model selection, token budgets, or provider configuration.
- Authentication or authorization implementation.
- WebSocket protocols or Durable Object behavior.
- Event schemas, queues, workers, or asynchronous processing contracts.
- Mini-game interfaces or rendering architecture.
- React Native state-management or UI architecture.
- Deployment configuration, CI/CD, or observability implementation.

Those details belong in focused implementation documents or future architectural decisions when justified. The stable architectural model is the boundary itself: the mobile client presents, the API orchestrates, AI proposes, Game Core decides, and PostgreSQL/Neon persists accepted authoritative data.
