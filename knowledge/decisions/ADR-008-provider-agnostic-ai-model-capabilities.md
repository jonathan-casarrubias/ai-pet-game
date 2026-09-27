# ADR-008: Provider-Agnostic AI Model Capabilities

## Status

Approved

## Context

The AI Pet Game uses AI as a bounded narrative and creative engine. The current development baseline uses Ollama with Qwen3 for local development. However, the architecture must remain flexible enough to swap providers and models without restructuring the Game Core domain.

A critical insight is that AI models should not be thought of primarily as "LLMs" or "chat models." Models may provide a variety of capabilities—text generation, binary/categorical decisions, classification, embeddings, or other specialized functions. The architecture must reflect this diversity from the start rather than assuming every AI integration is a conversational text-generation interface.

The system must also accommodate future non-LLM models, such as specialized decision engines, without forcing them into an LLM-shaped abstraction.

## Decision

The architecture is **capability-oriented, not model-oriented.**

### ModelProvider — conceptual base abstraction

`ModelProvider` is the conceptual base abstraction for AI/model integrations. It represents the provider/model boundary without assuming any specific model behavior. Specifically, it does not presuppose:

- chat
- conversations
- prompts
- text generation
- streaming
- embeddings
- or any other specific model behavior

This ADR records the architectural decision at the conceptual level; a concrete TypeScript interface is deferred to implementation time.

### Capability-specific abstractions

Capabilities are represented by specialized contracts when a real use case demands them. Examples include:

- `GenerationProvider` — for content and gameplay generation (immediate scope)
- `DecisionProvider` — for categorical/binary decisions (future, if needed)
- `EmbeddingProvider` — for vector embeddings (future, if needed)

Only `GenerationProvider` is in immediate scope. Future capability interfaces must not be added in anticipation; they should be introduced only when a concrete requirement arises.

### GenerationProvider — first concrete capability

The first capability the project needs is gameplay and content generation. `GenerationProvider` is provider-independent. The Game Core depends only on this generation abstraction, not on Ollama, Qwen3, or any specific model or vendor.

### Ollama and Qwen3 — first implementation

Ollama + Qwen3 is the first concrete implementation of the `GenerationProvider` capability. They are an **adapter/infrastructure concern**, not a domain dependency.

Replacing Qwen3 with another model, or Ollama with another provider or runtime, must not require changes to the Game Core domain logic.

### Support for non-LLM models

The architecture intentionally supports models that are not conversational LLMs. For example, a specialized decision model (such as JEV from TypeSafe) might answer yes/no or categorical questions rather than generating narrative text. Such a model could implement a future `DecisionProvider` capability without pretending to be an LLM or conforming to a chat-oriented interface.

Non-LLM models are an architectural possibility, not an implemented dependency at this time.

### Authority boundary

AI/model providers never become authoritative over the Game Core. The model may:

- generate
- predict
- classify
- recommend
- propose

But the Game Core remains responsible for:

- authoritative `GameState`
- gameplay rules
- capability validation
- safety and control constraints
- acceptance or rejection of proposals
- correction and fallback
- authoritative state mutation

The architecture preserves the principle established in ADR-001:

**AI proposes; Game Core decides.**

### Provider replacement

Changing:

- Qwen3 → another model
- Ollama → another runtime or provider
- one `GenerationProvider` implementation → another

must not require changes to Game Core.

Similarly, adding a future capability such as `DecisionProvider` must not couple Game Core to a specific model vendor.

## Consequences

Positive consequences include:

- AI providers and models can be swapped without touching Game Core domain logic.
- Non-LLM models (decision engines, classifiers, embedding models) can be integrated through their own capability interfaces.
- The architecture is ready for future capability types without retroactive redesign.
- The boundary between infrastructure (providers) and domain (Game Core) is explicit and enforceable.

Trade-offs include:

- Additional abstraction layers are required before any concrete provider is wired in.
- The team must resist the temptation to optimize the abstraction around the current provider (Ollama/Qwen3) rather than keeping it truly generic.
- Introducing new capability interfaces (e.g., `DecisionProvider`) adds interface overhead and should be justified by a concrete requirement.

## Relationship to existing ADRs

- **ADR-001:** Reinforces that Game Core is authoritative; this ADR clarifies that provider neutrality is part of that authority boundary.
- **ADR-002:** Clarifies that the "bounded AI" principle applies equally to non-generative capabilities (classification, decision-making) and to generative ones.
- **ADR-003:** Extends the framework-independence principle from UI frameworks to AI providers and models.
- **ADR-006:** The controlled proposal contract operates above any specific provider; this ADR ensures the contract itself does not leak provider-specific assumptions.
- **ADR-007:** Bounded generation relies on a `GenerationProvider` abstraction; this ADR defines the contractual boundary that abstraction must sit within.

## What this ADR does not decide

This ADR explicitly does **not** define:

- The concrete `GenerationProvider` TypeScript interface
- Ollama API details
- Qwen3 configuration
- Prompt format
- Structured-output format
- Streaming behavior
- Retries or provider failover
- Embeddings integration
- Decision-model implementation
- JEV or any other specific model integration
- LangChain usage
- Vercel AI SDK usage
- HTTP or API architecture
- Persistence mechanisms

These are implementation decisions deferred to future slices when concrete requirements exist.

## Non-goals

- Do not implement `DecisionProvider`, `EmbeddingProvider`, or any future capability interface now.
- Do not add provider-failover, retry, or streaming logic in this slice.
- Do not bake Ollama or Qwen3 specifics into the Game Core domain.
