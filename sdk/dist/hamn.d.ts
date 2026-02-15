import type { PublicClient, WalletClient } from 'viem';
import type { HAMNConfig, HAMNMode, Pattern, QueryResult, OnChainPattern } from './types.js';
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
export declare class HAMNClient {
    /** Direct access to the off-chain Memory Node client */
    readonly memory: MemoryClient;
    /** Direct access to the on-chain contract client */
    readonly contracts: ContractClient;
    /** Active SDK mode */
    readonly mode: HAMNMode;
    /** Requested mode from config before fallback handling. */
    readonly requestedMode: HAMNMode;
    /** Optional Stylus verifier address */
    readonly stylusVerifierAddress?: `0x${string}`;
    /** Whether fallback from stylus -> legacy is enabled. */
    readonly legacyFallbackEnabled: boolean;
    /** True when requested stylus mode was downgraded to legacy fallback. */
    readonly legacyFallbackUsed: boolean;
    constructor(memory: MemoryClient, contracts: ContractClient, mode?: HAMNMode, requestedMode?: HAMNMode, stylusVerifierAddress?: `0x${string}`, legacyFallbackEnabled?: boolean, legacyFallbackUsed?: boolean);
    /**
     * Factory: create a HAMNClient from config + viem clients.
     *
     * If no viem clients are provided, only off-chain operations will work.
     * Contract reads/writes will throw until you provide publicClient/walletClient.
     */
    static create(config: HAMNConfig, options?: {
        publicClient?: PublicClient;
        walletClient?: WalletClient;
        timeoutMs?: number;
    }): HAMNClient;
    /** Similarity search in the Memory Node. */
    query(vector: number[], k?: number): Promise<QueryResult[]>;
    /** Store a pattern off-chain. */
    addPattern(pattern: Pattern): Promise<Pattern>;
    /** Get an off-chain pattern by ID. */
    getPattern(id: string): Promise<Pattern>;
    /** Remove an off-chain pattern. */
    removePattern(id: string): Promise<Pattern>;
    /**
     * Record usage off-chain (reinforcement learning update).
     * @param id      Pattern ID
     * @param reward  Reward signal [0.0, 1.0]
     */
    recordUsage(id: string, reward: number): Promise<Pattern>;
    /** Apply temporal decay to all off-chain patterns. */
    decayAll(): Promise<void>;
    /** Check if the Memory Node is healthy. */
    health(): Promise<boolean>;
    /** Register a pattern on-chain with stake. Returns tx hash. */
    registerPattern(id: `0x${string}`, stake: bigint): Promise<`0x${string}`>;
    /** Get on-chain pattern data. */
    getOnChainPattern(id: `0x${string}`): Promise<OnChainPattern>;
    /** Check if a pattern is registered on-chain. */
    isRegistered(id: `0x${string}`): Promise<boolean>;
    /** Record on-chain usage event. Returns tx hash. */
    recordOnChainUsage(id: `0x${string}`): Promise<`0x${string}`>;
    /** Deposit ETH into the reward pool. Returns tx hash. */
    depositRewards(amount: bigint): Promise<`0x${string}`>;
    /** Claim all pending rewards. Returns tx hash. */
    claimRewards(): Promise<`0x${string}`>;
    /** Get pending rewards for an address. */
    getPendingRewards(address: `0x${string}`): Promise<bigint>;
}
