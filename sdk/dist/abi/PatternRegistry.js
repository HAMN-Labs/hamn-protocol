"use strict";
// ─── PatternRegistry ABI ──────────────────────────────────────────
// Auto-generated from contracts/src/PatternRegistry.sol
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatternRegistryABI = void 0;
exports.PatternRegistryABI = [
    // ── Read ──
    {
        type: 'function',
        name: 'patterns',
        inputs: [{ name: '_id', type: 'bytes32' }],
        outputs: [
            { name: 'id', type: 'bytes32' },
            { name: 'owner', type: 'address' },
            { name: 'stake', type: 'uint256' },
            { name: 'reputation', type: 'uint256' },
            { name: 'registrationTime', type: 'uint256' },
            { name: 'usageCount', type: 'uint256' },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'isRegistered',
        inputs: [{ name: '_id', type: 'bytes32' }],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'minStake',
        inputs: [],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'getPattern',
        inputs: [{ name: '_id', type: 'bytes32' }],
        outputs: [
            {
                name: '',
                type: 'tuple',
                components: [
                    { name: 'id', type: 'bytes32' },
                    { name: 'owner', type: 'address' },
                    { name: 'stake', type: 'uint256' },
                    { name: 'reputation', type: 'uint256' },
                    { name: 'registrationTime', type: 'uint256' },
                    { name: 'usageCount', type: 'uint256' },
                ],
            },
        ],
        stateMutability: 'view',
    },
    {
        type: 'function',
        name: 'MAX_REPUTATION',
        inputs: [],
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
        name: 'registerPattern',
        inputs: [{ name: '_id', type: 'bytes32' }],
        outputs: [],
        stateMutability: 'payable',
    },
    {
        type: 'function',
        name: 'recordUsage',
        inputs: [{ name: '_id', type: 'bytes32' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'slashStake',
        inputs: [
            { name: '_id', type: 'bytes32' },
            { name: '_amount', type: 'uint256' },
            { name: '_reason', type: 'string' },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    {
        type: 'function',
        name: 'setMinStake',
        inputs: [{ name: '_newMinStake', type: 'uint256' }],
        outputs: [],
        stateMutability: 'nonpayable',
    },
    // ── Events ──
    {
        type: 'event',
        name: 'PatternRegistered',
        inputs: [
            { name: 'id', type: 'bytes32', indexed: true },
            { name: 'owner', type: 'address', indexed: true },
            { name: 'stake', type: 'uint256', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'PatternUsed',
        inputs: [
            { name: 'id', type: 'bytes32', indexed: true },
            { name: 'user', type: 'address', indexed: true },
        ],
    },
    {
        type: 'event',
        name: 'StakeSlashed',
        inputs: [
            { name: 'id', type: 'bytes32', indexed: true },
            { name: 'amount', type: 'uint256', indexed: false },
            { name: 'reason', type: 'string', indexed: false },
        ],
    },
    {
        type: 'event',
        name: 'ReputationUpdated',
        inputs: [
            { name: 'id', type: 'bytes32', indexed: true },
            { name: 'newReputation', type: 'uint256', indexed: false },
        ],
    },
];
