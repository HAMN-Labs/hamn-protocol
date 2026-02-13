use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

/// Core data structure for a memory pattern.
/// Represents a reusable action pattern stored by the HAMN network.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Pattern {
    /// Unique identifier (hash of the pattern content).
    pub id: String,
    /// The embedding vector representing this pattern's semantic meaning.
    pub vector: Vec<f32>,
    /// Trust/quality score [0.0, 1.0], updated via reinforcement.
    pub confidence: f32,
    /// Number of times this pattern has been retrieved and used.
    pub access_count: u64,
    /// UNIX timestamp of last access.
    pub last_accessed: u64,
    /// UNIX timestamp of creation.
    pub created_at: u64,
    /// Tags/metadata for categorization.
    pub tags: Vec<String>,
}

impl Pattern {
    pub fn new(id: String, vector: Vec<f32>) -> Self {
        let now = Self::now();
        Pattern {
            id,
            vector,
            confidence: 0.5,
            access_count: 0,
            last_accessed: now,
            created_at: now,
            tags: Vec::new(),
        }
    }

    pub fn with_tags(mut self, tags: Vec<String>) -> Self {
        self.tags = tags;
        self
    }

    fn now() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs()
    }
}

/// Result of a similarity query against the memory node.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryResult {
    pub pattern: Pattern,
    pub similarity: f32,
    pub score: f32,
}
