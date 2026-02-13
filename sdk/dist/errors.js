"use strict";
// ─── HAMN Protocol SDK — Custom Errors ────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractError = exports.MemoryNodeError = exports.HAMNError = void 0;
class HAMNError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.cause = cause;
        this.name = 'HAMNError';
    }
}
exports.HAMNError = HAMNError;
class MemoryNodeError extends HAMNError {
    statusCode;
    constructor(message, statusCode, cause) {
        super(message, cause);
        this.statusCode = statusCode;
        this.name = 'MemoryNodeError';
    }
}
exports.MemoryNodeError = MemoryNodeError;
class ContractError extends HAMNError {
    constructor(message, cause) {
        super(message, cause);
        this.name = 'ContractError';
    }
}
exports.ContractError = ContractError;
