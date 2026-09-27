# First Gameplay Slice

This is a living game-design document for the first gameplay slice. It records the current product direction and open design status; it is not an ADR or a permanent architectural decision.

## Purpose

The purpose of the first gameplay slice is to establish a concrete vertical gameplay loop that demonstrates the product philosophy rather than merely adding another player interaction.

The slice should demonstrate:

```text
Interaction
    → bounded narrative / Pet response
    → activity
    → player action
    → Game Core validation
    → outcome
    → discovery / consequence
```

The goal is to move beyond:

```text
Child asks → AI answers → child asks again
```

Instead, an interaction should lead into an activity, and the activity should produce a meaningful game outcome. This supports the established game-first, bounded-AI product direction described in [Game Design Overview](game-design-overview.md) and [Player Experience and Core Loop](player-experience-and-core-loop.md).

## Core Design Principle

An activity is not simply a question with a correct answer.

Activities may involve different forms of interaction, including:

- Choosing.
- Exploring.
- Classifying.
- Solving.
- Investigating.

The product should feel like a game or adventure with incidental learning, not like a quiz or an educational chatbot.

The current conceptual structure is:

```text
Question / curiosity
    → narrative context
    → activity
    → player action
    → game outcome
    → discovery / consequence
```

This structure is consistent with the existing core-loop and bounded-world guidance in [Core Domain Model](core-domain-model.md), [World and Content Structure](world-and-content-structure.md), and [Adventures, Quests, and Mini-games](adventures-quests-minigames.md).

## Candidate Activity Families

All three activity families below are currently considered valid future directions. They are candidate categories, not finalized mechanics.

### A. Discovery / Classification

Examples include:

- Identifying an animal's habitat.
- Identifying suitable conditions for a seed.
- Classifying an object by material.
- Identifying what a creature eats.

The purpose of this family is to provide simple activities that naturally demonstrate incidental learning.

### B. Exploration

The Pet discovers a place or situation, and the player chooses what to investigate.

For example, a forest could contain several possible things to investigate, such as:

- A rock.
- A lake.
- A plant.

The player's choice determines what is discovered.

The purpose of this family is to make the interaction feel more like an adventure than a quiz and to establish a foundation where player behavior can later influence gameplay and personality.

### C. Puzzle

The player solves a bounded puzzle, such as a combination, sequence, or symbol-based challenge.

The purpose of this family is to demonstrate the future activity or Mini-game abstraction and provide a more traditional game interaction.

These examples are intentionally not expanded into complete mechanics here.

## First Slice Selection

The three activity families are all valid future directions. The exact first activity has not yet been finalized.

The first implementation should be selected based on:

- The product goals for the MVP.
- The ability to demonstrate the complete gameplay loop.
- The smallest meaningful bounded implementation.
- The ability to keep the rules deterministic and understandable.
- The ability to preserve Game Core authority while leaving narrative variation optional.

No activity family is selected by this document on behalf of the product or design process.

## Game Core Authority

Game Core remains authoritative over gameplay. It:

- Validates player actions.
- Determines whether an action is valid.
- Determines the authoritative outcome.
- Owns authoritative state transitions.
- Emits domain events for accepted outcomes.

The AI does not determine game truth and does not directly mutate game state.

These are already approved architectural principles, not new decisions in this document. See [Game Core Domain Boundaries](../architecture/game-core-domain-boundaries.md), [ADR-001: Game Core Authority](../decisions/ADR-001-game-core-authority.md), and [ADR-006: AI and Game Core Contract](../decisions/ADR-006-ai-game-core-contract.md).

## Narrative and AI Responsibility

AI remains a bounded narrative and creative engine. For this gameplay slice, AI may eventually be used to:

- Vary the narrative presentation.
- Generate or select bounded narrative variants.
- Adapt presentation to the player's structured history or personality when those concepts are defined.
- Generate bounded content within predefined activity types.

AI must not:

- Invent game rules.
- Determine authoritative outcomes.
- Directly modify Game Core state.
- Grant rewards directly.
- Introduce undefined mechanics.
- Turn the experience into unrestricted chat.

Any gameplay-affecting AI output must remain an untrusted proposal and follow the existing controlled-context, validation, and Game Core authority boundaries. See [AI Content and Narrative Model](../ai/ai-content-and-narrative-model.md), [AI Proposal Contract](../ai/ai-proposal-contract.md), and [ADR-002: AI as a Bounded Narrative Engine](../decisions/ADR-002-ai-bounded-narrative-engine.md).

No AI implementation is part of this document or its creation.

## Illustrative Conceptual Flow

The following is illustrative only and is not a finalized game mechanic:

```text
The child asks about something unusual the Pet has noticed.
        ↓
Bounded narrative gives the interaction context.
        ↓
The interaction becomes a supported activity.
        ↓
The child chooses, explores, classifies, solves, or investigates.
        ↓
Game Core validates the player action.
        ↓
The accepted action produces a bounded game outcome.
        ↓
The outcome establishes a discovery or other defined consequence.
```

The supported activity or capability space, rules, constraints, invariants, progression boundaries, safety requirements, and validation boundaries must be defined before implementation. Concrete gameplay sequences and experiences within that space may be generated dynamically by AI and validated by Game Core. The example does not establish a specific world, activity, reward, progression rule, or narrative outcome.

## Out of Scope

This document does not define:

- Final game mechanics.
- Final activity schemas.
- Final Game Core APIs.
- AI prompt formats.
- AI provider integrations.
- Database schemas.
- Mobile UI.
- Final reward or progression systems.
- Final personality mechanics.
- Production content.
- Complete quest or adventure systems.

It also does not change the approved Game Core, AI, framework, persistence, or runtime architecture.

## Evolution of This Document

This is a living design document. As gameplay experiments become more concrete:

- Ideas may be refined.
- Candidate activities may change.
- The first slice may be replaced by another candidate.
- Concrete mechanics may eventually become separate approved design decisions or architectural decisions when appropriate.

Normal game-design iteration does not need to become an ADR unnecessarily. Architectural decisions should continue to follow the existing ADR process when a change has architectural consequences.
