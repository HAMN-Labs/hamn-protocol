# HAMN Protocol
<div align="center">
  <h2>📺 Protocol Demo: A Shared Brain for AI</h2>
  <p><b>Performance Benchmark: 3.2s (Re-computation) vs 20ms (HAMN Recall)</b></p>
  
  <video src="https://github.com/HAMN-Labs/hamn-protocol/blob/main/HAMN__A_Shared_Brain_for_AI.mp4?raw=true" width="100%" controls autoplay muted loop>
    Your browser does not support the video tag.
  </video>

  <p align="center">
    <i>Watch how HAMN Protocol enables "Shared Intelligence" by allowing AI agents to recall proven solutions instantly.</i>
  </p>
</div>
## Decentralized Associative Memory for AI Agents on Arbitrum

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**HAMN (High-performance Associative Memory Network)** is a decentralized network that allows dApps and AI agents to **reuse previously found solutions** instead of recalculating them from scratch. It serves as a **shared intelligence layer** for the Arbitrum ecosystem.

---

## 1. Executive Summary

Instead of training heavy models for every task, HAMN stores and retrieves **working solution patterns**. By creating a collective memory, the protocol enables a marketplace where agents share successful actions and contributors are rewarded for useful patterns.

---

## 2. The Problem & Solution

| Feature           | Current State (Isolated)       | With HAMN (Shared Memory)              |
| :---------------- | :----------------------------- | :------------------------------------- |
| **Logic**         | Recompute solutions every time | Retrieve and reuse past experience     |
| **Efficiency**    | Redundant work & high latency  | Instant recall & 160x faster execution |
| **Collaboration** | Isolated, private experience   | Shared intelligence marketplace        |

---

## 3. Performance Benchmark: AI Strategy Builder

A user sets a goal: _"Maximize yield with low risk"_.

- **First Run (No Memory):** Agent analyzes the market, builds, and simulates strategies. **Time: ~3.2 sec**.
- **Second Run (With HAMN):** System finds a matching context in memory and retrieves the proven solution. **Time: ~20 ms**.

**Result:** A performance boost from 3.2s to 0.02s (160x acceleration).

---

## 4. Key Concept: Pattern Logic

HAMN stores relationships rather than raw data:
`market_state → action_sequence → success`.

### Memory Format

```json
Pattern {
  "context_hash": "...",
  "action_sequence": "...",
  "success_score": "...",
  "timestamp": "...",
  "contributor": "0x..."
}
```

\*\*

---

## 5. System Architecture

### Off-chain (Memory Layer)

- **HAMN Memory Engine:** Core retrieval engine.
- **Similarity Search:** Algorithmic matching of current context to stored patterns.
- **Reinforcement Updates:** Continuous score adjustments based on agent performance.

### On-chain (Arbitrum + Stylus Layer)

- **Pattern Ownership:** Secure registry of pattern contributors.
- **Staking & Reputation:** Participants lose stake for poor solutions and gain reputation for useful ones.
- **Intelligence Marketplace:** Automated reward distribution based on reuse count.

---

## 6. Mathematical Model

HAMN selects solutions using an **argmax** function:
`argmax(similarity × confidence × freshness)`

- **Confidence Update:** $confidence \leftarrow confidence + \alpha(reward - confidence)$.
- **Decay Function:** $confidence *= exp(-\lambda * time)$.

---

## 7. Scaling with Arbitrum Stylus (Phase 5)

To transition from MVP to a global intelligence marketplace, HAMN leverages **Arbitrum Stylus** to move complex logic on-chain.

- **Mathematical Acceleration:** Stylus enables writing contracts in **Rust or C++** (compiled to WASM), allowing native-speed execution of floating-point math and exponential decay functions that are inefficient in standard Solidity.
- **Gas Efficiency:** Stylus significantly **slashes gas costs** for complex operations, making micro-rewards for intelligence sharing economically viable at a scale of 100,000+ queries.
- **Decentralized Verification:** Moving similarity verification and reputation tracking from off-chain engines directly to Arbitrum smart contracts without losing performance.

---

## 8. Roadmap & KPIs

- **Phase 1:** Core HAMN Engine development.
- **Phase 2:** Smart Contract deployment (Staking/Ownership).
- **Phase 3:** Node Network launch.
- **Phase 4:** SDK & Demo App release.
- **Phase 5:** **Stylus Integration** & Mainnet deployment.

**6-Month Goals:**

- 50 Active Memory Nodes.
- 10+ dApp Integrations.
- 100k Queries & 10k Patterns.

---

## 9. Project Structure

| Component                        | Stack              | Docs                                                                            |
| -------------------------------- | ------------------ | ------------------------------------------------------------------------------- |
| [`core-engine/`](./core-engine/) | Rust               | Memory engine (similarity, scoring, decay) — **20/20 tests**                    |
| [`contracts/`](./contracts/)     | Solidity + Foundry | PatternRegistry, RewardDistributor — **12/12 tests**                            |
| [`sdk/`](./sdk/)                 | TypeScript + viem  | Client SDK ([EN](./sdk/README.md) / [RU](./sdk/README.ru.md)) — **25/25 tests** |

---

## 10. Vision

HAMN is not just an AI model; it is the **infrastructure for collective memory in Web3**. By turning Arbitrum into a high-performance compute platform, we are building the "Knowledge Backbone" for future AI-agentic workflows.

---

## ⚖️ License

This project is licensed under the **MIT License**.
