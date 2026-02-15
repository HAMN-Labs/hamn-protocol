"use strict";
// ─── HAMN Protocol SDK — Unified Client ───────────────────────────
// Facade that combines MemoryClient + ContractClient into one API.
Object.defineProperty(exports, "__esModule", { value: true });
exports.HAMNClient = void 0;
const memory_js_1 = require("./client/memory.js");
const contracts_js_1 = require("./client/contracts.js");
const errors_js_1 = require("./errors.js");
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
class HAMNClient {
    /** Direct access to the off-chain Memory Node client */
    memory;
    /** Direct access to the on-chain contract client */
    contracts;
    /** Active SDK mode */
    mode;
    /** Requested mode from config before fallback handling. */
    requestedMode;
    /** Optional Stylus verifier address */
    stylusVerifierAddress;
    /** Whether fallback from stylus -> legacy is enabled. */
    legacyFallbackEnabled;
    /** True when requested stylus mode was downgraded to legacy fallback. */
    legacyFallbackUsed;
    constructor(memory, contracts, mode = 'stylus', requestedMode = mode, stylusVerifierAddress, legacyFallbackEnabled = true, legacyFallbackUsed = false) {
        this.memory = memory;
        this.contracts = contracts;
        this.mode = mode;
        this.requestedMode = requestedMode;
        this.stylusVerifierAddress = stylusVerifierAddress;
        this.legacyFallbackEnabled = legacyFallbackEnabled;
        this.legacyFallbackUsed = legacyFallbackUsed;
    }
    /**
     * Factory: create a HAMNClient from config + viem clients.
     *
     * If no viem clients are provided, only off-chain operations will work.
     * Contract reads/writes will throw until you provide publicClient/walletClient.
     */
    static create(config, options) {
        const requestedMode = config.mode ?? 'stylus';
        const legacyFallbackEnabled = config.legacyFallbackEnabled ?? true;
        let mode = requestedMode;
        const stylusVerifierAddress = config.stylusVerifierAddress;
        let legacyFallbackUsed = false;
        if (requestedMode === 'stylus' && !stylusVerifierAddress) {
            if (legacyFallbackEnabled) {
                mode = 'legacy';
                legacyFallbackUsed = true;
            }
            else {
                throw new errors_js_1.HAMNError('stylusVerifierAddress is required when mode is "stylus" and legacyFallbackEnabled is false.');
            }
        }
        const memory = new memory_js_1.MemoryClient({
            nodeUrl: config.nodeUrl,
            timeoutMs: options?.timeoutMs,
        });
        const contracts = new contracts_js_1.ContractClient({
            publicClient: options?.publicClient,
            walletClient: options?.walletClient,
            registryAddress: config.registryAddress,
            distributorAddress: config.distributorAddress,
        });
        return new HAMNClient(memory, contracts, mode, requestedMode, stylusVerifierAddress, legacyFallbackEnabled, legacyFallbackUsed);
    }
    // ═══════════════════════════════════════════════════════════════════
    //  Off-chain — Memory Node
    // ═══════════════════════════════════════════════════════════════════
    /** Similarity search in the Memory Node. */
    async query(vector, k = 1) {
        return this.memory.query(vector, k);
    }
    /** Store a pattern off-chain. */
    async addPattern(pattern) {
        return this.memory.addPattern(pattern);
    }
    /** Get an off-chain pattern by ID. */
    async getPattern(id) {
        return this.memory.getPattern(id);
    }
    /** Remove an off-chain pattern. */
    async removePattern(id) {
        return this.memory.removePattern(id);
    }
    /**
     * Record usage off-chain (reinforcement learning update).
     * @param id      Pattern ID
     * @param reward  Reward signal [0.0, 1.0]
     */
    async recordUsage(id, reward) {
        return this.memory.recordUsage(id, reward);
    }
    /** Apply temporal decay to all off-chain patterns. */
    async decayAll() {
        return this.memory.decayAll();
    }
    /** Check if the Memory Node is healthy. */
    async health() {
        return this.memory.health();
    }
    // ═══════════════════════════════════════════════════════════════════
    //  On-chain — Contracts
    // ═══════════════════════════════════════════════════════════════════
    /** Register a pattern on-chain with stake. Returns tx hash. */
    async registerPattern(id, stake) {
        return this.contracts.registerPattern(id, stake);
    }
    /** Get on-chain pattern data. */
    async getOnChainPattern(id) {
        return this.contracts.getPattern(id);
    }
    /** Check if a pattern is registered on-chain. */
    async isRegistered(id) {
        return this.contracts.isRegistered(id);
    }
    /** Record on-chain usage event. Returns tx hash. */
    async recordOnChainUsage(id) {
        return this.contracts.recordUsage(id);
    }
    /** Deposit ETH into the reward pool. Returns tx hash. */
    async depositRewards(amount) {
        return this.contracts.depositRewards(amount);
    }
    /** Claim all pending rewards. Returns tx hash. */
    async claimRewards() {
        return this.contracts.claimRewards();
    }
    /** Get pending rewards for an address. */
    async getPendingRewards(address) {
        return this.contracts.getPendingRewards(address);
    }
}
exports.HAMNClient = HAMNClient;
