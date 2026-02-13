import type { PublicClient, WalletClient } from 'viem';
import type { OnChainPattern } from '../types.js';
/** Options for constructing a ContractClient. */
export interface ContractClientOptions {
    /** viem PublicClient for read operations */
    publicClient: PublicClient;
    /** viem WalletClient for write operations (optional — read-only mode if omitted) */
    walletClient?: WalletClient;
    /** PatternRegistry contract address */
    registryAddress: `0x${string}`;
    /** RewardDistributor contract address */
    distributorAddress: `0x${string}`;
}
/**
 * Client for on-chain HAMN contracts on Arbitrum.
 *
 * @example
 * ```ts
 * import { createPublicClient, createWalletClient, http } from 'viem';
 * import { arbitrumSepolia } from 'viem/chains';
 *
 * const contracts = new ContractClient({
 *   publicClient: createPublicClient({ chain: arbitrumSepolia, transport: http() }),
 *   walletClient: createWalletClient({ chain: arbitrumSepolia, transport: http() }),
 *   registryAddress: '0x...',
 *   distributorAddress: '0x...',
 * });
 * ```
 */
export declare class ContractClient {
    private readonly publicClient;
    private readonly walletClient?;
    private readonly registryAddress;
    private readonly distributorAddress;
    constructor(options: ContractClientOptions);
    /** Get full on-chain pattern data by ID. */
    getPattern(id: `0x${string}`): Promise<OnChainPattern>;
    /** Check if a pattern is registered on-chain. */
    isRegistered(id: `0x${string}`): Promise<boolean>;
    /** Get the current minimum stake required for registration. */
    getMinStake(): Promise<bigint>;
    /**
     * Register a new pattern on-chain with a stake.
     * @param id     bytes32 pattern ID
     * @param stake  Stake amount in wei
     * @returns Transaction hash
     */
    registerPattern(id: `0x${string}`, stake: bigint): Promise<`0x${string}`>;
    /**
     * Record an on-chain usage event for a pattern.
     * @returns Transaction hash
     */
    recordUsage(id: `0x${string}`): Promise<`0x${string}`>;
    /** Get pending (claimable) rewards for an address. */
    getPendingRewards(address: `0x${string}`): Promise<bigint>;
    /** Get total rewards ever distributed for a pattern. */
    getTotalRewards(patternId: `0x${string}`): Promise<bigint>;
    /**
     * Deposit ETH into the reward pool.
     * @returns Transaction hash
     */
    depositRewards(amount: bigint): Promise<`0x${string}`>;
    /**
     * Accrue reward for a pattern (onlyOwner).
     * @returns Transaction hash
     */
    accrueReward(patternId: `0x${string}`, baseReward: bigint): Promise<`0x${string}`>;
    /**
     * Claim all pending rewards for the connected wallet.
     * @returns Transaction hash
     */
    claimRewards(): Promise<`0x${string}`>;
    /**
     * Generic writeContract helper that resolves viem's `chain` + `account` requirements.
     * Uses `as any` to bypass strict generic inference — safe because ABI is validated at runtime.
     */
    private writeContract;
}
