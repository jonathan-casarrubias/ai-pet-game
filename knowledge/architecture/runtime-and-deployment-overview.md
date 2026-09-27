# Runtime and Deployment Overview

This document describes where the MVP runs and how its runtime boundaries fit together. It complements `knowledge/architecture/system-overview.md` by focusing on execution and deployment rather than repeating component responsibilities or implementation contracts.

## MVP runtime topology

The remote/demo topology is:

```text
React Native mobile application
            ↓ HTTP
Cloudflare Worker
    └── Express API and application boundary
            ├── Game Core
            ├── AI integration boundary ──→ external AI provider/model
            └── Persistence boundary ─────→ PostgreSQL hosted on Neon
```

The MVP must be remotely accessible so that people outside the local development environment can use and evaluate the core gameplay loop. Remote access therefore uses a deployed Cloudflare Worker and remotely hosted Neon PostgreSQL; an entirely local infrastructure is not the demonstration target.

## Runtime components

### Mobile application runtime

The mobile application is a React Native and TypeScript client running on a supported device or simulator. It presents the pet, narrative, adventures, and mini-games; collects player input; sends supported actions to the backend; and renders accepted results.

The mobile runtime is not authoritative. It does not decide valid actions, apply rewards, update progression, or accept AI output as gameplay. Authoritative results come from the backend and Game Core.

### Backend API runtime

The backend is a TypeScript application running as a single Cloudflare Worker for the MVP. Express runs within that Worker and provides the HTTP application framework, including routing, middleware, request handling, validation boundaries, and error handling.

The Worker hosts the application-side orchestration needed to load state, invoke Game Core, coordinate the AI and persistence boundaries, and return safe responses to the mobile client. Cloudflare-specific runtime concerns remain outside Game Core.

### Game Core runtime

Game Core executes as part of the backend application in the MVP deployment. It remains a framework-independent domain component even when hosted inside the Worker. It owns authoritative state transitions, rules, validation, progression, personality behavior, and valid gameplay outcomes.

Hosting Game Core in the Worker is a deployment choice, not a domain dependency. Game Core must not depend on React Native, Express, Cloudflare Workers, PostgreSQL, Neon, or an AI provider.

### Persistence runtime

PostgreSQL is hosted remotely by Neon and is used from the beginning for the MVP and remote demonstrations. The backend accesses Neon through the persistence boundary to load and store authoritative game-domain data.

Neon is a persistence service, not the source of game rules. Game Core determines valid state transitions; PostgreSQL stores accepted authoritative results.

### AI runtime and external dependency

AI is an external dependency accessed through the AI integration boundary. A selected provider and model generate bounded narrative or creative proposals from controlled context. AI output is untrusted and must pass the established structured proposal, safety, and Game Core validation flow before it can affect gameplay.

Ollama is a local development option only. It may provide the model runtime during local development, but it is not required by the remote/demo deployment and must not become a dependency of Game Core. Remote execution uses an externally reachable provider/model according to the implemented integration while preserving the same provider-independent proposal boundary.

## Main runtime request flow

An interaction follows this conceptual path:

1. The player performs an action in the React Native client.
2. The client sends the supported action to the remote API over HTTP.
3. Express, running inside the Cloudflare Worker, handles the request and performs transport-level validation.
4. The application loads the required authoritative state from Neon through the persistence boundary.
5. Game Core evaluates the action and determines whether an AI capability is needed.
6. If AI is used, the integration supplies controlled context to the external provider/model and receives a structured proposal. Game Core validates the proposal or applies a safe bounded fallback.
7. Game Core determines the accepted outcome and state transition; accepted authoritative data is persisted to Neon.
8. The API returns the accepted result or a safe failure response, and the mobile client renders it.

AI is optional to the runtime flow. Fundamental game behavior must remain valid when AI is unavailable, rejected, or not needed.

## Local development and remote/demo execution

Local development and remote/demo execution use the same conceptual boundaries but place components differently:

| Component | Local development | Remote/demo execution |
| --- | --- | --- |
| Mobile client | Runs locally on a device or simulator. | Runs on the demonstrator's device or simulator and connects remotely. |
| API and Express | Runs in a local development runtime compatible with the backend application. | Runs inside the deployed Cloudflare Worker. |
| Game Core | Runs locally with the backend application. | Runs inside the Cloudflare Worker application. |
| PostgreSQL | Remains hosted remotely on Neon. | Hosted remotely on Neon. |
| AI provider/model | May be external, or may use local Ollama. | Uses the configured external provider/model; local Ollama is not assumed. |

This separation allows developers to iterate locally while keeping the MVP's persistence architecture and demonstration path remote. Local Ollama is a convenience for development, not a requirement for users or demos.

## Deployment boundaries and replaceability

The deployment boundary is organized around replaceable outer concerns:

- The mobile application communicates with the backend through an application protocol rather than importing backend runtime code.
- Express handles HTTP concerns inside the Worker and delegates gameplay decisions to Game Core.
- Cloudflare Workers provides the remote execution environment but does not define domain behavior.
- The persistence boundary isolates Game Core from PostgreSQL/Neon access details.
- The AI integration boundary isolates Game Core from provider, model, and SDK details.
- Game Core communicates through domain-level inputs, outputs, and proposal contracts rather than infrastructure objects.

This allows the mobile client, backend runtime, persistence service, or AI provider/model to evolve independently where a concrete requirement exists. Replacing an outer component must not require moving game rules into the client, API framework, database, or AI provider. The initial deployment remains a single Worker and does not introduce microservices or other infrastructure beyond the established architecture.

## Failure and degradation considerations

- **Backend unavailable:** The client cannot complete the interaction and must present a safe error or unavailable state. It must not invent authoritative outcomes locally.
- **Database unavailable:** The backend must not report durable success when required state cannot be safely loaded or persisted. No partial authoritative mutation should be exposed as completed gameplay.
- **AI unavailable or invalid:** The game uses a deterministic or predefined bounded fallback when the feature supports one, or leaves state unchanged and returns a safe result. AI failure must not prevent valid non-AI gameplay or grant progression.
- **AI proposal rejected:** A malformed, unsafe, or rule-incompatible proposal is discarded. Only a proposal accepted by Game Core can affect state.
- **External dependency variability:** Provider/model behavior may change creative output, but it must not change the authority of Game Core or the persistence of invalid state.

Failure handling belongs at the boundary that owns the failure. No fallback may bypass Game Core validation or create a second source of game rules.

## Runtime scope

This overview intentionally does not define CI/CD, infrastructure-as-code, Cloudflare configuration, secrets, database schema, API endpoints, authentication implementation, AI provider configuration, or deployment commands. Those details are separate implementation concerns and must preserve the runtime boundaries described here.
