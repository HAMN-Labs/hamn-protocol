// ─── RewardDistributor ABI ────────────────────────────────────────
// Auto-generated from contracts/src/RewardDistributor.sol

export const RewardDistributorABI = [
  // ── Read ──
  {
    type: 'function',
    name: 'registry',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'totalRewardsDistributed',
    inputs: [{ name: '_patternId', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pendingRewards',
    inputs: [{ name: '_owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },

  // ── Write ──
  {
    type: 'function',
    name: 'deposit',
    inputs: [],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'accrueReward',
    inputs: [
      { name: '_patternId', type: 'bytes32' },
      { name: '_baseReward', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'claimRewards',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ── Events ──
  {
    type: 'event',
    name: 'RewardAccrued',
    inputs: [
      { name: 'patternId', type: 'bytes32', indexed: true },
      { name: 'owner', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'RewardClaimed',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'FundsDeposited',
    inputs: [
      { name: 'depositor', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const;
