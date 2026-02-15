use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::math;
use crate::types::{Pattern, QueryResult};

/// MemoryNode is the core in-memory pattern store.
/// It holds patterns and provides similarity-based retrieval.
pub struct MemoryNode {
    patterns: HashMap<String, Pattern>,
    /// Learning rate for reinforcement updates.
    pub alpha: f32,
    /// Decay constant for temporal freshness.
    pub lambda: f32,
}

impl MemoryNode {
    /// Create a new MemoryNode with default hyperparameters.
    pub fn new() -> Self {
        MemoryNode {
            patterns: HashMap::new(),
            alpha: 0.1,    // default learning rate
            lambda: 0.001, // default decay rate
        }
    }

    /// Create a MemoryNode with custom hyperparameters.
    pub fn with_params(alpha: f32, lambda: f32) -> Self {
        MemoryNode {
            patterns: HashMap::new(),
            alpha,
            lambda,
        }
    }

    /// Insert or update a pattern.
    pub fn add_pattern(&mut self, pattern: Pattern) {
        self.patterns.insert(pattern.id.clone(), pattern);
    }

    /// Remove a pattern by ID.
    pub fn remove_pattern(&mut self, id: &str) -> Option<Pattern> {
        self.patterns.remove(id)
    }

    /// Number of stored patterns.
    pub fn len(&self) -> usize {
        self.patterns.len()
    }

    /// Check if the store is empty.
    pub fn is_empty(&self) -> bool {
        self.patterns.is_empty()
    }

    /// Retrieve the single best-matching pattern.
    /// Uses argmax(similarity × decayed_confidence).
    pub fn find_best(&self, query: &[f32]) -> Option<QueryResult> {
        self.find_top_k(query, 1).into_iter().next()
    }

    /// Retrieve the top-K most relevant patterns, sorted by score descending.
    pub fn find_top_k(&self, query: &[f32], k: usize) -> Vec<QueryResult> {
        let now = Self::now();

        let mut scored: Vec<QueryResult> = self
            .patterns
            .values()
            .filter_map(|p| {
                let sim = math::cosine_similarity(&p.vector, query).ok()?;
                let score = math::compute_score(sim, p, self.lambda, now);
                Some(QueryResult {
                    pattern: p.clone(),
                    similarity: sim,
                    score,
                })
            })
            .collect();

        // Sort descending by score
        scored.sort_by(|a, b| {
            b.score
                .partial_cmp(&a.score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });
        scored.truncate(k);
        scored
    }

    /// Record a usage event: increment access_count, update timestamp,
    /// and apply reinforcement to confidence.
    pub fn record_usage(&mut self, id: &str, reward: f32) -> Option<&Pattern> {
        let now = Self::now();
        if let Some(p) = self.patterns.get_mut(id) {
            p.access_count += 1;
            p.confidence = math::reinforce(p.confidence, reward, self.alpha);
            p.last_accessed = now;
            Some(p)
        } else {
            None
        }
    }

    /// Apply temporal decay to all patterns' confidence values.
    pub fn decay_all(&mut self) {
        let now = Self::now();
        for p in self.patterns.values_mut() {
            let dt = (now.saturating_sub(p.last_accessed)) as f32;
            p.confidence = math::decay(p.confidence, self.lambda, dt);
            p.last_accessed = now;
        }
    }

    /// Save the current state to a JSON file.
    pub fn save_to_json<P: AsRef<std::path::Path>>(&self, path: P) -> std::io::Result<()> {
        let file = std::fs::File::create(path)?;
        let writer = std::io::BufWriter::new(file);
        serde_json::to_writer(writer, &self.patterns)?;
        Ok(())
    }

    /// Load state from a JSON file, replacing current patterns.
    pub fn load_from_json<P: AsRef<std::path::Path>>(&mut self, path: P) -> std::io::Result<()> {
        let file = std::fs::File::open(path)?;
        let reader = std::io::BufReader::new(file);
        let patterns: HashMap<String, Pattern> = serde_json::from_reader(reader)?;
        self.patterns = patterns;
        Ok(())
    }

    fn now() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs()
    }
}

impl Default for MemoryNode {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn make_pattern(id: &str, vec: Vec<f32>, confidence: f32) -> Pattern {
        Pattern {
            id: id.to_string(),
            vector: vec,
            confidence,
            access_count: 0,
            last_accessed: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            created_at: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs(),
            tags: vec![],
        }
    }

    #[test]
    fn test_add_and_len() {
        let mut node = MemoryNode::new();
        assert!(node.is_empty());
        node.add_pattern(make_pattern("a", vec![1.0, 0.0], 0.9));
        assert_eq!(node.len(), 1);
    }

    #[test]
    fn test_find_best_single() {
        let mut node = MemoryNode::new();
        node.add_pattern(make_pattern("a", vec![1.0, 0.0], 0.9));

        let result = node.find_best(&[1.0, 0.0]);
        assert!(result.is_some());
        let r = result.unwrap();
        assert_eq!(r.pattern.id, "a");
        assert!(r.similarity > 0.99);
    }

    #[test]
    fn test_find_best_selects_most_similar() {
        let mut node = MemoryNode::new();
        node.add_pattern(make_pattern("close", vec![0.9, 0.1], 0.8));
        node.add_pattern(make_pattern("far", vec![0.0, 1.0], 0.8));

        let result = node.find_best(&[1.0, 0.0]).unwrap();
        assert_eq!(result.pattern.id, "close");
    }

    #[test]
    fn test_find_top_k() {
        let mut node = MemoryNode::new();
        node.add_pattern(make_pattern("a", vec![1.0, 0.0], 0.9));
        node.add_pattern(make_pattern("b", vec![0.8, 0.2], 0.9));
        node.add_pattern(make_pattern("c", vec![0.0, 1.0], 0.9));

        let results = node.find_top_k(&[1.0, 0.0], 2);
        assert_eq!(results.len(), 2);
        assert_eq!(results[0].pattern.id, "a");
        assert_eq!(results[1].pattern.id, "b");
    }

    #[test]
    fn test_record_usage() {
        let mut node = MemoryNode::new();
        node.add_pattern(make_pattern("x", vec![1.0], 0.5));

        let p = node.record_usage("x", 1.0).unwrap();
        assert_eq!(p.access_count, 1);
        assert!(p.confidence > 0.5); // reinforced upward
    }

    #[test]
    fn test_record_usage_nonexistent() {
        let mut node = MemoryNode::new();
        assert!(node.record_usage("nope", 1.0).is_none());
    }

    #[test]
    fn test_remove_pattern() {
        let mut node = MemoryNode::new();
        node.add_pattern(make_pattern("x", vec![1.0], 0.5));
        assert_eq!(node.len(), 1);
        let removed = node.remove_pattern("x");
        assert!(removed.is_some());
        assert!(node.is_empty());
    }

    #[test]
    fn test_empty_find() {
        let node = MemoryNode::new();
        assert!(node.find_best(&[1.0, 0.0]).is_none());
        assert!(node.find_top_k(&[1.0, 0.0], 5).is_empty());
    }

    #[test]
    fn test_confidence_prefers_higher() {
        let mut node = MemoryNode::new();
        // Same direction, but different confidence
        node.add_pattern(make_pattern("high", vec![1.0, 0.0], 0.99));
        node.add_pattern(make_pattern("low", vec![1.0, 0.0], 0.01));

        let result = node.find_best(&[1.0, 0.0]).unwrap();
        assert_eq!(result.pattern.id, "high");
    }

    #[test]
    fn test_persistence() {
        let mut node = MemoryNode::new();
        node.add_pattern(make_pattern("p1", vec![1.0, 2.0], 0.5));

        let tmp_dir = std::env::temp_dir();
        let file_path = tmp_dir.join("hamn_test_persistence.json");

        // Save
        node.save_to_json(&file_path).expect("Failed to save");

        // Load into new node
        let mut loaded_node = MemoryNode::new();
        loaded_node
            .load_from_json(&file_path)
            .expect("Failed to load");

        assert_eq!(loaded_node.len(), 1);
        let loaded_p = loaded_node.find_best(&[1.0, 2.0]).unwrap();
        assert_eq!(loaded_p.pattern.id, "p1");

        // Cleanup
        let _ = std::fs::remove_file(file_path);
    }
}
