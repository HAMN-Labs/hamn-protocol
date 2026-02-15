// ─── HAMNClient Unit Tests ──────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HAMNClient } from '../hamn.js';
import { MemoryClient } from '../client/memory.js';
import { ContractClient } from '../client/contracts.js';
import { HAMNError } from '../errors.js';

// Mock the sub-clients
vi.mock('../client/memory.js');
vi.mock('../client/contracts.js');

describe('HAMNClient', () => {
  let memoryMock: MemoryClient;
  let contractsMock: ContractClient;
  let client: HAMNClient;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Instantiate mocks
    memoryMock = new MemoryClient({ nodeUrl: 'http://mock-node' });
    contractsMock = new ContractClient({
      publicClient: {} as any,
      registryAddress: '0x0',
      distributorAddress: '0x0',
    });

    // Create client instance with mocked sub-clients
    client = new HAMNClient(memoryMock, contractsMock);
  });

  // ── Initialization ────────────────────────────────────────────────

  describe('create', () => {
    it('should create HAMNClient with MemoryClient and ContractClient', () => {
      const config = {
        nodeUrl: 'http://localhost:8080',
        rpcUrl: 'http://localhost:8545',
        registryAddress: '0x1000000000000000000000000000000000000000' as const,
        distributorAddress: '0x2000000000000000000000000000000000000000' as const,
      };

      const instance = HAMNClient.create(config, {
        timeoutMs: 5000,
      });

      expect(instance).toBeInstanceOf(HAMNClient);
      expect(instance.requestedMode).toBe('stylus');
      expect(instance.mode).toBe('legacy');
      expect(instance.legacyFallbackEnabled).toBe(true);
      expect(instance.legacyFallbackUsed).toBe(true);
      expect(MemoryClient).toHaveBeenCalledWith({
        nodeUrl: config.nodeUrl,
        timeoutMs: 5000,
      });
      expect(ContractClient).toHaveBeenCalledWith({
        publicClient: undefined,
        walletClient: undefined,
        registryAddress: config.registryAddress,
        distributorAddress: config.distributorAddress,
      });
    });

    it('should create client in stylus mode when provided', () => {
      const config = {
        nodeUrl: 'http://localhost:8080',
        rpcUrl: 'http://localhost:8545',
        registryAddress: '0x1000000000000000000000000000000000000000' as const,
        distributorAddress: '0x2000000000000000000000000000000000000000' as const,
        mode: 'stylus' as const,
        stylusVerifierAddress: '0x3000000000000000000000000000000000000000' as const,
      };

      const instance = HAMNClient.create(config);
      expect(instance.mode).toBe('stylus');
      expect(instance.requestedMode).toBe('stylus');
      expect(instance.legacyFallbackUsed).toBe(false);
      expect(instance.stylusVerifierAddress).toBe(config.stylusVerifierAddress);
    });

    it('should throw when stylus mode has no stylusVerifierAddress and fallback is disabled', () => {
      const config = {
        nodeUrl: 'http://localhost:8080',
        rpcUrl: 'http://localhost:8545',
        registryAddress: '0x1000000000000000000000000000000000000000' as const,
        distributorAddress: '0x2000000000000000000000000000000000000000' as const,
        mode: 'stylus' as const,
        legacyFallbackEnabled: false,
      };

      expect(() => HAMNClient.create(config)).toThrow(HAMNError);
    });

    it('should keep stylus mode by default when stylusVerifierAddress is provided', () => {
      const config = {
        nodeUrl: 'http://localhost:8080',
        rpcUrl: 'http://localhost:8545',
        registryAddress: '0x1000000000000000000000000000000000000000' as const,
        distributorAddress: '0x2000000000000000000000000000000000000000' as const,
        stylusVerifierAddress: '0x3000000000000000000000000000000000000000' as const,
      };

      const instance = HAMNClient.create(config);
      expect(instance.requestedMode).toBe('stylus');
      expect(instance.mode).toBe('stylus');
      expect(instance.legacyFallbackUsed).toBe(false);
    });
  });

  // ── Off-chain Delegation (Memory) ─────────────────────────────────

  describe('Memory Delegation', () => {
    it('should delegate query to memory.query', async () => {
      const vector = [0.1, 0.2];
      const k = 5;
      await client.query(vector, k);
      expect(memoryMock.query).toHaveBeenCalledWith(vector, k);
    });

    it('should delegate addPattern to memory.addPattern', async () => {
      const pattern = { id: 'p1', vector: [1], confidence: 1 } as any;
      await client.addPattern(pattern);
      expect(memoryMock.addPattern).toHaveBeenCalledWith(pattern);
    });

    it('should delegate getPattern to memory.getPattern', async () => {
      await client.getPattern('p1');
      expect(memoryMock.getPattern).toHaveBeenCalledWith('p1');
    });

    it('should delegate removePattern to memory.removePattern', async () => {
      await client.removePattern('p1');
      expect(memoryMock.removePattern).toHaveBeenCalledWith('p1');
    });

    it('should delegate recordUsage to memory.recordUsage', async () => {
      await client.recordUsage('p1', 0.5);
      expect(memoryMock.recordUsage).toHaveBeenCalledWith('p1', 0.5);
    });

    it('should delegate decayAll to memory.decayAll', async () => {
      await client.decayAll();
      expect(memoryMock.decayAll).toHaveBeenCalled();
    });

    it('should delegate health to memory.health', async () => {
      await client.health();
      expect(memoryMock.health).toHaveBeenCalled();
    });
  });

  // ── On-chain Delegation (Contracts) ───────────────────────────────

  describe('Contract Delegation', () => {
    const PATTERN_ID = '0x123' as unknown as `0x${string}`;
    const USER_ADDR = '0xabc' as unknown as `0x${string}`;

    it('should delegate registerPattern to contracts.registerPattern', async () => {
      const stake = 100n;
      await client.registerPattern(PATTERN_ID, stake);
      expect(contractsMock.registerPattern).toHaveBeenCalledWith(PATTERN_ID, stake);
    });

    it('should delegate getOnChainPattern to contracts.getPattern', async () => {
      await client.getOnChainPattern(PATTERN_ID);
      expect(contractsMock.getPattern).toHaveBeenCalledWith(PATTERN_ID);
    });

    it('should delegate isRegistered to contracts.isRegistered', async () => {
      await client.isRegistered(PATTERN_ID);
      expect(contractsMock.isRegistered).toHaveBeenCalledWith(PATTERN_ID);
    });

    it('should delegate recordOnChainUsage to contracts.recordUsage', async () => {
      await client.recordOnChainUsage(PATTERN_ID);
      expect(contractsMock.recordUsage).toHaveBeenCalledWith(PATTERN_ID);
    });

    it('should delegate depositRewards to contracts.depositRewards', async () => {
      const amount = 500n;
      await client.depositRewards(amount);
      expect(contractsMock.depositRewards).toHaveBeenCalledWith(amount);
    });

    it('should delegate claimRewards to contracts.claimRewards', async () => {
      await client.claimRewards();
      expect(contractsMock.claimRewards).toHaveBeenCalled();
    });

    it('should delegate getPendingRewards to contracts.getPendingRewards', async () => {
      await client.getPendingRewards(USER_ADDR);
      expect(contractsMock.getPendingRewards).toHaveBeenCalledWith(USER_ADDR);
    });
  });
});
