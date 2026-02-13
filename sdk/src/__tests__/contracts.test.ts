// ─── ContractClient Unit Tests ────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContractClient } from '../client/contracts.js';
import { ContractError } from '../errors.js';

// ── Mock viem clients ──────────────────────────────────────────────

function createMockPublicClient() {
  return {
    readContract: vi.fn(),
  };
}

function createMockWalletClient() {
  return {
    writeContract: vi.fn(),
  };
}

const REGISTRY = '0x1111111111111111111111111111111111111111' as const;
const DISTRIBUTOR = '0x2222222222222222222222222222222222222222' as const;
const PATTERN_ID = '0x00000000000000000000000000000000000000000000000000000000deadbeef' as const;
const USER_ADDR = '0x3333333333333333333333333333333333333333' as const;
const TX_HASH = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890' as const;

describe('ContractClient', () => {
  let publicClient: ReturnType<typeof createMockPublicClient>;
  let walletClient: ReturnType<typeof createMockWalletClient>;
  let client: ContractClient;
  let readOnlyClient: ContractClient;

  beforeEach(() => {
    publicClient = createMockPublicClient();
    walletClient = createMockWalletClient();

    client = new ContractClient({
      publicClient: publicClient as any,
      walletClient: walletClient as any,
      registryAddress: REGISTRY,
      distributorAddress: DISTRIBUTOR,
    });

    readOnlyClient = new ContractClient({
      publicClient: publicClient as any,
      registryAddress: REGISTRY,
      distributorAddress: DISTRIBUTOR,
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  PatternRegistry — Read
  // ═══════════════════════════════════════════════════════════════════

  describe('getPattern', () => {
    it('should read and transform on-chain pattern', async () => {
      publicClient.readContract.mockResolvedValueOnce({
        id: PATTERN_ID,
        owner: USER_ADDR,
        stake: BigInt(10_000_000_000_000_000),
        reputation: BigInt(5000),
        registrationTime: BigInt(1700000000),
        usageCount: BigInt(42),
      });

      const pattern = await client.getPattern(PATTERN_ID);

      expect(pattern).toEqual({
        id: PATTERN_ID,
        owner: USER_ADDR,
        stake: BigInt(10_000_000_000_000_000),
        reputation: 5000,
        registrationTime: 1700000000,
        usageCount: 42,
      });

      expect(publicClient.readContract).toHaveBeenCalledWith({
        address: REGISTRY,
        abi: expect.any(Array),
        functionName: 'getPattern',
        args: [PATTERN_ID],
      });
    });

    it('should wrap errors as ContractError', async () => {
      publicClient.readContract.mockRejectedValueOnce(new Error('revert'));
      await expect(client.getPattern(PATTERN_ID)).rejects.toThrow(ContractError);
    });
  });

  describe('isRegistered', () => {
    it('should return boolean', async () => {
      publicClient.readContract.mockResolvedValueOnce(true);
      expect(await client.isRegistered(PATTERN_ID)).toBe(true);
    });
  });

  describe('getMinStake', () => {
    it('should return bigint', async () => {
      publicClient.readContract.mockResolvedValueOnce(BigInt(10_000_000_000_000_000));
      const stake = await client.getMinStake();
      expect(stake).toBe(BigInt(10_000_000_000_000_000));
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  PatternRegistry — Write
  // ═══════════════════════════════════════════════════════════════════

  describe('registerPattern', () => {
    it('should send registerPattern tx with value', async () => {
      walletClient.writeContract.mockResolvedValueOnce(TX_HASH);

      const hash = await client.registerPattern(PATTERN_ID, BigInt(10_000_000_000_000_000));

      expect(hash).toBe(TX_HASH);
      expect(walletClient.writeContract).toHaveBeenCalledWith({
        address: REGISTRY,
        abi: expect.any(Array),
        functionName: 'registerPattern',
        args: [PATTERN_ID],
        value: BigInt(10_000_000_000_000_000),
      });
    });

    it('should throw ContractError in read-only mode', async () => {
      await expect(
        readOnlyClient.registerPattern(PATTERN_ID, BigInt(10_000_000_000_000_000)),
      ).rejects.toThrow(ContractError);
    });
  });

  describe('recordUsage', () => {
    it('should call recordUsage on registry', async () => {
      walletClient.writeContract.mockResolvedValueOnce(TX_HASH);
      const hash = await client.recordUsage(PATTERN_ID);
      expect(hash).toBe(TX_HASH);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  RewardDistributor — Read
  // ═══════════════════════════════════════════════════════════════════

  describe('getPendingRewards', () => {
    it('should return pending rewards for address', async () => {
      publicClient.readContract.mockResolvedValueOnce(BigInt(500_000));
      const rewards = await client.getPendingRewards(USER_ADDR);
      expect(rewards).toBe(BigInt(500_000));
    });
  });

  describe('getTotalRewards', () => {
    it('should return total distributed rewards', async () => {
      publicClient.readContract.mockResolvedValueOnce(BigInt(1_000_000));
      const total = await client.getTotalRewards(PATTERN_ID);
      expect(total).toBe(BigInt(1_000_000));
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  //  RewardDistributor — Write
  // ═══════════════════════════════════════════════════════════════════

  describe('depositRewards', () => {
    it('should send deposit tx', async () => {
      walletClient.writeContract.mockResolvedValueOnce(TX_HASH);
      const hash = await client.depositRewards(BigInt(1_000_000));
      expect(hash).toBe(TX_HASH);
      expect(walletClient.writeContract).toHaveBeenCalledWith({
        address: DISTRIBUTOR,
        abi: expect.any(Array),
        functionName: 'deposit',
        value: BigInt(1_000_000),
      });
    });
  });

  describe('accrueReward', () => {
    it('should send accrueReward tx', async () => {
      walletClient.writeContract.mockResolvedValueOnce(TX_HASH);
      const hash = await client.accrueReward(PATTERN_ID, BigInt(100));
      expect(hash).toBe(TX_HASH);
    });
  });

  describe('claimRewards', () => {
    it('should send claimRewards tx', async () => {
      walletClient.writeContract.mockResolvedValueOnce(TX_HASH);
      const hash = await client.claimRewards();
      expect(hash).toBe(TX_HASH);
    });

    it('should throw in read-only mode', async () => {
      await expect(readOnlyClient.claimRewards()).rejects.toThrow(ContractError);
    });
  });
});
