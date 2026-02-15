/**
 * A memory pattern stored in the HAMN network.
 * This matches the Rust `types::Pattern` struct for off-chain operations
 * and the Solidity `PatternRegistry.Pattern` struct for on-chain operations.
 */
export interface Pattern {
    /** Unique identifier (keccak256 hash) */
    id: string;
    /** Embedding vector for similarity search */
    vector: number[];
    /** Trust/quality score [0.0, 1.0] */
    confidence: number;
    /** Number of times this pattern has been used */
    accessCount: number;
    /** UNIX timestamp of last access */
    lastAccessed: number;
    /** UNIX timestamp of creation */
    createdAt: number;
    /** Tags/metadata */
    tags: string[];
}
/**
 * On-chain representation of a pattern (from PatternRegistry.sol).
 */
export interface OnChainPattern {
    /** bytes32 pattern ID */
    id: `0x${string}`;
    /** Owner address */
    owner: `0x${string}`;
    /** Staked amount in wei */
    stake: bigint;
    /** Reputation score [0, 10000] */
    reputation: number;
    /** Registration block timestamp */
    registrationTime: number;
    /** On-chain usage count */
    usageCount: number;
}
/**
 * Result of a similarity query against a Memory Node.
 */
export interface QueryResult {
    pattern: Pattern;
    /** Cosine similarity to the query vector */
    similarity: number;
    /** Combined score: similarity × decayed_confidence */
    score: number;
}
/** SDK operating mode. */
export type HAMNMode = 'legacy' | 'stylus';
/**
 * Configuration for connecting to the HAMN network.
 */
export interface HAMNConfig {
    /** Memory Node HTTP endpoint */
    nodeUrl: string;
    /** Arbitrum RPC URL */
    rpcUrl: string;
    /** PatternRegistry contract address */
    registryAddress: `0x${string}`;
    /** RewardDistributor contract address */
    distributorAddress: `0x${string}`;
    /** SDK mode (default: stylus). */
    mode?: HAMNMode;
    /** Stylus verifier address (required when mode = "stylus"). */
    stylusVerifierAddress?: `0x${string}`;
    /** Allow fallback to legacy mode when stylus config is incomplete. Default: true. */
    legacyFallbackEnabled?: boolean;
    /** Chain ID (default: 421614 for Arbitrum Sepolia) */
    chainId?: number;
}
/**
 * Hyperparameters for the mathematical model.
 */
export interface MathParams {
    /** Learning rate for reinforcement (α). Default: 0.1 */
    alpha: number;
    /** Decay constant for freshness (λ). Default: 0.001 */
    lambda: number;
}
