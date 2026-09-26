# Testing a Feature

## Purpose

Use this procedure when designing, implementing, or verifying tests for functionality in the AI Pet Game.

The goal is to protect meaningful behavior and architectural boundaries with focused, deterministic tests. Tests must reflect the actual separation between Game Core, AI narrative behavior, API/application code, persistence, and infrastructure rather than making one layer responsible for another.

## Workflow

```text
Understand behavior to verify
        ↓
Identify architectural boundary and responsible layer
        ↓
Inspect existing tests and conventions
        ↓
Choose narrowest appropriate test level
        ↓
Define deterministic success and failure scenarios
        ↓
Test important architectural boundaries
        ↓
Avoid unnecessary external dependencies
        ↓
Run focused tests first
        ↓
Expand verification when appropriate
        ↓
Inspect diff and report exact results
```

### 1. Understand the behavior

Before writing or changing a test:

- Describe the observable behavior under test.
- Identify the input, current state, expected result, and relevant side effects.
- Identify valid behavior, rejection behavior, failure behavior, and important boundaries.
- Determine which layer owns the behavior and which layer should not own it.
- Check whether an existing test already covers the behavior or convention.

Do not write tests solely to increase coverage. A test should protect meaningful product behavior, a safety/security boundary, a deterministic rule, an integration contract, or an architectural constraint.

### 2. Identify the responsible boundary

Tests must preserve the project's responsibilities:

- **Game Core:** authoritative game state, rules, validation, transitions, progression, rewards, inventory, personality/gameplay behavior, and gameplay outcomes.
- **AI narrative:** bounded generation and adaptation using controlled context; never authoritative state mutation.
- **API/application:** transport, request validation, authentication/authorization boundaries, orchestration, and error mapping.
- **Persistence:** storage, retrieval, consistency, and transaction behavior for authoritative data.
- **Infrastructure:** Cloudflare Worker/runtime behavior and other external concerns.

A test can pass while an implementation is architecturally wrong. Include boundary checks when needed to detect duplicated rules, leaked dependencies, bypassed validation, or state mutation in the wrong layer.

## Test-level hierarchy

Choose the narrowest test that proves the behavior:

- **Pure unit/domain tests:** Prefer for deterministic Game Core rules, state transitions, validation, progression, rewards, safety constraints, and proposal acceptance/rejection.
- **Component/module tests:** Use for a bounded module such as context construction, proposal parsing, fallback handling, serialization, or an adapter with controlled dependencies.
- **API/route tests:** Use for HTTP/API parsing, authentication and authorization, resource access, response serialization, and error mapping. Use deterministic fakes for Game Core, AI, and persistence when real integrations are not the behavior under test.
- **Integration tests:** Add when interaction across real boundaries is itself important, such as persistence consistency, transaction behavior, or API-to-application wiring.
- **External-provider/infrastructure tests:** Isolate tests that require a live AI provider, PostgreSQL/Neon, Cloudflare, or deployment infrastructure. Use them only when the real external behavior must be verified.

Integration and external tests are not substitutes for focused domain tests. Do not make every test depend on a database, network, live LLM, or deployed Worker.

## Practical testing rules

### Game Core tests

Game Core tests must remain independent of React Native, React, Express, HTTP, Cloudflare Workers, PostgreSQL/Neon, AI providers, and other infrastructure. Test observable domain behavior rather than internal implementation details wherever possible.

Cover, as appropriate:

- Valid state transitions and deterministic outcomes.
- Invalid actions, inputs, and transitions.
- Boundary values and repeated or idempotent actions.
- Progression, rewards, inventory, and personality/gameplay behavior.
- Domain events when event behavior is genuinely part of the requirement.
- Safety constraints.
- Invalid or unsupported AI proposals.
- Proposals incompatible with the current state.
- Rejection without partial authoritative mutation.

Game Core remains the authority in these tests. A passing test must not rely on the API, database, prompt, or AI provider to enforce a game rule.

### AI narrative tests

Treat all AI output as untrusted. Do not require a live LLM for behavior that can be proven deterministically.

Cover, as appropriate:

- Controlled context construction.
- Omission of secrets and unnecessary child/player information.
- Capability-specific prompt/context inputs.
- Structured output parsing and schema validation.
- Malformed output, missing fields, unknown fields, and invalid values.
- Unsupported proposal types or capabilities.
- Semantic/domain rejection and safety rejection.
- Provider failure, timeout, unavailable provider, empty output, and deterministic fallback.
- Valid proposal acceptance only through Game Core validation.
- Rejected proposals cannot mutate authoritative state.

When provider integration itself must be tested, isolate those tests from pure narrative and Game Core tests and clearly identify their external dependency.

### API tests

Test API behavior at the HTTP/API boundary without forcing every test to use real databases, live AI providers, or Cloudflare infrastructure.

Cover, as appropriate:

- Request parsing and input validation.
- Authentication, authorization, resource ownership, and access scope.
- Valid requests and response serialization.
- Malformed requests, missing resources, and unsupported values.
- Valid requests rejected by Game Core rules.
- Stale or conflicting operations where relevant.
- AI failures, rejected proposals, and persistence failures.
- Correct error mapping and omission of sensitive/internal data.
- Rejection or ignoring of client-provided authoritative state, rewards, progression, inventory, or personality.
- Evidence that API behavior delegates authoritative decisions to Game Core rather than duplicating or bypassing them.
- No partial authoritative mutation after failed validation.

Use deterministic fakes or mocks at the appropriate boundaries. Do not turn route tests into accidental end-to-end tests.

### Persistence tests

Persistence tests verify storage behavior and consistency, not whether gameplay rules are correct. Do not duplicate Game Core business-rule tests in persistence tests, and do not treat a successful database write as proof that a gameplay operation was valid.

Cover, as appropriate:

- Successful persistence and retrieval of authoritative data.
- Data consistency and transaction/atomicity behavior where required.
- Persistence failures and safe error propagation.
- Stale or conflicting writes where relevant.
- Behavior when a transaction or write fails before completion.

Keep PostgreSQL/Neon-specific tests separate from pure domain tests. Do not allow persistence code to become the source of gameplay decisions.

### Architectural boundary tests

Use lightweight checks when a feature or change could introduce accidental coupling. Appropriate checks may include package boundaries, type checking, dependency inspection, import inspection, or focused tests.

Check, where relevant, that:

- Game Core does not import React/React Native.
- Game Core does not import Express or HTTP.
- Game Core does not import Cloudflare Worker APIs.
- Game Core does not import PostgreSQL, Neon, database clients, or persistence-specific code.
- Game Core does not import AI provider/model SDKs.
- API routes do not contain duplicated gameplay rules.
- AI integration does not directly mutate authoritative state.
- Persistence does not decide gameplay outcomes.

Do not invent elaborate architecture tests without a concrete risk to protect.

## Test data and determinism

Use small, explicit, readable fixtures:

- Prefer domain-relevant names over opaque generated values.
- Keep important edge cases explicit.
- Avoid unnecessary random data.
- Avoid shared mutable fixtures that can leak state between tests.
- Keep fixtures close to the tests, or use an established shared location when reuse is justified.
- Never include real secrets or sensitive child/player data.

Tests should not depend on current time, randomness, network availability, live LLM responses, external provider availability, production databases, deployment state, or local machine paths/configuration unless those are the behavior being tested. Control such dependencies through explicit test boundaries, seeded randomness, fake clocks, deterministic providers, or test databases as appropriate, and clearly distinguish those tests from deterministic tests.

## Failure testing

Do not test only the happy path. For important features, consider:

- Malformed input.
- Invalid domain action or state transition.
- Unauthorized access or ownership failure.
- Missing resources.
- Stale state or conflicting writes.
- Duplicate or repeated operations.
- AI dependency failure, timeout, unavailable provider, or malformed output.
- Unsupported capabilities and safety rejection.
- Persistence failure or interrupted transaction.
- Unexpected exceptions where meaningful.

Verify both the returned or observable failure and the absence of unintended state mutation. In particular, invalid AI proposals must not partially apply rewards, progression, inventory, personality, or other authoritative changes.

## Test naming and structure

Test names should communicate:

- The behavior under test.
- The relevant condition.
- The expected observable result.

Prefer focused tests over large scenario tests that verify many unrelated behaviors at once. Keep setup close to the behavior it explains. Avoid asserting incidental implementation details when an observable domain or API result is sufficient.

## Verification guidance

After adding or modifying tests:

1. Run the smallest relevant test set first.
2. Fix failures before expanding the scope.
3. Run affected package-level type, lint, or build checks when available.
4. Run broader repository tests when the change could affect other boundaries.
5. Run integration or external-provider tests only when the real boundary is part of the behavior being verified.
6. Inspect the final diff for unnecessary fixtures, external dependencies, duplicated assertions, and architectural leakage.
7. Report exact commands, results, and anything that remains unverified.

Never claim tests passed unless they were actually executed. A test suite passing is not evidence that the implementation is architecturally correct unless the relevant boundaries were also tested or inspected.

Do not prematurely introduce a testing framework, snapshot-heavy testing, mutation-testing infrastructure, property-based testing, contract-testing frameworks, end-to-end browser/device testing, performance-testing infrastructure, CI/CD tooling, or external test services unless the repository or a concrete requirement justifies it.

## Completion checklist

- [ ] The observable behavior and responsible architectural layer are explicit.
- [ ] Existing tests, fixtures, commands, and conventions were inspected and reused where appropriate.
- [ ] The narrowest test level that proves the behavior was selected.
- [ ] Valid behavior, invalid behavior, and important boundary conditions are covered.
- [ ] Game Core tests remain independent of UI, API, network, database, AI provider, and infrastructure concerns.
- [ ] AI output is tested as untrusted, including parsing, semantic validation, safety, failure, fallback, and no partial mutation where relevant.
- [ ] API tests verify boundary validation, access control, delegation to Game Core, response/error mapping, and no bypass of authoritative rules where relevant.
- [ ] Persistence tests verify storage and consistency without replacing Game Core business-rule tests.
- [ ] Fixtures are explicit, isolated, deterministic, and free of real sensitive data.
- [ ] Architectural boundary risks were tested or appropriately inspected.
- [ ] Focused and broader verification commands were executed as appropriate and reported accurately.
