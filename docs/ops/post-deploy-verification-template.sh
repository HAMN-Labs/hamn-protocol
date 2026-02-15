#!/usr/bin/env bash
set -euo pipefail

# Post-deploy verification template for testnet/mainnet rollouts.
# Usage:
#   export ANVIL_RPC=...
#   export MEMORY_NODE_URL=...
#   export REGISTRY_ADDR=0x...
#   export DISTRIBUTOR_ADDR=0x...
#   export STYLUS_VERIFIER_ADDRESS=0x...   # optional
#   export EXPECT_CHAIN_ID=0xa4b1           # optional (hex)
#   export RUN_E2E_SMOKE=1                  # optional
#   bash docs/ops/post-deploy-verification-template.sh

ANVIL_RPC="${ANVIL_RPC:-}"
MEMORY_NODE_URL="${MEMORY_NODE_URL:-}"
REGISTRY_ADDR="${REGISTRY_ADDR:-}"
DISTRIBUTOR_ADDR="${DISTRIBUTOR_ADDR:-}"
STYLUS_VERIFIER_ADDRESS="${STYLUS_VERIFIER_ADDRESS:-}"
EXPECT_CHAIN_ID="${EXPECT_CHAIN_ID:-}"
RUN_E2E_SMOKE="${RUN_E2E_SMOKE:-0}"

fail() {
  echo "[FAIL] $*" >&2
  exit 1
}

pass() {
  echo "[PASS] $*"
}

require_var() {
  local name="$1"
  local value="$2"
  if [[ -z "$value" ]]; then
    fail "Required env var is missing: $name"
  fi
}

extract_result() {
  sed -n 's/.*"result":"\([^"]*\)".*/\1/p'
}

rpc_call() {
  local method="$1"
  local params_json="$2"
  curl -fsS -H "Content-Type: application/json" \
    -d "{\"jsonrpc\":\"2.0\",\"method\":\"${method}\",\"params\":${params_json},\"id\":1}" \
    "$ANVIL_RPC"
}

check_contract_code() {
  local label="$1"
  local address="$2"

  local result
  result="$(rpc_call "eth_getCode" "[\"${address}\",\"latest\"]" | extract_result)"

  if [[ -z "$result" || "$result" == "0x" ]]; then
    fail "${label} has no deployed code at ${address}"
  fi

  pass "${label} contract code exists at ${address}"
}

require_var "ANVIL_RPC" "$ANVIL_RPC"
require_var "MEMORY_NODE_URL" "$MEMORY_NODE_URL"
require_var "REGISTRY_ADDR" "$REGISTRY_ADDR"
require_var "DISTRIBUTOR_ADDR" "$DISTRIBUTOR_ADDR"

echo "Running post-deploy verification..."

curl -fsS "${MEMORY_NODE_URL}/health" > /dev/null
pass "Memory Node health endpoint is reachable"

chain_id="$(rpc_call "eth_chainId" "[]" | extract_result)"
[[ -n "$chain_id" ]] || fail "Unable to read chain id via RPC"
pass "RPC is reachable (chain id: ${chain_id})"

if [[ -n "$EXPECT_CHAIN_ID" && "$chain_id" != "$EXPECT_CHAIN_ID" ]]; then
  fail "Unexpected chain id: got ${chain_id}, expected ${EXPECT_CHAIN_ID}"
fi

check_contract_code "PatternRegistry" "$REGISTRY_ADDR"
check_contract_code "RewardDistributor" "$DISTRIBUTOR_ADDR"

if [[ -n "$STYLUS_VERIFIER_ADDRESS" ]]; then
  check_contract_code "StylusVerifier" "$STYLUS_VERIFIER_ADDRESS"
else
  echo "[INFO] STYLUS_VERIFIER_ADDRESS is not set; stylus verifier check skipped"
fi

if [[ "$RUN_E2E_SMOKE" == "1" ]]; then
  if command -v make >/dev/null 2>&1; then
    make e2e-smoke
    pass "make e2e-smoke completed"
  else
    fail "make is not available, cannot run e2e smoke"
  fi
else
  echo "[INFO] RUN_E2E_SMOKE != 1; e2e smoke step skipped"
fi

echo "Post-deploy verification completed successfully."
