// ─── HAMN Protocol SDK — Unified Client ───────────────────────────
// Facade that combines MemoryClient + ContractClient into one API.

import type { PublicClient, WalletClient } from 'viem';

import type { HAMNConfig, Pattern, QueryResult, OnChainPattern } from './types.js';
import { MemoryClient } from './client/memory.js';
import { ContractClient } from './client/contracts.js';

/**
 * Full HAMN Protocol client.
 *
 * Combines off-chain memory operations (HTTP → Memory Node) with
 * on-chain settlement (viem → Arbitrum contracts).
 *
 * @example
 * ```ts
 * import { HAMNClient } from '@hamn/sdk';
 * import { createPublicClient, createWalletClient, http } from 'viem';
 * import { arbitrumSepolia } from 'viem/chains';
 *
 * const hamn = HAMNClient.create({
 *   nodeUrl: 'http://localhost:8080',
 *   rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
 *   registryAddress: '0x...',
 *   distributorAddress: '0x...',
 * });
 *
 * // Off-chain query
 * const results = await hamn.query([0.9, 0.1, 0.0], 5);
 *
 * // On-chain registration
 * const tx = await hamn.registerPattern('0xabc...', parseEther('0.01'));
 * ```
 */
export class HAMNClient {
  /** Direct access to the off-chain Memory Node client */
  public readonly memory: MemoryClient;
  /** Direct access to the on-chain contract client */
  public readonly contracts: ContractClient;

  constructor(
    memory: MemoryClient,
    contracts: ContractClient,
  ) {
    this.memory = memory;
    this.contracts = contracts;
  }

  /**
   * Factory: create a HAMNClient from config + viem clients.
   *
   * If no viem clients are provided, only off-chain operations will work.
   * Contract reads/writes will throw until you provide publicClient/walletClient.
   */
  static create(
    config: HAMNConfig,
    options?: {
      publicClient?: PublicClient;
      walletClient?: WalletClient;
      timeoutMs?: number;
    },
  ): HAMNClient {
    const memory = new MemoryClient({
      nodeUrl: config.nodeUrl,
      timeoutMs: options?.timeoutMs,
    });

    const contracts = new ContractClient({
      publicClient: options?.publicClient as PublicClient,
      walletClient: options?.walletClient,
      registryAddress: config.registryAddress,
      distributorAddress: config.distributorAddress,
    });

    return new HAMNClient(memory, contracts);
  }

  // ═══════════════════════════════════════════════════════════════════
  //  Off-chain — Memory Node
  // ═══════════════════════════════════════════════════════════════════

  /** Similarity search in the Memory Node. */
  async query(vector: number[], k: number = 1): Promise<QueryResult[]> {
    return this.memory.query(vector, k);
  }

  /** Store a pattern off-chain. */
  async addPattern(pattern: Pattern): Promise<Pattern> {
    return this.memory.addPattern(pattern);
  }

  /** Get an off-chain pattern by ID. */
  async getPattern(id: string): Promise<Pattern> {
    return this.memory.getPattern(id);
  }

  /** Remove an off-chain pattern. */
  async removePattern(id: string): Promise<Pattern> {
    return this.memory.removePattern(id);
  }

  /**
   * Record usage off-chain (reinforcement learning update).
   * @param id      Pattern ID
   * @param reward  Reward signal [0.0, 1.0]
   */
  async recordUsage(id: string, reward: number): Promise<Pattern> {
    return this.memory.recordUsage(id, reward);
  }

  /** Apply temporal decay to all off-chain patterns. */
  async decayAll(): Promise<void> {
    return this.memory.decayAll();
  }

  /** Check if the Memory Node is healthy. */
  async health(): Promise<boolean> {
    return this.memory.health();
  }

  // ═══════════════════════════════════════════════════════════════════
  //  On-chain — Contracts
  // ═══════════════════════════════════════════════════════════════════

  /** Register a pattern on-chain with stake. Returns tx hash. */
  async registerPattern(id: `0x${string}`, stake: bigint): Promise<`0x${string}`> {
    return this.contracts.registerPattern(id, stake);
  }

  /** Get on-chain pattern data. */
  async getOnChainPattern(id: `0x${string}`): Promise<OnChainPattern> {
    return this.contracts.getPattern(id);
  }

  /** Check if a pattern is registered on-chain. */
  async isRegistered(id: `0x${string}`): Promise<boolean> {
    return this.contracts.isRegistered(id);
  }

  /** Record on-chain usage event. Returns tx hash. */
  async recordOnChainUsage(id: `0x${string}`): Promise<`0x${string}`> {
    return this.contracts.recordUsage(id);
  }

  /** Deposit ETH into the reward pool. Returns tx hash. */
  async depositRewards(amount: bigint): Promise<`0x${string}`> {
    return this.contracts.depositRewards(amount);
  }

  /** Claim all pending rewards. Returns tx hash. */
  async claimRewards(): Promise<`0x${string}`> {
    return this.contracts.claimRewards();
  }

  /** Get pending rewards for an address. */
  async getPendingRewards(address: `0x${string}`): Promise<bigint> {
    return this.contracts.getPendingRewards(address);
  }
}
