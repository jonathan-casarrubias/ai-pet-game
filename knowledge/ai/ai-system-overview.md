# AI System Overview

## Purpose and role in the product

The AI Pet Game uses AI as a **bounded narrative and creative engine inside a game**. It enriches a deterministic game system with variation, personality, and child-appropriate storytelling; it does not replace the game system.

AI may:

- Create or select narrative variations.
- Generate bounded pet dialogue.
- Adapt narrative presentation to structured gameplay history and personality.
- Propose variants of predefined adventures, quests, or mini-game experiences when the game allows it.
- Contribute to curiosity, discovery, creativity, and incidental learning.

AI is not:

- The game engine or source of truth.
- An unrestricted chatbot.
- The authority over rules, rewards, progression, or state transitions.
- An unrestricted source of factual knowledge.
- A system that directly modifies authoritative game state.

The distinction is important: **creative generation** supplies possible content, while **authoritative game decisions** remain deterministic responsibilities of Game Core. AI can suggest how an experience may be presented or which bounded variation may fit; Game Core decides whether that suggestion is valid and what actually happens.

## Core interaction model

The conceptual interaction is:

```text
Game Core
    ↓
Controlled context
    ↓
AI narrative capability
    ↓
Structured proposal
    ↓
Schema validation
    ↓
Semantic and safety validation
    ↓
Game Core validation
    ↓
Accepted outcome
    ↓
Authoritative state mutation
```

Each stage has a distinct purpose:

1. **Game Core** identifies the current game situation and the capability that is allowed.
2. **Controlled context** limits the information exposed to the AI to what the current capability needs.
3. **AI narrative capability** generates bounded creative content rather than executing game actions.
4. **Structured proposal** gives the response an explicit meaning instead of treating free-form text as a command.
5. **Schema validation** checks that the response can be parsed and uses only the expected shape and values.
6. **Semantic and safety validation** checks content, limits, child-appropriateness, and capability-specific constraints.
7. **Game Core validation** checks compatibility with current state, rules, transitions, rewards, and progression.
8. **Accepted outcome** is the only proposal result that may influence gameplay.
9. **Authoritative state mutation** is performed only by Game Core after acceptance.

The AI does not communicate directly with arbitrary game components, persistence, or infrastructure. It receives no unrestricted game-state access and has no direct mutation capability.

## Controlled context

Controlled context is the deliberately selected input for one AI capability. The application and Game Core boundary decide what is included before the model is invoked. The model does not discover additional context by querying the game or database.

Depending on the capability, context may include:

- The current narrative situation.
- Selected game-world facts.
- Current pet personality attributes.
- Relevant structured gameplay history.
- Current quest or adventure context.
- Allowed narrative constraints and presentation limits.

Controlled context is intentionally different from:

- Raw database access.
- Unrestricted game state.
- Unrestricted conversation history.
- Secrets, credentials, or infrastructure handles.
- Unnecessary player or child information.

The context should be the smallest sufficient view for the requested capability. This limits exposure, makes behavior easier to reason about, and keeps the AI from relying on hidden or unavailable rules.

## Bounded AI capabilities

A capability is a named, limited use of AI with a defined purpose. It specifies:

- What the AI is allowed to produce.
- What controlled context it receives.
- What structured output it may return.
- What it is explicitly not allowed to do.
- How the result is validated and what remains Game Core's decision.

Conceptual capabilities include:

- **Pet dialogue:** produce bounded, child-appropriate dialogue for the current interaction.
- **Narrative variation:** present an existing game situation with a permitted creative variation.
- **Quest or adventure proposal:** suggest a variant of an already defined quest or adventure type.
- **Mini-game variation:** suggest presentation or content variation within an existing mini-game type.

These capabilities are not generic chat. Each one operates inside an allowed game-world scope and must have a safe behavior when generation is unavailable or rejected. A capability may not invent arbitrary mechanics, rewards, progression, or actions outside the Game Core contract.

## Structured proposals and validation

Gameplay-affecting AI output must be a structured proposal with an explicit proposal type, allowed fields, allowed values, and applicable limits. Structure separates creative content from authoritative decisions: the AI may fill permitted creative fields, but it does not define what those fields mean in game rules.

Structured output is still untrusted. A response can be syntactically valid while being unsuitable for the current game state, unsafe, outside the capability's scope, or inconsistent with progression and reward rules. Validation therefore occurs at multiple conceptual levels:

1. **Parsing and schema validation:** confirm that the response is readable, has the expected proposal type, contains permitted fields, and respects basic value and size limits.
2. **Semantic and safety validation:** confirm that the content is coherent for the capability, child-appropriate, bounded, and free of prohibited instructions or content.
3. **Game Core validation:** confirm that the proposal is allowed by the current state and authoritative rules, including valid transitions, progression, rewards, and gameplay constraints.

Only Game Core can accept the proposal and determine the actual outcome. Free-form text must never be interpreted as an implicit command.

## AI and game memory

The game should maintain **structured game memory**, not treat raw AI conversation history as the authoritative memory of play. Useful structured memory may include:

- Discoveries.
- Completed adventures.
- Preferences inferred from gameplay.
- Progression.
- Personality-related gameplay signals.
- Meaningful game events.

Structured memory is preferable because it supports deterministic rules, explicit progression, repeatable tests, and controlled context construction. It also prevents an accidental dependency on the model remembering a long conversation or on raw dialogue becoming an unbounded profile of the child.

Raw conversation may be an input to a specific interaction when appropriate, but it is not the source of truth for game state, progression, personality, or long-term memory.

## Personality

Pet personality is a game concept, not merely an LLM system prompt. Personality can influence narrative style, reactions, adventure presentation, curiosity, interactions, and permitted gameplay variations.

Game Core owns the authoritative personality state and the rules that govern its evolution. AI may receive selected personality information as controlled context and use it to vary expression, but it must not arbitrarily rewrite personality or infer authoritative changes from its own response. Any personality change must follow a Game Core rule and valid state transition.

This keeps personality meaningful across clients and providers while allowing the AI to make the pet feel more responsive and distinct.

## AI as a non-authoritative creative layer

The game must remain valid when:

- The AI is unavailable.
- The AI returns malformed or unsafe output.
- A proposal is incompatible with the current state.
- The provider changes.
- The model changes.
- Different models produce different creative responses.

This is the difference between **deterministic game behavior** and **probabilistic creative behavior**. Rules, valid transitions, progression, rewards, and state integrity must be deterministic and testable whenever practical. AI can add variation and richness, but fundamental correctness must not depend on model behavior.

The same Game Core should be able to run with an accepted AI proposal, a deterministic fallback, or no AI response at all, while preserving valid game behavior.

## Failure and fallback model

AI failures are normal boundary conditions, not exceptional permissions to bypass game rules. Possible failures include:

- Provider unavailable.
- Timeout.
- Empty, truncated, or malformed response.
- Schema validation failure.
- Semantic validation failure.
- Safety rejection.
- Proposal incompatible with the current state or rules.

Each failure must resolve to a safe, bounded behavior appropriate to the capability. Examples include a deterministic dialogue variation, a predefined narrative path, or a clear non-gameplay response that leaves state unchanged. The exact fallback belongs to the feature design and implementation, not to this overview.

The game must never pretend that a rejected or failed proposal was applied. No authoritative state mutation occurs before acceptance by Game Core, and failure handling must not create partial progression, rewards, or personality changes.

## Provider and model independence

The domain concept of the AI system is independent of Ollama, OpenAI, Gemini/Vertex, Anthropic, DeepSeek, LangChain, Vercel AI SDK, and any other provider, model, or framework. Ollama may be used as a local development baseline, but it is not part of the game domain model and must not become a Game Core dependency.

The controlled proposal contract sits above provider-specific invocation details. Replacing a provider, model, or SDK may change generation behavior or integration code, but it must not change the fundamental game rules, authoritative state model, or validation responsibilities.

## Safety model

Safety is part of the AI boundary for this child-oriented game. The AI must not:

- Request unnecessary personal information.
- Expose secrets or sensitive child information.
- Encourage secrecy from parents or caregivers.
- Create emotional dependency or manipulate the child.
- Provide unrestricted adult content.
- Encourage unsafe behavior.
- Bypass game boundaries.
- Access unrestricted external information during normal gameplay.
- Create arbitrary game mechanics.
- Grant arbitrary rewards or progression.

Safety is enforced through multiple layers: capability boundaries, minimal controlled context, prompt guidance, structured output limits, semantic and safety checks, and Game Core validation. Prompt instructions alone are not a sufficient safety control. Rejected content must result in safe bounded behavior without authoritative state mutation.

## Relationship with other architectural layers

The layers have separate responsibilities:

- **Game Core:** owns authoritative state and rules, validates proposals, and determines the actual gameplay outcome.
- **AI integration:** constructs controlled AI requests, invokes the selected provider or model, handles responses, parses structured output, and produces bounded proposals.
- **API:** transports requests and responses, orchestrates application operations, and handles authentication, authorization, and infrastructure concerns.
- **Persistence:** stores and retrieves authoritative game data; it does not become the source of gameplay rules.
- **Mobile client:** presents the game, sends player actions, and renders accepted outcomes; it does not become authoritative over game state.

The AI integration boundary may depend on application and infrastructure concerns, but Game Core remains independent of UI frameworks, HTTP, persistence technologies, Cloudflare Workers, and AI providers.

## What this document intentionally does not define

This overview does not define:

- Final AI interfaces.
- Final proposal schemas.
- Final prompt templates.
- Provider selection.
- Model selection.
- Token budgets.
- Exact personality traits.
- Exact quest schemas.
- Exact game mechanics.
- Exact persistence schema.
- Final API endpoints.

Those details belong in implementation or design documents, or in future architectural decisions when a concrete requirement justifies them. This document provides the conceptual boundary a coding agent should understand before implementing a feature: AI may create bounded possibilities, while Game Core remains responsible for deciding what the game actually accepts and does.
