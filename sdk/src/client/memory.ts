// ─── HAMN Protocol SDK — Memory Node Client ──────────────────────
// HTTP client for interacting with the off-chain Rust Memory Node.

import type { Pattern, QueryResult, MathParams } from '../types.js';
import { MemoryNodeError } from '../errors.js';

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
export class MemoryClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(options: MemoryClientOptions) {
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
  async query(vector: number[], k: number = 1): Promise<QueryResult[]> {
    return this.post<QueryResult[]>('/query', { vector, k });
  }

  // ── Pattern CRUD ─────────────────────────────────────────────────

  /** Store a new pattern in the Memory Node. */
  async addPattern(pattern: Pattern): Promise<Pattern> {
    return this.post<Pattern>('/patterns', pattern);
  }

  /** Retrieve a pattern by its ID. */
  async getPattern(id: string): Promise<Pattern> {
    return this.get<Pattern>(`/patterns/${encodeURIComponent(id)}`);
  }

  /** Remove a pattern by its ID. Returns the removed pattern. */
  async removePattern(id: string): Promise<Pattern> {
    return this.delete<Pattern>(`/patterns/${encodeURIComponent(id)}`);
  }

  // ── Usage & Decay ────────────────────────────────────────────────

  /**
   * Record a usage event for a pattern.
   * Increments access_count and applies reinforcement learning update.
   * @param id      Pattern ID
   * @param reward  Reward signal [0.0, 1.0]
   */
  async recordUsage(id: string, reward: number): Promise<Pattern> {
    return this.post<Pattern>(
      `/patterns/${encodeURIComponent(id)}/usage`,
      { reward },
    );
  }

  /** Apply temporal decay to all patterns' confidence values. */
  async decayAll(): Promise<void> {
    await this.post<void>('/decay', {});
  }

  // ── Administration ───────────────────────────────────────────────

  /** Get the current hyperparameters of the Memory Node. */
  async getParams(): Promise<MathParams> {
    return this.get<MathParams>('/params');
  }

  /** Health check. Returns true if the node is responsive. */
  async health(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  // ── Internal HTTP helpers ────────────────────────────────────────

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
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
        throw new MemoryNodeError(
          `Memory Node ${method} ${path}: ${response.status} — ${text}`,
          response.status,
        );
      }

      // 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof MemoryNodeError) throw err;
      throw new MemoryNodeError(
        `Memory Node ${method} ${path} failed: ${err instanceof Error ? err.message : String(err)}`,
        undefined,
        err,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  private get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  private post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  private delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}
