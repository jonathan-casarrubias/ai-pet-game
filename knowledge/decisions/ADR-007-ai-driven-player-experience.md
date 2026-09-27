# ADR-007: AI-Driven Player Experience Through Bounded Generation

## Status

Approved

## Context

The AI Pet Game is not a traditional game with an AI layer placed on top. It is also not a decision-tree game in which AI selects among a catalog of predefined experiences. The product thesis is that AI should materially influence the direction of a player's gameplay experience, while the game remains bounded, safe, and authoritative.

Dialogue generation, narrative variation, different wording or tone, cosmetic changes, and rephrasing the same gameplay are not sufficient. Those techniques can make a traditional game appear personalized without changing what the player actually does or how the player's gameplay develops.

The intended product model is:

```text
Player context
      ↓
Controlled AI context
      ↓
AI generates gameplay experience
      ↓
Game Core validates the generated experience
      ↓
Accepted gameplay becomes authoritative
      ↓
Gameplay produces new player state/history
      ↓
That new context influences future AI-generated gameplay
```

This requires a distinction between the bounded space defined by the game and the concrete experiences that emerge within it. Game Core must define what the game can safely and consistently do without manually authoring every possible experience. AI must be able to generate a concrete gameplay experience, including novel combinations or sequences, within those boundaries.

## Decision

The product will use **bounded AI generation**, not bounded selection from a finite catalog of predefined experiences.

Game Core defines the bounded generative space for gameplay. This includes the capabilities, valid actions, rules, state invariants, world constraints, entity capabilities, valid interactions, valid state transitions, valid consequences, progression constraints, and safety boundaries that must always hold. Game Core defines what the game can safely and consistently do; it does not need to define every experience that can occur.

Within those boundaries, AI generates the actual gameplay experience for a player at a particular moment. AI may generate situations, interactions, sequences of actions, combinations of capabilities, environmental circumstances, reactions, discoveries, challenges, consequences, exploration scenarios, progression experiences, narrative context, and gameplay adaptations. These are conceptual categories, not a final implementation model.

The generated experience may be novel. It does not need to have been previously authored, named, stored, or implemented as a predefined gameplay. The development team should define the system that makes diverse experiences possible rather than manually creating an exhaustive list of individual gameplays.

The conceptual flow is:

```text
Game Core capabilities + rules + constraints
                    │
                    ▼
             AI generates
          a concrete gameplay
                    │
                    ▼
            Game Core validates
                    │
          ┌─────────┴─────────┐
          │                   │
       accepted             rejected
          │                   │
          ▼                   ▼
     gameplay             fallback /
                           regenerate /
                           safely transform
```

The exact fallback, regeneration, or safe-transformation behavior is not decided by this ADR.

### Bounded generation, not bounded selection

Bounded AI does not mean selecting from a finite catalog of predefined experiences. The AI performs bounded generation. It may generate novel gameplay, but it cannot leave the capability, rule, state, progression, or safety boundaries defined and enforced by Game Core.

The Game Core defines the boundaries of the world; AI generates the experiences that emerge within them. Capabilities are predefined. Concrete experiences are not required to be.

### Game Core validates rather than authors every experience

Game Core remains authoritative, but authority does not require Game Core to manually author every experience. AI creates the proposed gameplay. Game Core determines whether that gameplay is valid for the current state and rules.

If valid, the generated gameplay may become authoritative gameplay through a Game Core-accepted result. If invalid or unsafe, it cannot directly affect authoritative state. It may be rejected, safely transformed, or handled by a future fallback mechanism within the approved architecture.

AI does not define what the game is capable of doing. AI generates the concrete gameplay experience appropriate for this player at this moment, subject to Game Core validation.

## Rejected product model: AI-assisted branching

The product must not be architected as a decision tree in which AI merely chooses among manually authored branches or predefined experiences:

```text
Start
 ├── Experience A
 │    ├── B
 │    └── C
 └── Experience D
      ├── E
      └── F
```

Nor should it be modeled as an experience catalog or experience selector whose purpose is to enumerate the gameplays AI may choose. Such a system would make AI an intelligent selector inside a traditional branching game and would not satisfy the product thesis.

The intended model is dynamic:

```text
Player state/history/context
             ↓
       Controlled AI context
             ↓
             AI
             ↓
      newly generated
        gameplay
             ↓
       Game Core validation
             ↓
       actual gameplay
             ↓
       new state/history
             ↓
             AI
             ↓
      another newly generated
        gameplay experience
```

The next experience emerges from the evolving state of the player and world. It does not need to correspond to a predefined branch.

## Player-specific experiences and dynamic progression

A core product goal is that two players using the same underlying Game Core capabilities can have materially different gameplay experiences when their gameplay histories or contexts differ.

Meaningfully different accepted actions, discoveries, decisions, behavior, curiosity, structured game memory, game-domain personality state, progression, or previous outcomes may influence the controlled context supplied to AI. That context may lead to different generated gameplay and different subsequent trajectories.

For example, two players may begin with the same capabilities but receive different generated situations or challenges because their accepted histories lead to different relevant contexts. The differences must be meaningful enough to affect gameplay or progression. The experiences do not need to come from manually authored branches.

The same principle applies to progression. Progression should be able to emerge from previous experiences, accepted actions, decisions, discoveries, behavior, curiosity, structured game memory, personality-related game state, and previous outcomes. Different players may therefore develop different gameplay trajectories, including trajectories that were not explicitly authored beforehand. Game Core still validates every authoritative progression outcome.

Personality remains a structured game-domain concept, not a psychological diagnosis or unrestricted model of the child. AI may use structured game-domain personality state and gameplay history as controlled context. This ADR does not define personality traits, memory schemas, or algorithms.

## Authority and safety

This decision does not weaken the existing authority or safety architecture:

- Game Core remains authoritative over game state, rules, validation, state transitions, progression, rewards, and accepted outcomes.
- AI output remains untrusted input to Game Core.
- Gameplay-affecting AI output remains a structured proposal under the approved contract.
- AI must not bypass validation or directly mutate authoritative state.
- AI must not redefine fundamental rules, violate state invariants, introduce unsupported runtime capabilities outside the defined generative space, grant arbitrary rewards, arbitrarily modify progression, create authoritative memory directly, or modify personality directly.
- AI must not create unsafe or inappropriate gameplay, access unrestricted external information during normal gameplay, or bypass child-safety constraints.

Creative freedom is therefore high within the boundaries, not unlimited outside them.

## MVP validation criterion

The MVP must demonstrate **generative gameplay, not AI-assisted branching**. It must demonstrate that:

1. The same underlying Game Core capabilities can support many different experiences.
2. AI generates concrete gameplay, not only dialogue, descriptions, or narrative presentation.
3. Generated gameplay is not selected from a finite predefined experience catalog.
4. Player context materially influences the generated gameplay.
5. Two players can follow materially different gameplay trajectories.
6. Some generated experiences can contain combinations or sequences that were never explicitly authored.
7. Game Core validates the generated experience before it becomes authoritative gameplay.
8. Invalid or unsafe generations cannot directly affect authoritative game state.
9. The system remains bounded and safe despite the generative nature of gameplay.

The demonstration must show meaningful player-specific gameplay or progression differences as a consequence of AI-driven adaptation. Differences limited to dialogue, presentation, cosmetics, random selection from authored experiences, fixed branching, or rephrasing the same gameplay do not satisfy this requirement.

The MVP does not need to provide unrestricted generation, infinite content, or a unique experience for every player. It must show that the product thesis is technically and experientially credible within the approved safety and authority boundaries.

## What does not qualify as the core innovation

The following may be useful features, but none alone satisfies this ADR:

- AI-generated dialogue or descriptions.
- Different wording, tone, or Pet personality in dialogue.
- Cosmetic or presentational variation.
- Random selection from predefined experiences.
- AI selecting from a finite gameplay catalog.
- Traditional branching gameplay with AI-generated text layered on top.
- Rephrasing or randomizing the same gameplay sequence.
- Choosing among manually authored progression paths.

## Relationship to existing decisions

This ADR clarifies the product direction without contradicting the existing approved architecture:

- **ADR-001:** Game Core remains the authoritative source of game state and rules. This ADR clarifies that authority means validating and accepting gameplay, not manually authoring every possible experience.
- **ADR-002:** AI remains bounded. This ADR clarifies that boundedness means bounded generation within Game Core capabilities, rules, constraints, invariants, and safety boundaries, not merely selection from predefined content.
- **ADR-006:** The AI/Game Core contract remains controlled context → structured AI-generated proposal → Game Core validation → accepted authoritative result. The proposal may describe a novel gameplay experience, but novelty does not make it authoritative until Game Core accepts it.

The [Generative Capability Space](../architecture/generative-capability-space.md) document elaborates the bounded-generation model established by this ADR at the conceptual design level. ADR-007 establishes the architectural and product decision; the design document does not replace or redefine it. Neither document defines implementation schemas or concrete runtime mechanisms.

This ADR does not authorize unrestricted chat, arbitrary mechanics, model-defined rules, direct state mutation, or any provider-specific implementation.

## Implications for future architecture and gameplay design

Future Game Core design should focus on defining a generative capability space rather than accumulating manually authored experiences. Future designs should distinguish between capabilities, rules, constraints, state, validation, generated experience proposals, and accepted outcomes without presupposing a catalog of experiences.

Future gameplay should be evaluated for whether it gives player context meaningful influence over generated gameplay while remaining safe and valid. The system should permit the development team to encounter a valid gameplay sequence that was never explicitly designed beforehand.

The first gameplay vertical, including concepts described in `first-gameplay-slice.md`, may remain useful as an example of the kind of experience a future AI-driven system could generate. It is not established by this ADR as a manually authored gameplay specification, and this ADR does not authorize implementing any particular scenario.

This ADR does not define the concrete implementation of capabilities, proposals, validation, state, or accepted outcomes. Those decisions require future design and implementation work when concrete requirements exist.

## Consequences and trade-offs

Positive consequences include:

- The MVP tests whether AI can generate gameplay rather than only content around fixed gameplay.
- Player history and behavior can affect gameplay trajectories, not only dialogue.
- The game can remain bounded and safe while supporting novel combinations and sequences.
- Game Core remains the authority and AI remains replaceable at the architectural boundary.
- The distinction between meaningful adaptation and cosmetic personalization becomes explicit and testable.

Trade-offs include:

- Game Core validation must be strong enough to evaluate novel proposals without authoring every possible experience in advance.
- Future capabilities, rules, invariants, and safety boundaries require careful design because they define the limits of generation.
- Product evaluation becomes more demanding because different wording is not evidence of generative gameplay.
- The system needs a safe response when a proposal is invalid, unsafe, or unavailable; the exact mechanism remains future work.
- Novel generation can increase unpredictability, requiring stronger testing and child-safety review.
- Demonstrating meaningful divergence may require more game-domain state and progression design than a dialogue-only experience.

## Non-goals

This ADR does not define:

- Concrete TypeScript interfaces or proposal schemas.
- Concrete capability schemas, validation algorithms, or state-transition algorithms.
- Prompt design, model selection, AI providers, or AI frameworks.
- RAG, vector databases, agents, LangChain, LangGraph, or other orchestration technologies.
- Memory schemas, personality traits, personality algorithms, or the final progression algorithm.
- Activity, adventure, quest, mini-game, or other specific gameplay mechanics.
- Specific manually authored experiences or an experience catalog.
- Database schemas, persistence implementation, APIs, WebSockets, UI, or deployment design.

The decision is a product and architecture principle: gameplay is AI-generated by design within a bounded generative space, while Game Core remains authoritative over the capabilities, rules, constraints, validation, and outcomes that determine what can become real gameplay.
