# Implementation Plan - System Integration

The goal is to enable End-to-End (E2E) testing of the HAMN Protocol by creating a runnable Memory Node server and a script that orchestrates the SDK, the server, and a local blockchain.

## User Review Required

> [!IMPORTANT]
> This plan involves adding dependencies (`axum`, `tokio`, `tower-http`) to `core-engine` to create a binary executable.

## Proposed Changes

### Core Engine (Rust)

#### [MODIFY] [Cargo.toml](file:///home/jorzhik/hamn-protocol/core-engine/Cargo.toml)

- Add dependencies: `axum`, `tokio`, `tower-http`, `tracing`, `tracing-subscriber`.

#### [NEW] [src/main.rs](file:///home/jorzhik/hamn-protocol/core-engine/src/main.rs)

- Implement a REST API server wrapping `MemoryNode`:
  - `POST /query`: Vector similarity search.
  - `POST /patterns`: Add pattern.
  - `GET /patterns/:id`: Get pattern.
  - `POST /patterns/:id/usage`: Record usage.
  - `POST /decay`: Trigger decay.
  - `GET /health`: Health check.

### SDK (TypeScript)

#### [NEW] [scripts/integration-test.ts](file:///home/jorzhik/hamn-protocol/sdk/scripts/integration-test.ts)

- A script to:
  1. Connect to local Anvil node.
  2. Deploy contracts (using `viem` or `forge`).
  3. Initialize `HAMNClient` pointing to local Memory Node and Anvil.
  4. Register a pattern on-chain.
  5. Store data off-chain.
  6. Verify data retrieval and consistency.

## Verification Plan

### Manual Verification

1. **Start Anvil**: `anvil`
2. **Start Memory Node**: `cargo run` in `core-engine`
3. **Run Integration Script**: `npx tsx scripts/integration-test.ts`
