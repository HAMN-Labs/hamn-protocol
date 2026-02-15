pub const SCALE: u64 = 1_000_000;

pub const REASON_OK: u16 = 0;
pub const REASON_INVALID_SIMILARITY: u16 = 1001;
pub const REASON_INVALID_CONFIDENCE: u16 = 1002;
pub const REASON_INVALID_LAMBDA: u16 = 1003;
pub const REASON_INVALID_REPUTATION: u16 = 1004;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct VerifyInputV1 {
    pub similarity_fp: u64,
    pub confidence_fp: u64,
    pub lambda_fp: u64,
    pub dt_seconds: u64,
    pub usage_count: u64,
    pub reputation_bp: u16,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct VerifyOutputV1 {
    pub score_fp: u64,
    pub freshness_fp: u64,
    pub reward_weight_fp: u64,
    pub accepted: bool,
    pub reason_code: u16,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RetrievalError {
    InvalidRange,
    DimensionMismatch,
    MathOverflow,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct StylusPattern {
    pub id: [u8; 32],
    pub vector: Vec<i64>,
    pub confidence_fp: u64,
    pub last_accessed: u64,
    pub usage_count: u64,
    pub reputation_bp: u16,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RankedPattern {
    pub id: [u8; 32],
    pub similarity_fp: u64,
    pub freshness_fp: u64,
    pub score_fp: u64,
    pub reward_weight_fp: u64,
}

pub fn mul_fp(a: u64, b: u64) -> Option<u64> {
    a.checked_mul(b).map(|x| x / SCALE)
}

pub fn log2_approx_fp(x: u64) -> u64 {
    if x <= 1 {
        return 0;
    }

    let mut v = x;
    let mut steps = 0u64;
    while v > 1 {
        v >>= 1;
        steps += 1;
    }

    (steps * 100_000).min(SCALE)
}

pub fn verify_score_v1(input: VerifyInputV1) -> VerifyOutputV1 {
    if input.similarity_fp > SCALE {
        return reject(REASON_INVALID_SIMILARITY);
    }
    if input.confidence_fp > SCALE {
        return reject(REASON_INVALID_CONFIDENCE);
    }
    if input.lambda_fp > SCALE {
        return reject(REASON_INVALID_LAMBDA);
    }
    if input.reputation_bp > 10_000 {
        return reject(REASON_INVALID_REPUTATION);
    }

    let dt_capped = input.dt_seconds.min(SCALE);
    let decay_term = mul_fp(input.lambda_fp, dt_capped).unwrap_or(SCALE);
    let decay_fp = SCALE.saturating_sub(decay_term);

    let freshness_fp = mul_fp(input.confidence_fp, decay_fp).unwrap_or(0);
    let score_fp = mul_fp(input.similarity_fp, freshness_fp).unwrap_or(0);

    let usage_factor_fp = log2_approx_fp(1 + input.usage_count);
    let reputation_norm_fp = ((input.reputation_bp as u64) * SCALE) / 10_000;

    let reward_weight_fp = mul_fp(
        mul_fp(score_fp, usage_factor_fp).unwrap_or(0),
        reputation_norm_fp,
    )
    .unwrap_or(0);

    VerifyOutputV1 {
        score_fp,
        freshness_fp,
        reward_weight_fp,
        accepted: true,
        reason_code: REASON_OK,
    }
}

pub fn cosine_similarity_fp(v1: &[i64], v2: &[i64]) -> Result<u64, RetrievalError> {
    if v1.len() != v2.len() {
        return Err(RetrievalError::DimensionMismatch);
    }

    let mut dot: i128 = 0;
    let mut mag1: i128 = 0;
    let mut mag2: i128 = 0;

    for (a, b) in v1.iter().zip(v2.iter()) {
        let a128 = *a as i128;
        let b128 = *b as i128;
        dot = dot
            .checked_add(a128.checked_mul(b128).ok_or(RetrievalError::MathOverflow)?)
            .ok_or(RetrievalError::MathOverflow)?;
        mag1 = mag1
            .checked_add(a128.checked_mul(a128).ok_or(RetrievalError::MathOverflow)?)
            .ok_or(RetrievalError::MathOverflow)?;
        mag2 = mag2
            .checked_add(b128.checked_mul(b128).ok_or(RetrievalError::MathOverflow)?)
            .ok_or(RetrievalError::MathOverflow)?;
    }

    if mag1 <= 0 || mag2 <= 0 || dot <= 0 {
        return Ok(0);
    }

    let mag1_u = mag1 as u128;
    let mag2_u = mag2 as u128;
    let denom_sq = mag1_u
        .checked_mul(mag2_u)
        .ok_or(RetrievalError::MathOverflow)?;
    let denom = integer_sqrt(denom_sq);

    if denom == 0 {
        return Ok(0);
    }

    let numerator = (dot as u128)
        .checked_mul(SCALE as u128)
        .ok_or(RetrievalError::MathOverflow)?;

    let similarity = (numerator / denom) as u64;
    Ok(similarity.min(SCALE))
}

pub fn rank_patterns_v1(
    query: &[i64],
    patterns: &[StylusPattern],
    lambda_fp: u64,
    now: u64,
    top_k: usize,
) -> Result<Vec<RankedPattern>, RetrievalError> {
    if lambda_fp > SCALE {
        return Err(RetrievalError::InvalidRange);
    }

    let mut ranked = Vec::with_capacity(patterns.len());

    for pattern in patterns {
        if pattern.confidence_fp > SCALE || pattern.reputation_bp > 10_000 {
            return Err(RetrievalError::InvalidRange);
        }

        let similarity_fp = cosine_similarity_fp(&pattern.vector, query)?;
        let dt_seconds = now.saturating_sub(pattern.last_accessed);

        let out = verify_score_v1(VerifyInputV1 {
            similarity_fp,
            confidence_fp: pattern.confidence_fp,
            lambda_fp,
            dt_seconds,
            usage_count: pattern.usage_count,
            reputation_bp: pattern.reputation_bp,
        });

        if !out.accepted {
            continue;
        }

        ranked.push(RankedPattern {
            id: pattern.id,
            similarity_fp,
            freshness_fp: out.freshness_fp,
            score_fp: out.score_fp,
            reward_weight_fp: out.reward_weight_fp,
        });
    }

    ranked.sort_by(|a, b| b.score_fp.cmp(&a.score_fp).then_with(|| a.id.cmp(&b.id)));

    if top_k < ranked.len() {
        ranked.truncate(top_k);
    }

    Ok(ranked)
}

pub fn record_usage_v1(
    pattern: &mut StylusPattern,
    reward_fp: u64,
    alpha_fp: u64,
    now: u64,
) -> Result<(), RetrievalError> {
    if reward_fp > SCALE || alpha_fp > SCALE || pattern.confidence_fp > SCALE {
        return Err(RetrievalError::InvalidRange);
    }

    let confidence = pattern.confidence_fp as i128;
    let reward = reward_fp as i128;
    let alpha = alpha_fp as i128;
    let scale = SCALE as i128;

    let delta = reward - confidence;
    let adjustment = (alpha
        .checked_mul(delta)
        .ok_or(RetrievalError::MathOverflow)?)
        / scale;

    let updated = (confidence + adjustment).clamp(0, SCALE as i128) as u64;

    pattern.confidence_fp = updated;
    pattern.usage_count = pattern.usage_count.saturating_add(1);
    pattern.last_accessed = now;

    Ok(())
}

pub fn decay_pattern_v1(
    pattern: &mut StylusPattern,
    lambda_fp: u64,
    now: u64,
) -> Result<(), RetrievalError> {
    if lambda_fp > SCALE || pattern.confidence_fp > SCALE {
        return Err(RetrievalError::InvalidRange);
    }

    let dt = now.saturating_sub(pattern.last_accessed).min(SCALE);
    let decay_term = mul_fp(lambda_fp, dt).ok_or(RetrievalError::MathOverflow)?;
    let decay_fp = SCALE.saturating_sub(decay_term);
    pattern.confidence_fp = mul_fp(pattern.confidence_fp, decay_fp).ok_or(RetrievalError::MathOverflow)?;
    pattern.last_accessed = now;

    Ok(())
}

fn reject(reason_code: u16) -> VerifyOutputV1 {
    VerifyOutputV1 {
        score_fp: 0,
        freshness_fp: 0,
        reward_weight_fp: 0,
        accepted: false,
        reason_code,
    }
}

fn integer_sqrt(n: u128) -> u128 {
    if n <= 1 {
        return n;
    }

    let mut x0 = n;
    let mut x1 = (x0 + n / x0) / 2;

    while x1 < x0 {
        x0 = x1;
        x1 = (x0 + n / x0) / 2;
    }

    x0
}

#[cfg(test)]
mod tests {
    use super::*;

    fn id(byte: u8) -> [u8; 32] {
        [byte; 32]
    }

    #[test]
    fn rejects_invalid_similarity() {
        let out = verify_score_v1(VerifyInputV1 {
            similarity_fp: SCALE + 1,
            confidence_fp: SCALE,
            lambda_fp: 0,
            dt_seconds: 0,
            usage_count: 0,
            reputation_bp: 5_000,
        });
        assert!(!out.accepted);
        assert_eq!(out.reason_code, REASON_INVALID_SIMILARITY);
    }

    #[test]
    fn score_is_monotonic_in_similarity() {
        let low = verify_score_v1(VerifyInputV1 {
            similarity_fp: 200_000,
            confidence_fp: 900_000,
            lambda_fp: 100,
            dt_seconds: 10,
            usage_count: 10,
            reputation_bp: 5_000,
        });

        let high = verify_score_v1(VerifyInputV1 {
            similarity_fp: 700_000,
            ..VerifyInputV1 {
                similarity_fp: 200_000,
                confidence_fp: 900_000,
                lambda_fp: 100,
                dt_seconds: 10,
                usage_count: 10,
                reputation_bp: 5_000,
            }
        });

        assert!(high.score_fp >= low.score_fp);
    }

    #[test]
    fn freshness_decreases_over_time() {
        let early = verify_score_v1(VerifyInputV1 {
            similarity_fp: 900_000,
            confidence_fp: 900_000,
            lambda_fp: 200,
            dt_seconds: 1,
            usage_count: 1,
            reputation_bp: 5_000,
        });

        let late = verify_score_v1(VerifyInputV1 {
            dt_seconds: 10_000,
            ..VerifyInputV1 {
                similarity_fp: 900_000,
                confidence_fp: 900_000,
                lambda_fp: 200,
                dt_seconds: 1,
                usage_count: 1,
                reputation_bp: 5_000,
            }
        });

        assert!(early.freshness_fp >= late.freshness_fp);
    }

    #[test]
    fn reward_weight_uses_reputation() {
        let low_rep = verify_score_v1(VerifyInputV1 {
            similarity_fp: 800_000,
            confidence_fp: 800_000,
            lambda_fp: 100,
            dt_seconds: 1,
            usage_count: 16,
            reputation_bp: 2_000,
        });

        let high_rep = verify_score_v1(VerifyInputV1 {
            reputation_bp: 9_000,
            ..VerifyInputV1 {
                similarity_fp: 800_000,
                confidence_fp: 800_000,
                lambda_fp: 100,
                dt_seconds: 1,
                usage_count: 16,
                reputation_bp: 2_000,
            }
        });

        assert!(high_rep.reward_weight_fp >= low_rep.reward_weight_fp);
    }

    #[test]
    fn cosine_similarity_identical_vectors_is_max() {
        let sim = cosine_similarity_fp(&[1_000, 2_000], &[1_000, 2_000]).unwrap();
        assert_eq!(sim, SCALE);
    }

    #[test]
    fn rank_patterns_sorts_by_score_desc() {
        let query = vec![1_000, 0];
        let patterns = vec![
            StylusPattern {
                id: id(1),
                vector: vec![1_000, 0],
                confidence_fp: 900_000,
                last_accessed: 0,
                usage_count: 5,
                reputation_bp: 8_000,
            },
            StylusPattern {
                id: id(2),
                vector: vec![500, 500],
                confidence_fp: 900_000,
                last_accessed: 0,
                usage_count: 5,
                reputation_bp: 8_000,
            },
        ];

        let ranked = rank_patterns_v1(&query, &patterns, 100, 10, 2).unwrap();
        assert_eq!(ranked.len(), 2);
        assert_eq!(ranked[0].id, id(1));
        assert!(ranked[0].score_fp >= ranked[1].score_fp);
    }

    #[test]
    fn record_usage_updates_confidence_and_usage_count() {
        let mut pattern = StylusPattern {
            id: id(3),
            vector: vec![1_000, 0],
            confidence_fp: 500_000,
            last_accessed: 1,
            usage_count: 10,
            reputation_bp: 5_000,
        };

        record_usage_v1(&mut pattern, 1_000_000, 100_000, 123).unwrap();

        assert!(pattern.confidence_fp > 500_000);
        assert_eq!(pattern.usage_count, 11);
        assert_eq!(pattern.last_accessed, 123);
    }

    #[test]
    fn decay_pattern_decreases_confidence() {
        let mut pattern = StylusPattern {
            id: id(4),
            vector: vec![1_000, 0],
            confidence_fp: 900_000,
            last_accessed: 0,
            usage_count: 0,
            reputation_bp: 5_000,
        };

        decay_pattern_v1(&mut pattern, 500_000, 1_000_000).unwrap();
        assert!(pattern.confidence_fp <= 900_000);
        assert_eq!(pattern.last_accessed, 1_000_000);
    }
}
