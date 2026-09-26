# ADR-006: AI and Game Core communicate through a controlled proposal contract

## Context

The AI Pet Game uses AI to enrich dialogue, narrative, adventures, and mini-games, but AI output is non-deterministic and must not become authoritative game behavior. The Game Core owns game state, rules, validation, progression, rewards, and state transitions. The boundary between AI generation and Game Core decision-making must therefore be explicit and consistent across AI providers, models, and application layers.

## Decision

The AI and Game Core communicate through a controlled, typed, structured proposal contract.

The AI must never directly execute game actions or mutate authoritative game state. The Game Core provides controlled context to the AI, the AI returns a structured proposal, and the Game Core validates that proposal against the authoritative game rules and current state. Only the Game Core may accept and apply a proposal to authoritative game state.

The conceptual flow is:

```text
Game Core
    ↓
Controlled Context
    ↓
AI
    ↓
Structured Proposal
    ↓
Game Core Validation
    ↓
Accepted / Rejected
    ↓
State Mutation
```

### AI output is untrusted input

All AI output is treated as untrusted and potentially invalid. Syntactically valid structured data is not sufficient for acceptance; the Game Core must also determine whether the proposal is semantically valid for the current game state and rules. Invalid proposals must be rejected safely so that AI failure cannot corrupt authoritative state.

### AI cannot define game rules

The AI may select or generate content only within capabilities explicitly defined by the Game Core. It cannot introduce arbitrary mechanics, rewards, state transitions, or gameplay rules. Gameplay-affecting proposal categories may include dialogue or narrative, quests or adventures, mini-games, and other bounded creative proposals explicitly supported by the Game Core.

### Structured proposals

Gameplay-affecting AI output must use explicit structured data rather than free-form text interpreted as commands. The exact schemas and interfaces are implementation and knowledge-documentation concerns and are not defined by this ADR.

### Controlled context

The Game Core determines what information is exposed to the AI. The AI receives only the context required for the current interaction. The architecture does not assume that the AI has unrestricted access to the player's history, persistent state, or database.

### Validation

The Game Core validates, at minimum:

- Proposal type.
- Allowed capabilities.
- Compatibility with the current game state.
- Game rules and allowed state transitions.
- Rewards and progression constraints.
- Child-safety and other applicable safety constraints.

Only an accepted proposal may contribute to a Game Core state transition. The API/application layer transports requests and responses, while persistence stores authoritative data without replacing Game Core business logic.

### Provider independence

The contract exists above any specific AI provider or model. Game Core must not depend on Ollama, a particular model, or a specific AI vendor. Replacing the provider or model must not require changing the fundamental Game Core rules.

## Consequences

- AI integration is safer because untrusted output cannot directly mutate authoritative state.
- Game rules remain deterministic and testable independently of AI behavior.
- Invalid AI output can be rejected explicitly without corrupting game state.
- AI providers and models can be replaced without changing the fundamental game rules.
- The contract creates clearer boundaries between Game Core, AI generation, the API/application layer, and persistence.
- The architecture reduces the risk of hallucinations affecting authoritative gameplay.
- The system requires explicit proposal schemas, validation code, and compatibility maintenance as Game Core capabilities evolve.
- The contract requires more engineering work than directly interpreting model output and may limit AI flexibility to supported capabilities.

## Relationship with previous ADRs

- **ADR-001:** This ADR formalizes the existing decision that Game Core is the authoritative source for game state, rules, validation, and state transitions.
- **ADR-002:** This ADR defines the contract through which the AI operates as a bounded narrative and creative engine rather than an unrestricted chatbot or game authority.
- **ADR-003:** The contract belongs at the Game Core integration boundary and must preserve Game Core's independence from React Native, Express, Cloudflare Workers, and other frameworks.

ADR-006 refines and formalizes these decisions; it does not replace or contradict them.
