"use strict";
// ─── HAMNClient Unit Tests ──────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const hamn_js_1 = require("../hamn.js");
const memory_js_1 = require("../client/memory.js");
const contracts_js_1 = require("../client/contracts.js");
// Mock the sub-clients
vitest_1.vi.mock('../client/memory.js');
vitest_1.vi.mock('../client/contracts.js');
(0, vitest_1.describe)('HAMNClient', () => {
    let memoryMock;
    let contractsMock;
    let client;
    (0, vitest_1.beforeEach)(() => {
        // Reset mocks before each test
        vitest_1.vi.clearAllMocks();
        // Instantiate mocks
        memoryMock = new memory_js_1.MemoryClient({ nodeUrl: 'http://mock-node' });
        contractsMock = new contracts_js_1.ContractClient({
            publicClient: {},
            registryAddress: '0x0',
            distributorAddress: '0x0',
        });
        // Create client instance with mocked sub-clients
        client = new hamn_js_1.HAMNClient(memoryMock, contractsMock);
    });
    // ── Initialization ────────────────────────────────────────────────
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('should create HAMNClient with MemoryClient and ContractClient', () => {
            const config = {
                nodeUrl: 'http://localhost:8080',
                rpcUrl: 'http://localhost:8545',
                registryAddress: '0x1000000000000000000000000000000000000000',
                distributorAddress: '0x2000000000000000000000000000000000000000',
            };
            const instance = hamn_js_1.HAMNClient.create(config, {
                timeoutMs: 5000,
            });
            (0, vitest_1.expect)(instance).toBeInstanceOf(hamn_js_1.HAMNClient);
            (0, vitest_1.expect)(memory_js_1.MemoryClient).toHaveBeenCalledWith({
                nodeUrl: config.nodeUrl,
                timeoutMs: 5000,
            });
            (0, vitest_1.expect)(contracts_js_1.ContractClient).toHaveBeenCalledWith({
                publicClient: undefined,
                walletClient: undefined,
                registryAddress: config.registryAddress,
                distributorAddress: config.distributorAddress,
            });
        });
    });
    // ── Off-chain Delegation (Memory) ─────────────────────────────────
    (0, vitest_1.describe)('Memory Delegation', () => {
        (0, vitest_1.it)('should delegate query to memory.query', async () => {
            const vector = [0.1, 0.2];
            const k = 5;
            await client.query(vector, k);
            (0, vitest_1.expect)(memoryMock.query).toHaveBeenCalledWith(vector, k);
        });
        (0, vitest_1.it)('should delegate addPattern to memory.addPattern', async () => {
            const pattern = { id: 'p1', vector: [1], confidence: 1 };
            await client.addPattern(pattern);
            (0, vitest_1.expect)(memoryMock.addPattern).toHaveBeenCalledWith(pattern);
        });
        (0, vitest_1.it)('should delegate getPattern to memory.getPattern', async () => {
            await client.getPattern('p1');
            (0, vitest_1.expect)(memoryMock.getPattern).toHaveBeenCalledWith('p1');
        });
        (0, vitest_1.it)('should delegate removePattern to memory.removePattern', async () => {
            await client.removePattern('p1');
            (0, vitest_1.expect)(memoryMock.removePattern).toHaveBeenCalledWith('p1');
        });
        (0, vitest_1.it)('should delegate recordUsage to memory.recordUsage', async () => {
            await client.recordUsage('p1', 0.5);
            (0, vitest_1.expect)(memoryMock.recordUsage).toHaveBeenCalledWith('p1', 0.5);
        });
        (0, vitest_1.it)('should delegate decayAll to memory.decayAll', async () => {
            await client.decayAll();
            (0, vitest_1.expect)(memoryMock.decayAll).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should delegate health to memory.health', async () => {
            await client.health();
            (0, vitest_1.expect)(memoryMock.health).toHaveBeenCalled();
        });
    });
    // ── On-chain Delegation (Contracts) ───────────────────────────────
    (0, vitest_1.describe)('Contract Delegation', () => {
        const PATTERN_ID = '0x123';
        const USER_ADDR = '0xabc';
        (0, vitest_1.it)('should delegate registerPattern to contracts.registerPattern', async () => {
            const stake = 100n;
            await client.registerPattern(PATTERN_ID, stake);
            (0, vitest_1.expect)(contractsMock.registerPattern).toHaveBeenCalledWith(PATTERN_ID, stake);
        });
        (0, vitest_1.it)('should delegate getOnChainPattern to contracts.getPattern', async () => {
            await client.getOnChainPattern(PATTERN_ID);
            (0, vitest_1.expect)(contractsMock.getPattern).toHaveBeenCalledWith(PATTERN_ID);
        });
        (0, vitest_1.it)('should delegate isRegistered to contracts.isRegistered', async () => {
            await client.isRegistered(PATTERN_ID);
            (0, vitest_1.expect)(contractsMock.isRegistered).toHaveBeenCalledWith(PATTERN_ID);
        });
        (0, vitest_1.it)('should delegate recordOnChainUsage to contracts.recordUsage', async () => {
            await client.recordOnChainUsage(PATTERN_ID);
            (0, vitest_1.expect)(contractsMock.recordUsage).toHaveBeenCalledWith(PATTERN_ID);
        });
        (0, vitest_1.it)('should delegate depositRewards to contracts.depositRewards', async () => {
            const amount = 500n;
            await client.depositRewards(amount);
            (0, vitest_1.expect)(contractsMock.depositRewards).toHaveBeenCalledWith(amount);
        });
        (0, vitest_1.it)('should delegate claimRewards to contracts.claimRewards', async () => {
            await client.claimRewards();
            (0, vitest_1.expect)(contractsMock.claimRewards).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should delegate getPendingRewards to contracts.getPendingRewards', async () => {
            await client.getPendingRewards(USER_ADDR);
            (0, vitest_1.expect)(contractsMock.getPendingRewards).toHaveBeenCalledWith(USER_ADDR);
        });
    });
});
