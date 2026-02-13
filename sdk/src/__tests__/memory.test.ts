// ─── MemoryClient Unit Tests ──────────────────────────────────────

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryClient } from '../client/memory.js';
import { MemoryNodeError } from '../errors.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  };
}

describe('MemoryClient', () => {
  let client: MemoryClient;

  beforeEach(() => {
    client = new MemoryClient({ nodeUrl: 'http://localhost:8080' });
    mockFetch.mockReset();
  });

  // ── query ────────────────────────────────────────────────────────

  describe('query', () => {
    it('should POST /query with vector and k', async () => {
      const expected = [
        { pattern: { id: 'p1' }, similarity: 0.95, score: 0.9 },
      ];
      mockFetch.mockResolvedValueOnce(jsonResponse(expected));

      const results = await client.query([1.0, 0.0], 3);

      expect(mockFetch).toHaveBeenCalledOnce();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:8080/query');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toEqual({ vector: [1.0, 0.0], k: 3 });
      expect(results).toEqual(expected);
    });

    it('should default k to 1', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse([]));
      await client.query([0.5, 0.5]);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.k).toBe(1);
    });
  });

  // ── addPattern ───────────────────────────────────────────────────

  describe('addPattern', () => {
    it('should POST /patterns with pattern data', async () => {
      const pattern = {
        id: 'test-1',
        vector: [1.0, 0.0],
        confidence: 0.9,
        accessCount: 0,
        lastAccessed: 1000,
        createdAt: 1000,
        tags: ['defi'],
      };
      mockFetch.mockResolvedValueOnce(jsonResponse(pattern, 201));

      const result = await client.addPattern(pattern);

      expect(result).toEqual(pattern);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toBe('http://localhost:8080/patterns');
      expect(opts.method).toBe('POST');
    });
  });

  // ── getPattern ───────────────────────────────────────────────────

  describe('getPattern', () => {
    it('should GET /patterns/:id', async () => {
      const pattern = { id: 'abc', vector: [1.0], confidence: 0.5 };
      mockFetch.mockResolvedValueOnce(jsonResponse(pattern));

      const result = await client.getPattern('abc');

      expect(result).toEqual(pattern);
      expect(mockFetch.mock.calls[0][0]).toBe('http://localhost:8080/patterns/abc');
      expect(mockFetch.mock.calls[0][1].method).toBe('GET');
    });
  });

  // ── removePattern ────────────────────────────────────────────────

  describe('removePattern', () => {
    it('should DELETE /patterns/:id', async () => {
      const removed = { id: 'abc' };
      mockFetch.mockResolvedValueOnce(jsonResponse(removed));

      const result = await client.removePattern('abc');

      expect(result).toEqual(removed);
      expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
    });
  });

  // ── recordUsage ──────────────────────────────────────────────────

  describe('recordUsage', () => {
    it('should POST /patterns/:id/usage with reward', async () => {
      const updated = { id: 'p1', confidence: 0.8 };
      mockFetch.mockResolvedValueOnce(jsonResponse(updated));

      const result = await client.recordUsage('p1', 0.9);

      expect(result).toEqual(updated);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body).toEqual({ reward: 0.9 });
    });
  });

  // ── decayAll ─────────────────────────────────────────────────────

  describe('decayAll', () => {
    it('should POST /decay', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(null, 204));
      await client.decayAll();

      expect(mockFetch.mock.calls[0][0]).toBe('http://localhost:8080/decay');
      expect(mockFetch.mock.calls[0][1].method).toBe('POST');
    });
  });

  // ── health ───────────────────────────────────────────────────────

  describe('health', () => {
    it('should return true when node responds 200', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }));
      expect(await client.health()).toBe(true);
    });

    it('should return false when node is unreachable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
      expect(await client.health()).toBe(false);
    });
  });

  // ── Error handling ───────────────────────────────────────────────

  describe('error handling', () => {
    it('should throw MemoryNodeError on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse('Not Found', 404));

      await expect(client.getPattern('missing')).rejects.toThrow(MemoryNodeError);
    });

    it('should throw MemoryNodeError on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

      await expect(client.query([1.0])).rejects.toThrow(MemoryNodeError);
    });
  });

  // ── URL normalization ────────────────────────────────────────────

  describe('URL normalization', () => {
    it('should strip trailing slashes', async () => {
      const c = new MemoryClient({ nodeUrl: 'http://example.com///' });
      mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }));
      await c.health();

      expect(mockFetch.mock.calls[0][0]).toBe('http://example.com/health');
    });
  });
});
