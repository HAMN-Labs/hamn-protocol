use crate::types::Pattern;

/// Cosine similarity between two vectors.
/// Returns a value in [-1.0, 1.0]. Returns 0.0 for zero-magnitude vectors.
pub fn cosine_similarity(v1: &[f32], v2: &[f32]) -> f32 {
    assert_eq!(v1.len(), v2.len(), "Vector dimensions must match");

    let mut dot = 0.0f32;
    let mut mag1 = 0.0f32;
    let mut mag2 = 0.0f32;

    for (a, b) in v1.iter().zip(v2.iter()) {
        dot += a * b;
        mag1 += a * a;
        mag2 += b * b;
    }

    let denom = mag1.sqrt() * mag2.sqrt();
    if denom == 0.0 {
        0.0
    } else {
        dot / denom
    }
}

/// Compute the combined score for pattern selection.
/// score = similarity × decayed_confidence
/// where decayed_confidence = confidence × exp(-λ × Δt)
pub fn compute_score(similarity: f32, pattern: &Pattern, lambda: f32, current_time: u64) -> f32 {
    let freshness = compute_freshness(pattern, lambda, current_time);
    similarity * freshness
}

/// Compute the freshness-decayed confidence.
/// freshness = confidence × exp(-λ × Δt)
pub fn compute_freshness(pattern: &Pattern, lambda: f32, current_time: u64) -> f32 {
    let dt = (current_time.saturating_sub(pattern.last_accessed)) as f32;
    pattern.confidence * (-lambda * dt).exp()
}

/// Reinforcement update for confidence.
/// confidence ← confidence + α × (reward − confidence)
pub fn reinforce(confidence: f32, reward: f32, alpha: f32) -> f32 {
    let new_conf = confidence + alpha * (reward - confidence);
    new_conf.clamp(0.0, 1.0)
}

/// Apply temporal decay to confidence.
/// confidence ← confidence × exp(-λ × Δt)
pub fn decay(confidence: f32, lambda: f32, dt_seconds: f32) -> f32 {
    let decayed = confidence * (-lambda * dt_seconds).exp();
    decayed.clamp(0.0, 1.0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::Pattern;

    #[test]
    fn test_cosine_identical() {
        let v = vec![1.0, 2.0, 3.0];
        let sim = cosine_similarity(&v, &v);
        assert!((sim - 1.0).abs() < 1e-6, "Identical vectors should have similarity 1.0");
    }

    #[test]
    fn test_cosine_orthogonal() {
        let v1 = vec![1.0, 0.0, 0.0];
        let v2 = vec![0.0, 1.0, 0.0];
        let sim = cosine_similarity(&v1, &v2);
        assert!(sim.abs() < 1e-6, "Orthogonal vectors should have similarity 0.0");
    }

    #[test]
    fn test_cosine_opposite() {
        let v1 = vec![1.0, 0.0];
        let v2 = vec![-1.0, 0.0];
        let sim = cosine_similarity(&v1, &v2);
        assert!((sim - (-1.0)).abs() < 1e-6, "Opposite vectors should have similarity -1.0");
    }

    #[test]
    fn test_cosine_zero_vector() {
        let v1 = vec![1.0, 2.0];
        let v2 = vec![0.0, 0.0];
        assert_eq!(cosine_similarity(&v1, &v2), 0.0);
    }

    #[test]
    fn test_reinforce_positive() {
        let conf = reinforce(0.5, 1.0, 0.1);
        assert!((conf - 0.55).abs() < 1e-6);
    }

    #[test]
    fn test_reinforce_negative() {
        let conf = reinforce(0.5, 0.0, 0.1);
        assert!((conf - 0.45).abs() < 1e-6);
    }

    #[test]
    fn test_reinforce_clamps() {
        let conf = reinforce(0.99, 1.0, 0.5);
        assert!(conf <= 1.0);
        let conf2 = reinforce(0.01, 0.0, 0.5);
        assert!(conf2 >= 0.0);
    }

    #[test]
    fn test_decay_basic() {
        let d = decay(1.0, 0.01, 100.0);
        // exp(-0.01 * 100) = exp(-1) ≈ 0.3679
        assert!((d - 0.3679).abs() < 0.01);
    }

    #[test]
    fn test_decay_zero_time() {
        let d = decay(0.8, 0.01, 0.0);
        assert!((d - 0.8).abs() < 1e-6);
    }

    #[test]
    fn test_compute_score() {
        let p = Pattern {
            id: "test".to_string(),
            vector: vec![],
            confidence: 0.8,
            access_count: 0,
            last_accessed: 1000,
            created_at: 1000,
            tags: vec![],
        };
        let score = compute_score(0.9, &p, 0.001, 1000);
        // dt=0, freshness = 0.8 * exp(0) = 0.8, score = 0.9 * 0.8 = 0.72
        assert!((score - 0.72).abs() < 1e-4);
    }

    #[test]
    fn test_compute_score_with_decay() {
        let p = Pattern {
            id: "test".to_string(),
            vector: vec![],
            confidence: 1.0,
            access_count: 0,
            last_accessed: 0,
            created_at: 0,
            tags: vec![],
        };
        let score = compute_score(1.0, &p, 0.01, 100);
        // dt=100, freshness = 1.0 * exp(-1) ≈ 0.3679, score = 1.0 * 0.3679
        assert!((score - 0.3679).abs() < 0.01);
    }
}
