# AGENTS.md

# Project

AI-powered virtual pet adventure game for children.

The product combines a virtual pet, bounded AI conversations, adaptive personality, narrative adventures, mini-games, and incidental learning.

The initial target audience is children approximately 3–9 years old.

The MVP is a small vertical slice intended to validate the core gameplay concept.

The MVP should demonstrate the complete core gameplay loop rather than attempting to provide a production-complete game.

---

# Product Vision

This is an AI-powered virtual pet mobile game for children approximately 3–9 years old.

The experience is inspired by virtual-pet games such as Tamagotchi/Pou, but it is not intended to be an open-ended AI chatbot.

The virtual pet operates inside a bounded game world and narrative.

The core loop is:

Curiosity → question/interaction → pet/narrative → adventure or mini-game → discovery/learning → pet evolves → new curiosity

The goal is to encourage curiosity, creativity, learning through play, and fun.

Learning should feel incidental and narrative-driven rather than like formal schooling.

The MVP should demonstrate the core concept through a small but coherent vertical slice.

The MVP must also be remotely accessible because it needs to be demonstrable to people outside the local development environment.

## Project structure

The repository currently uses this structure:

```text
ai-pet-game/
├── AGENTS.md
├── apps/
│   ├── api/
│   └── mobile/
├── knowledge/
│   ├── ai/
│   ├── architecture/
│   ├── decisions/
│   └── game-design/
├── packages/
│   ├── game-core/
│   └── shared/
└── skills/
    ├── ai-narrative/
    ├── api/
    ├── game-core/
    └── testing/
```

Document project knowledge and repeatable procedures in their designated directories rather than duplicating them in unrelated files.

## `knowledge/`

The `knowledge/` directory contains project knowledge and documentation.

### `knowledge/ai/`

Contains:

* AI behavior
* AI providers and models
* prompts
* structured AI output
* AI safety
* narrative behavior
* AI limitations
* AI-related implementation knowledge

### `knowledge/architecture/`

Contains:

* system architecture
* component boundaries
* integrations
* deployment architecture
* infrastructure architecture
* technical architecture documentation

### `knowledge/decisions/`

Contains:

* Architecture Decision Records
* explicit architectural decisions
* currently approved ADRs

Currently approved ADRs must be consulted before making changes that could affect those decisions.

### `knowledge/game-design/`

Contains:

* game mechanics
* gameplay
* quests/adventures
* progression
* personality
* learning concepts
* world/narrative design
* player experience

## `skills/`

Skills are repeatable procedures and task-specific guidance.

* `skills/ai-narrative/` contains procedures for AI narrative and bounded AI behavior.
* `skills/api/` contains API/backend implementation procedures.
* `skills/game-core/` contains Game Core implementation procedures.
* `skills/testing/` contains testing and verification procedures.

Do not use skills as a replacement for project-wide rules or ADRs.

## Architectural authority

ADRs are the authoritative source for explicit architectural decisions.

If a relevant ADR conflicts with a generic statement in this file, follow the ADR.

Current approved architectural decisions are:

* ADR-001: Game Core is authoritative for game state and rules.
* ADR-002: AI is a bounded narrative and creative engine.
* ADR-003: Game Core is independent of the UI framework.
* ADR-004: PostgreSQL with Neon is the persistence database.
* ADR-005: Cloudflare Workers is the backend runtime.
* ADR-006: AI and Game Core communicate through a controlled proposal contract.

Before making significant changes to architecture or Game Core, inspect the relevant ADRs in `knowledge/decisions/`, relevant documentation in `knowledge/`, and relevant skills in `skills/`.

Do not silently introduce an architectural change through implementation.

---

# Core architectural principles

## 1. Game first, AI second

The game system must remain functional and understandable independently of AI generation.

AI exists to enrich the experience, not to become the source of truth for game state or rules.

## 2. AI proposes; Game Core decides

The Game Core is authoritative.

AI may generate or propose bounded narrative, adventure, quest, or gameplay variations.

AI output must never directly mutate authoritative game state.

When AI output affects gameplay, it must be represented as structured data and validated by the Game Core before any state mutation.

The conceptual flow is:

```text
Game Core
   ↓
Controlled context
   ↓
AI
   ↓
Structured proposal
   ↓
Game Core validation
   ↓
State mutation
```

## 3. Game Core must remain framework-independent

`packages/game-core` must not depend on:

* React Native
* React
* Express
* Cloudflare Workers
* UI components
* navigation frameworks
* mobile APIs
* presentation-layer lifecycle
* infrastructure-specific APIs

Game Core owns game rules, state transitions, validation, progression, personality/gameplay logic, events/domain behavior, and valid gameplay outcomes.

Client applications interact with Game Core through well-defined interfaces.

---

# Child safety

Because the target audience includes children, safety is a fundamental architectural requirement.

The system must not:

* operate as an unrestricted chatbot
* encourage emotional dependency
* tell a child that the pet is their only friend
* encourage secrecy from parents or trusted adults
* manipulate a child emotionally
* request unnecessary sensitive personal information
* expose sensitive child information
* provide unrestricted access to external information during normal gameplay
* introduce unsafe or undefined gameplay mechanics through AI generation
* allow AI output to bypass Game Core validation

AI behavior must remain bounded by the game world, narrative, gameplay rules, and safety constraints.

---

# AI architecture

The AI is a bounded narrative and creative engine.

AI may:

* generate dialogue
* generate narrative variations
* propose adventure/quest variants
* propose variations of predefined mini-game types
* adapt interactions to structured gameplay history
* adapt behavior according to the pet's personality
* generate other explicitly permitted creative content

AI must not:

* define game rules
* modify authoritative game state directly
* grant rewards or progression directly
* invent arbitrary mechanics
* bypass Game Core validation
* act as the authoritative source of factual knowledge
* access unrestricted external information during normal game operation
* request or expose sensitive child information

AI providers/models must remain replaceable.

The current development baseline uses Ollama locally.

The architecture should remain provider/model agnostic.

Vercel AI SDK may be used as the AI abstraction layer.

LangChain is optional and must only be introduced when it provides a concrete benefit.

Qdrant is deferred and should not be introduced without a concrete requirement.

Redis is deferred and should not be introduced without a concrete requirement.

## Game memory

The game should maintain structured game memory rather than treating raw conversation history as the primary memory mechanism.

Relevant structured memory may include:

* gameplay history
* completed quests
* discoveries
* preferences demonstrated through gameplay
* progression
* personality-related signals
* other explicitly defined game-domain state

Do not introduce unrestricted long-term conversational memory.

## Personality

The pet's personality should evolve based on gameplay behavior and become part of gameplay.

Personality must be represented as structured game state rather than being solely inferred from raw conversation history.

AI may use personality state as controlled context, but Game Core remains authoritative.

## Quest and adventure system

Quests/adventures should be bounded by predefined types and Game Core rules.

AI may propose variations inside those predefined boundaries.

Game Core validates the proposal and determines the actual gameplay outcome.

AI must not create arbitrary mechanics outside the defined game system.

---

# Mobile client

The initial client is:

* React Native
* TypeScript

React Native is the presentation/client layer.

Do not move authoritative game rules into React components or UI state.

The architecture should preserve the possibility of future clients or game technologies, including Unity.

---

# Backend

The backend is:

* TypeScript
* Express
* Cloudflare Workers

The initial backend is a single Cloudflare Worker.

Express provides the HTTP application framework and is responsible for concerns such as:

* routing
* middleware
* authentication/authorization boundaries
* request validation
* HTTP error handling
* API-level concerns

Do not introduce NestJS.

Do not introduce microservices for the initial MVP.

The architecture may later be decomposed into multiple Workers if there is a concrete requirement related to scalability, isolation, ownership, or operational concerns.

Do not perform decomposition merely for architectural fashion.

Cloudflare-specific APIs or infrastructure concerns must remain at the infrastructure/application boundary and must not leak into Game Core.

Cloudflare Workers is the selected backend runtime for the MVP and intended future production architecture.

Do not assume a future migration to AWS or another backend platform.

---

# Persistence

The primary persistence technology is:

* PostgreSQL
* Neon

PostgreSQL/Neon is used from the beginning for the MVP/PoC.

Persistent game-domain data may include:

* player
* pet
* personality/progression
* quests/adventures
* events
* rewards/inventory
* other persistent game-domain data defined by Game Core

Game Core remains authoritative for business rules and state transitions.

PostgreSQL is the persistence mechanism and must not become a replacement for Game Core business logic.

Do not introduce:

* SQLite
* MongoDB
* database abstraction layers intended to support alternative databases

Neon Free is acceptable for development and small remote demonstrations.

The architecture should allow PostgreSQL/Neon capacity to scale later without changing the fundamental database technology.

Cloudflare Hyperdrive may be used where appropriate as infrastructure-level connectivity between Cloudflare Workers and Neon PostgreSQL.

---

# Realtime and events

The architecture is event-driven where this provides a meaningful benefit.

HTTP is the initial communication mechanism.

WebSockets may be used where realtime communication is genuinely useful.

Durable Objects should only be introduced when a concrete coordination/shared-state requirement justifies them.

Do not introduce realtime infrastructure prematurely.

---

# API

GraphQL is optional.

Do not introduce GraphQL merely because it is available.

Use the simplest API approach that satisfies the MVP requirements.

---

# Mini-games

Mini-games should use an abstraction that separates game logic/domain concepts from the rendering technology.

The initial implementation may use React Native.

The architecture should preserve the possibility of future Unity-based mini-games.

A conceptual abstraction such as:

```text
MiniGame
   ├── ReactNativeMiniGame
   └── future Unity implementation
```

is preferred where it provides real architectural value.

Do not over-engineer the abstraction before the first concrete mini-game exists.

---

# Infrastructure and deployment

The MVP must be remotely accessible.

The initial deployment architecture is:

```text
React Native mobile client
        ↓
Cloudflare Workers
        ↓
Express API
        ↓
Game Core
        ↓
Neon PostgreSQL
```

AI development may use local Ollama.

Local development and remote MVP deployment are separate concerns.

Do not describe the MVP as requiring an entirely local infrastructure.

Use free tiers where practical during development and early demonstrations.

Avoid unnecessary infrastructure costs.

Cloudflare Workers and Neon should be considered the selected infrastructure for the current MVP architecture.

---

# Architecture boundaries

Keep responsibilities clearly separated:

```text
React Native
      ↓
Express API
      ↓
Application/API layer
      ↓
Game Core
      ├── AI integration boundary
      ↓
Persistence boundary
      ↓
Neon PostgreSQL
```

The exact implementation may evolve, but these architectural responsibilities must remain clear.

Game Core must not depend on infrastructure.

The API layer must not become the source of game rules.

The database must not become the source of game rules.

The AI must not become the source of game rules.

---

# Determinism and validation

Game rules should be deterministic and testable whenever practical.

AI output is inherently non-deterministic and must therefore be treated as untrusted input to the Game Core.

All gameplay-affecting AI output must pass validation before state mutation.

Prefer explicit schemas and typed structures for communication between AI and Game Core.

---

# Development workflow

Before making significant changes to architecture or Game Core:

1. Inspect the relevant ADRs in `knowledge/decisions/`.
2. Inspect relevant documentation in `knowledge/`.
3. Inspect relevant skills in `skills/`.
4. Make the smallest change that satisfies the requirement.
5. Run the relevant tests or verification commands.
6. Report what was actually verified.
7. Never claim behavior was tested if it was not actually tested.

When implementing a feature, prefer incremental vertical slices over building large abstractions in advance.

Avoid speculative architecture.

Avoid premature infrastructure.

Avoid adding libraries merely because they are popular.

Prefer established, well-understood solutions when they satisfy the requirement.

---

# Architectural decision process

When a significant architectural decision is required:

1. Check whether an existing ADR already addresses it.
2. If an ADR exists, follow it unless there is a deliberate decision to revise the architecture.
3. If no ADR exists and the decision has meaningful architectural consequences, create a new ADR in `knowledge/decisions/`.
4. Keep implementation details out of ADRs unless they are part of the actual decision.
5. Do not silently introduce an architectural change through implementation.

Current approved architectural decisions are:

* ADR-001: Game Core is authoritative for game state and rules.
* ADR-002: AI is a bounded narrative and creative engine.
* ADR-003: Game Core is independent of the UI framework.
* ADR-004: PostgreSQL with Neon is the persistence database.
* ADR-005: Cloudflare Workers is the backend runtime.
* ADR-006: AI and Game Core communicate through a controlled proposal contract.

---

# TypeScript and tooling conventions

Apply these conventions to TypeScript packages and applications unless a deliberate, documented architectural or runtime requirement justifies an exception:

* Use TypeScript as the canonical compiler for reusable or compilable TypeScript packages. Declare TypeScript locally in each package rather than relying on a globally installed `tsc`.
* Until a root workspace is deliberately introduced, a TypeScript package may own its TypeScript development dependency and lockfile. Do not add a root workspace or root `package.json` as part of this convention.
* Node-oriented TypeScript packages use ESM with `"type": "module"` in `package.json` and `"module": "NodeNext"` in `tsconfig.json`. Do not configure legacy `moduleResolution: "Node"` or `node10` resolution; under NodeNext, source-relative imports must follow Node ESM requirements, including `.js` extensions where required.
* Do not use `ignoreDeprecations` merely to suppress compiler warnings. Migrate configuration to the current supported model and avoid redundant compiler options without a concrete reason.
* Reusable packages use the TypeScript compiler to produce JavaScript, declarations, and source maps. Node 24 native type stripping is limited to suitable small scripts or experiments and is not the reusable-package build model.
* Node-oriented TypeScript packages use Node's native `node:test` runner and `node:assert/strict` for assertions. Use them directly; do not create local copies of generic test or assertion helpers.
* TypeScript tests are compiled to JavaScript and the generated JavaScript is executed with Node. The standard package test command is `npm test`; for `packages/game-core`, it must remain `npm run build && node --test dist/tests/game-core.test.js`.
* Do not introduce Jest, Vitest, Mocha, `ts-node`, `tsx`, or similar testing/runtime tooling without a concrete future requirement and an explicit decision. Do not add `--test-isolation=none` or other workaround/special flags.
* Future platform-specific environments such as React Native may use an appropriate test framework when actually required, as a deliberate and documented exception.
* Keep tests focused on behavior and architectural boundaries, following `skills/testing/implement-feature.md`. Specialized test frameworks for other platforms require a deliberate, documented exception.
* Record exceptions deliberately so they are not introduced accidentally or copied as the default pattern.

---

# Non-goals for the MVP

Do not introduce the following unless a concrete requirement appears:

* unrestricted AI chat
* unrestricted web access for the AI
* microservices
* NestJS
* MongoDB
* SQLite
* Qdrant
* Redis
* Durable Objects without a concrete coordination requirement
* complex event infrastructure
* unnecessary GraphQL
* premature Unity implementation
* large-scale cloud infrastructure
* speculative abstractions

The MVP should remain small enough to validate the core product concept.

---

# Visual direction

The visual style is:

* colorful
* modern
* 2D
* illustrated/cartoon
* friendly
* appropriate for children

Do not use pixel-art as the primary visual direction.

For the MVP, prioritize a small amount of coherent art over a large amount of content.

---

# Decision principles

When choosing between implementation approaches, prefer solutions that:

1. Preserve Game Core authority.
2. Keep AI bounded and replaceable.
3. Preserve framework independence of Game Core.
4. Keep the MVP small.
5. Avoid unnecessary infrastructure.
6. Prefer deterministic and testable behavior.
7. Prefer established solutions over custom framework-like abstractions.
8. Preserve future extensibility when it is inexpensive and does not complicate the MVP.
9. Prefer free/local/open-source tooling during development when practical.
10. Avoid architectural changes that are not backed by a concrete requirement.

Do not optimize for theoretical scale before there is evidence that the system needs it.

Do not turn the MVP into a production-scale distributed system prematurely.

The goal is to build a coherent, testable, remotely demonstrable product foundation while preserving the architectural boundaries established by the ADRs.
