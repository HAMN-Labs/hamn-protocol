# Stylus Boundary Spec v1

Статус: draft
Дата: 2026-02-16
Task: HAMN-031

## 1) Purpose

Определить минимальный и детерминированный контракт между:
- off-chain `core-engine` (retrieval/кандидаты),
- on-chain Stylus module (verification/normalization),
- существующими settlement-контрактами (`PatternRegistry`, `RewardDistributor`).

## 2) Design Principles

- Deterministic execution: одинаковые входные данные дают одинаковый on-chain результат.
- No floating point on-chain: только fixed-point целочисленная арифметика.
- Small boundary: в chain передаются только данные, нужные для верификации и начисления.
- Backward compatible rollout: поддержка `legacy` и `stylus-enabled` путей в SDK.

## 3) Canonical Data Model

## 3.1 Pattern Identity

- `pattern_id`: `bytes32`
- Source of truth: hash canonical payload off-chain.
- Canonical hash input (v1):
  - `model_version: string`
  - `context_hash: bytes32`
  - `action_hash: bytes32`
  - `created_at: uint64`

## 3.2 Verification Input (Stylus)

```text
VerifyInputV1 {
  pattern_id: bytes32,
  query_hash: bytes32,
  similarity_fp: uint64,     // fixed-point in [0, SCALE]
  confidence_fp: uint64,     // fixed-point in [0, SCALE]
  lambda_fp: uint64,         // fixed-point in [0, SCALE]
  dt_seconds: uint64,        // now - last_accessed
  usage_count: uint64,
  reputation_bp: uint16      // [0..10000]
}
```

## 3.3 Verification Output (Stylus)

```text
VerifyOutputV1 {
  score_fp: uint64,          // normalized score
  freshness_fp: uint64,      // confidence * decay
  reward_weight_fp: uint64,  // normalized reward weight
  accepted: bool,
  reason_code: uint16        // 0=OK, !=0 validation code
}
```

## 4) Fixed-Point Arithmetic

## 4.1 Scale

- `SCALE = 1_000_000` (6 decimals).
- Все `*_fp` поля интерпретируются как `value / SCALE`.

## 4.2 Allowed Ranges

- similarity_fp: `0..SCALE`
- confidence_fp: `0..SCALE`
- lambda_fp: `0..SCALE`
- freshness_fp: `0..SCALE`
- score_fp: `0..SCALE`

## 4.3 Rounding Rule

- Для умножения fixed-point: `mul_fp(a, b) = (a * b) / SCALE`.
- Rounding mode: floor (toward zero).
- Overflow policy: revert.

## 4.4 Decay Function (v1)

Избегаем exp() в v1 on-chain boundary.

Вместо `exp(-lambda * dt)` верифицируем piecewise-linear approximation:

- `decay_fp = max(0, SCALE - mul_fp(lambda_fp, dt_scaled_fp))`
- `dt_scaled_fp = min(SCALE, dt_seconds * DT_UNIT_FP)`
- `DT_UNIT_FP` калибруется и фиксируется в контрактных константах.

Примечание: переход к более точной аппроксимации (например, LUT) будет `v2` и требует upgrade spec.

## 5) Canonical Formulas (v1)

- `freshness_fp = mul_fp(confidence_fp, decay_fp)`
- `score_fp = mul_fp(similarity_fp, freshness_fp)`
- `usage_factor_fp = min(SCALE, log2_approx(1 + usage_count))`
- `reputation_fp = reputation_bp * 100` (convert basis points -> SCALE/100?)
- `reward_weight_fp = mul_fp(score_fp, usage_factor_fp)` then reputation normalization

Нормализация репутации:
- `reputation_norm_fp = (reputation_bp * SCALE) / 10000`
- `reward_weight_fp = mul_fp(reward_weight_fp, reputation_norm_fp)`

## 6) Stylus Interface (Conceptual)

```text
verify_score_v1(input: VerifyInputV1) -> VerifyOutputV1
compute_reward_weight_v1(input: VerifyInputV1) -> uint64
get_math_params_v1() -> (scale, dt_unit_fp, version)
```

## 7) Validation & Error Codes

- `0`: OK
- `1001`: InvalidSimilarityRange
- `1002`: InvalidConfidenceRange
- `1003`: InvalidLambdaRange
- `1004`: InvalidReputationRange
- `1005`: TimestampDeltaTooLarge
- `1006`: PatternIdMismatch

Invalid input => `accepted=false` + reason code.

## 8) Compatibility Matrix (v1)

| Mode | Retrieval | Verification | Settlement |
|---|---|---|---|
| legacy | off-chain core-engine | off-chain only | Solidity contracts |
| stylus-enabled | off-chain core-engine | Stylus on-chain | Solidity + Stylus adapter |

SDK requirement:
- `mode: "legacy" | "stylus"`
- identical user-facing API where possible.

## 9) Test Vectors (Required)

Минимальный набор parity-векторов:
- identical inputs / identical outputs (golden)
- boundary values (0, SCALE, max dt)
- overflow/revert cases
- monotonicity checks:
  - при росте `similarity_fp` score не уменьшается
  - при росте `dt_seconds` freshness не растет

Формат файла:
- `docs/specs/test-vectors/stylus-boundary-v1.json`

## 10) Open Questions

- Утвердить точный `DT_UNIT_FP` для экономической модели.
- Определить финальную формулу `usage_factor_fp` (log2 step vs smoother approx).
- Нужен ли отдельный signed payload для anti-spoof между node и on-chain verifier.
