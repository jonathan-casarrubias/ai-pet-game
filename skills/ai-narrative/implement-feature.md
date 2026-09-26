# Implementing an AI Narrative Feature

## Purpose

Use this procedure when implementing or modifying AI-powered narrative behavior in the game.

The goal is to add bounded, child-appropriate narrative variation without making the AI the source of truth for game rules, state, progression, rewards, or unrestricted interaction. Narrative behavior must remain provider/model independent and must integrate with Game Core through the controlled proposal contract defined by ADR-006.

## Workflow

```text
Understand narrative requirement
        ↓
Inspect existing narrative and domain contracts
        ↓
Identify minimal controlled context
        ↓
Define or reuse bounded capability
        ↓
Define structured proposal/output contract
        ↓
Build capability-specific prompt/context
        ↓
Parse and validate untrusted AI output
        ↓
Apply Game Core validation and outcomes
        ↓
Handle failure or fallback safely
        ↓
Add focused tests
        ↓
Verify and report
```

### 1. Understand the narrative requirement

Before editing code:

- Describe the intended narrative behavior in game terms, not chatbot terms.
- Identify the narrative capability being requested, such as dialogue, a narrative variation, or a bounded quest/adventure proposal.
- Identify the allowed game-world context, expected outcome, and audience.
- Identify what the AI may propose and what Game Core must decide.
- Identify unavailable, invalid, unsafe, or failed-response behavior.

Do not turn an underspecified narrative request into an open-ended conversation feature. If the requirement would add mechanics, rewards, progression, or a new authoritative rule, resolve that domain requirement with the Game Core design rather than hiding it in a prompt.

### 2. Inspect existing contracts

Review the relevant implementation and documentation before creating new concepts. Look for:

- Existing narrative capability boundaries and narrative types.
- Existing Game Core inputs, outcomes, validators, and proposal contracts.
- Existing structured game state, personality, progression, discoveries, quests, and events.
- Existing safety constraints and fallback behavior.
- Existing AI integration boundaries, adapters, and focused tests.

Prefer reusing an existing capability and contract. Do not create a generic chat abstraction, prompt framework, provider wrapper, or new proposal type unless the current requirement genuinely needs it.

### 3. Identify controlled context

Define the smallest context required for the current capability. Context may include explicitly selected game-world facts, current interaction data, relevant pet personality state, and narrowly scoped gameplay history.

Before sending context to an AI system, confirm that it:

- Is selected by the application/Game Core boundary rather than fetched freely by the model.
- Contains no secrets, credentials, database access, or infrastructure handles.
- Contains no unnecessary child or player information.
- Does not expose unrestricted raw game history or unrestricted conversation history.
- Does not give the model authority to retrieve additional information.
- Is sufficient for the capability without relying on hidden rules or undocumented state.

The model receives controlled context, not direct access to Game Core, persistence, or the database.

### 4. Define or reuse the bounded capability

State the capability explicitly before writing the prompt or integration:

- What kind of narrative output is allowed?
- Which game-world elements may be referenced?
- Which fields may be proposed?
- Which capabilities are deliberately excluded?
- What must remain deterministic in Game Core?
- What is the safe fallback if generation is unavailable?

AI may generate bounded dialogue or narrative variation and may propose variants of predefined quests, adventures, or mini-games. It must not define arbitrary mechanics, grant rewards, change progression, select unrestricted actions, or mutate authoritative state.

### 5. Define the structured proposal contract

Gameplay-affecting output must be structured and explicit. Before implementation, document or reuse:

- An explicit proposal type.
- The allowed fields and their intended meaning.
- Required and optional values.
- Allowed capability values or enumerations.
- Limits such as length, count, range, or content scope.
- The distinction between creative content and authoritative game decisions.

Do not interpret free-form narrative text as a command. Do not rely on the model to infer hidden game rules. Do not put authoritative rules only in a prompt. The exact contract should follow the project's implementation and knowledge documentation without coupling it to a provider or model.

### 6. Build capability-specific prompt and context

Construct prompts for the named capability rather than using a generic “chat with the pet” prompt. Prompts should:

- Define the bounded role and child-appropriate narrative constraints in system/developer instructions.
- State the allowed game-world scope and the exact controlled context.
- Make the expected structured output explicit.
- State prohibited content and unsupported capabilities.
- Instruct the model not to invent rules, rewards, progression, mechanics, secrets, or personal information.
- Avoid implying that the model can perform actions or access data it cannot access.

Prompts are guidance for generation, not the validation layer. The implementation must continue to validate the response structurally, semantically, and through Game Core rules.

### 7. Treat output as untrusted

Every AI response is untrusted, including output that appears well-formed or follows the requested structure. The processing boundary should:

1. Handle unavailable, timed-out, malformed, empty, or truncated responses.
2. Parse the response using the explicit structured contract.
3. Reject unknown proposal types, unsupported fields, and invalid values.
4. Apply semantic and safety checks to the parsed proposal.
5. Pass gameplay-affecting proposals through the appropriate Game Core validation.
6. Apply state changes only after Game Core accepts the proposal.

There must be no partial authoritative state mutation before proposal acceptance. AI proposes; Game Core decides.

### 8. Preserve responsibility boundaries

Keep responsibilities separated:

- **AI integration:** provider invocation, response handling, parsing, and bounded generation.
- **Game Core:** authoritative state, rules, validation, allowed transitions, progression, rewards, and gameplay outcomes.
- **API/backend:** transport, request handling, authentication boundaries, infrastructure, and error mapping.
- **Persistence:** storage and retrieval of authoritative data without replacing Game Core business logic.

Do not import or hardcode a specific provider, model, SDK, or vendor into narrative domain logic. Ollama is a local development baseline, not a domain dependency. Do not introduce LangChain, Vercel AI SDK, LangGraph, Qdrant, Redis, RAG, agents, vector search, or prompt-management infrastructure unless a separate concrete requirement justifies it.

### 9. Handle safety and failure paths

Narrative output must remain appropriate for the intended child audience. Reject or safely replace output that:

- Exposes secrets or sensitive child information.
- Requests unnecessary personal information.
- Encourages secrecy, emotional dependency, manipulation, or unsafe behavior.
- Contains adult, abusive, or otherwise unsafe content.
- Provides unrestricted external knowledge or browsing.
- Instructs the player or system to bypass game boundaries.
- Introduces unsupported mechanics, rewards, progression, or actions.

Define a deterministic fallback or failure result appropriate to the feature for provider errors, timeouts, unavailable services, malformed output, rejected proposals, and safety failures. A narrative feature must degrade safely without corrupting state or pretending that an unaccepted action occurred.

## Testing guidance

Prefer deterministic tests at each boundary. Tests should not require a live external AI service when parsing, validation, safety, fallback, or Game Core behavior can be tested independently.

Cover, as appropriate:

- Controlled context construction and omission of unnecessary data.
- Capability-specific prompt inputs and bounded output expectations.
- Structured output parsing and schema validation.
- Unknown fields, malformed data, missing fields, and unsupported proposal types.
- Proposals incompatible with current Game Core state or rules.
- Reward, progression, transition, and safety violations.
- Provider failure, timeout, unavailable service, empty output, and malformed output.
- Deterministic fallback behavior.
- Rejection of proposals without partial state mutation.
- Acceptance of valid proposals only through the Game Core contract.

Use a fake or deterministic provider boundary when provider integration itself must be tested. Keep provider-specific integration tests separate from pure narrative and Game Core validation tests.

## Verification guidance

After implementation:

1. Run the most focused narrative and proposal-validation tests first.
2. Run relevant Game Core tests for affected rules and state transitions.
3. Run relevant package-level type, lint, or build checks when available.
4. Run broader checks only when they are relevant to the change.
5. Inspect the final diff to confirm that no provider, infrastructure, or application concern leaked into Game Core.
6. Report the exact commands run, their results, and any unverified behavior.

Never claim an AI service, test, build, or fallback was verified unless it was actually executed. If a live provider is unavailable, verify deterministic handling of that failure and state clearly what remains unverified.

## Completion checklist

- [ ] The requirement is expressed as a bounded narrative capability, not open-ended chat.
- [ ] Existing narrative, Game Core, and proposal contracts were inspected and reused where appropriate.
- [ ] Controlled context is minimal and contains no secrets or unnecessary player/child information.
- [ ] The AI role, allowed capabilities, and structured output are explicit.
- [ ] AI output is treated as untrusted and passes schema, semantic, safety, and Game Core validation.
- [ ] Unsupported proposal types and invalid responses are rejected safely.
- [ ] No AI output directly mutates authoritative state or defines rules, mechanics, rewards, or progression.
- [ ] Provider, model, SDK, and vendor concerns remain outside Game Core domain logic.
- [ ] Deterministic fallback behavior exists for relevant AI failures.
- [ ] Focused tests cover context, parsing, invalid proposals, safety, failures, fallbacks, and no partial mutation.
- [ ] Verification commands and results are reported accurately.
