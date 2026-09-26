# Implementing a Game Core Feature

Use this procedure when implementing or modifying a feature inside `packages/game-core`.

The goal is to add the smallest useful domain change while keeping Game Core authoritative, deterministic where practical, framework-independent, and independently testable.

## Workflow

```text
Understand requirement
        ↓
Inspect existing Game Core
        ↓
Identify domain state and rules
        ↓
Identify existing abstractions
        ↓
Implement smallest domain change
        ↓
Add/update focused tests
        ↓
Verify
        ↓
Report
```

### 1. Understand the requirement

Before editing code:

- Describe the requested gameplay behavior in domain terms.
- Identify the user or system input that starts the behavior.
- Identify the expected successful outcome.
- Identify invalid inputs, unavailable actions, and failure outcomes.
- Check whether the behavior is already covered by an existing Game Core concept.

If the requirement is ambiguous about rules or authoritative outcomes, resolve that ambiguity from existing project knowledge or ask for clarification rather than inventing mechanics.

### 2. Inspect existing Game Core

Review the relevant files in `packages/game-core` before creating new concepts. Look for:

- Existing state models and domain values.
- Existing commands, actions, or use-case entry points.
- Existing validation and transition logic.
- Existing progression, rewards, personality, and event behavior.
- Existing focused tests and package scripts.

Prefer extending an existing domain concept over adding a parallel abstraction. Do not introduce a new pattern merely to make one feature appear more general.

### 3. Identify the domain contract

Write down the feature's domain contract before implementation:

- **State:** What authoritative domain state is read or changed?
- **Rules:** What conditions determine whether the behavior is allowed?
- **Transitions:** Which state changes are valid, and in what order?
- **Validation:** Which inputs, capabilities, and current-state conditions must be checked?
- **Progression and rewards:** What limits, eligibility rules, or deterministic outcomes apply?
- **Events:** Is a domain event genuinely required by an existing behavior or consumer?

Game Core owns these decisions. External callers may provide inputs, but they must not decide whether a transition, reward, or progression change is valid.

### 4. Preserve framework independence

Code in `packages/game-core` must not depend on presentation, transport, infrastructure, persistence, or provider implementations. Do not import or embed:

- React or React Native.
- Express, HTTP, request/response objects, or API-specific serialization.
- Cloudflare Workers or other runtime-specific APIs.
- PostgreSQL, Neon, database clients, or persistence-specific models.
- Ollama, a model SDK, or any specific AI provider.
- UI state, navigation, mobile APIs, or lifecycle concerns.

When a feature genuinely needs an external concern, keep the domain behavior behind an explicit boundary or input/output contract. Place the integration in the appropriate application or infrastructure layer. Do not create a generic boundary solely for hypothetical future use.

### 5. Implement the smallest domain change

Implement the minimum change that satisfies the requirement:

- Keep rules and state transitions in Game Core.
- Keep deterministic decisions inside domain logic whenever practical.
- Reuse existing types, validators, and concepts.
- Reject invalid inputs safely without partial state mutation.
- Avoid speculative support for future clients, Unity, or unrequested gameplay.
- Do not add event buses, state machines, CQRS, repositories, or other architectural patterns unless the current feature demonstrably requires one.

The API/application layer should translate external requests into Game Core inputs and translate Game Core results into transport responses. Persistence should store authoritative state, not implement or replace the rules.

### 6. Handle AI-related behavior safely

If the feature consumes AI-generated information, follow ADR-006:

- Treat every AI result as untrusted input, including syntactically valid structured data.
- Accept only structured proposals in capabilities explicitly supported by Game Core.
- Validate proposal type, allowed capabilities, current-state compatibility, rules, transitions, rewards, progression, and safety constraints.
- Apply state changes only after Game Core accepts the proposal.
- Never interpret free-form text as a command.
- Never call Ollama or another provider from domain logic.
- Keep provider and model replacement independent from Game Core rules.

AI may propose bounded narrative or creative variation; it may not define mechanics, grant rewards, or mutate authoritative state.

### 7. Add focused tests

Add or update tests next to the affected Game Core behavior. Tests should run without network, databases, AI providers, React Native, Cloudflare, or HTTP.

Cover, as appropriate:

- Valid inputs and valid state transitions.
- Invalid inputs and invalid transitions.
- Boundary conditions and repeated actions.
- Rule, progression, reward, and safety constraints.
- Rejection of invalid structured proposals when AI input is involved.
- Deterministic outcomes and the absence of partial state mutation after failure.

Test domain behavior directly rather than testing framework or transport wiring in Game Core tests.

### 8. Verify and report

After implementation:

1. Run the most focused Game Core tests first.
2. Run relevant package-level type checks, lint, or build checks when available.
3. Run broader repository checks only when they are relevant to the change.
4. Inspect the final diff to confirm that only the intended domain and test files changed.
5. Report the exact commands run and their results.

Do not claim a test, check, or build passed unless it was actually executed. If verification is blocked, report the command, the blocker, and what remains unverified.

## Completion checklist

- [ ] The requirement is expressed as domain behavior.
- [ ] Existing Game Core concepts were inspected and reused where appropriate.
- [ ] State, rules, transitions, validation, and progression implications are explicit.
- [ ] Game Core remains the authority for outcomes and state mutation.
- [ ] No UI, API, HTTP, persistence, infrastructure, or AI-provider dependency entered Game Core.
- [ ] AI output, if used, is structured, untrusted, bounded, and validated.
- [ ] Focused deterministic tests cover success, failure, and important boundaries.
- [ ] Focused and relevant package checks were executed and accurately reported.
