# Core Domain Model

This document establishes the stable vocabulary of the AI Pet Game for future Game Core work. It describes what the main concepts mean and how they relate without defining implementation contracts, database structures, or exact game mechanics.

## Domain authority and information categories

The domain distinguishes four kinds of information:

- **Authoritative domain concepts:** State and decisions owned by Game Core, including game state, pet state, personality, progression, valid outcomes, and accepted rewards.
- **Player/client input:** Intent and interaction data supplied by the player through a client. Input is evaluated by Game Core and is not authoritative by itself.
- **AI-generated proposals:** Bounded, untrusted suggestions for narrative or supported gameplay variation. A proposal has no game authority until Game Core accepts it.
- **Derived, persisted, or presentation information:** Information calculated from accepted domain decisions, stored for later use, or formatted for the client. Persistence stores accepted state; presentation does not define it.

The central rule is: **Game Core decides, persistence records, clients present, and AI proposes.**

## Core concepts

### Player

**Represents:** The participant whose actions drive the game experience. The Player concept provides the domain context for interactions, progress, discoveries, and the relationship with the pet.

**Relationships:** A player supplies intent, participates in interactions, encounters adventures and mini-games, and influences the pet through meaningful gameplay. Player-related game state may be associated with progression, history, or preferences demonstrated through play.

**Category:** The player is a domain concept. Game-relevant player state is authoritative when tracked by Game Core; authentication, account management, and identity infrastructure are outside this model.

### Pet

**Represents:** The persistent player-facing character at the center of the game world. The pet provides continuity across interactions, narrative, adventures, discoveries, and evolution.

**Relationships:** The pet has an identity and personality, responds to player interactions, participates in adventures and mini-games, and may change through accepted progression and discovery outcomes.

**Category:** Authoritative Game Core state. The pet is not an unrestricted AI companion, and its behavior is not defined solely by model output, raw conversation, or client presentation.

### Pet identity

**Represents:** The stable identity that allows the game to refer to the same pet across sessions and meaningful gameplay.

**Relationships:** Identity anchors the pet's personality, history, discoveries, progression, and relationship with the player. It gives persistent state a subject without prescribing species, appearance, age, or other undefined attributes.

**Category:** Authoritative domain state when the game tracks it. The exact identity attributes remain open and are not defined by this document.

### Pet personality

**Represents:** Structured gameplay-related characteristics that influence how the pet reacts, expresses itself, and participates in bounded narrative or gameplay.

**Relationships:** Personality may be influenced by accepted gameplay, structured memory, discoveries, and progression. It may shape pet or narrative responses and controlled AI context, but AI does not independently change it.

**Category:** Authoritative Game Core state. Exact traits, scales, evolution rules, and algorithms remain undefined.

### Game state

**Represents:** The authoritative current condition of the game for a player and pet, including only concepts that the implemented game rules recognize.

**Relationships:** Game state contains or refers to pet identity, personality, progression, adventure or quest status, discoveries, accepted rewards, optional inventory, and structured memory when those concepts are implemented. Player intent and AI proposals are evaluated against the current state.

**Category:** Authoritative Game Core state. PostgreSQL with Neon may persist it, but persistence does not define its meaning or transitions.

### Player intent

**Represents:** What the player is attempting to do through the client, such as asking a supported question, choosing an action, exploring, or participating in gameplay.

**Relationships:** Intent begins the domain flow and may become an interaction if it is recognized and accepted by Game Core. It can lead to a pet or narrative response, an adventure or mini-game, or another supported outcome.

**Category:** Player/client input. Intent is not a command that bypasses validation and does not directly mutate authoritative state.

### Interaction

**Represents:** A bounded game-domain exchange or operation between the player, pet, and game world. It is the domain interpretation of supported player intent rather than an unrestricted conversation.

**Relationships:** An interaction may express curiosity, produce a pet or narrative response, lead to an adventure or mini-game, or result in a discovery and other accepted changes. An interaction may use AI for bounded creative content, but the interaction's valid outcome remains a Game Core decision.

**Category:** The incoming interaction is input; an accepted interaction and its effects are authoritative domain outcomes. Client rendering and raw conversation text are presentation or content, not the authority.

### Curiosity

**Represents:** Interest, wonder, or an opportunity to explore that drives the player and pet toward another meaningful interaction.

**Relationships:** Curiosity can lead to a question or other interaction, which may lead to a pet or narrative response, adventure, mini-game, discovery, and further pet evolution. An accepted outcome can create conditions for new curiosity.

**Category:** A gameplay concept that may be represented in authoritative state when the rules track it, or used as derived narrative context when it is not explicitly stored. A raw player question is not automatically a durable curiosity record.

### Adventure

**Represents:** A bounded game-world experience that combines narrative, interaction, exploration, discovery, or supported gameplay.

**Relationships:** An adventure may be initiated by an interaction or curiosity, contain or reference one or more quests or mini-games, and produce discoveries, learning outcomes, progression, personality effects, or rewards when Game Core accepts them.

**Category:** An authoritative domain concept when its state or outcome is tracked. Its exact structure, lifecycle, and content remain open.

### Quest

**Represents:** A bounded objective or supported unit of activity within an adventure or other game experience.

**Relationships:** A quest belongs to the game's predefined boundaries, may be presented through narrative, and can produce an accepted outcome when its conditions are met. AI may suggest a variation within an allowed quest concept but cannot define a new objective or rule.

**Category:** Authoritative domain state and rules when implemented. Exact quest types, structures, conditions, and rewards remain undefined.

### Discovery

**Represents:** A meaningful game-world fact, realization, or newly encountered result established through accepted play.

**Relationships:** Discoveries may arise from interactions, adventures, quests, or mini-games. They can contribute to structured game memory, progression, personality-related behavior, future narrative context, and new curiosity.

**Category:** An accepted domain result that may become authoritative state and structured memory. Its presentation to the player is derived or presentation-related, and AI-generated text is not itself the discovery unless Game Core accepts the underlying result.

### Learning or discovery outcome

**Represents:** The meaningful understanding, connection, or change in perspective that play is intended to encourage through discovery and narrative.

**Relationships:** It may emerge from a discovery, adventure, quest, or mini-game and may contribute to progression, pet evolution, or new curiosity. Learning is embedded in play rather than represented as a separate school system.

**Category:** The accepted game-world outcome is a domain result when the game rules recognize it. The player's subjective understanding and the exact educational content are not authoritative Game Core state unless explicitly modeled later.

### Mini-game

**Represents:** A bounded gameplay module that presents an interaction or challenge within an adventure or another supported game experience.

**Relationships:** A mini-game receives player input, follows Game Core rules, and produces an accepted result that may contribute to discovery, progression, personality, or rewards. Its visual presentation is supplied by the client.

**Category:** The mini-game's rules and accepted results are authoritative Game Core concepts; its rendering and input controls are presentation concerns. Exact mini-games and mechanics remain undefined.

### Progression

**Represents:** Authoritative change in the pet's or player's available game experience as a consequence of meaningful accepted play.

**Relationships:** Progression may reflect discoveries, completed adventures, personality development, access to future bounded experiences, or other game-defined changes. It is determined by Game Core and may be persisted and used as context for later decisions.

**Category:** Authoritative Game Core state and rules. No exact levels, experience, currencies, unlock trees, timers, streaks, or progression algorithm are defined.

### Reward

**Represents:** An accepted game consequence granted for a valid outcome.

**Relationships:** A reward can result from an adventure, quest, mini-game, discovery, or other supported interaction and may contribute to progression or optional inventory. AI and clients may describe or display a reward but cannot grant one.

**Category:** Authoritative domain outcome and state when accepted by Game Core. Exact reward types, values, and mechanics remain open.

### Inventory (optional established concept)

**Represents:** A possible structured record of persistent game items or other collectible rewards recognized by the game.

**Relationships:** If introduced, inventory is updated only by accepted Game Core outcomes and may relate to rewards, progression, adventures, or pet state.

**Category:** Optional authoritative Game Core state if the MVP or a later feature uses it. Its schema and mechanics are intentionally undefined; the concept must not be assumed to require an inventory system.

### Structured game memory

**Represents:** A bounded record of meaningful gameplay information used to preserve continuity and support future domain and narrative decisions.

**Relationships:** It may include discoveries, completed adventures, demonstrated preferences, progression, personality-related signals, and meaningful domain events. Game Core may use selected memory to evaluate later interactions or construct controlled AI context.

**Category:** Structured domain information derived from accepted decisions and potentially persisted as authoritative game-related state. It is not an unrestricted conversation transcript and is not inferred solely from what an AI model remembers.

### Domain event

**Represents:** A structured statement that a meaningful domain fact or accepted outcome occurred.

**Relationships:** A domain event is produced by an accepted Game Core transition and may contribute to structured memory, progression, personality behavior, or persistence. Examples include a completed adventure, discovery, or accepted gameplay outcome when those concepts are implemented.

**Category:** Derived from an authoritative decision and potentially persisted. It does not replace Game Core state or become an independent source of rules, and it does not imply a general event infrastructure.

### AI proposal

**Represents:** A bounded suggestion for dialogue, narrative variation, adventure or quest variation, mini-game content, or another capability explicitly supported by Game Core.

**Relationships:** Game Core provides controlled context through the AI boundary; the AI returns a proposal; Game Core validates it against current state, rules, safety, progression, and supported capabilities. The proposal may be accepted, rejected, or replaced by a safe bounded result.

**Category:** AI-generated proposal and untrusted input. It is never authoritative merely because it is structured, plausible, or displayed by a client.

### Accepted game outcome

**Represents:** The authoritative result that Game Core determines after evaluating player intent, current state, applicable rules, and any AI proposal.

**Relationships:** An accepted outcome may produce a state transition, discovery, learning or narrative result, progression, personality change, reward, inventory change, and domain events when those effects are supported. Persistence stores the accepted result for later use, and the client presents it.

**Category:** Authoritative Game Core decision and result. A persisted representation may be stored, while the client-facing representation is derived for presentation.

## Conceptual gameplay relationships

The core loop connects the concepts as follows:

```text
Curiosity
    → player intent and interaction/question
    → pet or narrative response
    → adventure or mini-game
    → discovery / learning or discovery outcome
    → accepted progression, reward, or pet evolution
    → new curiosity
```

The loop is a conceptual relationship, not a requirement that every interaction contain every step. A supported interaction may end with a bounded response, while another may lead into an adventure or mini-game. In every case:

1. The player supplies intent through a client.
2. Game Core interprets the intent within the current game state.
3. AI may enrich the response or propose bounded variation when explicitly supported.
4. Game Core validates the proposal and decides the accepted outcome.
5. Accepted state changes and domain events become the basis for future interactions.
6. Persistence stores accepted state, and the client presents the result.

Pet evolution refers only to Game Core-approved changes in pet state, personality, history, progression, or supported behavior. It does not mean that a model independently changes the pet or that a client infers a durable change from displayed text.

## State, persistence, and presentation

The model separates the domain from its storage and display:

- **Authoritative state:** Game Core's valid representation of the player, pet, personality, progression, adventures, discoveries, rewards, optional inventory, and structured memory when implemented.
- **Derived information:** Views, narrative context, presentation content, and other values calculated from authoritative state for a specific interaction or client.
- **Persisted information:** A stored representation of accepted authoritative state and meaningful domain history. PostgreSQL with Neon records it but does not define the rules.
- **Presentation-only information:** UI state, animation state, device concerns, temporary input state, and rendered dialogue or visuals. It may communicate an outcome but cannot create one.

Raw conversation history may support a specific interaction, but it is not the authoritative memory of the game. AI-generated content may be displayed as narrative, but it is not authoritative until Game Core accepts any gameplay-affecting meaning behind it.

## Open implementation details

This domain model intentionally leaves open the exact personality traits and algorithms, quest and adventure structures, mini-games, progression mechanics, reward and inventory mechanics, learning content, persistence representation, and presentation flows. Those details must be defined by future game-design or implementation work without changing the authority relationships established here.
