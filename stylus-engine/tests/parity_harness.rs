use std::{cmp::Ordering, fs, path::PathBuf};

use serde::Deserialize;
use stylus_engine::{
    rank_patterns_v1, verify_score_v1, RankedPattern, StylusPattern, VerifyInputV1, SCALE,
};

#[derive(Debug, Deserialize)]
struct BatchConfig {
    version: String,
    samples: Samples,
    tolerance: Tolerance,
    rank_harness: RankHarness,
}

#[derive(Debug, Deserialize)]
struct Samples {
    similarity_fp: Vec<u64>,
    confidence_fp: Vec<u64>,
    lambda_fp: Vec<u64>,
    dt_seconds: Vec<u64>,
    usage_count: Vec<u64>,
    reputation_bp: Vec<u16>,
}

#[derive(Debug, Deserialize)]
struct Tolerance {
    score_fp: u64,
    freshness_fp: u64,
    reward_weight_fp: u64,
}

#[derive(Debug, Deserialize)]
struct RankHarness {
    patterns: usize,
    top_k: usize,
    lambda_fp: u64,
    now: u64,
    tolerance: u64,
}

#[derive(Debug)]
struct RefOutput {
    score_fp: u64,
    freshness_fp: u64,
    reward_weight_fp: u64,
    accepted: bool,
    reason_code: u16,
}

fn load_batch_config() -> BatchConfig {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("../docs/specs/test-vectors/stylus-boundary-v1-batch-config.json");

    let raw = fs::read_to_string(&path).expect("failed to read batch config");
    serde_json::from_str::<BatchConfig>(&raw).expect("failed to parse batch config")
}

fn reference_verify(input: VerifyInputV1) -> RefOutput {
    if input.similarity_fp > SCALE {
        return RefOutput {
            score_fp: 0,
            freshness_fp: 0,
            reward_weight_fp: 0,
            accepted: false,
            reason_code: 1001,
        };
    }
    if input.confidence_fp > SCALE {
        return RefOutput {
            score_fp: 0,
            freshness_fp: 0,
            reward_weight_fp: 0,
            accepted: false,
            reason_code: 1002,
        };
    }
    if input.lambda_fp > SCALE {
        return RefOutput {
            score_fp: 0,
            freshness_fp: 0,
            reward_weight_fp: 0,
            accepted: false,
            reason_code: 1003,
        };
    }
    if input.reputation_bp > 10_000 {
        return RefOutput {
            score_fp: 0,
            freshness_fp: 0,
            reward_weight_fp: 0,
            accepted: false,
            reason_code: 1004,
        };
    }

    let dt_capped = input.dt_seconds.min(SCALE);
    let decay_term = ((input.lambda_fp as u128 * dt_capped as u128) / SCALE as u128) as u64;
    let decay_fp = SCALE.saturating_sub(decay_term);

    let freshness_fp = ((input.confidence_fp as u128 * decay_fp as u128) / SCALE as u128) as u64;
    let score_fp = ((input.similarity_fp as u128 * freshness_fp as u128) / SCALE as u128) as u64;

    let usage_factor_fp = {
        let mut v = 1 + input.usage_count;
        let mut steps = 0u64;
        while v > 1 {
            v >>= 1;
            steps += 1;
        }
        (steps * 100_000).min(SCALE)
    };

    let reputation_norm_fp = ((input.reputation_bp as u64) * SCALE) / 10_000;
    let reward_step = ((score_fp as u128 * usage_factor_fp as u128) / SCALE as u128) as u64;
    let reward_weight_fp = ((reward_step as u128 * reputation_norm_fp as u128) / SCALE as u128) as u64;

    RefOutput {
        score_fp,
        freshness_fp,
        reward_weight_fp,
        accepted: true,
        reason_code: 0,
    }
}

fn abs_diff(a: u64, b: u64) -> u64 {
    a.abs_diff(b)
}

fn cosine_similarity_ref(v1: &[i64], v2: &[i64]) -> u64 {
    if v1.len() != v2.len() {
        return 0;
    }

    let mut dot = 0.0f64;
    let mut mag1 = 0.0f64;
    let mut mag2 = 0.0f64;

    for (a, b) in v1.iter().zip(v2.iter()) {
        let af = *a as f64;
        let bf = *b as f64;
        dot += af * bf;
        mag1 += af * af;
        mag2 += bf * bf;
    }

    if mag1 <= 0.0 || mag2 <= 0.0 || dot <= 0.0 {
        return 0;
    }

    let sim = (dot / (mag1.sqrt() * mag2.sqrt())).clamp(0.0, 1.0);
    (sim * SCALE as f64).floor() as u64
}

#[test]
fn batch_parity_harness_matches_reference_formula() {
    let cfg = load_batch_config();
    assert_eq!(cfg.version, "stylus-boundary-v1-batch");

    let mut total = 0usize;
    let mut mismatches = Vec::new();

    for &similarity_fp in &cfg.samples.similarity_fp {
        for &confidence_fp in &cfg.samples.confidence_fp {
            for &lambda_fp in &cfg.samples.lambda_fp {
                for &dt_seconds in &cfg.samples.dt_seconds {
                    for &usage_count in &cfg.samples.usage_count {
                        for &reputation_bp in &cfg.samples.reputation_bp {
                            total += 1;
                            let input = VerifyInputV1 {
                                similarity_fp,
                                confidence_fp,
                                lambda_fp,
                                dt_seconds,
                                usage_count,
                                reputation_bp,
                            };

                            let got = verify_score_v1(input);
                            let exp = reference_verify(input);

                            let score_ok = abs_diff(got.score_fp, exp.score_fp) <= cfg.tolerance.score_fp;
                            let freshness_ok =
                                abs_diff(got.freshness_fp, exp.freshness_fp) <= cfg.tolerance.freshness_fp;
                            let reward_ok = abs_diff(got.reward_weight_fp, exp.reward_weight_fp)
                                <= cfg.tolerance.reward_weight_fp;

                            if !(score_ok
                                && freshness_ok
                                && reward_ok
                                && got.accepted == exp.accepted
                                && got.reason_code == exp.reason_code)
                            {
                                mismatches.push(format!(
                                    "input={:?} got=({}, {}, {}, {}, {}) exp=({}, {}, {}, {}, {})",
                                    (
                                        input.similarity_fp,
                                        input.confidence_fp,
                                        input.lambda_fp,
                                        input.dt_seconds,
                                        input.usage_count,
                                        input.reputation_bp
                                    ),
                                    got.score_fp,
                                    got.freshness_fp,
                                    got.reward_weight_fp,
                                    got.accepted,
                                    got.reason_code,
                                    exp.score_fp,
                                    exp.freshness_fp,
                                    exp.reward_weight_fp,
                                    exp.accepted,
                                    exp.reason_code,
                                ));
                            }
                        }
                    }
                }
            }
        }
    }

    assert!(
        mismatches.is_empty(),
        "parity mismatches: {} of {}\nfirst:\n{}",
        mismatches.len(),
        total,
        mismatches
            .iter()
            .take(10)
            .cloned()
            .collect::<Vec<_>>()
            .join("\n")
    );
}

#[test]
fn ranking_parity_harness_matches_reference_order() {
    let cfg = load_batch_config();

    let query = vec![1000, -200, 50, 700];
    let mut patterns = Vec::with_capacity(cfg.rank_harness.patterns);

    for i in 0..cfg.rank_harness.patterns {
        let id = [i as u8; 32];
        let vector = vec![
            ((i as i64 * 13) % 2000) - 1000,
            ((i as i64 * 17) % 2000) - 1000,
            ((i as i64 * 19) % 2000) - 1000,
            ((i as i64 * 23) % 2000) - 1000,
        ];

        patterns.push(StylusPattern {
            id,
            vector,
            confidence_fp: 200_000 + ((i as u64 * 1337) % 800_001),
            last_accessed: (i as u64 * 97) % cfg.rank_harness.now,
            usage_count: (i as u64 * 11) % 128,
            reputation_bp: ((i as u16 * 73) % 10_001),
        });
    }

    let got = rank_patterns_v1(
        &query,
        &patterns,
        cfg.rank_harness.lambda_fp,
        cfg.rank_harness.now,
        cfg.rank_harness.top_k,
    )
    .expect("rank_patterns_v1 failed");

    let mut expected: Vec<RankedPattern> = patterns
        .iter()
        .map(|p| {
            let sim = cosine_similarity_ref(&p.vector, &query);
            let dt = cfg.rank_harness.now.saturating_sub(p.last_accessed);
            let ref_out = reference_verify(VerifyInputV1 {
                similarity_fp: sim,
                confidence_fp: p.confidence_fp,
                lambda_fp: cfg.rank_harness.lambda_fp,
                dt_seconds: dt,
                usage_count: p.usage_count,
                reputation_bp: p.reputation_bp,
            });

            RankedPattern {
                id: p.id,
                similarity_fp: sim,
                freshness_fp: ref_out.freshness_fp,
                score_fp: ref_out.score_fp,
                reward_weight_fp: ref_out.reward_weight_fp,
            }
        })
        .collect();

    expected.sort_by(|a, b| {
        b.score_fp
            .cmp(&a.score_fp)
            .then_with(|| a.id.cmp(&b.id))
            .then(Ordering::Equal)
    });
    expected.truncate(cfg.rank_harness.top_k);

    assert_eq!(got.len(), expected.len());

    for (idx, (g, e)) in got.iter().zip(expected.iter()).enumerate() {
        assert_eq!(g.id, e.id, "rank mismatch at {}", idx);
        assert!(
            abs_diff(g.score_fp, e.score_fp) <= cfg.rank_harness.tolerance,
            "score mismatch at {}: got={}, exp={}",
            idx,
            g.score_fp,
            e.score_fp
        );
    }
}
