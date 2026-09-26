# ADR-002: AI is a bounded narrative and creative engine

## Context

The AI Pet Game uses AI to make interactions, adventures, and gameplay feel dynamic and personalized. The AI is not intended to be an open-ended chatbot and must operate within the game's defined world, narrative, mechanics, safety boundaries, and available game context.

## Decision

The AI is a bounded narrative and creative engine.

The AI may:

- Generate or select dialogue within the game's narrative context.
- Generate narrative variations.
- Propose adventure or quest variants from allowed game concepts.
- Propose mini-game or gameplay variations within predefined game types.
- Adapt narrative and content based on structured gameplay history and personality.
- Produce other creative content explicitly permitted by the Game Core.

The AI must not:

- Act as an unrestricted general-purpose chatbot.
- Define or modify game rules.
- Directly modify game state.
- Directly grant rewards or progression.
- Introduce mechanics that are not defined by the Game Core.
- Treat its own generated content as authoritative factual knowledge.
- Access unrestricted external information as part of the game's normal operation.
- Request, store, or expose sensitive personal information from the child.

All AI output that can affect gameplay must be represented as a structured proposal and validated by the Game Core before being applied.

## Consequences

- AI behavior remains bounded by the game design.
- The game can provide dynamic content without making the AI responsible for game correctness.
- AI providers and models can be replaced without changing the game's fundamental rules.
- AI failures or hallucinations are constrained by the Game Core validation boundary.
- The system remains suitable for a child-oriented game rather than becoming an unrestricted conversational AI product.
