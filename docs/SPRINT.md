# Current Sprint

Период: 2026-02-16 → 2026-02-23

## Goals

1. Стабилизировать локальный E2E workflow для разработчиков.
2. Убрать рассинхрон между кодом и документацией.
3. Запустить подготовительный этап Phase 5 (Stylus + Mainnet) на уровне архитектуры и planning.

## Scope

| ID | Task | Status | Definition of Done |
|---|---|---|---|
| HAMN-030 | Phase 5 planning: Stylus Integration & Mainnet deployment | done | Утвержден master plan + декомпозирован backlog на WS1-WS5 |
| HAMN-031 | Stylus boundary spec v1 (data model + deterministic math) | done | Есть спецификация интерфейсов, форматов и deterministic math subset |
| HAMN-032 | `stylus-engine/` skeleton + базовый CI pipeline | done | Репозиторный модуль создан, базовая сборка и тестовый pipeline проходят |
| HAMN-033 | SDK dual mode: `legacy` / `stylus` (feature flag) | done | SDK конфиг поддерживает mode и покрыт unit/integration tests |
| HAMN-034 | Security threat model для Stylus + contract interactions | done | Описаны угрозы/контрмеры и security gate |
| HAMN-035 | Testnet deployment runbook + smoke checklist | done | Документирован testnet deployment и smoke checklist |
| HAMN-014 | Проверка `GET /params` в интеграции | done | Проверка `GET /params` добавлена в unit и e2e |
| HAMN-015 | Make smoke e2e target | done | Добавлен `make e2e-smoke` с preflight checks |
| HAMN-016 | `.env` схема для локального деплоя/e2e | in-progress | Есть `.env.example` + обновленные инструкции по запуску |

## Out of Scope

- Полная миграция всей off-chain логики в Stylus в рамках текущего спринта.
- Mainnet go-live до прохождения security gate.
- Изменение токеномики reward модели.
