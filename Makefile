SHELL := /bin/bash

# Load environment overrides from .env when present.
ifneq (,$(wildcard .env))
include .env
export
endif

ANVIL_RPC ?= http://127.0.0.1:8545
MEMORY_NODE_URL ?= http://127.0.0.1:8080
ANVIL_PK ?= 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
REGISTRY_ADDR ?= 0x5fbdb2315678afecb367f032d93f642f64180aa3
DISTRIBUTOR_ADDR ?= 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512

.PHONY: help test test-core test-contracts test-sdk build-sdk anvil memory-node deploy-local e2e e2e-smoke process-check

help:
	@echo "HAMN local workflow"
	@echo ""
	@echo "Targets:"
	@echo "  make test            - Run all tests (core-engine, sdk, contracts)"
	@echo "  make test-core       - cargo test in core-engine"
	@echo "  make test-sdk        - npm test in sdk"
	@echo "  make test-contracts  - forge test in contracts"
	@echo "  make build-sdk       - npm run build in sdk"
	@echo "  make anvil           - Start local Anvil node"
	@echo "  make memory-node     - Start Rust Memory Node on :8080"
	@echo "  make deploy-local    - Deploy contracts to Anvil"
	@echo "  make e2e             - Run SDK integration test"
	@echo "  make e2e-smoke       - Preflight checks + run e2e"
	@echo "  make process-check   - Ensure process docs were updated with code changes"
	@echo ""
	@echo "Configurable env vars:"
	@echo "  ANVIL_RPC=$(ANVIL_RPC)"
	@echo "  MEMORY_NODE_URL=$(MEMORY_NODE_URL)"
	@echo "  ANVIL_PK=<private key>"
	@echo "  REGISTRY_ADDR=$(REGISTRY_ADDR)"
	@echo "  DISTRIBUTOR_ADDR=$(DISTRIBUTOR_ADDR)"

test: test-core test-sdk test-contracts

test-core:
	cd core-engine && cargo test

test-sdk:
	cd sdk && npm test

test-contracts:
	cd contracts && forge test

build-sdk:
	cd sdk && npm run build

anvil:
	anvil

memory-node:
	cd core-engine && cargo run

deploy-local:
	cd contracts && forge script script/Deploy.s.sol:DeployScript \
		--rpc-url $(ANVIL_RPC) \
		--broadcast \
		--private-key $(ANVIL_PK)

e2e:
	cd sdk && \
		ANVIL_RPC=$(ANVIL_RPC) \
		MEMORY_NODE_URL=$(MEMORY_NODE_URL) \
		ANVIL_PK=$(ANVIL_PK) \
		REGISTRY_ADDR=$(REGISTRY_ADDR) \
		DISTRIBUTOR_ADDR=$(DISTRIBUTOR_ADDR) \
		npx tsx scripts/integration-test.ts

e2e-smoke:
	@echo "Checking Memory Node health: $(MEMORY_NODE_URL)/health"
	@curl -fsS "$(MEMORY_NODE_URL)/health" > /dev/null || (echo "Memory Node health check failed"; exit 1)
	@echo "Checking RPC endpoint: $(ANVIL_RPC)"
	@curl -fsS -H "Content-Type: application/json" \
		-d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' \
		"$(ANVIL_RPC)" > /dev/null || (echo "RPC health check failed"; exit 1)
	@echo "Preflight checks passed. Running e2e..."
	@$(MAKE) e2e

process-check:
	@code_changes=$$(git diff --name-only HEAD -- core-engine sdk contracts stylus-engine .github Makefile | grep -Ev '^(docs|doc)/' || true); \
	process_changes=$$(git diff --name-only HEAD -- docs/BACKLOG.md docs/CHANGELOG_DEV.md); \
	if [ -z "$$code_changes" ]; then \
		echo "process-check: no code changes detected"; \
		exit 0; \
	fi; \
	if [ -z "$$process_changes" ]; then \
		echo "process-check: code changed but docs/BACKLOG.md and docs/CHANGELOG_DEV.md were not updated"; \
		echo ""; \
		echo "Changed files:"; \
		echo "$$code_changes"; \
		exit 1; \
	fi; \
	echo "process-check: ok"
