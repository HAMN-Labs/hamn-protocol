import type { Pattern, QueryResult, MathParams } from '../types.js';
/** Options for constructing a MemoryClient. */
export interface MemoryClientOptions {
    /** Memory Node HTTP endpoint, e.g. "http://localhost:8080" */
    nodeUrl: string;
    /** Request timeout in milliseconds. Default: 10_000 */
    timeoutMs?: number;
}
/**
 * Client for the off-chain HAMN Memory Node (Rust engine).
 *
 * @example
 * ```ts
 * const memory = new MemoryClient({ nodeUrl: 'http://localhost:8080' });
 * const results = await memory.query([0.9, 0.1, 0.0], 5);
 * ```
 */
export declare class MemoryClient {
    private readonly baseUrl;
    private readonly timeoutMs;
    constructor(options: MemoryClientOptions);
    /**
     * Similarity search: find top-K patterns matching the query vector.
     * @param vector  Query embedding vector
     * @param k       Number of results to return (default: 1)
     */
    query(vector: number[], k?: number): Promise<QueryResult[]>;
    /** Store a new pattern in the Memory Node. */
    addPattern(pattern: Pattern): Promise<Pattern>;
    /** Retrieve a pattern by its ID. */
    getPattern(id: string): Promise<Pattern>;
    /** Remove a pattern by its ID. Returns the removed pattern. */
    removePattern(id: string): Promise<Pattern>;
    /**
     * Record a usage event for a pattern.
     * Increments access_count and applies reinforcement learning update.
     * @param id      Pattern ID
     * @param reward  Reward signal [0.0, 1.0]
     */
    recordUsage(id: string, reward: number): Promise<Pattern>;
    /** Apply temporal decay to all patterns' confidence values. */
    decayAll(): Promise<void>;
    /** Get the current hyperparameters of the Memory Node. */
    getParams(): Promise<MathParams>;
    /** Health check. Returns true if the node is responsive. */
    health(): Promise<boolean>;
    private request;
    private get;
    private post;
    private delete;
}
