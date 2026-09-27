# Product Differentiation

This document defines what the AI Pet Game is building and protects that product identity from drifting toward a generic AI chatbot with a pet avatar. The product is differentiated by the relationship between a bounded game world, a persistent pet, structured gameplay memory, evolving personality, and AI-generated narrative and variation.

## The product we are building

The AI Pet Game is a **bounded AI-driven virtual-pet adventure game** for children. The pet is a player-facing character and guide within a defined game world. It helps turn curiosity into interaction, interaction into play, and play into discovery and evolution.

The product is not primarily a place to ask an AI questions. It is a game in which AI makes the pet, narrative, and supported gameplay feel varied and responsive while Game Core provides the persistent structure, rules, continuity, and outcomes.

The core loop is:

```text
Curiosity
    → interaction or question
    → pet or narrative response
    → Adventure or Quest
    → Mini-game, discovery, or other supported activity
    → accepted outcome
    → progression and personality evolution
    → new curiosity
```

The MVP should demonstrate a coherent slice of this loop rather than maximize conversation breadth or feature count.

## What the product is not

The game is explicitly not:

- An unrestricted AI chatbot.
- A general-purpose question-and-answer service with a pet skin.
- An open-ended AI companion whose value depends on continuous conversation.
- A system in which the model invents rules, mechanics, rewards, progression, or facts that become authoritative.
- A product whose long-term memory is an unrestricted transcript of the child's conversations.
- A presentation layer that simulates personality without persistent Game Core state.
- A client-side game in which screens or local results decide authoritative completion and rewards.
- A system that uses emotional dependency, secrecy, manipulation, or pressure as engagement mechanics.

The pet may speak conversationally, but conversation serves the bounded game world. It must not become the product's substitute for Adventures, Quests, Mini-games, Discovery, Progression, Personality, or structured Game Memory.

## Two different roles for AI

### AI as conversation or companion

In a conversation or companion experience, the primary value is the model's ability to respond to open-ended input. Continuity is often treated as conversational recall, and the model may become the apparent authority over what happens next.

That is not the product direction here. Open-ended conversation is not the core progression loop, raw dialogue is not authoritative memory, and the pet must not become an unrestricted companion.

### AI as narrative and gameplay engine

In this game, AI is a bounded narrative and creative engine. A named capability receives controlled context and returns an untrusted proposal or creative result within an allowed scope. Game Core validates any gameplay-affecting proposal and determines the actual outcome.

AI may:

- Make pet dialogue and narrative feel varied.
- Adapt expression to selected personality and structured game memory.
- Propose bounded variations of supported Adventures, Quests, or Mini-games.
- Help connect curiosity, discovery, and incidental learning through narrative.

AI may not:

- Define the game world or its rules.
- Directly mutate authoritative state.
- Grant rewards or progression.
- Invent arbitrary mechanics or objectives.
- Decide that an Adventure, Quest, or Mini-game is complete.

The difference is fundamental: **companion AI treats conversation as the product; game AI enriches a product whose authoritative structure already exists.**

## Why the game concepts are core

Adventures, Quests, Mini-games, Discovery, Progression, Personality, and structured Game Memory are not secondary features surrounding a chatbot. They are the product's persistent structure.

- **Adventures** give interactions a bounded world, context, and meaningful direction.
- **Quests** give the player supported objectives and units of progress.
- **Mini-games** turn narrative opportunities into playable experiences with domain rules and accepted results.
- **Discovery** gives play a meaningful result beyond receiving generated text.
- **Progression** makes accepted play change what the player and pet can experience next.
- **Personality** makes the pet's continuity part of gameplay rather than only a writing style.
- **Structured Game Memory** preserves meaningful history without depending on unrestricted model recall.

Together, these concepts create a game loop in which AI-generated expression is valuable because it is connected to persistent play. Removing them would leave a conversational interface, not this product.

## The pet's role

The pet is both a character and a guide. It gives the player a continuing relationship with the game world, helps frame curiosity, and provides a recognizable perspective on Adventures, Quests, Mini-games, and discoveries.

The pet feels responsive through the combination of:

1. **AI expression:** Bounded dialogue and narrative variation make responses feel lively.
2. **Game Core continuity:** Authoritative state ensures that accepted experiences, progression, and outcomes persist.
3. **Structured memory:** Meaningful discoveries and gameplay history give later interactions context.
4. **Personality state:** Accepted gameplay can influence how the pet reacts and presents future experiences.
5. **Gameplay consequences:** Interactions lead to Adventures, Mini-games, discoveries, and evolution rather than ending at text generation.

No single model response needs to create the impression of intelligence. The impression should emerge from the coordinated behavior of AI, Game Core, memory, personality, and play.

## Bounded AI is intentional product design

Bounded AI is not merely a technical safety constraint or a temporary limitation of the MVP. It is what gives the product a coherent identity.

A bounded game world makes the pet's responses meaningful because they relate to shared places, activities, history, and consequences. It makes curiosity actionable without promising arbitrary answers. It lets the player understand that the pet is part of a game with discoverable possibilities rather than an unpredictable service with no stable rules.

Boundaries also preserve child-appropriate behavior, deterministic progression, testable gameplay, replaceable providers, and meaningful fallback behavior. Expanding conversation at the cost of game structure would weaken the product rather than improve it.

## Guardrails for future feature decisions

Future product and architecture decisions should ask:

- Does this strengthen the curiosity-to-play-to-discovery loop?
- Does it give the pet a meaningful role as a guide or character in the game world?
- Does it use AI to enrich an existing capability rather than create unrestricted chat?
- Is there a clear Game Core concept, rule, and accepted outcome behind the feature?
- Can the feature remain valid when AI is unavailable or rejected?
- Does it use structured memory and personality as bounded game state rather than raw transcript recall?
- Do clients present and collect input without becoming authoritative?
- Does persistence record accepted state without becoming the source of game rules?
- Can the feature be explained without relying on a particular model, provider, or presentation technology?

If the primary answer is “the AI talks more,” the feature is likely moving away from the product direction unless it also strengthens the game loop.

## Examples of unacceptable drift

The following would represent product or architectural drift:

- Making an open-ended chat screen the primary or complete gameplay experience.
- Allowing the model to invent new mechanics, Quest objectives, rewards, progression, or Mini-games at runtime.
- Treating the entire conversation transcript as the pet's memory or personality model.
- Allowing AI-generated claims to create discoveries, personality changes, or completed Adventures without Game Core acceptance.
- Letting the client decide that a Mini-game, Quest, or Adventure is complete.
- Replacing structured pet personality state with a system prompt that changes from conversation to conversation.
- Adding unrestricted external information access so the pet can answer arbitrary questions outside the game world.
- Designing engagement around secrecy, emotional dependency, manipulation, or pressure.
- Removing Adventures, Quests, Mini-games, or discovery outcomes while retaining only a talking pet.

These examples are guardrails, not a complete list. Any change that makes the model, raw conversation, or client the primary source of continuity or gameplay authority requires deliberate review against the established architecture and product vision.

## Product invariants

Future agents should preserve these invariants:

1. **This is a game first and an AI experience second.**
2. **The pet exists inside a bounded game world, not an unrestricted companion relationship.**
3. **The core loop connects curiosity and interaction to play, discovery, and evolution.**
4. **Adventures, Quests, Mini-games, Discovery, Progression, Personality, and structured Game Memory are core product concepts.**
5. **Game Core is the authority over rules, state, transitions, rewards, progression, personality, and accepted outcomes.**
6. **AI proposes bounded narrative or gameplay variation; Game Core decides.**
7. **AI-generated content is never authoritative merely because it is plausible or displayed.**
8. **Clients present and collect input; they do not grant completion, rewards, or progression.**
9. **Structured memory records meaningful gameplay facts, not unrestricted conversational history.**
10. **The experience remains coherent, safe, deterministic where practical, and valid when AI is unavailable.**
11. **Provider, model, SDK, client, and infrastructure choices remain replaceable around the domain boundaries.**

The defining product promise is therefore not that the pet can say anything. It is that the pet can make a bounded game world feel responsive, continuous, curious, and alive through meaningful play.
