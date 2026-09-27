# Generated Gameplay Sequences and Player Actions

This document defines the conceptual relationship between an AI-generated gameplay sequence and the actions a player takes within it. It extends the [Generative Capability Space](generative-capability-space.md) and [Capability Model](capability-model.md) without defining implementation schemas, runtime classes, APIs, or concrete gameplay mechanics.

The central question is whether a generated sequence should be a script, a dynamically selected decision tree, or a bounded context in which player actions determine what happens next.

The appropriate model for this architecture is the third: **a generated gameplay sequence is a bounded gameplay context and structure within which player actions can produce different valid outcomes and cause the experience to evolve.**

## Conceptual Flow

The relationship is:

```text
Player and world context
        ↓
Controlled AI context
        ↓
AI generates gameplay sequence proposal
        ↓
Game Core validates the generated context
        ↓
Gameplay context is presented to the player
        ↓
Player attempts an action
        ↓
Game Core validates the player action
        ↓
Accepted consequence or safe rejection
        ↓
Authoritative state and history
        ↓
The current sequence evolves, ends, or leads to future generation
```

The generated sequence is not authoritative merely because it was produced by AI. The player's action is not authoritative merely because it is consistent with the sequence. Game Core evaluates both against the current authoritative state, capabilities, rules, constraints, invariants, progression boundaries, and safety requirements.

## What Is a Generated Gameplay Sequence?

A **Generated Gameplay Sequence** is a concrete, bounded gameplay context produced by AI from the applicable Game Core capability space and controlled player/world context.

It may describe or organize:

- A situation the player and Pet encounter.
- Relevant entities, relationships, or world circumstances.
- Capabilities that may be applicable in the current context.
- A possible direction or arrangement of gameplay.
- Narrative framing that makes the situation understandable.
- Conditions that affect which player actions are valid.
- Potential kinds of consequences that Game Core may evaluate.

It is an intended structure for interaction, not a promise that every described step will occur. It gives the player a bounded space of meaningful possibilities while leaving the actual next action to the player and the authoritative outcome to Game Core.

A generated sequence is therefore:

- More concrete than an abstract capability.
- Less rigid than a script.
- More dynamic than a predefined branch.
- More bounded than unrestricted conversation or arbitrary simulation.
- Subject to change as a result of accepted player actions.

The sequence can be novel and need not have been previously authored, named, stored, or implemented as a complete experience.

## Alternatives Considered

### Rigid script

Under a rigid-script model:

```text
Step 1 → Step 2 → Step 3 → Step 4
```

the player is effectively expected to perform the actions assumed by AI. This would make the generated sequence an implicit command list. It would reduce player agency, make unexpected but valid behavior difficult to support, and encourage AI to fabricate or assume actions that the child never performed.

This model is rejected.

### Dynamically generated decision tree

Under a decision-tree model, AI would generate or select a set of branches and the player would move through those predefined alternatives:

```text
Generated start
       ├── Branch A
       └── Branch B
```

Even if the tree were generated at runtime, it would still treat gameplay as a collection of predefined paths selected by the system. It would make the sequence a bounded selection structure rather than a generative capability context. It also encourages the system to precompute the player's possible future rather than respond to actual actions and current state.

This model is rejected as the primary architecture.

### Bounded gameplay context

Under the adopted model, AI generates a bounded context and a composition of applicable capabilities. The player then chooses or attempts an action within that context. Game Core determines whether the action is valid and what it changes.

The resulting experience can:

- Continue along the generated direction.
- Produce a different valid consequence.
- Change the relevant situation.
- Open a new valid interaction.
- End the current sequence.
- Lead to a new generation step using the updated state and history.

This model preserves bounded generation while allowing player behavior to shape the actual experience.

## Player Actions Are Not AI-Generated Actions

The distinction between an AI-generated gameplay proposal and an actual player action is fundamental.

### AI-generated gameplay proposal

The AI may generate a situation, capability composition, possible interaction, or bounded direction for gameplay. This proposal is untrusted input. It describes what may be available or relevant, not what the player has done.

### Actual player action

The player action is an external input supplied through the client. It represents what the player is attempting to do. It must be evaluated independently by Game Core against the current state and applicable capabilities.

AI must not:

- Fabricate that the player performed an action.
- Assume that the player followed the generated sequence.
- Convert a suggested action into an accepted action.
- Declare that a player completed a step because the action would fit the narrative.
- Apply a consequence before Game Core accepts the player's action.

The player's action may match the generated direction, choose among available possibilities, take a valid alternative, decline to continue, or attempt something outside the current capability space. Game Core decides what is valid in each case.

## A Generated Sequence Is Not a Script

A generated sequence must not be interpreted as:

```text
AI writes steps
        ↓
Player follows steps
        ↓
Game Core confirms the expected result
```

That model would make AI the author of the player's behavior and would turn the player into an executor of a model-generated script.

Instead:

```text
AI generates bounded gameplay context
        ↓
Player chooses or attempts an action
        ↓
Game Core evaluates the action
        ↓
Accepted result changes the authoritative context
        ↓
The sequence continues, changes, ends, or leads to future generation
```

The sequence may communicate an intended direction or available affordances, but it does not require a single correct player path unless a future game rule deliberately defines such a condition. Even then, the requirement is a Game Core rule, not an assumption made by AI.

Player agency is preserved by allowing the child to make meaningful choices, try supported alternatives, pause, decline, or produce an outcome that differs from AI's expectation without the system treating that difference as a failure of the child.

## Capabilities, Actions, and State

The relationship between generated capabilities, player actions, and state is:

```text
Generated capability context
        ↓
Player attempts an action
        ↓
Game Core checks capability applicability and rules
        ↓
Game Core accepts or rejects the action
        ↓
Accepted state transition and domain consequences
```

The generated sequence can identify relevant capabilities, but it does not execute them. The player supplies the action, and Game Core determines whether that action is valid for the current entity, world, state, and sequence context.

An accepted action may:

- Advance the current gameplay context.
- Produce a discovery or other consequence.
- Change which capabilities are applicable.
- Alter the relationship between entities or world elements.
- Make a previous capability unavailable or a new capability relevant.
- Complete or end the current context.
- Provide structured history for future generation.

These are conceptual possibilities, not a final state or progression model. Any actual effect must be determined by Game Core rules and accepted through a valid state transition.

## Player Actions Can Shape What Happens Next

The generated sequence should be understood as a starting context, not a complete prediction of the player's future.

Different valid actions can produce different consequences:

```text
Generated context
        ↓
Player action A ──→ accepted consequence A ──→ updated context A

Generated context
        ↓
Player action B ──→ accepted consequence B ──→ updated context B
```

The two actions do not need to correspond to two manually authored branches. They can be different valid uses or combinations of the same capabilities, evaluated against the state at the moment they occur.

After an accepted action, the experience may evolve deterministically according to Game Core rules, receive another controlled AI generation step, or end safely. If AI generates the next context, that generation uses the updated authoritative state and structured history rather than assuming that the previous sequence continued unchanged.

This is how player behavior can materially influence future gameplay without requiring a predefined decision tree for every possible action history.

## Sequence Evolution

A generated sequence may evolve in several conceptual ways after player action:

### Continue

The accepted action preserves the relevant context and makes another part of the generated direction applicable.

### Transform

The accepted action changes the world or state so that the current context becomes a different valid situation. The next gameplay may use different capabilities or relationships.

### Branch through state, not authored paths

The player's action may lead to a different valid state and therefore a different future context. This is not a predefined branch tree. The divergence emerges from the accepted state transition and subsequent generation.

### Complete

The accepted action satisfies the relevant conditions for the current bounded context, producing an accepted consequence or discovery.

### End or pause

The player may stop, decline, or reach a safe end to the current context. The game must not invent punishment, guilt, emotional pressure, or hidden consequences because the player did not continue.

The precise lifecycle of a sequence remains future design work. The stable principle is that player action and Game Core state, not AI expectation, determine which evolution is valid.

## Validation of Player Actions

Game Core validates player actions independently from the AI-generated proposal. Conceptually, it evaluates:

- Whether the player action is recognizable as a supported input.
- Whether the referenced capability exists.
- Whether that capability applies to the current entities and state.
- Whether the action is valid within the current generated gameplay context.
- Whether applicable rules and constraints are satisfied.
- Whether state invariants remain true.
- Whether progression and consequence boundaries are respected.
- Whether the resulting transition is safe and authoritative.

A player action can be rejected even when it was suggested by AI. An action can also be valid even when it was not explicitly anticipated by the generated narrative, provided it belongs to the current capability space and satisfies Game Core rules.

The generated sequence is therefore context for validation, not a replacement for validation. Game Core does not merely check whether the player completed the AI's expected step; it determines whether the attempted action is valid in the current domain state.

## Authority and Consequences

Only Game Core can turn a player action into an authoritative consequence.

The authority boundary is:

```text
AI-generated gameplay proposal
        ↓
Untrusted context for player interaction
        ↓
Player action
        ↓
Game Core validation
        ↓
Accepted domain decision
        ↓
Authoritative state, events, memory, progression, or rewards
```

AI may describe a possible consequence, but it cannot grant that consequence. A narrative statement that the Pet discovered something, earned a reward, completed an objective, or changed personality remains non-authoritative until Game Core independently accepts the underlying result.

Rejected actions and rejected AI proposals must not partially mutate state. Persistence records accepted results, and clients present accepted results; neither boundary decides whether the action was valid.

## Novelty and Player Agency

Novel gameplay can emerge not only from the initial AI-generated sequence but also from the interaction between that sequence and actual player behavior.

Novelty may arise from:

- A new composition of known capabilities generated for the context.
- A player action that uses a capability in an unexpected but valid way.
- A new ordering of valid capabilities after an accepted state change.
- A player-specific consequence based on structured history or discovery.
- A future generated context shaped by the player's accepted actions.

The system does not need to predict every valid action in advance. It needs to define capabilities and rules that let Game Core evaluate actions consistently and safely.

This does not permit arbitrary player actions or arbitrary AI behavior. Novelty remains bounded by the generative capability space, applicability conditions, invariants, progression boundaries, and child-safety requirements.

## Rejection and Correction

The generated-sequence model participates in the established correction flow:

```text
AI generates gameplay context
        ↓
Game Core validates the generated context
        ↓
Valid ─────────────→ present context to player

Invalid
        ↓
structured rejection feedback
        ↓
AI corrects the proposal
        ↓
Game Core revalidates
```

Once the context is presented, the player's action is evaluated through the normal Game Core input and transition flow. AI correction applies to an invalid generated proposal; it must not be used to rewrite a valid player action into the action AI expected.

If the generation/validation correction limit is reached, the future-defined recovery or fallback behavior is used. The system must not retry indefinitely and must never accept invalid gameplay merely to end the loop.

## Child Safety and Agency

Player agency is especially important for a child-oriented experience. A generated sequence must not pressure the child to follow AI's preferred path or imply that refusal, interruption, or a different valid action is emotionally harmful.

The system must not:

- Treat AI-generated instructions as mandatory without a Game Core rule that makes the action valid and appropriate.
- Use the Pet to shame, guilt, threaten, or manipulate the child into continuing.
- Introduce hidden consequences for declining or stopping.
- Encourage secrecy, dependency, or unsafe real-world behavior.
- Expose unnecessary personal information in order to continue the sequence.
- Let AI invent unsafe actions or consequences.

Bounded gameplay should provide understandable choices and safe responses while preserving the distinction between a generated suggestion and the child's actual decision.

## Determinism, Independence, and Boundaries

Game Core validation of player actions, applicability, rules, invariants, and accepted state transitions should be deterministic and testable wherever practical.

AI may remain probabilistic in generating gameplay context, but the meaning of an accepted player action must not depend on model wording or provider-specific behavior. Replacing the AI provider or model must not change Game Core authority or the fundamental interpretation of valid actions.

The model remains independent of:

- UI frameworks.
- API and transport frameworks.
- Persistence implementations.
- AI providers and models.
- Prompt formats and orchestration technologies.

Those surrounding systems may transport or present context and actions, but Game Core remains responsible for domain validation and authoritative consequences.

## Relationship to Existing Documents

This document elaborates the existing generative gameplay architecture:

- **ADR-001:** Game Core remains the authority over rules, state, transitions, progression, rewards, and accepted consequences.
- **ADR-002:** AI remains a bounded narrative and creative engine. It may generate gameplay proposals, but it cannot define rules or mutate state directly.
- **ADR-006:** The AI produces controlled, structured, untrusted proposals. Only Game Core can accept a proposal or player action as an authoritative result.
- **ADR-007:** Gameplay is generated by design within a bounded capability space rather than selected from a finite experience catalog.
- **Generative Capability Space:** Defines the boundaries within which capabilities and gameplay can validly exist.
- **Capability Model:** Defines capabilities as composable building blocks and explains their applicability and validation.
- **First Gameplay Slice:** Describes the intended interaction-to-activity-to-outcome loop. Its activity examples should be understood as candidate bounded contexts or capability families, not as mandatory scripts or finalized experience branches.

This document adds the player-action dimension. It does not replace or redefine those decisions and design documents.

## Explicit Non-Goals

This document does not define:

- TypeScript interfaces or runtime classes.
- JSON schemas for sequences, actions, proposals, or rejection feedback.
- A formal action or sequence language.
- Validation algorithms.
- AI prompts, models, providers, or frameworks.
- A finite experience catalog.
- A predefined decision tree for every player action.
- Specific adventures, quests, mini-games, or activities.
- A final sequence lifecycle or recovery implementation.
- Persistence schemas, APIs, WebSockets, or UI behavior.
- Personality, memory, progression, or reward algorithms.

## Design Principles

1. **A generated sequence is a bounded gameplay context, not a rigid script.**
2. **AI proposes gameplay; the player supplies actions; Game Core decides consequences.**
3. **AI must never fabricate or assume that the player performed an action.**
4. **Player actions are external inputs evaluated against current authoritative state.**
5. **A generated sequence is not a dynamically selected experience catalog or decision tree.**
6. **Player behavior may cause the experience to continue, transform, complete, pause, or lead to new generation.**
7. **Novel player-specific outcomes are allowed when they remain within the capability space.**
8. **Only Game Core-authorized consequences become authoritative state.**
9. **Rejection and correction must be structured and bounded.**
10. **Child safety and player agency remain authoritative boundaries.**
