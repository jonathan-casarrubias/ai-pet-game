# Slice #6 Mini — MVP Runtime Design

## Status

Approved for implementation

## Purpose

Define the minimum runtime/service layer required to expose the existing AI Pet Game Game Core to a future client such as React Native.

The purpose of this slice is to make the existing gameplay loop remotely accessible while keeping the runtime intentionally thin.

The runtime is not a second game engine. Game Core remains the sole authority for gameplay rules, proposal validation, state mutation, correction, fallback, and gameplay outcomes.

The MVP uses anonymous in-memory sessions and does not require authentication, registration, or durable persistence.

---

## Scope

Slice #6 Mini introduces a minimal Node.js + TypeScript + Express runtime with:

* anonymous game sessions
* in-memory session storage
* isolated `GameCore` instances per session
* `GenerationProvider` injection
* `ProviderGameplayGenerator` integration
* minimal HTTP endpoints for the client
* translation of runtime/Game Core/provider failures into HTTP responses

The runtime must support multiple simultaneous anonymous sessions within the same process.

Each session is completely isolated from every other session.

---

## Non-Goals

The following are explicitly outside the scope of Slice #6 Mini:

* authentication
* user registration
* user accounts
* JWT or refresh tokens
* PostgreSQL
* Neon
* persistent sessions
* Redis
* multiplayer
* shared game state
* WebSockets
* queues
* distributed locks
* horizontal scaling
* microservices
* Kubernetes
* production observability
* advanced logging or metrics
* Cloudflare Workers deployment
* React Native implementation
* visual presentation
* animation
* asset management
* production deployment infrastructure

These concerns may be introduced in future slices only when justified by concrete requirements.

---

## Runtime Technology

The runtime will use:

* Node.js
* TypeScript
* Express
* in-memory session storage

The runtime must not introduce a framework abstraction that obscures the existing Game Core contracts.

Express is an implementation choice for this MVP runtime and does not represent a new architectural boundary.

---

## Runtime Architecture

The runtime sits outside Game Core and acts as a thin intermediary between the client and the existing domain/application capabilities.

```text
React Native / Future Client
            |
            v
       Express Runtime
            |
            v
    Anonymous Session
            |
            v
        Game Core
            |
     +------+------+
     |             |
     v             v
Gameplay       Generation
Generator       Provider
     |             |
     |             v
     |        Ollama / Qwen3
     |
     v
Game Core proposal resolution
```

The dependency direction remains:

```text
Runtime
   |
   v
Game Core
   |
   +--> GameplayGenerator
   |
   +--> GenerationProvider
```

The runtime must not duplicate Game Core rules.

---

## Anonymous Session Model

Each call to:

```text
POST /sessions
```

creates a new anonymous session.

A session contains the runtime objects required to continue the game:

```text
Session
├── sessionId
├── playerId
├── gameCore
├── gameplayGenerator
└── proposalCorrector
```

`GameCore` owns the authoritative `GameState`.

The runtime session store owns the association between `sessionId` and the corresponding runtime session.

### Session properties

A session is:

* anonymous
* temporary
* process-local
* in-memory
* isolated
* disposable

Restarting the runtime destroys all sessions.

No session is persisted.

### Session isolation

If sessions A and B exist simultaneously:

```text
Session A
  └── GameCore A
       └── GameState A

Session B
  └── GameCore B
       └── GameState B
```

Session A must never be able to observe or mutate Session B.

There is no shared gameplay state.

This is not multiplayer functionality.

---

## Initial Game

The MVP must provide the initial pet immediately after session creation.

The client must not be required to:

* register
* authenticate
* create an account
* complete onboarding
* configure persistence

The runtime creates the initial `GameState` using the existing Game Core initialization mechanism.

The initial state contains the player's anonymous identity, pet identity, pet name, version, and empty discovery history.

---

# HTTP API

The Slice #6 Mini API contains four client-facing endpoints.

```text
POST   /sessions
GET    /sessions/:sessionId/state
POST   /sessions/:sessionId/generate
POST   /sessions/:sessionId/actions
```

These endpoints represent player/game operations rather than internal Game Core methods.

---

## POST /sessions

Creates a new anonymous game session.

### Request

The client may optionally provide the initial pet name.

Example:

```json
{
  "petName": "Lumi"
}
```

If the MVP implementation defines a default pet name, the field may be omitted.

No authentication information is accepted.

### Runtime behavior

The runtime:

1. creates a unique session ID
2. creates an anonymous player ID
3. creates the initial `GameState`
4. creates a `GameCore` instance for the session
5. creates the gameplay generator using the configured `GenerationProvider`
6. creates/configures the proposal corrector
7. stores the session in the in-memory session store
8. returns the initial game state

### Response

The response must provide enough information for the client to begin playing immediately.

At minimum:

```text
sessionId
player
pet
current state/version
discoveries
```

The exact DTO shape is an implementation detail and should remain intentionally small.

---

## GET /sessions/:sessionId/state

Returns the current state of an existing anonymous session.

### Purpose

This endpoint provides a simple synchronization/read operation for the client.

The client should not need to understand how Game Core stores or derives state.

### Response

The response must expose the current client-relevant game state, including at minimum:

* player identity
* pet identity
* pet name
* current interaction count
* current state version
* discoveries

The response should not expose internal Game Core implementation details unless they are required by the client.

### Errors

If the session does not exist:

```text
404 Not Found
```

---

## POST /sessions/:sessionId/generate

Requests a new AI-generated gameplay experience.

This endpoint represents the player's request for the game to generate the next experience.

The client does not directly interact with:

* `ControlledGenerationContext`
* `GameplayProposal`
* `GenerationRequest`
* `GenerationResult`
* `ProposalCorrector`

Those are internal runtime/Game Core concepts.

### Request

The request provides only the information required to establish the generation intent and current gameplay context.

Conceptually:

```json
{
  "purpose": "explore",
  "elementId": "blue-stone"
}
```

The exact request DTO must be kept minimal and aligned with the existing Game Core contracts.

### Runtime flow

The runtime performs:

```text
Client
  |
  | POST /generate
  v
Runtime
  |
  | obtain current session state
  v
Game Core
  |
  | createControlledGenerationContext(...)
  v
ControlledGenerationContext
  |
  v
ProviderGameplayGenerator
  |
  v
GenerationProvider
  |
  v
Ollama / Qwen3
  |
  v
GameplayProposal
  |
  v
Game Core
  |
  | resolveGameplayProposal(...)
  v
ProposalResolutionResult
  |
  v
Runtime
  |
  v
Client
```

### Important boundary

The AI-generated proposal is never authoritative.

The runtime must pass the generated proposal through Game Core's existing resolution flow.

The runtime must not:

* validate the proposal itself
* mutate GameState based on the proposal
* bypass proposal resolution
* bypass correction
* bypass deterministic fallback

### Response

The client needs the accepted gameplay experience.

At minimum, the response must make available:

* narrative
* activity information when applicable
* contextual gameplay information required by the client
* available capability/action information when applicable
* information about the current authoritative state when needed by the client

The client should not need to understand whether the result came from:

```text
original
corrected
fallback
```

unless this information is explicitly useful for diagnostics. It is not part of the gameplay experience.

---

## POST /sessions/:sessionId/actions

Submits a player action.

Supported actions are determined by the existing Game Core.

Currently supported action types include:

```text
greet_pet
ask_pet_question
observe
explore
```

The runtime must not introduce additional action types.

### Request

The request identifies the player action and includes only the action-specific data required by the existing `PlayerAction` contracts.

Examples conceptually include:

```json
{
  "type": "greet_pet"
}
```

or:

```json
{
  "type": "ask_pet_question",
  "question": "Where should we explore next?"
}
```

or:

```json
{
  "type": "explore",
  "elementId": "blue-stone"
}
```

The exact DTO mapping must preserve the existing Game Core action contracts.

### Runtime behavior

The runtime:

1. retrieves the session
2. obtains the session's `GameCore`
3. constructs the appropriate `PlayerAction`
4. supplies the required contextual capability information
5. delegates evaluation to Game Core
6. returns the resulting transition

The runtime must not independently determine whether an action is valid.

### Response

The client needs enough information to update its presentation after the action.

At minimum:

* whether the action was accepted
* resulting authoritative state
* relevant domain events
* rejection information when the action was rejected

The response must be based on the result returned by Game Core.

---

# Game Core Integration

The runtime must use the existing Game Core APIs.

The runtime does not introduce alternative gameplay logic.

The main integration points are:

```text
GameCore
├── createControlledGenerationContext(...)
├── resolveGameplayProposal(...)
└── evaluate(...)
```

The runtime orchestrates these operations but does not expose them directly through HTTP.

The client interacts with gameplay-level operations instead.

---

# GenerationProvider Integration

The runtime configures the generation provider.

The current implementation uses:

```text
OllamaGenerationProvider
    └── qwen3:8b
```

The provider is injected through the existing provider abstraction.

The runtime should construct the provider and pass it to:

```text
ProviderGameplayGenerator
```

Game Core remains unaware of the concrete provider implementation.

The architecture therefore remains provider-agnostic:

```text
Client
  |
Runtime
  |
ProviderGameplayGenerator
  |
GenerationProvider
  |
OllamaGenerationProvider
  |
Ollama / Qwen3
```

A future provider can replace Ollama without changing Game Core.

---

# Contextual Elements

The current Game Core requires contextual elements when creating a generation context and when evaluating certain actions.

For Slice #6 Mini, the runtime must provide the contextual information required by the existing Game Core contracts.

The runtime must not invent new gameplay capabilities or alter the capability model.

The current supported contextual categories include:

```text
object
creature
plant
phenomenon
artifact
```

Current contextual attributes include:

```text
visible
glowing
```

Current capabilities include:

```text
observe
explore
```

The exact mechanism by which the client receives or selects contextual elements is intentionally kept minimal.

The runtime should not introduce a separate contextual-element management subsystem for Slice #6 Mini.

---

# Error Handling

The runtime translates known failures into appropriate HTTP responses.

The error model should remain intentionally small.

### Session errors

Unknown session:

```text
404 Not Found
```

### Client/gameplay errors

Invalid or unsupported player action:

```text
400 Bad Request
```

Invalid contextual element or capability:

```text
400 Bad Request
```

Player/session mismatch:

```text
400 Bad Request
```

Stale state/version conflict, when applicable:

```text
409 Conflict
```

### Generation/provider errors

Provider unavailable:

```text
503 Service Unavailable
```

Generation failure:

```text
500 Internal Server Error
```

Invalid provider output:

```text
500 Internal Server Error
```

### Internal proposal-resolution failures

Internal proposal-resolution details must not be exposed as a separate public API.

For example:

```text
INVALID_PURPOSE
PET_MISMATCH
```

should remain internal validation/resolution concepts unless a future client-facing requirement explicitly requires them.

The runtime should return a small, stable client-facing error representation rather than leaking internal Game Core implementation details.

---

# API Design Principles

The HTTP API must follow these principles.

## 1. Player intent over internal implementation

The API should describe what the player/game wants to do.

Prefer:

```text
POST /sessions/:id/generate
POST /sessions/:id/actions
```

over exposing:

```text
POST /create-controlled-generation-context
POST /generate-proposal
POST /resolve-proposal
POST /validate-proposal
```

## 2. Game Core remains authoritative

The runtime cannot independently:

* validate capabilities
* validate proposals
* mutate GameState
* apply gameplay rules
* determine accepted outcomes

## 3. AI remains untrusted

The AI produces proposals.

Game Core decides whether those proposals become gameplay.

## 4. Thin runtime

The runtime should primarily:

```text
HTTP
  ↓
Session lookup
  ↓
Game Core orchestration
  ↓
Response mapping
```

It must not become a second domain layer.

---

# State Isolation

Every anonymous session owns:

```text
GameCore
GameState
player identity
gameplay generator configuration
proposal correction configuration
```

Sessions must not share:

* GameState
* discoveries
* interaction counts
* pet state
* player identity
* gameplay history

Provider configuration may be shared because it is infrastructure configuration rather than gameplay state.

The MVP does not require shared mutable state.

---

# Acceptance Criteria

Slice #6 Mini is complete when:

1. A client can create an anonymous session.
2. The session receives an initial pet immediately.
3. Multiple sessions can exist simultaneously.
4. Sessions remain isolated.
5. The current state can be retrieved.
6. A client can request AI-generated gameplay.
7. Generation uses the existing `GenerationProvider`.
8. Generated proposals pass through the existing Game Core resolution flow.
9. Invalid proposals still use the existing correction/fallback behavior.
10. A client can submit the currently supported player actions.
11. Game Core remains the sole authority for action evaluation and state mutation.
12. State transitions are returned to the client.
13. Provider failures are translated into stable HTTP errors.
14. Unknown sessions return `404`.
15. No authentication or persistence is introduced.
16. No gameplay rules are duplicated in the runtime.
17. The runtime remains small enough to be replaced or extended later without changing Game Core.

---

# Explicitly Deferred

The following remain deferred after Slice #6 Mini:

* PostgreSQL/Neon persistence
* registered users
* authentication
* guest-to-account migration
* persistent sessions
* distributed sessions
* horizontal scaling
* Redis
* multiplayer
* WebSockets
* queues
* advanced observability
* production deployment architecture
* Cloudflare Workers
* React Native
* presentation model
* rendering architecture
* animations
* asset management
* AI-generated visual assets
* advanced gameplay systems

These concerns should only be introduced when a concrete product or technical requirement justifies them.

---

# Relationship to Existing ADRs

### ADR-001 — Game Core Authoritative

Game Core remains the sole authority for gameplay rules and state mutation.

### ADR-004 — PostgreSQL with Neon

PostgreSQL/Neon remains the planned future persistence mechanism but is explicitly deferred for the anonymous MVP.

### ADR-005 — Cloudflare Workers

Cloudflare Workers remains a possible future runtime target but is not required for Slice #6 Mini.

### ADR-006 — Controlled Proposal Contract

Generated proposals remain untrusted and must pass through Game Core resolution.

### ADR-007 — Bounded Generation

AI generates within the capabilities and constraints supplied by Game Core.

### ADR-008 — Provider-Agnostic AI Model Capabilities

The runtime uses `GenerationProvider` rather than coupling Game Core to Ollama or Qwen3.

### ADR-009 — MVP Runtime and Anonymous In-Memory Game Sessions

This design implements the runtime model established by ADR-009: anonymous, temporary, isolated, in-memory sessions with a deliberately thin runtime layer.

---

# Implementation Constraint

The implementation of Slice #6 Mini must follow this design without architectural expansion.

In particular, implementation must not introduce:

* persistence
* authentication
* additional infrastructure
* new gameplay capabilities
* new domain authority
* multiplayer behavior
* distributed state
* production deployment abstractions

The objective is to expose the existing Game Core to the future playable client with the smallest practical runtime.
