# TypeScript and Tooling Conventions

## Purpose

This document records the repository-wide TypeScript tooling conventions established while modernizing `packages/game-core`. It is an operational repository convention, not a product architecture decision or a new ADR.

The conventions keep reusable TypeScript packages buildable, independently understandable, and consistent while the repository remains split into packages and applications without a root workspace.

## Canonical compiler and package ownership

TypeScript is the canonical compiler for reusable or otherwise compilable TypeScript packages. A package should declare TypeScript locally and invoke that package-owned compiler through its scripts instead of depending on a globally installed `tsc`.

Until a root workspace is deliberately introduced, each TypeScript package may own its TypeScript development dependency and lockfile. This keeps package-level tooling explicit without prematurely introducing repository-wide dependency management. A future root workspace may centralize TypeScript and other shared tooling dependencies, but that change is intentionally deferred.

## ESM and NodeNext

Node-oriented TypeScript packages use modern Node ESM:

- `package.json` declares `"type": "module"`.
- `tsconfig.json` uses `"module": "NodeNext"`.
- Legacy `moduleResolution: "Node"` / `node10` resolution is not used. NodeNext should not be paired with an explicit deprecated legacy resolution mode.
- Relative source imports follow NodeNext ESM requirements, including `.js` extensions where required by the emitted JavaScript module graph.

The intended migration path is to use the current supported module and resolution model, not to silence deprecation warnings. `ignoreDeprecations` is not a substitute for migration, and compiler options should not be added redundantly without a concrete reason.

## Reusable-package build boundary

Reusable packages such as `packages/game-core` use the TypeScript compiler to produce JavaScript output together with declarations and source maps. This is the canonical build and execution boundary for package code.

Node 24 native type stripping may be useful for small scripts or experiments where it is appropriate, but it is not the canonical build model for reusable packages. Runtime and test tooling such as `ts-node`, `tsx`, Jest, or Vitest is not part of the baseline; introduce it only when a concrete project requirement justifies the dependency and workflow.

## Testing convention

Node-oriented TypeScript packages use Node's native `node:test` runner and strict assertions from `node:assert/strict` as the default testing foundation. Tests should use those APIs directly rather than maintaining local copies of generic test or assertion functions. This keeps the repository aligned with its modern Node.js runtime, preserves framework independence, and avoids an unnecessary testing dependency.

TypeScript tests are compiled to JavaScript and the generated JavaScript is executed with Node. The standard package test command is `npm test`. For `packages/game-core`, the command remains:

```text
npm run build && node --test dist/tests/game-core.test.js
```

Test commands should invoke the standard Node test runner without `--test-isolation=none` or other unnecessary flags and workarounds.

Tests should stay focused on observable behavior and architectural boundaries and should preserve the testing principles in `skills/testing/implement-feature.md`: choose the narrowest appropriate test level, keep deterministic tests independent of external systems, cover meaningful success and failure behavior, and verify that invalid operations do not partially mutate authoritative state.

Jest, Vitest, Mocha, `ts-node`, `tsx`, or another dedicated testing/runtime tool requires a concrete future project requirement and an explicit decision. This default applies to Node-oriented packages; a future platform such as React Native may require an appropriate specialized framework, but that must be a deliberate, documented exception rather than an accidental second standard.

## Scope and exceptions

These conventions apply to future TypeScript packages and applications consistently unless a specific architectural or runtime requirement calls for an exception. Exceptions should be deliberate and documented, so they remain visible rather than becoming accidental local patterns.
