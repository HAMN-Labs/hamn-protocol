# Current Sprint

Период: 2026-02-16 → 2026-02-23

## Goals

1. Стабилизировать локальный E2E workflow для разработчиков.
2. Убрать рассинхрон между кодом и документацией.
3. Выполнить полную миграцию off-chain логики в Stylus в рамках текущего спринта.

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
| HAMN-040 | Post-deploy verification script template | done | Добавлен reusable script template и инструкция использования |
| HAMN-041 | Release sign-off matrix | done | Создана матрица sign-off ролей и mandatory approvals |
| HAMN-042 | Incident postmortem template | done | Добавлен шаблон RCA для rollout инцидентов |
| HAMN-043 | Release communications template | done | Добавлен шаблон internal/public обновлений по релизу |
| HAMN-044 | Incident timeline log template | done | Добавлен UTC timeline шаблон для deployment window |
| HAMN-045 | Release readiness review checklist | done | Добавлен checklist template и критерии pre-go/no-go |
| HAMN-046 | Dependency and owner map template | done | Добавлен шаблон release dependency/owner map с fallback ownership |
| HAMN-051 | Port retrieval scoring path to Stylus | done | Реализованы ranking/cosine/usage/decay функции в `stylus-engine` + тесты |
| HAMN-052 | SDK Stylus-first default flow | done | SDK default mode=`stylus`, fallback в legacy управляется `legacyFallbackEnabled` |
| HAMN-053 | Migration parity harness at scale | done | Добавлен массовый parity harness (batch vectors + diff report) |
| HAMN-054 | Cutover + freeze plan for off-chain logic | done | Определен пошаговый cutover с freeze gate и rollback criteria |
| HAMN-055 | Runbooks/docs for Stylus-only primary path | done | Runbooks/README/SDK docs синхронизированы: Stylus primary path, legacy только emergency fallback |
| HAMN-047 | Canary scorecard template (metrics + gate result) | done | Добавлен единый scorecard-артефакт для canary gate decision |
| HAMN-048 | Release owner handoff checklist template | done | Добавлен handoff checklist template для pre/post deployment ownership |
| HAMN-056 | Decommission plan for legacy off-chain path | in-progress | Подготовить staged retirement legacy fallback с governance gates |

## Out of Scope

- Mainnet go-live до прохождения security gate.
- Изменение токеномики reward модели.
