// ─── HAMN Protocol SDK — On-chain Contract Client ─────────────────
// viem-based client for interacting with PatternRegistry & RewardDistributor.

import {
  type PublicClient,
  type WalletClient,
  type GetContractReturnType,
  getContract,
} from 'viem';

import type { OnChainPattern } from '../types.js';
import { ContractError } from '../errors.js';
import { PatternRegistryABI } from '../abi/PatternRegistry.js';
import { RewardDistributorABI } from '../abi/RewardDistributor.js';

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
export class ContractClient {
  private readonly publicClient: PublicClient;
  private readonly walletClient?: WalletClient;
  private readonly registryAddress: `0x${string}`;
  private readonly distributorAddress: `0x${string}`;

  constructor(options: ContractClientOptions) {
    this.publicClient = options.publicClient;
    this.walletClient = options.walletClient;
    this.registryAddress = options.registryAddress;
    this.distributorAddress = options.distributorAddress;
  }

  // ═══════════════════════════════════════════════════════════════════
  //  PatternRegistry — Read
  // ═══════════════════════════════════════════════════════════════════

  /** Get full on-chain pattern data by ID. */
  async getPattern(id: `0x${string}`): Promise<OnChainPattern> {
    try {
      const result = await this.publicClient.readContract({
        address: this.registryAddress,
        abi: PatternRegistryABI,
        functionName: 'getPattern',
        args: [id],
      });

      const p = result as {
        id: `0x${string}`;
        owner: `0x${string}`;
        stake: bigint;
        reputation: bigint;
        registrationTime: bigint;
        usageCount: bigint;
      };

      return {
        id: p.id,
        owner: p.owner,
        stake: p.stake,
        reputation: Number(p.reputation),
        registrationTime: Number(p.registrationTime),
        usageCount: Number(p.usageCount),
      };
    } catch (err) {
      throw new ContractError(
        `Failed to get pattern ${id}: ${err instanceof Error ? err.message : String(err)}`,
        err,
      );
    }
  }

  /** Check if a pattern is registered on-chain. */
  async isRegistered(id: `0x${string}`): Promise<boolean> {
    try {
      return (await this.publicClient.readContract({
        address: this.registryAddress,
        abi: PatternRegistryABI,
        functionName: 'isRegistered',
        args: [id],
      })) as boolean;
    } catch (err) {
      throw new ContractError(
        `Failed to check registration: ${err instanceof Error ? err.message : String(err)}`,
        err,
      );
    }
  }

  /** Get the current minimum stake required for registration. */
  async getMinStake(): Promise<bigint> {
    try {
      return (await this.publicClient.readContract({
        address: this.registryAddress,
        abi: PatternRegistryABI,
        functionName: 'minStake',
      })) as bigint;
    } catch (err) {
      throw new ContractError(
        `Failed to get min stake: ${err instanceof Error ? err.message : String(err)}`,
        err,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  PatternRegistry — Write
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Register a new pattern on-chain with a stake.
   * @param id     bytes32 pattern ID
   * @param stake  Stake amount in wei
   * @returns Transaction hash
   */
  async registerPattern(id: `0x${string}`, stake: bigint): Promise<`0x${string}`> {
    this.requireWallet();
    try {
      const hash = await this.walletClient!.writeContract({
        address: this.registryAddress,
        abi: PatternRegistryABI,
        functionName: 'registerPattern',
        args: [id],
        value: stake,
      });
      return hash;
    } catch (err) {
      throw new ContractError(
        `Failed to register pattern: ${err instanceof Error ? err.message : String(err)}`,
        err,
      );
    }
  }

  /**
   * Record an on-chain usage event for a pattern.
   * @returns Transaction hash
   */
  async recordUsage(id: `0x${string}`): Promise<`0x${string}`> {
    this.requireWallet();
    try {
      const hash = await this.walletClient!.writeContract({
        address: this.registryAddress,
        abi: PatternRegistryABI,
        functionName: 'recordUsage',
        args: [id],
      });
      return hash;
    } catch (err) {
      throw new ContractError(
        `Failed to record usage: ${err instanceof Error ? err.message : String(err)}`,
        err,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  RewardDistributor — Read
  // ═══════════════════════════════════════════════════════════════════

  /** Get pending (claimable) rewards for an address. */
  async getPendingRewards(address: `0x${string}`): Promise<bigint> {
    try {
      return (await this.publicClient.readContract({
        address: this.distributorAddress,
        abi: RewardDistributorABI,
        functionName: 'pendingRewards',
        args: [address],
      })) as bigint;
    } catch (err) {
      throw new ContractError(
        `Failed to get pending rewards: ${err instanceof Error ? err.message : String(err)}`,
        err,
      );
    }
  }

  /** Get total rewards ever distributed for a pattern. */
  async getTotalRewards(patternId: `0x${string}`): Promise<bigint> {
    try {
      return (await this.publicClient.readContract({
        address: this.distributorAddress,
        abi: RewardDistributorABI,
        functionName: 'totalRewardsDistributed',
        args: [patternId],
      })) as bigint;
    } catch (err) {
      throw new ContractError(
        `Failed to get total rewards: ${err instanceof Error ? err.message : String(err)}`,
        err,
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  //  RewardDistributor — Write
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Deposit ETH into the reward pool.
   * @returns Transaction hash
   */
  async depositRewards(amount: bigint): Promise<`0x${string}`> {
    this.requireWallet();
    try {
      const hash = await this.walletClient!.writeContract({
        address: this.distributorAddress,
        abi: RewardDistributorABI,
        functionName: 'deposit',
        value: amount,
      });
      return hash;
    } catch (err) {
      throw new ContractError(
        `Failed to deposit rewards: ${err instanceof Error ? err.message : String(err)}`,
        err,
      );
    }
  }

  /**
   * Accrue reward for a pattern (onlyOwner).
   * @returns Transaction hash
   */
  async accrueReward(patternId: `0x${string}`, baseReward: bigint): Promise<`0x${string}`> {
    this.requireWallet();
    try {
      const hash = await this.walletClient!.writeContract({
        address: this.distributorAddress,
        abi: RewardDistributorABI,
        functionName: 'accrueReward',
        args: [patternId, baseReward],
      });
      return hash;
    } catch (err) {
      throw new ContractError(
        `Failed to accrue reward: ${err instanceof Error ? err.message : String(err)}`,
        err,
      );
    }
  }

  /**
   * Claim all pending rewards for the connected wallet.
   * @returns Transaction hash
   */
  async claimRewards(): Promise<`0x${string}`> {
    this.requireWallet();
    try {
      const hash = await this.walletClient!.writeContract({
        address: this.distributorAddress,
        abi: RewardDistributorABI,
        functionName: 'claimRewards',
      });
      return hash;
    } catch (err) {
      throw new ContractError(
        `Failed to claim rewards: ${err instanceof Error ? err.message : String(err)}`,
        err,
      );
    }
  }

  // ── Internal ─────────────────────────────────────────────────────

  private requireWallet(): void {
    if (!this.walletClient) {
      throw new ContractError(
        'WalletClient is required for write operations. Pass walletClient in ContractClientOptions.',
      );
    }
  }
}
