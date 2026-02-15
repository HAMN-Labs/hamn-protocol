# Integration History (Migrated from `doc/`)

Date: 2026-02-16

Этот файл консолидирует исторические документы из legacy-папки `doc/`.

## Summary

Интеграционный этап закрыл цель локального E2E для HAMN:
- поднят HTTP server для `core-engine`;
- добавлен deploy script контрактов;
- добавлен E2E скрипт в SDK;
- верифицированы модульные тесты и end-to-end сценарий.

## Original Plan (Short)

- Добавить в `core-engine` runtime-зависимости (`axum`, `tokio`, `tower-http`, tracing).
- Реализовать `core-engine/src/main.rs` с endpoint-ами:
  - `POST /query`
  - `POST /patterns`
  - `GET /patterns/:id`
  - `POST /patterns/:id/usage`
  - `POST /decay`
  - `GET /health`
- Добавить `sdk/scripts/integration-test.ts` для полной цепочки local E2E.

## Completed Tasks (from legacy checklist)

- Создан HTTP server в `core-engine`.
- Создан `contracts/script/Deploy.s.sol`.
- Контракты развернуты в local Anvil.
- Создан интеграционный скрипт на SDK.
- Выполнен E2E integration test.
- Задокументирован процесс.

## Walkthrough Snapshot

1. Проверка SDK unit tests (`vitest`) — успешно.
2. Запуск Memory Node (`cargo run`) — успешно.
3. Деплой `PatternRegistry` и `RewardDistributor` в Anvil — успешно.
4. Выполнение `sdk/scripts/integration-test.ts`:
   - health check OK;
   - регистрация паттерна on-chain OK;
   - сохранение/чтение off-chain OK;
   - similarity query OK;
   - usage update on-chain/off-chain OK.

## Current Canonical Process

Для актуального процесса используйте:
- `docs/README.md`
- `docs/BACKLOG.md`
- `docs/SPRINT.md`
- `docs/CHANGELOG_DEV.md`
- `docs/DECISIONS.md`
- `docs/RISKS.md`
