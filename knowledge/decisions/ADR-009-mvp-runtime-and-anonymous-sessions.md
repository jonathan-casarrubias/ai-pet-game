# ADR-009: MVP Runtime and Anonymous In-Memory Game Sessions

## Status

Approved

## Date

2026-09-27

## Context

The AI Pet Game MVP must be remotely accessible and demonstrable, but the primary validation target is the generative AI gameplay experience, not account management or backend infrastructure. The team needs to reach a playable, visually compelling experience as quickly as possible.

Introducing authentication, user accounts, durable persistence, or a full production-oriented application runtime at this stage would add significant complexity without advancing the core product thesis: that AI-driven bounded generation can produce engaging, player-specific gameplay experiences.

The existing Game Core already supports the full gameplay loop through in-memory `GameState` and the proposal resolution flow established in ADR-001, ADR-006, and ADR-007. The MVP should leverage this existing foundation rather than building unnecessary infrastructure on top of it.

## Decision

The MVP uses an **anonymous, in-memory session model**. No authentication, no user accounts, and no durable server-side persistence are required for the initial demonstration.

### MVP Runtime Model

The runtime/service layer is intentionally minimal and acts primarily as an intermediary between the client and Game Core:

1. Opening the application creates a new anonymous game session for the MVP. The MVP does not resume a previous session because `GameState` is ephemeral and stored only in memory.

2. The initial pet is available immediately without any account creation or setup.

3. `GameState` is kept in memory for the lifetime of the session.

4. The runtime delegates all gameplay decisions and state mutation to Game Core.

5. The runtime injects the `GenerationProvider` abstraction (currently `OllamaGenerationProvider`) but does not make Game Core dependent on any specific provider implementation.

6. The runtime must not become a second game-authority layer.

### Anonymous Session Model

An anonymous session has these properties:

* **Temporary:** Exists only for the duration of the session while the runtime is active.
* **No user identity:** No registered user account or persistent identity is required.
* **In-memory:** `GameState` lives in process memory.
* **Disposable:** Restarting the runtime resets all in-memory sessions and their state.
* **Isolated:** Each session owns its own independent `GameState` and gameplay history.
* **Non-multiplayer:** Sessions do not interact with one another and do not share gameplay state.

Multiple anonymous sessions may exist simultaneously within the same runtime/process. Supporting multiple isolated sessions does not imply multiplayer functionality.

This is distinct from the future registered user model:

| Aspect        | Anonymous Session (MVP)  | Registered User (Future)                      |
| ------------- | ------------------------ | --------------------------------------------- |
| Identity      | None                     | User account with persistent identity         |
| State storage | In-memory, process-local | Database-backed (PostgreSQL/Neon per ADR-004) |
| Persistence   | Ephemeral                | Durable across sessions                       |
| Scope         | Runtime/session lifetime | Multi-session, potentially cross-device       |

### Relationship to Game Core

Game Core remains persistence-agnostic. It operates on `GameState` without knowing whether that state is stored in memory, PostgreSQL, or any other mechanism.

For the MVP, the runtime is responsible for:

* Creating the initial `GameState`
* Maintaining the `GameState` associated with each anonymous session
* Passing the relevant state to Game Core
* Applying the state transitions returned by Game Core to the session's in-memory state
* Injecting the appropriate `GenerationProvider`

Game Core's public API (`createControlledGenerationContext`, `resolveGameplayProposal`, `evaluate`, etc.) remains unchanged regardless of what lies outside it.

### Relationship to AI Provider

The runtime configures which `GenerationProvider` to use. Currently this is `OllamaGenerationProvider` with `qwen3:8b`.

The runtime passes this provider to `ProviderGameplayGenerator`, which feeds it into the `GameplayGenerator` interface that Game Core already consumes.

```typescript
const provider = new OllamaGenerationProvider();

const generator = new ProviderGameplayGenerator(provider);

// generator is passed to the runtime's generation orchestration layer
```

Game Core never references `OllamaGenerationProvider` directly. The dependency flows inward:

```text
Runtime
  ↓
ProviderGameplayGenerator
  ↓
GenerationProvider
  ↓
OllamaGenerationProvider
```

The provider implementation remains replaceable without changing Game Core.

### Persistence Boundary

For the MVP:

* `GameState` lives in memory.
* No database connections are opened.
* No persistence API is called.
* Anonymous session state is not recovered after a runtime restart.

ADR-004 (PostgreSQL with Neon) remains valid for future durable persistence. This ADR explicitly states that durable persistence is not required for the anonymous MVP session model.

When a future slice introduces durable persistence, Game Core will continue to operate on `GameState` objects without becoming persistence-aware. The runtime or a future persistence boundary will be responsible for loading and storing state.

## Explicit Non-Goals / Out of Scope

The following are explicitly **not** part of the MVP architecture decision:

* User authentication or registration
* Account management
* Durable server-side game state
* Horizontal scaling or distributed state
* Multiplayer functionality or player-to-player interaction
* Production-grade observability, logging, or metrics
* Message queues or async job processing
* Caching infrastructure
* Redis, Qdrant, or other deferred technologies unless required by a future concrete capability
* Cloudflare Workers deployment (ADR-005 may apply later)
* React Native or mobile client specifics
* Production-grade service infrastructure

## Consequences

### Positive consequences

* Minimal infrastructure complexity enables rapid iteration on the core gameplay loop.
* The team can validate the generative AI experience without introducing authentication or database dependencies.
* Game Core remains fully testable and runnable in isolation.
* The anonymous session model removes friction for first-time users during demonstrations.
* Multiple players can independently use the application at the same time without requiring accounts.
* Each anonymous session can develop its own independent gameplay history.
* Future persistence can be introduced without changing Game Core's authority or persistence-agnostic design.

### Trade-offs

* State is lost when the runtime stops; there is no continuity across restarts.
* Multiple isolated anonymous sessions may exist simultaneously within a single process, but each session has its own independent `GameState`. One session cannot observe or mutate another session's state.
* This does not provide multiplayer functionality: there is no player-to-player interaction, shared gameplay state, or synchronization between sessions.
* Demonstration setups require the runtime to be running locally or in an appropriate deployment environment.
* The runtime layer is intentionally thin, so more infrastructure will be required if the product later needs durable persistence, registered users, distributed execution, or other production capabilities.

## Future Evolution

When the product matures beyond the MVP and moves toward registered users or requires durable game continuity:

1. A future ADR will address authentication, user identity, and persistent sessions.
2. The runtime may load `GameState` from PostgreSQL (per ADR-004) and save state transitions back to the database.
3. The anonymous session model may remain as a guest or preview mode.
4. Cloudflare Workers (ADR-005) or another deployment target may become the runtime host.
5. A future service/runtime architecture may introduce additional infrastructure only when justified by concrete product or operational requirements.

This ADR does not preclude any of those futures; it deliberately defers them until there is a concrete requirement.

## Relationship to Existing ADRs

* **ADR-001:** Game Core remains authoritative; the runtime is a thin intermediary.
* **ADR-004:** PostgreSQL/Neon is deferred for the MVP but remains the planned future persistence layer.
* **ADR-005:** Cloudflare Workers may be a future deployment target; it is not required by the MVP.
* **ADR-006:** The controlled proposal contract continues to apply regardless of the persistence model.
* **ADR-007:** Bounded generation operates consistently with in-memory state and with future persisted state.
* **ADR-008:** The provider-agnostic `GenerationProvider` abstraction is used by the runtime and does not dictate persistence.

## What This ADR Does Not Decide

* The specific HTTP server framework (Express, Fastify, etc.)
* Cloudflare Workers configuration or deployment details
* Database schema for future persistence
* Authentication mechanism
* Mobile client architecture
* UI framework specifics
* CORS, CSRF, or other security headers
* Containerization or deployment orchestration
* The detailed HTTP/API contract for Slice #6 Mini
