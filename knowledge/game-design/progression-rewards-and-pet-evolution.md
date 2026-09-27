# Progression, Rewards, and Pet Evolution

This document defines the conceptual relationship between progression, rewards, and Pet evolution in the AI Pet Game. These are related but distinct game-domain concepts. Their exact mechanics remain intentionally open, while their authority, safety, and consistency boundaries are established here.

## Progression

Progression is the authoritative representation of meaningful advancement within the game. It describes how accepted play changes what the player and Pet can experience or do within the bounded game world.

Progression may conceptually represent:

- Access to new supported experiences.
- Advancement through Adventures or Quests.
- Discovery of new game-world content.
- Development of the Pet.
- Increasing game capabilities within predefined boundaries.
- Movement toward Pet evolution.
- Other explicitly defined game-domain advancement.

Progression is not simply a number shown to the player. It is not automatically equivalent to a reward, and it must not be inferred from a narrative statement or a client-side presentation. Game Core owns progression rules and determines when accepted gameplay produces progression.

Progression may be represented in authoritative state, persisted for continuity, and used to evaluate future valid experiences. Persistence records the accepted result but does not determine what progression means or when it occurs.

## Rewards

A reward is an accepted consequence granted by Game Core for a valid gameplay outcome. Rewards make accepted play meaningful within the game world, but they are only one possible consequence of progression or discovery.

Conceptual reward categories may include:

- Unlocking supported content.
- Items or collectibles.
- Cosmetic changes.
- Access to new bounded experiences.
- Pet-related changes.
- Other bounded game-world benefits.

These categories do not define a reward catalog. The game may later decide that some accepted outcomes produce no reward, a non-item consequence, progression without a reward, or a reward without Pet evolution.

The concepts remain distinct:

- **Progression:** Authoritative advancement or change in the available game experience.
- **Reward:** An accepted consequence granted for valid play.
- **State change:** Any authoritative transition recognized by Game Core, which may include progression, rewards, Pet evolution, memory, or other domain effects.
- **Reward presentation:** The client-facing representation of an accepted reward, such as narrative, visual feedback, or other presentation data.

A reward exists in the game domain only when Game Core grants it. AI may describe or propose a reward within a bounded capability, but an AI promise, client animation, or narrative claim is not a reward and cannot authorize one.

## Pet evolution

Pet evolution is a meaningful change in the Pet's authoritative game state or available game experience resulting from accepted progression. It represents the Pet changing as part of the player's journey through the game world, rather than being merely a cosmetic animation or an AI-generated story beat.

Evolution may conceptually affect:

- Appearance.
- Available interactions.
- Narrative possibilities.
- Supported activities.
- Pet capabilities within the game.
- Personality expression.
- Access to new bounded experiences.

The exact evolution stages, appearance, capabilities, and triggers are not defined here. Evolution is a Game Core outcome. AI may narratively describe an accepted evolution or propose bounded content around it, but it cannot independently trigger, grant, or declare evolution.

An evolution shown by the client is only presentation until the corresponding Game Core state transition is accepted and persisted according to the applicable consistency requirements.

## Relationship between the concepts

The conceptual relationship is:

```text
Player intent
        ↓
Accepted gameplay outcome
        ↓
Progression and/or reward
        ↓
Possible Pet evolution
        ↓
New bounded game possibilities
        ↓
New curiosity
```

This is a relationship, not a fixed formula. Progression does not always require a reward. A reward does not necessarily imply Pet evolution. Pet evolution may require progression criteria, and one accepted gameplay outcome may affect progression, rewards, evolution, personality, memory, and events together when future rules support those effects.

The exact relationships remain game-design decisions. They must be explicit and understandable rather than emerging from model behavior or accidental coupling between systems.

## Authority and validation

The established authority hierarchy is:

```text
Game Core decides
        ↓
Persistence records
        ↓
Clients present
        ↓
AI proposes or narrates
```

Game Core validates:

- Whether the player action was valid in the current state.
- Whether the accepted outcome qualifies for progression.
- Whether a reward is warranted.
- Whether an evolution condition has been satisfied.
- Which authoritative state changes occur.

AI output is always untrusted. It must not directly grant rewards, progression, unlocks, evolution, inventory, achievements, capabilities, or any other authoritative consequence. If AI proposes a gameplay variation, the proposal must pass the established structural, semantic, safety, and Game Core validation layers before it can contribute to an accepted decision.

The client collects intent and presents results. It cannot determine that a player earned a reward, advanced, unlocked content, or evolved the Pet. Persistence stores accepted state; it does not define rules or validate an outcome on behalf of Game Core.

## Relationship with domain events

Progression, rewards, and evolution participate in the existing state-flow model:

```text
Accepted gameplay outcome
        ↓
Authoritative state transition
        ↓
Progression, reward, and/or evolution changes
        ↓
Meaningful domain event(s), when applicable
        ↓
Persistence
        ↓
Client-safe result
```

A domain event describes an accepted fact that Game Core has already determined occurred. It does not authorize progression, grant a reward, or trigger evolution after the fact. No exact event names are defined here.

Rejected actions, invalid AI proposals, and failed operations must not produce authoritative events claiming successful progression, rewards, or evolution. Events and state changes must remain coherent; the system must not present a durable outcome that the authoritative state does not support.

## Relationship with personality

Progression and Pet evolution may influence personality expression and future bounded experiences. For example, accepted development may change how the Pet responds or which supported experiences can be presented. Personality may also help shape the presentation of an already-valid outcome.

Personality must not arbitrarily grant progression, rewards, unlocks, or evolution. It may influence how a valid possibility is expressed or selected within predefined capabilities, but Game Core remains authoritative over eligibility, state transitions, and outcomes.

This relationship must remain one-directional where necessary to avoid uncontrolled feedback:

```text
Accepted gameplay
        ↓
Game Core progression/evolution decision
        ↓
Supported personality or presentation effect
        ↓
Future bounded experiences
```

Any future rule connecting personality back to progression must be explicit, bounded, testable, and reviewed for unintended incentives. AI must not create a circular dependency by inferring progression from its own personality expression.

## Relationship with structured game memory

Meaningful progression, reward, and evolution outcomes may become structured Game Memory when Game Core determines that the information is relevant to future continuity or gameplay. Memory may preserve accepted discoveries, completed experiences, meaningful Pet development, or other bounded facts.

Memory records meaningful gameplay facts; it does not independently grant progression, rewards, or evolution. An AI-generated statement that a reward was earned or the Pet evolved is not a memory entry unless Game Core has accepted the underlying outcome and determined that it should be remembered.

The relationship is therefore:

```text
Accepted Game Core outcome
        ↓
Authoritative state and optional domain event
        ↓
Relevant structured memory, when supported
        ↓
Future bounded context
```

Memory remains context for later decisions, not an alternate rules engine or source of authority.

## Player agency and child safety

Progression and rewards should reinforce player agency and meaningful play rather than manipulate engagement. The system must avoid:

- Coercive engagement.
- Fear of losing the Pet.
- Guilt-based rewards.
- Emotional pressure.
- Artificial urgency aimed at children.
- Punishment based on attachment to the Pet.
- Mechanics implying that the child must continue playing to care for the Pet.
- Framing rewards as emotional approval from the Pet.
- Making the child responsible for maintaining the Pet's emotional wellbeing.

The Pet may celebrate accomplishments, but celebration must not make the child feel responsible for the Pet's happiness or imply that continued play is a duty.

Progression and rewards must not use emotional vulnerability, loneliness, fear, social pressure, secrecy, guilt, or personal insecurities to drive play or reward-seeking behavior. The system should be understandable enough for the intended age range without exploiting psychological vulnerabilities. Exact age-specific mechanics remain open and require later design review.

## Healthy progression

Healthy progression should support:

- Curiosity.
- Exploration.
- Experimentation.
- Creativity.
- Discovery.
- Mastery.
- Persistence.
- Variety of play.

Progression should make accepted play meaningful and reveal new possibilities in the bounded game world. It should not be designed primarily to maximize session length, repeated engagement, or compulsive retention. The product goal is meaningful gameplay, not pressure to continue playing.

## Failure and AI unavailability

The game must remain valid when AI is unavailable or fails. In particular:

- If AI is unavailable, Game Core must preserve valid authoritative progression state and use a supported fallback or no narrative.
- If AI produces invalid output, the proposal must be rejected without progression, reward, or evolution changes.
- If AI proposes an impossible reward, Game Core must ignore or reject the proposal rather than inventing a new reward rule.
- If AI proposes an invalid evolution, no evolution may be applied from that proposal.
- If narrative generation fails, the accepted gameplay result may use predefined or deterministic presentation where supported.
- If personality context is unavailable, progression and evolution rules must continue to operate without relying on an invented personality interpretation.

AI enriches presentation and bounded variation; it is not a prerequisite for valid authoritative advancement.

## Reversibility and permanence

Future design may distinguish between progression, rewards, or evolution that are:

- Temporary or session-scoped.
- Persistent across sessions.
- Reversible through later accepted play.
- Irreversible within the intended game experience.

These properties must be explicit for each future mechanic. Irreversible changes require deliberate game-design and child-safety justification. They must not result from arbitrary AI behavior, a client-side claim, or an isolated player action unless the applicable Game Core rules explicitly support that result.

Where reversibility is uncertain, the system should preserve player agency and avoid turning temporary behavior into a permanent judgment or loss. Persistence must reflect accepted domain decisions rather than accidental presentation state.

## Avoiding runaway complexity

Progression, rewards, and evolution should remain understandable and bounded. This conceptual model does not assume a need for:

- Complex economies.
- Multiple currencies.
- Skill trees.
- Loot systems.
- Battle passes.
- Randomized reward mechanics.
- Gambling-like mechanics.
- Complex achievement systems.

These concepts are outside the current scope unless a future requirement explicitly justifies them. They must not be introduced merely to make progression appear deeper or to imitate unrelated game systems.

## Pet evolution as product differentiation

Pet evolution is more than a cosmetic feature. The Pet should feel as though it changes as a consequence of the player's meaningful journey through the game world.

Evolution may connect progression, discoveries, personality, Adventures, Quests, Mini-games, structured memory, and access to new bounded experiences. This connection gives accepted play continuity and helps the Pet feel like a character within the game rather than a static avatar around a chatbot.

The connection must remain a game-domain relationship governed by explicit rules. An AI-generated story about the Pet changing is not an evolution event, and a client animation is not an authoritative state transition.

## Persistence and consistency

Progression, rewards, and evolution are authoritative game state or authoritative consequences of state transitions. If persistence fails:

- The system must not claim durable success before required state is safely stored.
- The client must not assume that a displayed reward or evolution is permanent merely because it was shown.
- Retries must not duplicate rewards or progression.
- Duplicate event processing must not create duplicate authoritative outcomes.
- A failed or rejected operation must not partially apply progression, rewards, evolution, memory, personality, or related events.

The exact persistence mechanism and coordination strategy are implementation concerns. The conceptual requirement is that accepted state and meaningful events remain consistent, and that client presentation cannot outrun authoritative validity.

## Determinism and testing

Progression, reward eligibility, and evolution decisions should be deterministic and testable wherever practical. A valid domain input and current authoritative state should produce a reproducible Game Core decision independent of the AI provider, model, client framework, or persistence technology.

This supports:

- Deterministic Game Core rules.
- Testable progression decisions.
- Predictable reward eligibility.
- Reproducible evolution outcomes.
- Safe AI fallbacks.
- Provider independence.
- Client independence.

AI may affect presentation and bounded content variation, but it must not calculate authoritative progression, reward eligibility, or evolution conditions. Tests must be able to verify these decisions without relying on a live model or a particular client implementation.

## Future design decisions

The following decisions are intentionally deferred:

- The progression model.
- Whether XP, levels, or neither are used.
- Currencies and any economy design.
- Reward categories and frequency.
- Unlock rules.
- Evolution stages.
- Evolution triggers.
- Evolution appearance and capabilities.
- The relationship between progression and personality.
- Exact formulas and thresholds.
- Exact adaptations for different child age ranges.

These decisions should be made only after this conceptual model and the existing authority and safety boundaries are understood. Each decision must preserve Game Core authority, player agency, bounded AI, and framework independence.

## Non-goals

This document does not define:

- Exact progression mechanics.
- Exact rewards or reward probabilities.
- Currencies, XP, or levels.
- Skill trees or loot systems.
- Randomized reward systems.
- Monetization or battle passes.
- Gambling-like mechanics.
- Exact Pet evolution stages or triggers.
- Exact Pet personality traits.
- Numerical formulas or thresholds.
- Database schemas.
- TypeScript interfaces or classes.
- API endpoints.
- AI prompts or provider/model configuration.

## Architectural principles

1. **Game Core owns progression.**
2. **Game Core grants rewards.**
3. **Game Core decides Pet evolution.**
4. **AI proposes or narrates; it does not grant authoritative outcomes.**
5. **Progression, rewards, and evolution are authoritative game state or accepted domain consequences.**
6. **Domain events describe accepted outcomes rather than authorizing them.**
7. **Personality may influence expression and supported experiences but does not override progression rules.**
8. **Structured memory records meaningful outcomes but does not grant them.**
9. **Progression should reinforce curiosity, discovery, creativity, persistence, and mastery.**
10. **Progression and rewards must never depend on emotional manipulation or psychological vulnerability.**
11. **Irreversible progression requires explicit game-design and safety justification.**
12. **The game remains valid without AI.**
13. **Exact progression, reward, and evolution mechanics are intentionally deferred.**
