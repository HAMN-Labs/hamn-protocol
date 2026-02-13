"use strict";
// ─── HAMN Protocol SDK — Memory Node Client ──────────────────────
// HTTP client for interacting with the off-chain Rust Memory Node.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryClient = void 0;
const errors_js_1 = require("../errors.js");
/**
 * Client for the off-chain HAMN Memory Node (Rust engine).
 *
 * @example
 * ```ts
 * const memory = new MemoryClient({ nodeUrl: 'http://localhost:8080' });
 * const results = await memory.query([0.9, 0.1, 0.0], 5);
 * ```
 */
class MemoryClient {
    baseUrl;
    timeoutMs;
    constructor(options) {
        // Remove trailing slash
        this.baseUrl = options.nodeUrl.replace(/\/+$/, '');
        this.timeoutMs = options.timeoutMs ?? 10_000;
    }
    // ── Queries ──────────────────────────────────────────────────────
    /**
     * Similarity search: find top-K patterns matching the query vector.
     * @param vector  Query embedding vector
     * @param k       Number of results to return (default: 1)
     */
    async query(vector, k = 1) {
        return this.post('/query', { vector, k });
    }
    // ── Pattern CRUD ─────────────────────────────────────────────────
    /** Store a new pattern in the Memory Node. */
    async addPattern(pattern) {
        return this.post('/patterns', pattern);
    }
    /** Retrieve a pattern by its ID. */
    async getPattern(id) {
        return this.get(`/patterns/${encodeURIComponent(id)}`);
    }
    /** Remove a pattern by its ID. Returns the removed pattern. */
    async removePattern(id) {
        return this.delete(`/patterns/${encodeURIComponent(id)}`);
    }
    // ── Usage & Decay ────────────────────────────────────────────────
    /**
     * Record a usage event for a pattern.
     * Increments access_count and applies reinforcement learning update.
     * @param id      Pattern ID
     * @param reward  Reward signal [0.0, 1.0]
     */
    async recordUsage(id, reward) {
        return this.post(`/patterns/${encodeURIComponent(id)}/usage`, { reward });
    }
    /** Apply temporal decay to all patterns' confidence values. */
    async decayAll() {
        await this.post('/decay', {});
    }
    // ── Administration ───────────────────────────────────────────────
    /** Get the current hyperparameters of the Memory Node. */
    async getParams() {
        return this.get('/params');
    }
    /** Health check. Returns true if the node is responsive. */
    async health() {
        try {
            await this.get('/health');
            return true;
        }
        catch {
            return false;
        }
    }
    // ── Internal HTTP helpers ────────────────────────────────────────
    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body !== undefined ? JSON.stringify(body) : undefined,
                signal: controller.signal,
            });
            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new errors_js_1.MemoryNodeError(`Memory Node ${method} ${path}: ${response.status} — ${text}`, response.status);
            }
            // 204 No Content
            if (response.status === 204) {
                return undefined;
            }
            return (await response.json());
        }
        catch (err) {
            if (err instanceof errors_js_1.MemoryNodeError)
                throw err;
            throw new errors_js_1.MemoryNodeError(`Memory Node ${method} ${path} failed: ${err instanceof Error ? err.message : String(err)}`, undefined, err);
        }
        finally {
            clearTimeout(timer);
        }
    }
    get(path) {
        return this.request('GET', path);
    }
    post(path, body) {
        return this.request('POST', path, body);
    }
    delete(path) {
        return this.request('DELETE', path);
    }
}
exports.MemoryClient = MemoryClient;
