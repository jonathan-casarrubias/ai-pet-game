# Implementing an API Feature

## Purpose

Use this procedure when implementing or modifying API/backend behavior in the AI Pet Game.

The goal is to expose useful application behavior through the TypeScript and Express API running on the initial Cloudflare Worker without moving domain authority into routes, controllers, persistence, AI integrations, or infrastructure code.

## Workflow

```text
Understand API requirement
        ↓
Inspect existing routes, contracts, and boundaries
        ↓
Identify responsible Game Core behavior
        ↓
Define or reuse request/response contracts
        ↓
Validate external input
        ↓
Delegate authoritative decisions to Game Core
        ↓
Orchestrate AI or persistence through established boundaries
        ↓
Map domain outcomes and failures to API responses
        ↓
Add focused tests
        ↓
Verify and report
```

### 1. Understand the API requirement

Before editing code:

- Describe the client-facing behavior and the domain operation it invokes.
- Identify the route or API capability involved, its caller, and the data the caller actually needs.
- Identify authentication, authorization, ownership, and resource-access requirements.
- Identify malformed requests, missing resources, domain rejections, conflicts, dependency failures, and unexpected failures.
- Check whether an existing route, use case, contract, error mapping, or middleware already supports the behavior.

Do not invent a new API abstraction, transport style, or endpoint family when an existing pattern satisfies the requirement. Keep the change focused on the requested behavior.

### 2. Inspect existing routes, contracts, and boundaries

Review the relevant API code, shared/domain types, Game Core entry points, persistence boundaries, AI integration boundaries, tests, and package scripts. Confirm:

- Which layer owns each responsibility.
- How external input is parsed and validated.
- How authentication and authorization boundaries are enforced.
- How domain outcomes and errors are represented.
- How authoritative state is loaded and persisted.
- How AI proposals are parsed and validated when applicable.
- Which response shapes and failure conventions already exist.

Prefer reusing established contracts and boundaries. Do not create generic controllers, service layers, repositories, gateways, or middleware solely for hypothetical future APIs.

### 3. Identify the responsible domain behavior

Determine which Game Core operation owns the requested decision:

- State and rules.
- Valid state transitions.
- Validation and gameplay outcomes.
- Progression, rewards, inventory, personality, and events.
- Validation of structured AI proposals.

The API receives external input and orchestrates the operation; it must not independently decide whether a gameplay action is valid. Clients request actions. They do not submit authoritative state, rewards, progression, inventory, personality, or similar gameplay data for the API to accept.

### 4. Define or reuse API contracts

Use explicit typed request and response contracts at the API boundary. Before implementation, identify:

- Required and optional request fields.
- Allowed values and input limits.
- Resource identifiers and ownership scope.
- Response data the client actually needs.
- Domain outcomes that must remain distinguishable.
- Serialization and deserialization rules.

Reuse shared or domain types where appropriate, but do not leak database records, Express types, Worker environment objects, provider SDK types, secrets, or infrastructure details into public API contracts. Avoid exposing internal domain implementation details unnecessarily.

Do not silently coerce invalid client input into a different game action. Reject malformed or invalid input at the boundary before constructing a Game Core request.

### 5. Validate input and access at the API boundary

Validate external input before passing it to domain operations:

- Parse the request using the established API conventions.
- Reject missing, malformed, out-of-range, or unsupported values.
- Enforce authentication and authorization when required.
- Validate player/resource ownership and access scope before loading or changing data.
- Ignore or reject client-provided authoritative state and derived gameplay outcomes.
- Do not expose unnecessary child/player information in logs or responses.

API validation protects the boundary, but it does not replace Game Core validation. A request that is well-formed and authorized may still be rejected by domain rules.

### 6. Delegate decisions to Game Core

Construct the appropriate Game Core input, command, or use-case request from validated API input. Then:

1. Load the required authoritative state through the established application/persistence boundary.
2. Pass the domain input and state to Game Core.
3. Let Game Core perform authoritative validation and determine the outcome.
4. Persist the accepted state transition through the established boundary when required.
5. Return only the result needed by the client.

The API must not duplicate rules in route handlers, controllers, SQL, serializers, or middleware. If the domain operation is rejected, do not perform partial authoritative mutation. Preserve meaningful domain errors instead of converting every rejection into a generic server error.

### 7. Handle AI-related API operations

When an operation involves AI, the API may orchestrate the client request, controlled context, AI integration, and Game Core, but it must preserve ADR-006:

- Provide only the controlled context required by the bounded capability.
- Do not expose unrestricted database access, raw game history, secrets, or internal state to the model.
- Treat every AI response as untrusted.
- Use the established structured proposal contract.
- Parse and schema-validate the response before domain use.
- Pass gameplay-affecting proposals through semantic and Game Core validation before mutation.
- Never allow a provider to directly mutate authoritative state.
- Map provider failures, timeouts, malformed output, safety failures, and rejected proposals to safe API behavior.

Keep provider-specific invocation behind the existing AI integration boundary. Do not make the API contract depend on Ollama, a particular model, SDK, or vendor, and do not put provider-specific logic directly in route handlers when an established boundary exists. AI remains bounded narrative generation; it is not an open-ended chatbot or source of game rules.

### 8. Handle persistence through the application boundary

Use PostgreSQL with Neon as the project's persistence mechanism through the established application boundary. Persistence code may retrieve and store authoritative data, but it must not replace Game Core business logic.

- Do not put gameplay rules in SQL, queries, controllers, or route handlers.
- Do not import database clients, Neon types, ORM types, or persistence models into framework-independent Game Core code.
- Handle transaction or consistency requirements when the operation requires atomic persistence.
- Do not assume database success means that the gameplay operation was valid.
- Persist only after the relevant Game Core validation and transition decision succeeds.
- Map persistence failures without exposing internal database details to clients.

Do not introduce SQLite, MongoDB, or a generic persistence abstraction merely for theoretical portability.

### 9. Preserve runtime and framework boundaries

The initial backend is TypeScript with Express running on one Cloudflare Worker. Keep responsibilities separated:

- **API/application:** routing, middleware, authentication/authorization boundaries, request validation, orchestration, and error mapping.
- **Game Core:** authoritative domain state, rules, validation, transitions, progression, rewards, and gameplay outcomes.
- **Persistence:** PostgreSQL/Neon storage and retrieval at the application boundary.
- **AI integration:** provider invocation and bounded proposal handling behind an explicit boundary.
- **Infrastructure:** Cloudflare-specific runtime and environment concerns.

Cloudflare-specific APIs and environment capabilities must remain at the infrastructure boundary. Do not couple Game Core to Express, HTTP, Cloudflare Workers, Worker environment objects, PostgreSQL, Neon, database clients, or other infrastructure concerns. Do not introduce NestJS, additional Workers, microservices, GraphQL, WebSockets, Durable Objects, queues, event buses, CQRS, API gateways, service meshes, specific authentication vendors, specific ORM libraries, or specific AI providers without a concrete requirement or separate architectural decision.

### 10. Map outcomes and failures carefully

Map API behavior from the actual result of the operation. Distinguish, where applicable, between:

- Malformed or invalid client input.
- Authentication or authorization failure.
- Missing resource.
- Valid request rejected by Game Core rules.
- Conflict or stale state.
- AI unavailable or failed.
- Persistence or infrastructure failure.
- Unexpected server failure.

Follow existing API conventions for response shapes and status codes. Do not prescribe arbitrary codes when the repository has an established convention or the requirement does not determine one. Keep internal stack traces, provider details, database errors, secrets, and infrastructure handles out of client responses.

## Testing guidance

Prefer deterministic tests at clear API and domain boundaries. Route/API tests should not require production infrastructure or a live AI provider when deterministic fakes or mocks can verify the behavior.

Cover, as appropriate:

- Request parsing and validation.
- Response serialization and omission of unnecessary data.
- Authentication, authorization, ownership, and access boundaries.
- Valid requests that produce valid Game Core outcomes.
- Invalid domain operations and meaningful domain-error mapping.
- Malformed requests and unsupported values.
- Missing resources and stale or conflicting operations.
- Client attempts to submit authoritative state, rewards, progression, inventory, or personality.
- AI failures, malformed proposals, unsupported proposal types, safety rejections, and timeouts.
- Persistence failures and consistency/transaction behavior where relevant.
- Correct error mapping without leaking secrets or internal infrastructure details.
- The API cannot bypass Game Core validation.
- Rejected operations do not cause partial authoritative mutation.

Use deterministic fakes at the AI, persistence, and Game Core boundaries as appropriate. Keep pure Game Core tests independent of HTTP, Express, Cloudflare, databases, and external AI services.

## Verification guidance

After implementation:

1. Run the most focused route or API tests first.
2. Run affected Game Core tests for the delegated domain behavior.
3. Run relevant package-level type, lint, or build checks when available.
4. Run broader repository checks only when relevant to the change.
5. Inspect the final diff for leaked infrastructure, provider, persistence, or duplicated domain logic.
6. Report the exact commands run, their results, and any unverified behavior.

Never claim a test, build, database operation, AI integration, or deployment check passed unless it was actually executed. If external infrastructure is unavailable, verify deterministic failure handling and state clearly what remains unverified.

## Completion checklist

- [ ] The API requirement and responsible domain operation are explicit.
- [ ] Existing routes, contracts, boundaries, and conventions were inspected and reused where appropriate.
- [ ] Request input is explicitly validated before entering Game Core.
- [ ] Authentication, authorization, ownership, and access boundaries are enforced where required.
- [ ] Game Core remains authoritative for rules, state, validation, progression, rewards, and outcomes.
- [ ] The API does not duplicate gameplay rules or accept client-provided authoritative state.
- [ ] AI operations use controlled context, structured proposals, untrusted-output handling, and Game Core validation.
- [ ] Persistence uses PostgreSQL/Neon through the application boundary and does not contain domain rules.
- [ ] No infrastructure, database, Express, HTTP, Worker, provider, or SDK types leaked into Game Core or public contracts.
- [ ] Errors distinguish relevant client, access, domain, dependency, conflict, and server failures without leaking internals.
- [ ] Focused deterministic tests cover success, validation, authorization, failures, and no partial mutation.
- [ ] Verification commands and results are reported accurately.
