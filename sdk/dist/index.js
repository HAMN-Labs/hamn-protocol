"use strict";
// ─── HAMN Protocol SDK ────────────────────────────────────────────
// Public API surface — re-export everything.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardDistributorABI = exports.PatternRegistryABI = exports.HAMNClient = exports.ContractClient = exports.MemoryClient = exports.ContractError = exports.MemoryNodeError = exports.HAMNError = void 0;
// Errors
var errors_js_1 = require("./errors.js");
Object.defineProperty(exports, "HAMNError", { enumerable: true, get: function () { return errors_js_1.HAMNError; } });
Object.defineProperty(exports, "MemoryNodeError", { enumerable: true, get: function () { return errors_js_1.MemoryNodeError; } });
Object.defineProperty(exports, "ContractError", { enumerable: true, get: function () { return errors_js_1.ContractError; } });
// Clients
var memory_js_1 = require("./client/memory.js");
Object.defineProperty(exports, "MemoryClient", { enumerable: true, get: function () { return memory_js_1.MemoryClient; } });
var contracts_js_1 = require("./client/contracts.js");
Object.defineProperty(exports, "ContractClient", { enumerable: true, get: function () { return contracts_js_1.ContractClient; } });
var hamn_js_1 = require("./hamn.js");
Object.defineProperty(exports, "HAMNClient", { enumerable: true, get: function () { return hamn_js_1.HAMNClient; } });
// ABI (for advanced users who want to use viem directly)
var PatternRegistry_js_1 = require("./abi/PatternRegistry.js");
Object.defineProperty(exports, "PatternRegistryABI", { enumerable: true, get: function () { return PatternRegistry_js_1.PatternRegistryABI; } });
var RewardDistributor_js_1 = require("./abi/RewardDistributor.js");
Object.defineProperty(exports, "RewardDistributorABI", { enumerable: true, get: function () { return RewardDistributor_js_1.RewardDistributorABI; } });
