# Knowledge Map

This directory contains the project's architecture, approved decisions, AI boundaries, and game-design knowledge. The documents are organized by responsibility rather than implementation order.

## Start here

Read these documents first to understand the project as a whole:

1. [`decisions/ADR-001-game-core-authority.md`](decisions/ADR-001-game-core-authority.md)
2. [`architecture/system-overview.md`](architecture/system-overview.md)
3. [`game-design/game-design-overview.md`](game-design/game-design-overview.md)
4. [`game-design/player-experience-and-core-loop.md`](game-design/player-experience-and-core-loop.md)
5. [`ai/ai-system-overview.md`](ai/ai-system-overview.md)

## Knowledge structure

```text
Approved architectural decisions
        ↓
System and runtime boundaries
        ↓
Game Core domain authority
        ↓
Game-design vocabulary and player experience
        ↓
Bounded AI content, safety, and orchestration
```

The central authority rule across the knowledge base is:

```text
Clients collect intent and present results
API/application code transports and orchestrates
AI proposes or narrates
Game Core decides
Persistence records accepted results
```

## Architecture

Architecture documents describe system boundaries, runtime responsibilities, and state flow.

| Document | Purpose |
| --- | --- |
| [`architecture/system-overview.md`](architecture/system-overview.md) | High-level system architecture and relationships between the mobile client, API, Game Core, AI boundary, and persistence. |
| [`architecture/runtime-and-deployment-overview.md`](architecture/runtime-and-deployment-overview.md) | Conceptual runtime and deployment model for local development, remote demos, Cloudflare Workers, Express, Neon PostgreSQL, and external AI dependencies. |
| [`architecture/game-core-domain-boundaries.md`](architecture/game-core-domain-boundaries.md) | Defines Game Core responsibilities, non-responsibilities, authoritative state, validation, and framework/infrastructure independence. |
| [`architecture/domain-events-and-state-flow.md`](architecture/domain-events-and-state-flow.md) | Defines the flow from player intent through Game Core state transitions, domain events, persistence, retries, and client-safe results. |
| [`architecture/application-layer-and-use-cases.md`](architecture/application-layer-and-use-cases.md) | Defines the application/use-case layer between transport/API concerns and Game Core, including coordination, AI orchestration, persistence, failures, retries, and safety boundaries. |
| [`architecture/generative-capability-space.md`](architecture/generative-capability-space.md) | Defines the bounded generative space of reusable capabilities, rules, constraints, invariants, state, and safety boundaries. |
| [`architecture/capability-model.md`](architecture/capability-model.md) | Defines capabilities as reusable, composable abilities with contextual applicability rather than complete authored experiences. |
| [`architecture/generated-gameplay-context-and-state.md`](architecture/generated-gameplay-context-and-state.md) | Distinguishes authoritative Game Core state from generated, bounded gameplay context. |
| [`architecture/ai-game-core-generative-contract.md`](architecture/ai-game-core-generative-contract.md) | Describes the controlled context, untrusted gameplay proposal, and Game Core validation boundary for generative gameplay. |
| [`architecture/controlled-generation-context.md`](architecture/controlled-generation-context.md) | Defines the scoped, purpose-specific, non-authoritative information package Game Core constructs for AI generation, including its relationship to relevant state, capabilities, gameplay context, and safety boundaries. |
| [`architecture/gameplay-proposal-model.md`](architecture/gameplay-proposal-model.md) | Defines the conceptual semantic categories and authority boundaries of a generated gameplay proposal. |

## Architecture Decision Records

ADRs are the authoritative source for explicit architectural decisions. Consult relevant ADRs before changing architecture or Game Core behavior.

| Document | Decision |
| --- | --- |
| [`decisions/ADR-001-game-core-authority.md`](decisions/ADR-001-game-core-authority.md) | Game Core is the authoritative source of game state, rules, transitions, progression, rewards, and AI proposal validation. |
| [`decisions/ADR-002-ai-bounded-narrative-engine.md`](decisions/ADR-002-ai-bounded-narrative-engine.md) | AI is a bounded narrative and creative engine, not an unrestricted chatbot or game authority. |
| [`decisions/ADR-003-game-core-framework-independence.md`](decisions/ADR-003-game-core-framework-independence.md) | Game Core remains independent of React Native and other UI frameworks. |
| [`decisions/ADR-004-postgresql-neon-for-persistence.md`](decisions/ADR-004-postgresql-neon-for-persistence.md) | PostgreSQL hosted on Neon is the persistence database; it does not define game rules. |
| [`decisions/ADR-005-cloudflare-workers-backend-runtime.md`](decisions/ADR-005-cloudflare-workers-backend-runtime.md) | Cloudflare Workers with Express is the selected backend runtime for the MVP and future production foundation. |
| [`decisions/ADR-006-ai-game-core-contract.md`](decisions/ADR-006-ai-game-core-contract.md) | AI and Game Core communicate through a controlled, structured, validated proposal contract. |
| [`decisions/ADR-007-ai-driven-player-experience.md`](decisions/ADR-007-ai-driven-player-experience.md) | AI generates novel gameplay within a bounded capability space rather than selecting from a finite experience catalog. |
| [`decisions/ADR-008-provider-agnostic-ai-model-capabilities.md`](decisions/ADR-008-provider-agnostic-ai-model-capabilities.md) | AI/model integration is capability-oriented, not model-oriented; Game Core remains independent of Ollama, Qwen3, and any specific provider; `GenerationProvider` is the first concrete capability, with future capabilities like `DecisionProvider` deferred until a concrete requirement exists. |

## AI

AI documents define how AI enriches the game while remaining bounded, replaceable, safe, and non-authoritative.

| Document | Purpose |
| --- | --- |
| [`ai/ai-system-overview.md`](ai/ai-system-overview.md) | Overall AI role, controlled context, bounded capabilities, validation, safety, fallback, and provider independence. |
| [`ai/ai-proposal-contract.md`](ai/ai-proposal-contract.md) | Conceptual contract between Game Core and AI proposals, including validation layers, rejection, fallback, and contract evolution. |
| [`ai/ai-content-and-narrative-model.md`](ai/ai-content-and-narrative-model.md) | Distinguishes authored, deterministic, narrative, and gameplay-affecting AI-generated content inside the bounded world. |
| [`ai/ai-safety-and-child-protection.md`](ai/ai-safety-and-child-protection.md) | Child-first safety model covering dependency, manipulation, privacy, real-world boundaries, memory, personality, and safe failure. |
| [`ai/ai-capability-orchestration.md`](ai/ai-capability-orchestration.md) | Defines when AI is needed, how capabilities are selected, how context is assembled, and how output is validated or replaced by fallback. |

## Game design

Game-design documents define the stable vocabulary, player experience, world structure, and conceptual relationships between gameplay systems. They intentionally leave exact mechanics open unless explicitly stated otherwise.

### Product and experience

| Document | Purpose |
| --- | --- |
| [`game-design/game-design-overview.md`](game-design/game-design-overview.md) | Core product concept, virtual Pet, core loop, bounded gameplay, learning through play, and MVP philosophy. |
| [`game-design/product-differentiation.md`](game-design/product-differentiation.md) | Protects the product from drifting toward a generic AI chatbot or unrestricted companion. |
| [`game-design/player-experience-and-core-loop.md`](game-design/player-experience-and-core-loop.md) | Defines the intended player experience, session flow, long-term continuity, agency, safety, and core-loop integrity. |

### Domain vocabulary and gameplay structure

| Document | Purpose |
| --- | --- |
| [`game-design/core-domain-model.md`](game-design/core-domain-model.md) | Stable vocabulary and relationships for Player, Pet, personality, state, intent, interaction, curiosity, Adventures, Quests, Discoveries, Mini-games, progression, memory, events, proposals, and outcomes. |
| [`game-design/adventures-quests-minigames.md`](game-design/adventures-quests-minigames.md) | Defines the conceptual distinctions, lifecycles, relationships, authority, and AI boundaries for Adventures, Quests, and Mini-games. |
| [`game-design/world-and-content-structure.md`](game-design/world-and-content-structure.md) | Defines the bounded world, Areas, Experiences, content capabilities, content lifecycle, progression-driven expansion, and world consistency. |

### Pet continuity and development

| Document | Purpose |
| --- | --- |
| [`game-design/game-memory-and-personality.md`](game-design/game-memory-and-personality.md) | Defines structured game memory, its distinction from raw conversation history, and its relationship with personality and controlled AI context. |
| [`game-design/personality-system.md`](game-design/personality-system.md) | Defines personality as authoritative Pet game state, gameplay-derived signals, safety boundaries, agency, and future trait-review requirements. |
| [`game-design/progression-rewards-and-pet-evolution.md`](game-design/progression-rewards-and-pet-evolution.md) | Defines progression, rewards, and Pet evolution as related but distinct Game Core concepts with safety and consistency guardrails. |

## Cross-document relationships

### Core gameplay loop

The game-design documents build around this loop:

```text
Curiosity
    → interaction or question
    → Pet or narrative response
    → Adventure or Quest
    → Mini-game, activity, or discovery
    → accepted outcome
    → progression, reward, personality, memory, or Pet evolution
    → new curiosity
```

### AI-assisted interaction flow

The AI and architecture documents refine the loop with this optional path:

```text
Player intent
    → application/Game Core evaluation
    → optional capability selection
    → minimum controlled context
    → bounded AI output
    → structural, semantic, safety, and Game Core validation
    → accepted result or safe fallback
    → authoritative transition, events, and persistence
    → client presentation
```

### Authority boundaries

- **Game Core:** Defines rules, evaluates intent and proposals, applies state transitions, and determines accepted outcomes.
- **AI:** Generates bounded narrative or gameplay proposals and never directly mutates authoritative state.
- **API/application layer:** Transports intent, coordinates integrations, participates in application orchestration, and maps outcomes without defining gameplay.
- **Persistence:** Stores accepted state and meaningful history without becoming the source of game rules.
- **Client:** Collects player input and presents accepted results without deciding authoritative completion, rewards, progression, or evolution.

## Recommended reading by task

### Changing Game Core or gameplay rules

Read the relevant ADRs, then [`architecture/game-core-domain-boundaries.md`](architecture/game-core-domain-boundaries.md), [`game-design/core-domain-model.md`](game-design/core-domain-model.md), and the relevant game-design document.

### Adding or changing an AI capability

Read [`decisions/ADR-002-ai-bounded-narrative-engine.md`](decisions/ADR-002-ai-bounded-narrative-engine.md), [`decisions/ADR-006-ai-game-core-contract.md`](decisions/ADR-006-ai-game-core-contract.md), [`ai/ai-content-and-narrative-model.md`](ai/ai-content-and-narrative-model.md), [`ai/ai-safety-and-child-protection.md`](ai/ai-safety-and-child-protection.md), and [`ai/ai-capability-orchestration.md`](ai/ai-capability-orchestration.md).

### Changing memory or personality

Read [`game-design/game-memory-and-personality.md`](game-design/game-memory-and-personality.md), [`game-design/personality-system.md`](game-design/personality-system.md), the AI safety document, and the Game Core/domain-events documents.

### Changing Adventures, Quests, or Mini-games

Read [`game-design/adventures-quests-minigames.md`](game-design/adventures-quests-minigames.md), [`game-design/world-and-content-structure.md`](game-design/world-and-content-structure.md), [`game-design/player-experience-and-core-loop.md`](game-design/player-experience-and-core-loop.md), and the Game Core boundary documents.

### Changing runtime, deployment, or persistence boundaries

Read the relevant ADRs and [`architecture/system-overview.md`](architecture/system-overview.md), [`architecture/runtime-and-deployment-overview.md`](architecture/runtime-and-deployment-overview.md), and [`architecture/game-core-domain-boundaries.md`](architecture/game-core-domain-boundaries.md).

## Scope

This map covers the Markdown documents currently present under `knowledge/`. It should be updated when a new knowledge document is added or when a document's purpose changes.
