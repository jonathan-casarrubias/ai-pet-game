# Game Design Overview

## Product concept

The AI Pet Game is a mobile game for children approximately ages 3–9. It combines a virtual pet with bounded AI-powered narrative and adventure gameplay. It is conceptually inspired by virtual-pet games such as Tamagotchi and Pou, but it is not a clone of either product.

The pet and its world provide a safe setting for curiosity, creativity, discovery, learning, and fun. AI can make interactions and narrative feel varied and responsive, but it operates inside the defined game world and capabilities. The product is not an open-ended AI chatbot.

Learning should be incidental and embedded in play rather than presented as traditional school-like instruction. The MVP is intentionally a small, coherent vertical slice that demonstrates this experience without defining the full commercial product or a complete production feature set.

## Core gameplay loop

The established conceptual loop is:

```text
Curiosity
    → Question / interaction
    → Pet / narrative response
    → Adventure or mini-game
    → Discovery / learning / outcome
    → Pet evolves
    → New curiosity
```

Conceptually:

- **Curiosity:** The player notices something, wonders about it, or becomes interested in an opportunity in the game world.
- **Question or interaction:** The player responds through a question, choice, observation, exploration, or other supported interaction.
- **Pet or narrative response:** The pet and game world respond within their bounded narrative and gameplay capabilities.
- **Adventure or mini-game:** The interaction may lead to a supported gameplay experience rather than only a conversational answer.
- **Discovery, learning, or outcome:** The player experiences a meaningful result, such as discovering something or understanding a relationship within the game world.
- **Pet evolves:** Meaningful gameplay can influence the pet's ongoing state, personality, history, or access to future bounded experiences according to Game Core rules.
- **New curiosity:** The changed situation creates another opportunity for interest and exploration.

This loop describes the intended product experience, not necessarily a literal UI sequence for every interaction. Some interactions may contain only part of the loop. AI can enrich narrative and variation at multiple points, but Game Core owns the actual rules, transitions, and outcomes.

## The virtual pet

The pet is the central player-facing character and a persistent game entity. It gives the player a continuing relationship with the game world and provides a consistent lens for narrative, discovery, and play.

Conceptually, the pet can have:

- A persistent identity.
- A personality that evolves through gameplay.
- Relationships with the player expressed through bounded game interactions.
- A history of meaningful discoveries and adventures.
- Reactions influenced by the player's gameplay.
- Narrative behavior influenced by personality and current game context.

The pet is not intended to become an unrestricted AI companion or a mechanism for emotional dependency. Its behavior remains bounded by the game world, child-safety constraints, and supported capabilities. The pet's authoritative state belongs to Game Core rather than to the mobile UI, a model, or raw conversation history.

This overview does not define a final pet schema, stat system, needs system, age system, species system, or personality trait list.

## Curiosity as a gameplay driver

Curiosity is a core design concept. The game should create opportunities for the player to:

- Ask questions.
- Notice something interesting.
- Explore.
- Make choices.
- Discover something new.
- Trigger an adventure or mini-game.

Curiosity must not turn the product into an unrestricted question-and-answer chatbot. A player's question or interaction is interpreted within the game's bounded world and supported capabilities. AI may help express an engaging response, but it does not define arbitrary mechanics or promise outcomes that Game Core has not established.

## Adventures and quests

Adventures and quests are bounded gameplay experiences. They provide opportunities for exploration, discovery, narrative, and interaction while remaining within structures and types supported by the game.

An adventure or quest should:

- Use a predefined, game-supported structure or type.
- Provide a meaningful opportunity for exploration, discovery, narrative, or gameplay.
- Produce a valid Game Core outcome.
- Allow bounded AI-generated variation when the capability explicitly supports it.

AI may propose narrative or content variations of an existing supported type. It may not invent arbitrary mechanics, rewards, progression systems, or state transitions. Exact quest types, schemas, reward values, and progression rules remain future game-design work.

## Mini-games

Mini-games are gameplay modules that may be triggered as part of an adventure or another supported game experience. They are governed by Game Core rules and outcomes, while the mobile client presents the interaction and handles presentation-layer input.

The design allows a mini-game abstraction so that the initial mobile implementation can differ from a possible future Unity implementation:

```text
Mini-game concept
    ├── Mobile presentation and input
    └── Future alternative presentation or technology
```

The abstraction is a boundary, not a reason to invent speculative frameworks. Game Core owns the domain rules and valid results. AI may influence bounded narrative or content around a mini-game when explicitly supported, but it does not define arbitrary new mini-game mechanics. Mini-game logic should remain replaceable and extensible without coupling Game Core to React Native.

No specific mini-games are established by this overview.

## Personality

Personality is an evolving gameplay concept belonging to the pet and game domain. It is influenced by structured gameplay history and meaningful player behavior. It may influence narrative presentation, reactions, curiosity, interactions, and bounded gameplay variation.

Game Core owns the authoritative personality state and the rules that govern its evolution. The AI may express personality and may receive selected personality information as controlled context, but it must not independently redefine the pet's authoritative personality state. Any personality change must follow a valid game rule and state transition.

This overview does not define exact traits, numerical scales, personality algorithms, or evolution thresholds.

## Game memory

Game memory represents meaningful gameplay information rather than simply storing an unrestricted conversation transcript. Conceptual categories may include:

- Discoveries.
- Completed adventures.
- Meaningful events.
- Structured preferences inferred from gameplay.
- Progression.
- Personality-related signals.

Structured memory supports deterministic gameplay, controlled AI context, predictable progression, testability, and privacy and safety boundaries. It avoids making the game dependent on a model remembering a long conversation or on raw dialogue becoming an unrestricted profile of the child.

Raw conversation may be relevant to a particular interaction, but it is not the authoritative memory of the game. The final persistence schema is not defined here.

## Discovery and incidental learning

Discovery and learning are intended outcomes of play, not a separate school curriculum. The game should create opportunities for the child to:

- Discover concepts.
- Connect observations.
- Ask follow-up questions.
- Experiment.
- Solve simple problems.
- Learn through narrative and play.

Learning should feel embedded in the adventure and connected to the pet's curiosity. The product should not become a homework system, classroom, generic educational chatbot, or unrestricted factual question-and-answer system.

AI may help present or contextualize bounded educational or narrative content, but authoritative factual and game constraints must not depend solely on model output. No curriculum or educational standards are defined by this overview.

## Game state and authority

The game distinguishes among authoritative game state, derived or presentational information, and AI-generated content.

**Game Core owns authoritative state and gameplay decisions.** Conceptual authoritative areas may include:

- Pet state.
- Personality state.
- Progression.
- Quest or adventure state.
- Rewards and inventory.
- Meaningful game events.

AI-generated dialogue or narrative is not automatically authoritative game state. A client does not become authoritative merely because it renders content or collects player input. The database persists authoritative information, using PostgreSQL with Neon as the selected persistence technology, but persistence does not replace Game Core as the owner of rules and state transitions.

The same principle applies across the backend: the API transports and orchestrates operations, while the Game Core determines valid outcomes.

## AI's role in gameplay

AI participates as a creative layer, not as the game engine. It may:

- Generate bounded pet dialogue.
- Vary narrative presentation.
- Adapt bounded content to personality and structured gameplay history.
- Propose variations of supported adventures or quests.
- Propose bounded mini-game content variations where explicitly supported.

AI cannot:

- Directly mutate authoritative state.
- Define game rules.
- Grant arbitrary rewards.
- Define progression.
- Invent unsupported mechanics.
- Access unrestricted game data.
- Become an unrestricted chatbot.

The deeper controlled-context, proposal, validation, failure, and provider-boundary model is documented in `knowledge/ai/ai-system-overview.md`. This document focuses on what that boundary means for gameplay rather than repeating the AI system design.

## Child safety as a game-design constraint

Child safety is part of the product design, not merely an infrastructure feature. The bounded game-world design is itself an important safety boundary: the experience is organized around supported interactions, narrative contexts, and gameplay outcomes instead of unrestricted conversation or browsing.

The game should avoid:

- Open-ended unrestricted conversations.
- Emotional dependency.
- Secrecy from parents or caregivers.
- Manipulation.
- Unnecessary collection of personal information.
- Unrestricted external browsing.
- Adult or unsafe content.
- Mechanics that intentionally pressure the child through manipulative engagement.

Safety constraints apply to the pet, narrative, adventures, mini-games, progression, and AI-generated content. The game should fail safely when content or proposals cannot be accepted rather than weakening its boundaries.

## Player agency and interaction model

The child is an active participant rather than a passive recipient. The game should allow the player to:

- Interact with the pet.
- Make choices.
- Explore.
- Ask questions.
- Play mini-games.
- Discover outcomes.

AI should respond within the game world and support the player's agency rather than attempting to control the player's real-world decisions. The design should avoid coercion, fear, dependency, and pressure as engagement mechanisms. Exact UX flows are intentionally left open.

## Progression and evolution

Progression describes how the pet and game experience evolve through meaningful play. Conceptual dimensions may include:

- Discoveries.
- Adventures completed.
- Personality development.
- Access to new bounded experiences.
- Evolving narrative possibilities.

Progression must remain an authoritative Game Core concern. AI may help present or vary content, but it cannot grant progression or decide that an unlock occurred.

This overview does not define levels, experience values, currencies, unlock trees, reward tables, timers, streak mechanics, or monetization mechanics. Those require explicit future game-design decisions.

## MVP philosophy

The MVP should prove the core experience rather than maximize feature count. A successful vertical slice should demonstrate enough of the following to make the product concept coherent:

- Pet interaction.
- Bounded AI narrative.
- Curiosity.
- An adventure or mini-game.
- Discovery or incidental learning.
- Persistent state.
- Personality or gameplay adaptation.
- Safe fallback when AI is unavailable.

These are product capabilities to demonstrate, not a requirement to build every possible variation. The MVP should remain intentionally small enough to validate the concept before expanding mechanics, content, or infrastructure.

## Visual and interaction direction

The visual direction is colorful, modern, 2D, illustrated, cartoon-like, approachable, and playful. Pixel art is not the primary visual direction.

This direction supports the target audience and tone, but it does not determine the domain architecture. Visual presentation remains a client concern; authoritative gameplay behavior remains in Game Core and should be usable by other clients or technologies.

## What this overview intentionally does not define

This overview does not yet define:

- Exact pet attributes.
- Exact personality traits.
- Exact personality evolution algorithm.
- Exact needs or care mechanics.
- Exact quests or adventures.
- Exact mini-games.
- Exact progression.
- Exact rewards.
- Exact inventory.
- Currencies.
- Monetization.
- Daily or streak mechanics.
- Exact learning content.
- Curriculum.
- Final UI or UX flows.
- Final persistence schema.
- Final API contracts.
- Exact AI proposal schemas.

These details must be designed explicitly before implementation rather than invented by a coding agent. This document establishes the stable product and gameplay model: the game is a bounded virtual-pet adventure experience in which AI enriches narrative and variation, while Game Core remains authoritative for valid gameplay.
