use std::{collections::HashMap, fs, path::PathBuf};

use serde::Deserialize;
use stylus_engine::{verify_score_v1, VerifyInputV1};

#[derive(Debug, Deserialize)]
struct VectorFile {
    version: String,
    scale: u64,
    cases: Vec<VectorCase>,
    assertions: Vec<VectorAssertion>,
}

#[derive(Debug, Deserialize)]
struct VectorCase {
    name: String,
    input: VectorInput,
    expected: VectorExpected,
}

#[derive(Debug, Deserialize)]
struct VectorInput {
    similarity_fp: u64,
    confidence_fp: u64,
    lambda_fp: u64,
    dt_seconds: u64,
    usage_count: u64,
    reputation_bp: u16,
}

#[derive(Debug, Deserialize)]
struct VectorExpected {
    score_fp: u64,
    freshness_fp: u64,
    reward_weight_fp: u64,
    accepted: bool,
    reason_code: u16,
}

#[derive(Debug, Deserialize)]
struct VectorAssertion {
    #[serde(rename = "type")]
    assertion_type: String,
    left: String,
    right: String,
}

fn load_vectors() -> VectorFile {
    let mut path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    path.push("../docs/specs/test-vectors/stylus-boundary-v1.json");

    let raw = fs::read_to_string(&path).expect("failed to read parity vector json");
    serde_json::from_str::<VectorFile>(&raw).expect("failed to parse parity vector json")
}

#[test]
fn parity_vectors_match_expected_outputs() {
    let vectors = load_vectors();
    assert_eq!(vectors.version, "stylus-boundary-v1");
    assert_eq!(vectors.scale, 1_000_000);

    for case in &vectors.cases {
        let out = verify_score_v1(VerifyInputV1 {
            similarity_fp: case.input.similarity_fp,
            confidence_fp: case.input.confidence_fp,
            lambda_fp: case.input.lambda_fp,
            dt_seconds: case.input.dt_seconds,
            usage_count: case.input.usage_count,
            reputation_bp: case.input.reputation_bp,
        });

        assert_eq!(out.score_fp, case.expected.score_fp, "case={}", case.name);
        assert_eq!(
            out.freshness_fp, case.expected.freshness_fp,
            "case={}", case.name
        );
        assert_eq!(
            out.reward_weight_fp, case.expected.reward_weight_fp,
            "case={}", case.name
        );
        assert_eq!(out.accepted, case.expected.accepted, "case={}", case.name);
        assert_eq!(
            out.reason_code, case.expected.reason_code,
            "case={}", case.name
        );
    }
}

#[test]
fn parity_vector_relational_assertions_hold() {
    let vectors = load_vectors();

    let mut by_name: HashMap<&str, (u64, u64)> = HashMap::new();
    for case in &vectors.cases {
        let out = verify_score_v1(VerifyInputV1 {
            similarity_fp: case.input.similarity_fp,
            confidence_fp: case.input.confidence_fp,
            lambda_fp: case.input.lambda_fp,
            dt_seconds: case.input.dt_seconds,
            usage_count: case.input.usage_count,
            reputation_bp: case.input.reputation_bp,
        });
        by_name.insert(&case.name, (out.score_fp, out.freshness_fp));
    }

    for assertion in &vectors.assertions {
        let left = by_name
            .get(assertion.left.as_str())
            .unwrap_or_else(|| panic!("missing left case: {}", assertion.left));
        let right = by_name
            .get(assertion.right.as_str())
            .unwrap_or_else(|| panic!("missing right case: {}", assertion.right));

        match assertion.assertion_type.as_str() {
            "score_non_decreasing" => {
                assert!(
                    left.0 <= right.0,
                    "score assertion failed: {} -> {}",
                    assertion.left,
                    assertion.right
                );
            }
            "freshness_non_increasing" => {
                assert!(
                    left.1 >= right.1,
                    "freshness assertion failed: {} -> {}",
                    assertion.left,
                    assertion.right
                );
            }
            other => panic!("unsupported assertion type: {other}"),
        }
    }
}
