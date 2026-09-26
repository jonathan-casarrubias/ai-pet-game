# ADR-005: Cloudflare Workers as the Backend Runtime

## Context

The AI Pet Game requires a remotely accessible backend for the MVP/PoC and should use the same backend runtime as the foundation for future production environments.

The backend should be lightweight, scalable, and suitable for a serverless execution model. The architecture should avoid introducing infrastructure that would require a future migration to another cloud provider solely because the product grows.

The backend also requires standard HTTP capabilities such as routing, middleware, authentication, authorization, validation, and error handling. These capabilities should be provided by an established framework rather than reimplemented manually.

## Decision

Cloudflare Workers is the backend runtime for the project.

The backend will be implemented in TypeScript and will use Express as its HTTP framework and middleware layer.

Express is responsible for HTTP concerns such as routing, middleware composition, authentication and authorization boundaries, request validation, and HTTP error handling.

The Game Core remains independent of Cloudflare Workers and Express and must not depend on the backend runtime or HTTP framework.

The initial backend will be implemented as a single Worker rather than as multiple microservices.

The architecture must allow the backend to be decomposed into multiple Workers in the future if concrete scalability, isolation, ownership, or operational requirements justify that separation.

Cloudflare-specific capabilities may be used at the infrastructure boundary, but the domain logic must remain independent of them.

The backend runtime is intended to support both the MVP/PoC and future production environments. The architecture does not assume that a future migration to AWS or another cloud provider will be necessary as the product grows.

## Consequences

Cloudflare Workers provides the remote execution environment for the backend from the beginning.

Express provides established HTTP routing and middleware capabilities without introducing the additional architectural complexity of a larger backend framework such as NestJS.

The backend can use a serverless execution model and scale without requiring the project to manage traditional long-running application servers.

The Game Core remains reusable and independently testable because it does not depend on Express or Cloudflare Workers.

The initial architecture remains simple because the project starts with a single Worker rather than prematurely introducing microservices.

The architecture can evolve toward multiple Workers if future requirements justify service decomposition.

The backend remains primarily TypeScript-based and can use the Node.js-compatible capabilities supported by the Cloudflare Workers runtime.

## Exclusions

NestJS is not introduced as the backend framework.

Microservices are not introduced for the initial MVP/PoC.

Durable Objects are not introduced unless a future requirement specifically justifies their use.

The Game Core does not depend on Express.

The Game Core does not depend on Cloudflare Workers.

A future migration to AWS or another cloud provider is not assumed or planned as part of the initial architecture.

