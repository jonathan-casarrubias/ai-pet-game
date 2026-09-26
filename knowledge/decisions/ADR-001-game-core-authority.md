# ADR-001: Game Core is the authoritative source of game state and rules

## Context

The AI Pet Game uses AI to dynamically influence narrative, adventures, and mini-games. However, an LLM must never be the authority over the actual game state or game rules because AI output can be unpredictable or incorrect.

## Decision

The Game Core is the single authoritative source for:

- Game state
- Game rules
- State transitions
- Progression
- Rewards
- Validation of AI proposals

The AI acts only as a bounded proposal and narrative engine. It may propose narrative content, quest variants, dialogue, or other allowed game decisions, but the Game Core must validate the proposal before any state mutation occurs.

The AI must never directly mutate game state.

## Core Flow

Game Core → controlled context → AI → structured proposal → Game Core validation → state mutation

## Consequences

- Game rules remain deterministic and testable.
- AI failures or hallucinations cannot directly corrupt game state.
- The AI implementation can be replaced without changing the core game rules.
- AI-generated content must pass validation before affecting gameplay.
