# ADR-003: Game Core must remain independent of the UI framework

## Context

The AI Pet Game is initially targeting React Native for the mobile application. However, the game logic should not become dependent on React Native or any specific UI framework. The project may use other clients or game technologies in the future, including Unity.

## Decision

The Game Core must remain independent of React Native and any UI framework.

The Game Core is responsible for:

- Game state and state transitions.
- Game rules and validation.
- Player and pet progression.
- Personality and gameplay-related logic.
- Game events and domain behavior.
- Determining valid gameplay outcomes.

The Game Core must not depend on:

- React Native.
- React components.
- UI state or UI lifecycle.
- Navigation frameworks.
- Mobile-specific APIs.
- Any other presentation-layer technology.

UI applications and other clients interact with the Game Core through well-defined interfaces.

## Consequences

- Game logic can be tested independently from the UI.
- The same Game Core can be reused by different clients or game technologies.
- React Native remains a presentation/client layer rather than becoming part of the game's domain logic.
- Future migration or integration with technologies such as Unity becomes more feasible.
- The Game Core remains focused on deterministic game behavior rather than presentation concerns.
