# ADR-010: First Playable AI Adventure

## Status

Approved

## Date

2026-09-28

## Context

The AI Pet Game has an established architecture through Slice #7: Game Core with provider-agnostic AI generation, an anonymous in-memory runtime, a React Native/Skia presentation layer, and working end-to-end AI generation. However, the current UI remains a visual prototype — Lumi cannot move freely, the world is mostly hardcoded, there are no meaningful gameplay mechanics, and AI mostly changes narrative text rather than producing materially different gameplay.

This slice transforms the prototype into a genuinely playable small 2D AI-driven adventure. The result must feel like the beginning of an actual game, not an architecture demo.

## Decision

This slice introduces a **playable 2D world** with player-controlled movement, spatial entities, proximity-based interaction, and bounded AI-generated gameplay consequences — while preserving all existing architectural boundaries.

### 1. Playable 2D World

The game introduces a spatial world model represented within Game Core. At minimum:

- **Position**: Each entity has an `{x, y}` coordinate in a 2D coordinate space.
- **World bounds**: The world has defined boundaries that constrain movement.
- **Entities**: Spatial entities (objects, creatures, hazards) have positions and state.
- **Player position**: The pet (Lumi) has a current position that changes with movement.
- **Interaction radius**: Entities have a configurable proximity radius that determines when interaction is available.

This spatial model is intentionally lightweight — it is not a physics engine or game engine. It exists only to support movement, proximity checks, and state-driven rendering.

### 2. Player-Controlled Movement

Movement is a first-class player action:

- **Web input**: Arrow keys and WASD drive continuous or step-based movement.
- **Mobile input**: Touch/drag or a simple virtual joystick drives movement.
- **Input adapters may differ by platform**, but movement state and validation logic remain shared in Game Core.

Movement produces a new player position. The game validates the new position against world bounds before accepting it. The renderer reflects the new position.

### 3. Proximity-Based Interaction

Interaction is not a global button. An interaction with a spatial entity is only available when the player is within the entity's interaction radius:

```
distance(playerPos, entityPos) <= interactionRadius
```

The UI communicates proximity availability through visual indicators (e.g., glow, highlight, prompt), but the authoritative validation lives in Game Core.

### 4. Bounded Gameplay Consequences

AI may propose bounded gameplay consequences as part of a `GameplayProposal`. Supported consequence types include:

- `reveal_creature`: A creature becomes visible in the world.
- `reveal_object`: An object becomes visible or changes state.
- `trigger_chase`: A chase sequence begins.
- `trigger_danger`: A hazard is introduced or danger state activates.
- `discover_item`: A discovery reward is granted.
- `change_entity_state`: An existing entity transitions to a new state.
- `narrative_consequence`: A narrative-only consequence with no gameplay state change.

**AI may propose a consequence, but Game Core decides whether it is valid.** The proposal is untrusted input. Game Core validates:

- The consequence type is supported.
- The referenced contextual elements exist and are valid.
- The proposed state changes comply with game rules and invariants.
- The state version is current.
- Safety constraints are satisfied.

If valid, Game Core mutates authoritative `GameState`, emits a domain event, and propagates the change through the Presentation Model to the renderer.

### 5. Chase / Danger

A lightweight chase/danger capability is introduced as the first demonstration of bounded gameplay consequences. The conceptual flow for the initial scenario is:

```
Player interacts with stone
    ↓
AI proposes: reveal creature (ants), trigger chase
    ↓
Game Core validates the proposal
    ↓
GameState updates: ants become visible, chase activates
    ↓
Domain event emitted
    ↓
Presentation Model reflects new state
    ↓
Renderer animates chase
    ↓
Player moves away → chase terminates
```

The chase mechanic itself is simple: creatures move toward the player, and escaping beyond a threshold distance terminates the chase. The architecture supports this as one example of a consequence type, not as a hardcoded single path.

### 6. AI Generation Flow

The existing AI generation flow is extended to support gameplay consequences:

```
Player Action
    ↓
Game Core
    ↓
Controlled Generation Context (includes spatial state)
    ↓
Generation Provider
    ↓
Gameplay Proposal (may include consequence)
    ↓
Game Core Validation
    ↓
Accepted Gameplay Consequence
    ↓
GameState Mutation
    ↓
Domain Event
    ↓
Presentation Model
    ↓
Renderer
```

The `GameplayProposal` and `AcceptedGameplayContext` types are extended with an optional `consequence` field. The `GenerationRequest` and `RelevantGenerationState` are extended to include spatial context (player position, nearby entities) so AI can generate consequences appropriate to the current world state.

### 7. Proposal Safety

The existing Slice #4 safety model is preserved:

- Invalid proposal → structured rejection with code and message
- Exactly one correction attempt via `ProposalCorrector`
- Deterministic fallback if correction also fails

ADR-010 may extend proposal validation to check consequence-specific rules, but must not weaken the existing rejection → correction → fallback chain.

### 8. Presentation Model / Renderer

The existing boundary is preserved:

```
Game Core (authoritative state)
    ↓
Presentation Model (derived, renderable view)
    ↓
Renderer (visual output only)
```

The renderer receives movement, proximity, interaction availability, entity state changes, creature appearance, and chase state through the Presentation Model. It renders based on that model — it never becomes authoritative.

React Native Skia remains the sole renderer. No second rendering architecture is introduced.

### 9. Runtime

The Runtime remains thin per ADR-009:

- Anonymous in-memory sessions continue.
- No authentication, accounts, or user identity.
- No database or persistence.
- No multiplayer.
- No queues, Redis, or distributed infrastructure.
- New gameplay operations (movement, interaction with consequence) are exposed via the existing HTTP API pattern.

### 10. Provider Independence

The `GenerationProvider` abstraction remains intact. Replacing Ollama/Qwen3 with another provider or model must not require changes to Game Core. AI proposals may include consequences, but the provider interface (`GenerationResult`) is extended only with the `consequence` field if needed — the interface contract remains provider-agnostic.

### 11. Platform Coverage

All three platforms remain first-class:

- **Web**: Keyboard (Arrow keys, WASD) + optional mouse for targeted movement commands.
- **iOS**: Touch/drag or virtual joystick.
- **Android**: Touch/drag or virtual joystick.

Input adapters differ by platform; movement/state/interaction logic is shared in Game Core.

## Consequences

### Positive

- The MVP demonstrates a genuinely playable experience rather than a static prototype.
- Player actions produce meaningful, visible consequences in the game world.
- AI generates material gameplay changes (not just narrative text), validating ADR-007's bounded generation thesis.
- The spatial model is lightweight and focused — it does not become a general-purpose game engine.
- All existing architectural boundaries (Game Core authority, provider independence, proposal safety) are preserved.
- The chase/danger demonstration proves the system can create situations requiring active player response.

### Trade-offs

- The spatial model adds complexity to `GameState`, `PlayerAction`, and related types.
- Movement and interaction require new validation rules in Game Core.
- The AI prompt must be updated to include spatial context and consequence options.
- The renderer must handle dynamic entity rendering and chase state.
- Tests must cover new movement, interaction, and consequence validation paths.

## Scope / Exclusions

The following are explicitly **not** part of this slice:

- Authentication or user accounts.
- PostgreSQL / Neon persistence.
- Redis, WebSockets, or real-time infrastructure.
- Multiplayer or player-to-player interaction.
- Queues, microservices, Kubernetes, or production cloud infrastructure.
- A physics engine or second game engine.
- Arbitrary AI-generated mechanics outside the defined consequence types.
- AI authority over `GameState`.
- New AI providers or paid AI APIs.
- Hardcoding the entire architecture around the ant/stone demonstration scenario.
- ADR-011 (reserved for future robust service/runtime evolution).

## Relationship to Existing ADRs

- **ADR-001**: Game Core remains authoritative over all state and rules. The spatial model and consequences are validated by Game Core, never directly by AI or the UI.
- **ADR-002**: AI remains a bounded narrative and creative engine. It may propose consequences, but within the capability space defined by Game Core.
- **ADR-003**: Game Core remains independent of React Native, Skia, or any UI framework. The spatial model lives in Game Core; the renderer merely displays it.
- **ADR-006**: The controlled proposal contract is extended to include consequences, but the flow (context → AI → proposal → validation → mutation) is unchanged.
- **ADR-007**: Bounded generation is demonstrated with concrete gameplay consequences (not just narrative), proving the generative thesis.
- **ADR-008**: Provider independence is preserved. The `GenerationProvider` interface may carry a `consequence` field, but no specific model is required.
- **ADR-009**: Anonymous in-memory sessions remain the MVP model. No persistence is introduced.

## What This ADR Does Not Decide

- The exact TypeScript types for `Position`, `SpatialEntity`, or `GameplayConsequence` (deferred to implementation).
- The specific interaction radius value or movement speed.
- The visual style of entities (art is a separate concern).
- The exact prompt format for consequence generation.
- The chase algorithm details (movement speed, termination conditions).
- The UI component structure for touch controls.
- The web CORS configuration (preserved from existing setup).
