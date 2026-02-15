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
| HAMN-036 | Canary rollout plan (gates, metrics, rollback criteria) | done | Создан canary rollout plan с gate-метриками и rollback criteria |
| HAMN-037 | Mainnet go/no-go checklist and template | done | Созданы checklist и decision template для production gate |
| HAMN-038 | Parity test-vectors JSON for stylus boundary | done | Создан файл test-vectors и parity tests в `stylus-engine` |
| HAMN-039 | Mainnet deployment ledger template | done | Создан шаблон ledger для addresses/tx/config/sign-off |
| HAMN-014 | Проверка `GET /params` в интеграции | done | Проверка `GET /params` добавлена в unit и e2e |
| HAMN-015 | Make smoke e2e target | done | Добавлен `make e2e-smoke` с preflight checks |
| HAMN-016 | `.env` схема для локального деплоя/e2e | done | Добавлен `.env.example` + `Makefile` читает `.env` |
| HAMN-020 | CI E2E job (anvil + memory node + sdk e2e) | done | Добавлен workflow `.github/workflows/e2e.yml` |
| HAMN-021 | Process docs policy for PR | done | Добавлены PR template и policy doc |
| HAMN-040 | Post-deploy verification script template | in-progress | Добавлен reusable script template и инструкция использования |

## Out of Scope

- Полная миграция всей off-chain логики в Stylus в рамках текущего спринта.
- Mainnet go-live до прохождения security gate.
- Изменение токеномики reward модели.
