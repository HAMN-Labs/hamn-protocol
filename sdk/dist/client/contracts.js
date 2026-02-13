"use strict";
// ─── HAMN Protocol SDK — On-chain Contract Client ─────────────────
// viem-based client for interacting with PatternRegistry & RewardDistributor.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractClient = void 0;
const errors_js_1 = require("../errors.js");
const PatternRegistry_js_1 = require("../abi/PatternRegistry.js");
const RewardDistributor_js_1 = require("../abi/RewardDistributor.js");
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
class ContractClient {
    publicClient;
    walletClient;
    registryAddress;
    distributorAddress;
    constructor(options) {
        this.publicClient = options.publicClient;
        this.walletClient = options.walletClient;
        this.registryAddress = options.registryAddress;
        this.distributorAddress = options.distributorAddress;
    }
    // ═══════════════════════════════════════════════════════════════════
    //  PatternRegistry — Read
    // ═══════════════════════════════════════════════════════════════════
    /** Get full on-chain pattern data by ID. */
    async getPattern(id) {
        try {
            const result = await this.publicClient.readContract({
                address: this.registryAddress,
                abi: PatternRegistry_js_1.PatternRegistryABI,
                functionName: 'getPattern',
                args: [id],
            });
            const p = result;
            return {
                id: p.id,
                owner: p.owner,
                stake: p.stake,
                reputation: Number(p.reputation),
                registrationTime: Number(p.registrationTime),
                usageCount: Number(p.usageCount),
            };
        }
        catch (err) {
            throw new errors_js_1.ContractError(`Failed to get pattern ${id}: ${err instanceof Error ? err.message : String(err)}`, err);
        }
    }
    /** Check if a pattern is registered on-chain. */
    async isRegistered(id) {
        try {
            return (await this.publicClient.readContract({
                address: this.registryAddress,
                abi: PatternRegistry_js_1.PatternRegistryABI,
                functionName: 'isRegistered',
                args: [id],
            }));
        }
        catch (err) {
            throw new errors_js_1.ContractError(`Failed to check registration: ${err instanceof Error ? err.message : String(err)}`, err);
        }
    }
    /** Get the current minimum stake required for registration. */
    async getMinStake() {
        try {
            return (await this.publicClient.readContract({
                address: this.registryAddress,
                abi: PatternRegistry_js_1.PatternRegistryABI,
                functionName: 'minStake',
            }));
        }
        catch (err) {
            throw new errors_js_1.ContractError(`Failed to get min stake: ${err instanceof Error ? err.message : String(err)}`, err);
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
    async registerPattern(id, stake) {
        return this.writeContract(this.registryAddress, PatternRegistry_js_1.PatternRegistryABI, 'registerPattern', [id], stake, 'Failed to register pattern');
    }
    /**
     * Record an on-chain usage event for a pattern.
     * @returns Transaction hash
     */
    async recordUsage(id) {
        return this.writeContract(this.registryAddress, PatternRegistry_js_1.PatternRegistryABI, 'recordUsage', [id], undefined, 'Failed to record usage');
    }
    // ═══════════════════════════════════════════════════════════════════
    //  RewardDistributor — Read
    // ═══════════════════════════════════════════════════════════════════
    /** Get pending (claimable) rewards for an address. */
    async getPendingRewards(address) {
        try {
            return (await this.publicClient.readContract({
                address: this.distributorAddress,
                abi: RewardDistributor_js_1.RewardDistributorABI,
                functionName: 'pendingRewards',
                args: [address],
            }));
        }
        catch (err) {
            throw new errors_js_1.ContractError(`Failed to get pending rewards: ${err instanceof Error ? err.message : String(err)}`, err);
        }
    }
    /** Get total rewards ever distributed for a pattern. */
    async getTotalRewards(patternId) {
        try {
            return (await this.publicClient.readContract({
                address: this.distributorAddress,
                abi: RewardDistributor_js_1.RewardDistributorABI,
                functionName: 'totalRewardsDistributed',
                args: [patternId],
            }));
        }
        catch (err) {
            throw new errors_js_1.ContractError(`Failed to get total rewards: ${err instanceof Error ? err.message : String(err)}`, err);
        }
    }
    // ═══════════════════════════════════════════════════════════════════
    //  RewardDistributor — Write
    // ═══════════════════════════════════════════════════════════════════
    /**
     * Deposit ETH into the reward pool.
     * @returns Transaction hash
     */
    async depositRewards(amount) {
        return this.writeContract(this.distributorAddress, RewardDistributor_js_1.RewardDistributorABI, 'deposit', undefined, amount, 'Failed to deposit rewards');
    }
    /**
     * Accrue reward for a pattern (onlyOwner).
     * @returns Transaction hash
     */
    async accrueReward(patternId, baseReward) {
        return this.writeContract(this.distributorAddress, RewardDistributor_js_1.RewardDistributorABI, 'accrueReward', [patternId, baseReward], undefined, 'Failed to accrue reward');
    }
    /**
     * Claim all pending rewards for the connected wallet.
     * @returns Transaction hash
     */
    async claimRewards() {
        return this.writeContract(this.distributorAddress, RewardDistributor_js_1.RewardDistributorABI, 'claimRewards', undefined, undefined, 'Failed to claim rewards');
    }
    // ── Internal ─────────────────────────────────────────────────────
    /**
     * Generic writeContract helper that resolves viem's `chain` + `account` requirements.
     * Uses `as any` to bypass strict generic inference — safe because ABI is validated at runtime.
     */
    async writeContract(address, abi, functionName, args, value, errorPrefix) {
        if (!this.walletClient) {
            throw new errors_js_1.ContractError('WalletClient is required for write operations. Pass walletClient in ContractClientOptions.');
        }
        try {
            const params = {
                address,
                abi,
                functionName,
                chain: this.walletClient.chain ?? null,
                account: this.walletClient.account ?? undefined,
            };
            if (args)
                params.args = args;
            if (value !== undefined)
                params.value = value;
            const hash = await this.walletClient.writeContract(params);
            return hash;
        }
        catch (err) {
            if (err instanceof errors_js_1.ContractError)
                throw err;
            throw new errors_js_1.ContractError(`${errorPrefix}: ${err instanceof Error ? err.message : String(err)}`, err);
        }
    }
}
exports.ContractClient = ContractClient;
