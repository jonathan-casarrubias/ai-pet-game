# Game Memory and Personality

This document defines the conceptual relationship between structured game memory and the pet's personality. It establishes how meaningful gameplay can persist and influence future experiences without turning the game into an unrestricted conversational memory system.

## Core principles

- **Game Core is authoritative.** It decides which gameplay facts are meaningful, which memory or personality changes are valid, and how they affect future state.
- **Memory is structured gameplay information.** It represents selected facts from accepted play, not an unrestricted transcript of everything said or generated.
- **Personality is game state.** It is a domain concept that may evolve through valid gameplay behavior and rules, not merely a model prompt or presentation style.
- **AI proposes; Game Core decides.** AI may use selected memory and personality information as controlled context and may propose narrative variation, but it cannot create authoritative memory or directly modify personality.
- **Persistence records accepted state.** PostgreSQL with Neon may store memory and personality state, but persistence does not define their meaning or rules.
- **Memory remains bounded and safe.** Stored information must be relevant to gameplay, proportionate to the capability using it, and appropriate for a child-oriented product.

## What structured game memory means

Structured game memory is a bounded record of meaningful facts, outcomes, and signals from gameplay that Game Core recognizes as useful for continuity or future decisions. It supports the pet's history, progression, personality-related behavior, narrative adaptation, and controlled AI context.

Conceptual memory may include:

- Discoveries established through accepted play.
- Completed adventures or quests.
- Meaningful domain events and accepted outcomes.
- Preferences demonstrated through gameplay rather than merely stated once.
- Progression and personality-related gameplay signals.
- Other explicitly defined game-domain facts that support the bounded experience.

Memory is not a general record of the player's life, a profile assembled from unrestricted conversation, or a substitute for current authoritative game state. The exact categories and representation remain open to future game-design decisions.

## Memory is not raw conversation history

Raw conversation and AI-generated dialogue may be relevant to one interaction, but they are not the authoritative memory of the game. Treating all conversation as memory would make the game dependent on unbounded history, model recall, and potentially sensitive information that was never intended to affect gameplay.

A statement, question, or generated line becomes game memory only when Game Core determines that it represents a meaningful, permitted, and safe domain fact. The fact may be derived from an accepted interaction or outcome; the original wording is not automatically retained as authoritative state.

This distinction preserves:

- Deterministic game rules and repeatable behavior.
- Bounded context for AI capabilities.
- Clear privacy and child-safety boundaries.
- Provider and model independence.
- The ability to change narrative presentation without rewriting game history.

The storage or processing mechanism for raw conversation is outside this document and must not be treated as the game's memory model.

## Authority relationships

The relevant information categories are:

- **Authoritative game state:** Current pet identity, personality, progression, adventure or quest state, accepted discoveries, rewards, and other concepts recognized by Game Core.
- **Structured memory:** Meaningful gameplay facts derived from accepted Game Core decisions. When recognized as part of the domain, these facts may be authoritative state and may be persisted.
- **Derived information:** Capability-specific summaries, selected context, current narrative framing, or other views calculated from authoritative state and memory.
- **Presentation data:** Dialogue, visuals, animations, and other client-facing representations. Presentation communicates an outcome but does not create memory or personality changes.
- **AI-generated content:** Untrusted proposals or narrative content. It is not memory, personality state, or an authoritative event merely because it is plausible or displayed.

The relationship can be summarized as:

```text
Accepted gameplay
        ↓
Game Core decision and state transition
        ↓
Meaningful memory facts, events, or personality changes
        ↓
Persistence of accepted state
        ↓
Selected derived context for future gameplay or AI
        ↓
Presentation and bounded narrative
```

Persistence may be the source from which state is loaded, but Game Core remains the authority over what the loaded information means and how it may change.

## Game Core authority over memory and personality

Game Core owns the rules for:

- Identifying which accepted gameplay outcomes can create memory.
- Validating memory facts and personality-related signals.
- Determining whether a memory fact is relevant to a future domain decision.
- Applying valid personality changes based on gameplay.
- Resolving conflicts between current state and stale or inconsistent information.
- Producing the authoritative outcome and any related domain events.

Memory and personality changes must be consequences of accepted game behavior. A client cannot create a durable memory entry by displaying text, and an AI model cannot create one by mentioning a fact or claiming that the pet has changed.

Game Core may use memory and personality to shape future pet behavior, narrative context, adventure presentation, or supported gameplay variation. They must not become unrestricted rules that bypass the defined game system.

## Personality as structured game state

Pet personality represents gameplay-related characteristics that influence how the pet reacts, expresses itself, and participates in bounded experiences. It gives continuity to the pet and may help the game feel responsive across interactions.

Personality may evolve when Game Core recognizes meaningful gameplay signals, such as accepted discoveries, completed experiences, or demonstrated preferences. The exact traits, scales, thresholds, and evolution algorithms are intentionally undefined.

The conceptual evolution flow is:

```text
Player intent or gameplay input
        ↓
Accepted Game Core outcome
        ↓
Structured event or gameplay signal
        ↓
Game Core evaluates applicable personality rules
        ↓
Authoritative personality state change, if allowed
```

Not every interaction must change personality, and a personality-related signal does not automatically imply a change. Game Core decides whether the event is meaningful and whether the current rules permit an update.

AI may express the current personality in dialogue or narrative and may receive selected personality information as controlled context. It cannot independently infer or apply a personality change, and it cannot replace structured personality state with a prompt or raw conversation history.

## Memory and controlled AI context

Selected memory and personality information may be supplied to an AI capability as controlled context. The selection must be capability-specific and limited to what is relevant to the current interaction.

Context may include, when appropriate:

- The current bounded game situation.
- Relevant pet personality information.
- A small set of relevant discoveries or completed experiences.
- Current progression or adventure context needed for the capability.
- Explicit narrative and safety boundaries.

The AI should receive a purposeful view, not unrestricted access to all memory or the entire game state. The context must not expose information simply because it exists in persistence. Game Core and the application boundary determine what is relevant, safe, and proportionate.

Memory used for AI context does not give AI authority over the underlying facts. AI may use the context to produce a proposal, but it cannot revise the memory, reinterpret progression, grant a reward, or change personality. Any gameplay-affecting proposal remains subject to the AI proposal contract and Game Core validation.

## Boundedness, relevance, and safety

Memory should be bounded by the needs of the game and the capability using it. It should be:

- **Relevant:** Related to current gameplay, the pet, supported progression, or a specific bounded narrative purpose.
- **Minimal:** Limited to information needed for the current domain decision or creative capability.
- **Structured:** Represented as meaningful game facts rather than unrestricted text history.
- **Safe:** Appropriate for children and free of unnecessary sensitive information.
- **Reviewable:** Understandable as a domain fact, signal, event, or state value rather than an opaque model inference.
- **Non-authoritative when unvalidated:** A suggestion, inference, or generated claim remains untrusted until Game Core accepts it.

Information must not become game memory merely because it is available. Memory must not be used to create emotional dependency, encourage secrecy, manipulate the player, or expand the pet beyond the bounded game world.

Memory must not include, as a normal gameplay practice:

- Unnecessary personal or sensitive information about a child or player.
- Secrets, credentials, infrastructure information, or provider details.
- Unrestricted raw conversation history.
- Unvalidated claims generated by AI.
- Sensitive profiles inferred without an explicit and justified game-domain need.
- External facts or content gathered through unrestricted browsing during normal gameplay.

The exact privacy and retention rules remain open, but the domain boundary is fixed: game memory exists to support the bounded game, not to build an unrestricted personal profile.

## AI-generated content versus authoritative memory

AI-generated dialogue, narrative, or proposal content is not an authoritative memory event. A model may mention a discovery, describe a personality change, or suggest that something happened, but those statements do not become game facts automatically.

An authoritative memory event must originate from an accepted Game Core decision. The conceptual distinction is:

- **AI content:** A creative expression or untrusted proposal for the current capability.
- **Game Core event:** A structured fact that Game Core determined actually occurred.
- **Memory state:** The accepted, bounded representation of a fact that should influence future domain behavior.

Only the latter two can affect authoritative game state, and they do so through Game Core rules. The client may present AI content and accepted events together, but presentation must not blur their authority.

## Influencing future gameplay without becoming unrestricted rules

Memory and personality may influence future narrative, pet reactions, adventure presentation, curiosity, or supported gameplay variation. They provide continuity and context; they do not replace explicit game rules.

For example, a remembered discovery may make a later bounded interaction more relevant, or a personality state may influence how an allowed narrative variation is expressed. Neither memory nor personality may authorize an otherwise invalid transition, invent a mechanic, grant an arbitrary reward, or override current Game Core state.

Future behavior must remain understandable as:

```text
Current authoritative state
    + relevant structured memory and personality
    + current player intent
    + validated AI proposal, if any
    → Game Core decision
```

Memory is context for decisions, not an independent rule engine.

## Conceptual memory lifecycle

### Creation

Memory begins with a meaningful accepted domain outcome, event, discovery, or gameplay signal. Player intent, raw conversation, and AI proposals are inputs or suggestions, not memory by themselves.

### Validation

Game Core determines whether the candidate fact is relevant, safe, consistent with current state, and within the defined game domain. It may reject, ignore, or transform a candidate into the accepted domain representation. Unvalidated AI claims must not enter memory.

### Persistence

Accepted memory and personality state may be stored with the rest of the authoritative game state. PostgreSQL with Neon persists the result, but it does not decide what should be remembered, whether a fact is valid, or how it changes personality.

### Retrieval and use

When a later interaction requires continuity, Game Core or the application boundary retrieves the relevant accepted information and selects the portion needed for the domain decision or AI capability. Retrieval does not grant unrestricted access to all stored memory.

### Expiration or obsolescence

Some memory may become irrelevant, be superseded by newer authoritative state, or no longer be appropriate for a capability. The system must support the conceptual possibility that memory is not permanent or universally applicable.

Exact retention periods, expiration rules, supersession behavior, and cleanup mechanisms are open decisions. Until defined, stale information must not override current authoritative state or be treated as current merely because it was once valid.

## Missing, stale, inconsistent, or unavailable memory

Memory is a supporting domain input, not a permission to weaken game rules. Safe behavior includes:

- **Missing memory:** Continue with current authoritative state and a deterministic or bounded default where the feature allows it.
- **Stale memory:** Prefer current validated state and ignore or limit the stale information for the current decision.
- **Inconsistent memory:** Do not guess which value is authoritative; preserve state integrity and use the applicable Game Core resolution or safe fallback.
- **Unavailable persistence:** Do not claim that memory-dependent state was loaded or updated successfully. Avoid reporting a durable outcome unless the required state can be safely evaluated and stored.
- **Invalid memory supplied as AI context:** Exclude or reject it before it reaches the capability, and do not allow the AI to repair authoritative state.

The game must remain safe and understandable when memory is incomplete. Missing continuity is preferable to inventing a fact, applying an unvalidated personality change, or exposing incorrect progression.

## Responsibilities by boundary

### Game Core

Game Core defines the meaning of memory and personality, validates candidates, applies authoritative changes, determines relevance, and produces accepted events and outcomes. It ensures that memory and personality remain bounded gameplay concepts and that AI cannot modify them directly.

### AI capability and integration

AI receives only selected controlled context and may use it to produce bounded narrative or gameplay proposals. It must not treat memory as a command source, expose unnecessary information, create authoritative memory events, or independently update personality.

### API and application layer

The API/application layer coordinates loading relevant state, constructing controlled context, invoking the AI integration, and mapping Game Core outcomes to client responses. It transports and orchestrates but does not define memory semantics, personality rules, or alternate state transitions.

### Persistence

Persistence stores and retrieves accepted game state, structured memory, personality state, and meaningful domain history when those concepts are implemented. It must not become the source of truth for memory meaning, personality evolution, or gameplay rules.

### Clients

Clients present the pet, narrative, and accepted outcomes and collect player input. They may show derived memory-informed content, but they must not create authoritative memory, infer durable personality changes, or apply AI-generated claims directly to state.

## Open design decisions

This document intentionally leaves open:

- The exact memory categories and representation.
- The exact personality traits, scales, and evolution algorithm.
- Which gameplay signals create memory or personality changes.
- How conflicting or duplicate memory facts are resolved.
- Which memory is retained, superseded, or expires and when.
- Which capabilities may receive which categories of context.
- The exact relationship between memory, progression, discoveries, and rewards.

These decisions must be made explicitly as the game develops. They must preserve the established boundary: structured memory and personality support a bounded game experience, while Game Core remains authoritative and AI remains a non-authoritative creative layer.
