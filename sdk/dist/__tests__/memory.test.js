"use strict";
// ─── MemoryClient Unit Tests ──────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const memory_js_1 = require("../client/memory.js");
const errors_js_1 = require("../errors.js");
// Mock global fetch
const mockFetch = vitest_1.vi.fn();
vitest_1.vi.stubGlobal('fetch', mockFetch);
function jsonResponse(data, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => data,
        text: async () => JSON.stringify(data),
    };
}
(0, vitest_1.describe)('MemoryClient', () => {
    let client;
    (0, vitest_1.beforeEach)(() => {
        client = new memory_js_1.MemoryClient({ nodeUrl: 'http://localhost:8080' });
        mockFetch.mockReset();
    });
    // ── query ────────────────────────────────────────────────────────
    (0, vitest_1.describe)('query', () => {
        (0, vitest_1.it)('should POST /query with vector and k', async () => {
            const expected = [
                { pattern: { id: 'p1' }, similarity: 0.95, score: 0.9 },
            ];
            mockFetch.mockResolvedValueOnce(jsonResponse(expected));
            const results = await client.query([1.0, 0.0], 3);
            (0, vitest_1.expect)(mockFetch).toHaveBeenCalledOnce();
            const [url, opts] = mockFetch.mock.calls[0];
            (0, vitest_1.expect)(url).toBe('http://localhost:8080/query');
            (0, vitest_1.expect)(opts.method).toBe('POST');
            (0, vitest_1.expect)(JSON.parse(opts.body)).toEqual({ vector: [1.0, 0.0], k: 3 });
            (0, vitest_1.expect)(results).toEqual(expected);
        });
        (0, vitest_1.it)('should default k to 1', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse([]));
            await client.query([0.5, 0.5]);
            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            (0, vitest_1.expect)(body.k).toBe(1);
        });
    });
    // ── addPattern ───────────────────────────────────────────────────
    (0, vitest_1.describe)('addPattern', () => {
        (0, vitest_1.it)('should POST /patterns with pattern data', async () => {
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
            (0, vitest_1.expect)(result).toEqual(pattern);
            const [url, opts] = mockFetch.mock.calls[0];
            (0, vitest_1.expect)(url).toBe('http://localhost:8080/patterns');
            (0, vitest_1.expect)(opts.method).toBe('POST');
        });
    });
    // ── getPattern ───────────────────────────────────────────────────
    (0, vitest_1.describe)('getPattern', () => {
        (0, vitest_1.it)('should GET /patterns/:id', async () => {
            const pattern = { id: 'abc', vector: [1.0], confidence: 0.5 };
            mockFetch.mockResolvedValueOnce(jsonResponse(pattern));
            const result = await client.getPattern('abc');
            (0, vitest_1.expect)(result).toEqual(pattern);
            (0, vitest_1.expect)(mockFetch.mock.calls[0][0]).toBe('http://localhost:8080/patterns/abc');
            (0, vitest_1.expect)(mockFetch.mock.calls[0][1].method).toBe('GET');
        });
    });
    // ── removePattern ────────────────────────────────────────────────
    (0, vitest_1.describe)('removePattern', () => {
        (0, vitest_1.it)('should DELETE /patterns/:id', async () => {
            const removed = { id: 'abc' };
            mockFetch.mockResolvedValueOnce(jsonResponse(removed));
            const result = await client.removePattern('abc');
            (0, vitest_1.expect)(result).toEqual(removed);
            (0, vitest_1.expect)(mockFetch.mock.calls[0][1].method).toBe('DELETE');
        });
    });
    // ── recordUsage ──────────────────────────────────────────────────
    (0, vitest_1.describe)('recordUsage', () => {
        (0, vitest_1.it)('should POST /patterns/:id/usage with reward', async () => {
            const updated = { id: 'p1', confidence: 0.8 };
            mockFetch.mockResolvedValueOnce(jsonResponse(updated));
            const result = await client.recordUsage('p1', 0.9);
            (0, vitest_1.expect)(result).toEqual(updated);
            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            (0, vitest_1.expect)(body).toEqual({ reward: 0.9 });
        });
    });
    // ── decayAll ─────────────────────────────────────────────────────
    (0, vitest_1.describe)('decayAll', () => {
        (0, vitest_1.it)('should POST /decay', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse(null, 204));
            await client.decayAll();
            (0, vitest_1.expect)(mockFetch.mock.calls[0][0]).toBe('http://localhost:8080/decay');
            (0, vitest_1.expect)(mockFetch.mock.calls[0][1].method).toBe('POST');
        });
    });
    // ── health ───────────────────────────────────────────────────────
    (0, vitest_1.describe)('health', () => {
        (0, vitest_1.it)('should return true when node responds 200', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }));
            (0, vitest_1.expect)(await client.health()).toBe(true);
        });
        (0, vitest_1.it)('should return false when node is unreachable', async () => {
            mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));
            (0, vitest_1.expect)(await client.health()).toBe(false);
        });
    });
    // ── Error handling ───────────────────────────────────────────────
    (0, vitest_1.describe)('error handling', () => {
        (0, vitest_1.it)('should throw MemoryNodeError on HTTP error', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse('Not Found', 404));
            await (0, vitest_1.expect)(client.getPattern('missing')).rejects.toThrow(errors_js_1.MemoryNodeError);
        });
        (0, vitest_1.it)('should throw MemoryNodeError on network failure', async () => {
            mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));
            await (0, vitest_1.expect)(client.query([1.0])).rejects.toThrow(errors_js_1.MemoryNodeError);
        });
    });
    // ── URL normalization ────────────────────────────────────────────
    (0, vitest_1.describe)('URL normalization', () => {
        (0, vitest_1.it)('should strip trailing slashes', async () => {
            const c = new memory_js_1.MemoryClient({ nodeUrl: 'http://example.com///' });
            mockFetch.mockResolvedValueOnce(jsonResponse({ status: 'ok' }));
            await c.health();
            (0, vitest_1.expect)(mockFetch.mock.calls[0][0]).toBe('http://example.com/health');
        });
    });
});
