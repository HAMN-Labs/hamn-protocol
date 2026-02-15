# @hamn/sdk

**TypeScript SDK for the HAMN Protocol** — interact with Memory Nodes and on-chain contracts in a single unified API.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 📖 **[Документация на русском →](./README.ru.md)**

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Reference](#api-reference)
  - [HAMNClient (Facade)](#hamnclient-facade)
  - [MemoryClient (Off-chain)](#memoryclient-off-chain)
  - [ContractClient (On-chain)](#contractclient-on-chain)
- [Types](#types)
- [Error Handling](#error-handling)
- [ABI](#abi)
- [Testing](#testing)
- [Configuration](#configuration)
- [Examples](#examples)

---

## Installation

```bash
npm install @hamn/sdk
# or
yarn add @hamn/sdk
```

**Peer dependency:** The SDK uses [viem](https://viem.sh/) for on-chain interactions. Install it alongside the SDK:

```bash
npm install viem
```

---

## Quick Start

```typescript
import { HAMNClient } from "@hamn/sdk";
import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

// 1. Create viem clients
const account = privateKeyToAccount("0x...");
const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});
const walletClient = createWalletClient({
  account,
  chain: arbitrumSepolia,
  transport: http(),
});

// 2. Initialize HAMN
const hamn = HAMNClient.create(
  {
    nodeUrl: "http://localhost:8080",
    rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc",
    registryAddress: "0x...",
    distributorAddress: "0x...",
  },
  { publicClient, walletClient },
);

// 3. Off-chain: similarity search
const results = await hamn.query([0.9, 0.1, 0.0, 0.5], 5);
console.log("Best match:", results[0]?.pattern.id);

// 4. On-chain: register a pattern
const txHash = await hamn.registerPattern(
  "0x00000000000000000000000000000000000000000000000000000000deadbeef",
  parseEther("0.01"),
);
console.log("Registered:", txHash);
```

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              HAMNClient (Facade)            │
│  Unified API for off-chain + on-chain ops   │
├──────────────────┬──────────────────────────┤
│  MemoryClient    │  ContractClient          │
│  HTTP → Node     │  viem → Arbitrum         │
├──────────────────┼──────────────────────────┤
│  Rust Engine     │  PatternRegistry.sol     │
│  (Memory Node)   │  RewardDistributor.sol   │
└──────────────────┴──────────────────────────┘
```

The SDK is split into three layers:

| Layer         | Module           | Transport       | Purpose                                        |
| ------------- | ---------------- | --------------- | ---------------------------------------------- |
| **Facade**    | `HAMNClient`     | —               | Single entry point for all operations          |
| **Off-chain** | `MemoryClient`   | HTTP / `fetch`  | Similarity search, pattern CRUD, reinforcement |
| **On-chain**  | `ContractClient` | viem / JSON-RPC | Staking, reputation, rewards                   |

---

## API Reference

### HAMNClient (Facade)

The main entry point. Combines `MemoryClient` and `ContractClient`.

```typescript
import { HAMNClient } from "@hamn/sdk";

const hamn = HAMNClient.create(config, { publicClient, walletClient });
```

#### Factory

| Method                                | Description                                               |
| ------------------------------------- | --------------------------------------------------------- |
| `HAMNClient.create(config, options?)` | Create a client from `HAMNConfig` + optional viem clients |

#### Off-chain Methods

| Method                    | Returns         | Description                          |
| ------------------------- | --------------- | ------------------------------------ |
| `query(vector, k?)`       | `QueryResult[]` | Similarity search (top-K)            |
| `addPattern(pattern)`     | `Pattern`       | Store a new pattern                  |
| `getPattern(id)`          | `Pattern`       | Retrieve pattern by ID               |
| `removePattern(id)`       | `Pattern`       | Delete a pattern                     |
| `recordUsage(id, reward)` | `Pattern`       | Record usage + reinforcement update  |
| `decayAll()`              | `void`          | Apply temporal decay to all patterns |
| `health()`                | `boolean`       | Memory Node health check             |

#### On-chain Methods

| Method                       | Returns          | Description                     |
| ---------------------------- | ---------------- | ------------------------------- |
| `registerPattern(id, stake)` | `0x${string}`    | Register pattern with ETH stake |
| `getOnChainPattern(id)`      | `OnChainPattern` | Read on-chain pattern data      |
| `isRegistered(id)`           | `boolean`        | Check registration status       |
| `recordOnChainUsage(id)`     | `0x${string}`    | Record usage event on-chain     |
| `depositRewards(amount)`     | `0x${string}`    | Fund the reward pool            |
| `claimRewards()`             | `0x${string}`    | Claim accrued rewards           |
| `getPendingRewards(address)` | `bigint`         | Check pending reward balance    |

---

### MemoryClient (Off-chain)

Direct HTTP client for the Rust Memory Node. Use when you only need off-chain operations.

```typescript
import { MemoryClient } from '@hamn/sdk';

const memory = new MemoryClient({
  nodeUrl: 'http://localhost:8080',
  timeoutMs: 5000, // optional, default: 10000
});

// Similarity search
const results = await memory.query([0.9, 0.1], 3);

// Pattern CRUD
await memory.addPattern({ id: 'p1', vector: [1.0, 0.0], confidence: 0.9, ... });
const pattern = await memory.getPattern('p1');
await memory.removePattern('p1');

// Reinforcement learning
await memory.recordUsage('p1', 0.95); // reward ∈ [0, 1]
await memory.decayAll();

// Health
const healthy = await memory.health(); // true / false
```

#### HTTP Endpoints

| Method          | Endpoint                   | Description                       |
| --------------- | -------------------------- | --------------------------------- |
| `query`         | `POST /query`              | `{ vector: number[], k: number }` |
| `addPattern`    | `POST /patterns`           | Pattern JSON body                 |
| `getPattern`    | `GET /patterns/:id`        | —                                 |
| `removePattern` | `DELETE /patterns/:id`     | —                                 |
| `recordUsage`   | `POST /patterns/:id/usage` | `{ reward: number }`              |
| `decayAll`      | `POST /decay`              | —                                 |
| `health`        | `GET /health`              | —                                 |
| `getParams`     | `GET /params`              | Returns `MathParams`              |

---

### ContractClient (On-chain)

Direct viem client for Arbitrum smart contracts. Supports **read-only mode** (no `walletClient`).

```typescript
import { ContractClient } from "@hamn/sdk";

const contracts = new ContractClient({
  publicClient,
  walletClient, // optional — omit for read-only
  registryAddress: "0x...",
  distributorAddress: "0x...",
});

// Read operations (no wallet needed)
const pattern = await contracts.getPattern("0xabc...");
const registered = await contracts.isRegistered("0xabc...");
const minStake = await contracts.getMinStake();
const pending = await contracts.getPendingRewards("0xuser...");

// Write operations (wallet required)
const tx1 = await contracts.registerPattern("0xabc...", parseEther("0.01"));
const tx2 = await contracts.recordUsage("0xabc...");
const tx3 = await contracts.depositRewards(parseEther("1.0"));
const tx4 = await contracts.claimRewards();
```

---

## Types

```typescript
import type {
  Pattern, // Off-chain pattern (vector, confidence, tags)
  OnChainPattern, // On-chain pattern (stake, reputation, usageCount)
  QueryResult, // Search result (pattern + similarity + score)
  HAMNConfig, // SDK configuration
  HAMNMode, // SDK mode: "legacy" | "stylus"
  MathParams, // Hyperparameters (alpha, lambda)
} from "@hamn/sdk";
```

### Pattern

| Field          | Type       | Description                   |
| -------------- | ---------- | ----------------------------- |
| `id`           | `string`   | Unique identifier (keccak256) |
| `vector`       | `number[]` | Embedding vector              |
| `confidence`   | `number`   | Trust score [0.0, 1.0]        |
| `accessCount`  | `number`   | Usage counter                 |
| `lastAccessed` | `number`   | UNIX timestamp                |
| `createdAt`    | `number`   | UNIX timestamp                |
| `tags`         | `string[]` | Metadata tags                 |

### OnChainPattern

| Field              | Type                | Description          |
| ------------------ | ------------------- | -------------------- |
| `id`               | `` `0x${string}` `` | bytes32 pattern ID   |
| `owner`            | `` `0x${string}` `` | Contributor address  |
| `stake`            | `bigint`            | Staked amount (wei)  |
| `reputation`       | `number`            | Score [0, 10000]     |
| `registrationTime` | `number`            | Block timestamp      |
| `usageCount`       | `number`            | On-chain usage count |

### HAMNConfig

| Field                | Type                | Description                          |
| -------------------- | ------------------- | ------------------------------------ |
| `nodeUrl`            | `string`            | Memory Node HTTP endpoint            |
| `rpcUrl`             | `string`            | Arbitrum RPC URL                     |
| `registryAddress`    | `` `0x${string}` `` | PatternRegistry address              |
| `distributorAddress` | `` `0x${string}` `` | RewardDistributor address            |
| `mode?`              | `HAMNMode`          | SDK mode (`legacy` by default)       |
| `stylusVerifierAddress?` | `` `0x${string}` `` | Required when `mode = "stylus"`  |
| `chainId?`           | `number`            | Default: `421614` (Arbitrum Sepolia) |

---

## Error Handling

All SDK errors extend `HAMNError`:

```typescript
import { HAMNError, MemoryNodeError, ContractError } from "@hamn/sdk";

try {
  await hamn.query([1.0, 0.0]);
} catch (err) {
  if (err instanceof MemoryNodeError) {
    console.error("Memory Node HTTP error:", err.statusCode, err.message);
  } else if (err instanceof ContractError) {
    console.error("Contract error:", err.message);
  }
}
```

| Error Class       | Source           | Properties              |
| ----------------- | ---------------- | ----------------------- |
| `HAMNError`       | Base class       | `message`, `cause`      |
| `MemoryNodeError` | `MemoryClient`   | + `statusCode?: number` |
| `ContractError`   | `ContractClient` | —                       |

---

## ABI

For advanced users who want to interact with contracts directly via viem:

```typescript
import { PatternRegistryABI, RewardDistributorABI } from "@hamn/sdk";
import { getContract } from "viem";

const registry = getContract({
  address: "0x...",
  abi: PatternRegistryABI,
  client: publicClient,
});
```

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Build
npm run build
```

Test stack: [vitest](https://vitest.dev/) with mocked `fetch` and viem clients.

---

## Configuration

### Environment Variables (recommended)

```bash
HAMN_NODE_URL=http://localhost:8080
HAMN_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
HAMN_REGISTRY_ADDRESS=0x...
HAMN_DISTRIBUTOR_ADDRESS=0x...
HAMN_PRIVATE_KEY=0x...
```

```typescript
const hamn = HAMNClient.create({
  nodeUrl: process.env.HAMN_NODE_URL!,
  rpcUrl: process.env.HAMN_RPC_URL!,
  registryAddress: process.env.HAMN_REGISTRY_ADDRESS! as `0x${string}`,
  distributorAddress: process.env.HAMN_DISTRIBUTOR_ADDRESS! as `0x${string}`,
});
```

---

## Examples

### Read-only Mode

```typescript
// No wallet — only read operations
const hamn = HAMNClient.create(config, { publicClient });

const isReg = await hamn.isRegistered("0xabc...");
const data = await hamn.getOnChainPattern("0xabc...");
const rewards = await hamn.getPendingRewards("0xuser...");
```

### Batch Usage Tracking

```typescript
// Record usage both off-chain and on-chain
async function trackUsage(id: string, reward: number) {
  const [offChain, txHash] = await Promise.all([
    hamn.recordUsage(id, reward),
    hamn.recordOnChainUsage(id as `0x${string}`),
  ]);
  console.log(`Off-chain confidence: ${offChain.confidence}`);
  console.log(`On-chain tx: ${txHash}`);
}
```

### Memory-Only Mode

```typescript
import { MemoryClient } from "@hamn/sdk";

// Pure off-chain, no blockchain interaction
const memory = new MemoryClient({ nodeUrl: "http://localhost:8080" });

await memory.addPattern({
  id: "strategy-yield-low-risk",
  vector: [0.9, 0.1, 0.05, 0.8],
  confidence: 0.95,
  accessCount: 0,
  lastAccessed: Date.now() / 1000,
  createdAt: Date.now() / 1000,
  tags: ["defi", "yield", "low-risk"],
});

const results = await memory.query([0.85, 0.15, 0.1, 0.75], 3);
```

---

## License

MIT — see [LICENSE](../LICENSE)
