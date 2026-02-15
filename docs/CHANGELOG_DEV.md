# Dev Changelog

## 2026-02-16

- Добавлен `GET /params` в `core-engine/src/main.rs`.
- Добавлен корневой `Makefile` для локального workflow (`test`, `deploy-local`, `e2e`, и др.).
- Добавлен `make process-check` для контроля обновления process-docs при изменениях кода.
- Обновлены `README.md` и `contracts/README.md`.
- Создана структура ведения процесса в `docs/` (`BACKLOG`, `SPRINT`, `DECISIONS`, `RISKS`).
- Legacy-документы из `doc/` консолидированы в `docs/INTEGRATION_HISTORY.md`.
- В `doc/` оставлены redirect-файлы на актуальные документы в `docs/`.
- Добавлен master plan Phase 5: `docs/PHASE5_STYLUS_MAINNET_PLAN.md`.
- Добавлен boundary spec v1: `docs/specs/stylus-boundary-v1.md`.
- Зафиксировано архитектурное решение DEC-002 по fixed-point math для Stylus boundary.
- Создан `stylus-engine` skeleton (`stylus-engine/Cargo.toml`, `stylus-engine/src/lib.rs`, `stylus-engine/README.md`).
- Добавлен CI workflow для stylus-engine: `.github/workflows/stylus-engine.yml`.
- Прогон тестов `stylus-engine`: 4/4 passed.
- В SDK добавлен dual mode (`legacy`/`stylus`) через `HAMNConfig.mode`.
- Валидация SDK: `stylus` mode требует `stylusVerifierAddress`.
- Обновлены SDK unit tests (`HAMNClient`): 42/42 passed.
- Добавлен threat model: `docs/security/stylus-threat-model-v1.md`.
- Добавлен testnet runbook: `docs/ops/testnet-deployment-runbook.md`.
- Добавлена проверка `GET /params` в `sdk/src/__tests__/memory.test.ts`.
- E2E script проверяет `/params` через `client.memory.getParams()`.
- SDK tests после изменений: 43/43 passed.
- Добавлен `make e2e-smoke` с preflight-проверками Memory Node и RPC.
- Sprint/backlog обновлены: `HAMN-015` закрыт, `HAMN-016` переведен в `in-progress`.
