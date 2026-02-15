"use strict";
// ─── ContractClient Unit Tests ────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const contracts_js_1 = require("../client/contracts.js");
const errors_js_1 = require("../errors.js");
// ── Mock viem clients ──────────────────────────────────────────────
function createMockPublicClient() {
    return {
        readContract: vitest_1.vi.fn(),
    };
}
function createMockWalletClient() {
    return {
        writeContract: vitest_1.vi.fn(),
    };
}
const REGISTRY = '0x1111111111111111111111111111111111111111';
const DISTRIBUTOR = '0x2222222222222222222222222222222222222222';
const PATTERN_ID = '0x00000000000000000000000000000000000000000000000000000000deadbeef';
const USER_ADDR = '0x3333333333333333333333333333333333333333';
const TX_HASH = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
(0, vitest_1.describe)('ContractClient', () => {
    let publicClient;
    let walletClient;
    let client;
    let readOnlyClient;
    (0, vitest_1.beforeEach)(() => {
        publicClient = createMockPublicClient();
        walletClient = createMockWalletClient();
        client = new contracts_js_1.ContractClient({
            publicClient: publicClient,
            walletClient: walletClient,
            registryAddress: REGISTRY,
            distributorAddress: DISTRIBUTOR,
        });
        readOnlyClient = new contracts_js_1.ContractClient({
            publicClient: publicClient,
            registryAddress: REGISTRY,
            distributorAddress: DISTRIBUTOR,
        });
    });
    // ═══════════════════════════════════════════════════════════════════
    //  PatternRegistry — Read
    // ═══════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('getPattern', () => {
        (0, vitest_1.it)('should read and transform on-chain pattern', async () => {
            publicClient.readContract.mockResolvedValueOnce({
                id: PATTERN_ID,
                owner: USER_ADDR,
                stake: BigInt(10_000_000_000_000_000),
                reputation: BigInt(5000),
                registrationTime: BigInt(1700000000),
                usageCount: BigInt(42),
            });
            const pattern = await client.getPattern(PATTERN_ID);
            (0, vitest_1.expect)(pattern).toEqual({
                id: PATTERN_ID,
                owner: USER_ADDR,
                stake: BigInt(10_000_000_000_000_000),
                reputation: 5000,
                registrationTime: 1700000000,
                usageCount: 42,
            });
            (0, vitest_1.expect)(publicClient.readContract).toHaveBeenCalledWith({
                address: REGISTRY,
                abi: vitest_1.expect.any(Array),
                functionName: 'getPattern',
                args: [PATTERN_ID],
            });
        });
        (0, vitest_1.it)('should wrap errors as ContractError', async () => {
            publicClient.readContract.mockRejectedValueOnce(new Error('revert'));
            await (0, vitest_1.expect)(client.getPattern(PATTERN_ID)).rejects.toThrow(errors_js_1.ContractError);
        });
    });
    (0, vitest_1.describe)('isRegistered', () => {
        (0, vitest_1.it)('should return boolean', async () => {
            publicClient.readContract.mockResolvedValueOnce(true);
            (0, vitest_1.expect)(await client.isRegistered(PATTERN_ID)).toBe(true);
        });
    });
    (0, vitest_1.describe)('getMinStake', () => {
        (0, vitest_1.it)('should return bigint', async () => {
            publicClient.readContract.mockResolvedValueOnce(BigInt(10_000_000_000_000_000));
            const stake = await client.getMinStake();
            (0, vitest_1.expect)(stake).toBe(BigInt(10_000_000_000_000_000));
        });
    });
    // ═══════════════════════════════════════════════════════════════════
    //  PatternRegistry — Write
    // ═══════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('registerPattern', () => {
        (0, vitest_1.it)('should send registerPattern tx with value', async () => {
            walletClient.writeContract.mockResolvedValueOnce(TX_HASH);
            const hash = await client.registerPattern(PATTERN_ID, BigInt(10_000_000_000_000_000));
            (0, vitest_1.expect)(hash).toBe(TX_HASH);
            (0, vitest_1.expect)(walletClient.writeContract).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                address: REGISTRY,
                functionName: 'registerPattern',
                args: [PATTERN_ID],
                value: BigInt(10_000_000_000_000_000),
            }));
        });
        (0, vitest_1.it)('should throw ContractError in read-only mode', async () => {
            await (0, vitest_1.expect)(readOnlyClient.registerPattern(PATTERN_ID, BigInt(10_000_000_000_000_000))).rejects.toThrow(errors_js_1.ContractError);
        });
    });
    (0, vitest_1.describe)('recordUsage', () => {
        (0, vitest_1.it)('should call recordUsage on registry', async () => {
            walletClient.writeContract.mockResolvedValueOnce(TX_HASH);
            const hash = await client.recordUsage(PATTERN_ID);
            (0, vitest_1.expect)(hash).toBe(TX_HASH);
        });
    });
    // ═══════════════════════════════════════════════════════════════════
    //  RewardDistributor — Read
    // ═══════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('getPendingRewards', () => {
        (0, vitest_1.it)('should return pending rewards for address', async () => {
            publicClient.readContract.mockResolvedValueOnce(BigInt(500_000));
            const rewards = await client.getPendingRewards(USER_ADDR);
            (0, vitest_1.expect)(rewards).toBe(BigInt(500_000));
        });
    });
    (0, vitest_1.describe)('getTotalRewards', () => {
        (0, vitest_1.it)('should return total distributed rewards', async () => {
            publicClient.readContract.mockResolvedValueOnce(BigInt(1_000_000));
            const total = await client.getTotalRewards(PATTERN_ID);
            (0, vitest_1.expect)(total).toBe(BigInt(1_000_000));
        });
    });
    // ═══════════════════════════════════════════════════════════════════
    //  RewardDistributor — Write
    // ═══════════════════════════════════════════════════════════════════
    (0, vitest_1.describe)('depositRewards', () => {
        (0, vitest_1.it)('should send deposit tx', async () => {
            walletClient.writeContract.mockResolvedValueOnce(TX_HASH);
            const hash = await client.depositRewards(BigInt(1_000_000));
            (0, vitest_1.expect)(hash).toBe(TX_HASH);
            (0, vitest_1.expect)(walletClient.writeContract).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                address: DISTRIBUTOR,
                functionName: 'deposit',
                value: BigInt(1_000_000),
            }));
        });
    });
    (0, vitest_1.describe)('accrueReward', () => {
        (0, vitest_1.it)('should send accrueReward tx', async () => {
            walletClient.writeContract.mockResolvedValueOnce(TX_HASH);
            const hash = await client.accrueReward(PATTERN_ID, BigInt(100));
            (0, vitest_1.expect)(hash).toBe(TX_HASH);
        });
    });
    (0, vitest_1.describe)('claimRewards', () => {
        (0, vitest_1.it)('should send claimRewards tx', async () => {
            walletClient.writeContract.mockResolvedValueOnce(TX_HASH);
            const hash = await client.claimRewards();
            (0, vitest_1.expect)(hash).toBe(TX_HASH);
        });
        (0, vitest_1.it)('should throw in read-only mode', async () => {
            await (0, vitest_1.expect)(readOnlyClient.claimRewards()).rejects.toThrow(errors_js_1.ContractError);
        });
    });
});
