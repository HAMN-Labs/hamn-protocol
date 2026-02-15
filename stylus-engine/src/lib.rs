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

    // v1 linear decay approximation: max(0, 1 - lambda * dt_scaled)
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

fn reject(reason_code: u16) -> VerifyOutputV1 {
    VerifyOutputV1 {
        score_fp: 0,
        freshness_fp: 0,
        reward_weight_fp: 0,
        accepted: false,
        reason_code,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

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
}
