# stylus-engine (skeleton)

Minimal skeleton for Phase 5 Stylus workstream.

## Current scope

- Fixed-point math helpers (`SCALE = 1_000_000`)
- `VerifyInputV1` / `VerifyOutputV1`
- `verify_score_v1` deterministic logic (draft)
- Unit tests for range validation and monotonic properties

## Run tests

```bash
cd stylus-engine
cargo test
```

## Note

This module is a pre-Stylus Rust skeleton to validate formulas and parity behavior
before wiring into Arbitrum Stylus contracts.
