//! HAMN Core Engine
//!
//! High-performance Associative Memory Network — the off-chain memory layer
//! for AI agents. Provides vector similarity search, pattern storage,
//! reinforcement learning updates, and temporal decay.
//!
//! Designed for future Arbitrum Stylus (Rust/WASM) compatibility.

pub mod types;
pub mod math;
pub mod engine;

// Re-export primary API surface
pub use types::{Pattern, QueryResult};
pub use engine::MemoryNode;
