// ─── HAMN Protocol SDK ────────────────────────────────────────────
// Public API surface — re-export everything.

// Types
export type {
  Pattern,
  OnChainPattern,
  QueryResult,
  HAMNConfig,
  MathParams,
} from './types.js';

// Errors
export { HAMNError, MemoryNodeError, ContractError } from './errors.js';

// Clients
export { MemoryClient, type MemoryClientOptions } from './client/memory.js';
export { ContractClient, type ContractClientOptions } from './client/contracts.js';
export { HAMNClient } from './hamn.js';

// ABI (for advanced users who want to use viem directly)
export { PatternRegistryABI } from './abi/PatternRegistry.js';
export { RewardDistributorABI } from './abi/RewardDistributor.js';
